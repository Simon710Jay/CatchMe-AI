import si from 'systeminformation';
import { MetricsPayload } from '../types';
import { logger } from '../logger/logger';

export class SystemMetrics {
  static async collect(): Promise<MetricsPayload> {
    try {
      const [cpu, mem, load, fs] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fullLoad(),
        si.fsSize(),
      ]);

      const mainDisk = fs.find(d => d.mount === '/') || fs[0];

      return {
        cpuUsage: cpu.currentLoad,
        memoryUsage: (mem.active / mem.total) * 100,
        uptime: si.time().uptime,
        loadAverage: [load], // si.fullLoad returns a number, simplified for demo
        diskUsage: mainDisk ? mainDisk.use : 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error(`Error collecting system metrics: ${error.message}`);
      throw error;
    }
  }
}
