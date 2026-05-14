import Log from '../models/Log';
import Incident from '../models/Incident';
import SystemMetric from '../models/SystemMetric';
import { broadcast } from '../websocket/socket';
import { logger } from '../logger/logger';

export class StatsService {
  static async getDashboardStats() {
    try {
      const [
        activeIncidents,
        totalErrors,
        resolvedIncidents,
        criticalIncidents,
        latestMetric
      ] = await Promise.all([
        Incident.countDocuments({ status: { $ne: 'resolved' } }),
        Log.countDocuments({ severity: { $in: ['critical', 'warning', 'error', 'failed'] } }),
        Incident.countDocuments({ status: 'resolved' }),
        Incident.countDocuments({ status: { $ne: 'resolved' }, severity: 'critical' }),
        SystemMetric.findOne().sort({ timestamp: -1 })
      ]);

      return {
        activeIncidents,
        totalErrors,
        resolvedIncidents,
        criticalIncidents,
        healthScore: latestMetric?.healthScore ?? 100,
        responseTime: latestMetric?.responseTime ?? 0
      };
    } catch (error: any) {
      logger.error(`Error getting dashboard stats: ${error.message}`);
      return null;
    }
  }

  static async broadcastStats() {
    const stats = await this.getDashboardStats();
    if (stats) {
      broadcast('stats-updated', stats);
    }
  }
}
