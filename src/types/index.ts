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
  status: 'open' | 'resolved' | 'investigating' | 'pr_created' | 'failed';
  workflowStatus: string;
  resolvedAt?: string;
  resolvedBy?: string;
  prCreated?: boolean;
  prNumber?: number;
  prUrl?: string;
  source: 'real' | 'ai';
  isTest: boolean;
  githubRepo?: string;
  githubIssueId?: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  logs?: Log[];
}

export interface IncidentTimelineEvent {
  _id: string;
  incidentId: string;
  eventType: 'incident_created' | 'ai_analysis_started' | 'ai_analysis_completed' | 'pr_opened' | 'review_requested' | 'pr_approved' | 'incident_resolved' | 'investigation_started';
  message: string;
  metadata?: any;
  createdAt: string;
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
  totalErrors: number;
  avgResponseTime: number;
  systemHealth: number;
  criticalIncidents: number;
  resolvedIncidents: number;
}

export interface HealthHistoryPoint {
  timestamp: string;
  healthScore: number;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
}

export interface ErrorDistribution {
  critical: number;
  warning: number;
  resolved: number;
}

export type AIStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AIAnalysis {
  _id: string;
  incidentId: string;
  status: AIStatus;
  probableCause: string;
  impactAssessment: string;
  recommendedAction: string;
  confidence: number;
  severity: Severity;
  createdAt: string;
}

export type PRStatus = 'draft' | 'open' | 'review_requested' | 'approved' | 'merged' | 'closed' | 'failed';

export interface GitHubPR {
  id?: string;
  incidentId: string;
  prNumber?: number;
  branchName: string;
  prUrl?: string;
  status: PRStatus;
  createdAt?: string;
  updatedAt?: string;
}
export interface GitHubIntegration {
  workspaceId: string;
  provider: 'github';
  owner: string;
  repo: string;
  authType: 'oauth' | 'token';
  defaultBranch: string;
  connected: boolean;
  updatedAt: string;
  userId?: string;
  githubId?: string;
  username?: string;
  avatarUrl?: string;
  connectedRepositories?: Array<{
    name: string;
    owner: string;
    private: boolean;
    defaultBranch: string;
  }>;
  connectedAt?: string;
  lastUsedAt?: string;
  status?: 'connected' | 'disconnected';
}
