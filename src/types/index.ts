export type Severity = 'critical' | 'warning' | 'resolved';

export interface Log {
  id: string;
  timestamp: string;
  service: string;
  message: string;
  severity: Severity;
  stackTrace?: string;
  endpoint?: string;
  statusCode?: number;
}

export interface SystemMetrics {
  activeIncidents: number;
  errors: number;
  responseTimeMs: number;
  healthPercentage: number;
}

export interface AIInsight {
  issue: string;
  severity: Severity;
  probableCause: string;
  impact: string;
  recommendedFix: string;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  totalEvents: number;
  firstSeen: string;
  lastSeen: string;
  logs: Log[];
}
