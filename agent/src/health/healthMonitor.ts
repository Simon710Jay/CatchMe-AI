import { MetricsPayload, HealthPayload } from '../types';

export class HealthMonitor {
  static analyze(metrics: MetricsPayload): HealthPayload {
    let status: "healthy" | "warning" | "critical" = "healthy";
    let message = "System is performing within normal parameters.";

    if (metrics.cpuUsage > 90 || metrics.memoryUsage > 95) {
      status = "critical";
      message = `Critical resource usage: CPU ${metrics.cpuUsage.toFixed(1)}%, RAM ${metrics.memoryUsage.toFixed(1)}%`;
    } else if (metrics.cpuUsage > 70 || metrics.memoryUsage > 85) {
      status = "warning";
      message = `High resource usage: CPU ${metrics.cpuUsage.toFixed(1)}%, RAM ${metrics.memoryUsage.toFixed(1)}%`;
    }

    if (metrics.diskUsage > 90) {
      status = "critical";
      message = `Disk space nearly full: ${metrics.diskUsage.toFixed(1)}% used`;
    }

    return {
      status,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
