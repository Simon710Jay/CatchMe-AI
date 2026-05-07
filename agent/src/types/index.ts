export type Severity = "critical" | "warning" | "info" | "resolved";

export interface LogPayload {
  message: string;
  severity: Severity;
  service: string;
  timestamp: string;
  stackTrace?: string;
  endpoint?: string;
  statusCode?: number;
}

export interface MetricsPayload {
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  loadAverage: number[];
  diskUsage: number;
  timestamp: string;
}

export interface HealthPayload {
  status: "healthy" | "warning" | "critical";
  message: string;
  timestamp: string;
}
