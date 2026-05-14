import si from 'systeminformation';
import { logger } from '../logger/logger';
import SystemMetric from '../models/SystemMetric';
import Incident from '../models/Incident';
import Log from '../models/Log';
import { broadcast } from '../websocket/socket';

export class SystemMetricsCollector {
  private static COLLECTION_INTERVAL = 10000; // 10 seconds

  static start() {
    setInterval(() => this.collect(), this.COLLECTION_INTERVAL);
    logger.info('📊 System Metrics Collector started');
  }

  static async collect() {
    try {
      // 1. Collect System Stats
      const cpu = await si.currentLoad();
      const mem = await si.mem();
      
      // 2. Collect Application Stats
      const activeIncidents = await Incident.countDocuments({ status: { $ne: 'resolved' } });
      const criticalIncidents = await Incident.countDocuments({ status: { $ne: 'resolved' }, severity: 'critical' });
      const resolvedIncidents = await Incident.countDocuments({ status: 'resolved' });
      const totalErrors = await Log.countDocuments({ severity: { $in: ['critical', 'warning', 'error', 'failed'] } });
      
      // 3. Calculate Health Score
      const healthScore = this.calculateHealthScore({
        cpuUsage: cpu.currentLoad,
        memoryUsage: (mem.active / mem.total) * 100,
        activeIncidents,
        criticalIncidents
      });

      // 4. Mock Response Time (Real measurement would need middleware)
      const responseTime = 150 + Math.random() * 50; 

      // 5. Store in DB
      const metric = new SystemMetric({
        cpuUsage: cpu.currentLoad,
        memoryUsage: (mem.active / mem.total) * 100,
        responseTime,
        healthScore,
        activeIncidents,
        criticalIncidents,
        resolvedIncidents,
        totalErrors,
      });
      await metric.save();

      // 6. Broadcast via WebSocket
      broadcast('metrics-updated', metric);
      
      if (healthScore < 70) {
        broadcast('health-warning', { score: healthScore, timestamp: new Date() });
      }

      logger.debug(`Collected metrics: Health ${healthScore.toFixed(2)}% | CPU ${cpu.currentLoad.toFixed(2)}%`);
    } catch (error: any) {
      logger.error(`Metrics collection failed: ${error.message}`);
    }
  }

  private static calculateHealthScore(data: {
    cpuUsage: number;
    memoryUsage: number;
    activeIncidents: number;
    criticalIncidents: number;
  }): number {
    let score = 100;

    // Deduct for high CPU (> 80%)
    if (data.cpuUsage > 80) score -= (data.cpuUsage - 80) * 0.5;
    
    // Deduct for high Memory (> 85%)
    if (data.memoryUsage > 85) score -= (data.memoryUsage - 85) * 0.8;

    // Deduct for active incidents
    score -= data.activeIncidents * 5;

    // Heavy penalty for critical incidents
    score -= data.criticalIncidents * 15;

    return Math.max(0, Math.min(100, score));
  }
}
