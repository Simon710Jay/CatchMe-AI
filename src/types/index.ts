export type Severity = 'critical' | 'warning' | 'resolved';

export interface Log {
  id: string;
  timestamp: string;
  service: string;
  message: string;
  severity: Severity;
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
