import Incident from '../models/Incident';
import Log from '../models/Log';
import IncidentWorkflowEvent from '../models/IncidentWorkflowEvent';
import AIAnalysis from '../models/AIAnalysis';
import Notification from '../models/Notification';
import { logger } from '../logger/logger';
import { broadcast } from '../websocket/socket';
import { StatsService } from './statsService';

export interface ClearTestIncidentsResponse {
  success: boolean;
  deletedIncidents: number;
  deletedLogs: number;
  message: string;
}

export interface CleanupResult {
  deletedIncidents: number;
  deletedLogs: number;
  deletedEvents: number;
  deletedAnalyses: number;
  deletedNotifications: number;
}

export interface TestIncidentFilter {
  isTest?: boolean;
  source?: string;
  title?: { $regex: string; $options: string };
  service?: string;
}

export class IncidentCleanupService {
  /**
   * Helper to define exactly what constitutes a "test incident".
   * This builds the MongoDB query filter.
   */
  public static getTestIncidentFilter(): any {
    return {
      $or: [
        { isTest: true },
        { source: 'ai' },
        { title: { $regex: '\\[TEST\\]', $options: 'i' } },
        { service: 'test-service' },
        { generatedBy: 'simulation' },
        { 'metadata.test': true }
      ]
    };
  }

  /**
   * Returns the count of test incidents
   */
  public static async getTestIncidentCount(): Promise<number> {
    const filter = this.getTestIncidentFilter();
    return Incident.countDocuments(filter);
  }

  /**
   * Clears all test incidents and related data efficiently.
   */
  public static async clearTestIncidents(): Promise<CleanupResult> {
    logger.info("Clearing test incidents...");

    const filter = this.getTestIncidentFilter();
    
    // Efficiently find IDs using projection
    const testIncidents = await Incident.find(filter).select('_id');
    const testIds = testIncidents.map(inc => inc._id);

    if (testIds.length === 0) {
      logger.info("No test incidents found to clear.");
      return {
        deletedIncidents: 0,
        deletedLogs: 0,
        deletedEvents: 0,
        deletedAnalyses: 0,
        deletedNotifications: 0
      };
    }

    // Bulk delete associated data
    const [
      incidentResult,
      logResult,
      eventResult,
      analysisResult,
      notificationResult
    ] = await Promise.all([
      Incident.deleteMany({ _id: { $in: testIds } }),
      Log.deleteMany({ incidentId: { $in: testIds } }),
      IncidentWorkflowEvent.deleteMany({ incidentId: { $in: testIds } }),
      AIAnalysis.deleteMany({ incidentId: { $in: testIds } }),
      Notification.deleteMany({ relatedIncidentId: { $in: testIds } }),
    ]);

    const result: CleanupResult = {
      deletedIncidents: incidentResult.deletedCount || 0,
      deletedLogs: logResult.deletedCount || 0,
      deletedEvents: eventResult.deletedCount || 0,
      deletedAnalyses: analysisResult.deletedCount || 0,
      deletedNotifications: notificationResult.deletedCount || 0
    };

    logger.info(`Cleanup complete: deleted ${result.deletedIncidents} incidents and ${result.deletedLogs} logs.`);

    // Broadcast synchronization events
    broadcast('test-incidents-cleared', { deletedCount: result.deletedIncidents });
    broadcast('incident-deleted', {}); // Fallback for UI refresh if explicitly listening to this
    broadcast('dashboard-stats-updated', {}); // Triggers explicit state sync
    
    // Trigger existing global stats sync
    StatsService.broadcastStats();

    return result;
  }
}
