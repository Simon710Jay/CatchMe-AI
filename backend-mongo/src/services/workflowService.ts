import Incident from '../models/Incident';
import IncidentWorkflowEvent from '../models/IncidentWorkflowEvent';
import { broadcast } from '../websocket/socket';
import { logger } from '../logger/logger';
import mongoose from 'mongoose';

export class WorkflowService {
  static async updateStatus(
    incidentId: string, 
    status: string, 
    message: string, 
    metadata: any = {}
  ) {
    try {
      const incident = await Incident.findByIdAndUpdate(
        incidentId,
        { workflowStatus: status },
        { new: true }
      );

      if (!incident) {
        throw new Error('Incident not found');
      }

      // Create workflow event
      const event = new IncidentWorkflowEvent({
        incidentId: new mongoose.Types.ObjectId(incidentId),
        eventType: this.mapStatusToEventType(status),
        message,
        metadata
      });
      await event.save();

      // Broadcast update
      broadcast('incident-updated', incident);
      broadcast('workflow-event-created', event);

      logger.info(`Incident ${incidentId} workflow status updated to ${status}`);
      return { incident, event };
    } catch (error: any) {
      logger.error(`Workflow update error: ${error.message}`);
      throw error;
    }
  }

  static async logEvent(
    incidentId: string, 
    eventType: string, 
    message: string, 
    metadata: any = {}
  ) {
    try {
      const event = new IncidentWorkflowEvent({
        incidentId: new mongoose.Types.ObjectId(incidentId),
        eventType,
        message,
        metadata
      });
      await event.save();

      broadcast('workflow-event-created', event);
      return event;
    } catch (error: any) {
      logger.error(`Workflow event logging error: ${error.message}`);
      throw error;
    }
  }

  private static mapStatusToEventType(status: string): string {
    const mapping: Record<string, string> = {
      open: 'incident_created',
      investigating: 'investigation_started',
      pr_created: 'pr_opened',
      resolved: 'incident_resolved',
      failed: 'incident_failed' // Add to enum if needed
    };
    return mapping[status] || 'incident_updated';
  }
}
