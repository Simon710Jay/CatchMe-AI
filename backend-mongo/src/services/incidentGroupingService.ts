import Incident from '../models/Incident';
import Log from '../models/Log';
import { broadcast } from '../websocket/socket';
import { logger } from '../logger/logger';

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
        incident.count += 1;
        incident.lastSeen = new Date();
        incident.severity = this.getHigherSeverity(incident.severity, log.severity);
        await incident.save();

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

        broadcast('incident-created', incident);
        logger.info(`Created new incident: ${incident._id}`);
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
}
