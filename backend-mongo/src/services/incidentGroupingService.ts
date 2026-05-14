import Incident from '../models/Incident';
import Log from '../models/Log';
import { broadcast } from '../websocket/socket';
import { logger } from '../logger/logger';
import { NotificationService } from './notificationService';
import { queueAIAnalysis } from '../queue/aiQueue';

export class IncidentGroupingService {
  static async groupLogIntoIncident(logId: string) {
    const log = await Log.findById(logId);
    if (!log) return;

    try {
      // Find open incident with same message and service
      let incident = await Incident.findOne({
        title: log.message,
        service: log.service,
        status: 'open',
      });

      if (incident) {
        // Update existing incident
        const oldSeverity = incident.severity;
        incident.count += 1;
        incident.lastSeen = new Date();
        incident.severity = this.getHigherSeverity(incident.severity, log.severity);
        await incident.save();

        if (this.isSeverityUpgraded(oldSeverity, incident.severity)) {
          await NotificationService.create({
            title: 'Severity Escalated',
            message: `Incident "${incident.title}" severity increased to ${incident.severity}`,
            severity: incident.severity,
            relatedIncidentId: incident._id,
          });
          
          // Re-analyze on escalation
          await queueAIAnalysis((incident._id as any).toString());
        }

        broadcast('incident-updated', incident);
        logger.debug(`Updated incident: ${incident._id}`);
      } else {
        // Create new incident
        incident = new Incident({
          title: log.message,
          service: log.service,
          severity: log.severity,
          count: 1,
          status: 'open',
        });
        await incident.save();

        await NotificationService.create({
          title: 'New Incident Detected',
          message: `New incident in ${incident.service}: ${incident.title}`,
          severity: incident.severity,
          relatedIncidentId: incident._id,
        });

        // Trigger AI Analysis for new incident
        await queueAIAnalysis((incident._id as any).toString());

        broadcast('incident-created', incident);
        logger.info(`Created new incident: ${incident._id}`);

        // Log workflow event
        const IncidentWorkflowEvent = require('../models/IncidentWorkflowEvent').default;
        await IncidentWorkflowEvent.create({
          incidentId: incident._id,
          eventType: 'incident_created',
          message: `New incident detected in ${incident.service}: ${incident.title}`,
          metadata: { service: incident.service, severity: incident.severity }
        });
      }

      // Link log to incident
      log.incidentId = incident._id as any;
      await log.save();

      return incident;
    } catch (error: any) {
      logger.error(`Error in incident grouping: ${error.message}`);
    }
  }

  private static getHigherSeverity(current: string, incoming: string): string {
    const priority: Record<string, number> = {
      critical: 3,
      warning: 2,
      info: 1,
      resolved: 0,
    };

    return priority[incoming] > priority[current] ? incoming : current;
  }

  private static isSeverityUpgraded(oldS: string, newS: string): boolean {
    const priority: Record<string, number> = { critical: 3, warning: 2, info: 1, resolved: 0 };
    return priority[newS] > priority[oldS];
  }
}
