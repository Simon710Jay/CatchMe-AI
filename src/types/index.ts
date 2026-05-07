export type Severity = 'critical' | 'warning' | 'resolved';

export interface Log {
  _id: string;
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
  _id: string;
  title: string;
  service: string;
  severity: Severity;
  count: number;
  status: string;
  logs?: Log[];
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  severity: Severity;
  read: boolean;
  createdAt: string;
  relatedIncidentId?: string;
}

export interface DashboardSummary {
  activeIncidents: number;
  criticalIncidents: number;
  totalLogs: number;
  criticalLogs: number;
  resolvedIncidents: number;
  healthPercentage: number;
  responseTimeMs: number;
}
