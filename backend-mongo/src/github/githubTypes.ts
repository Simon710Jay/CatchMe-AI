export type PRStatus = 'draft' | 'open' | 'review_requested' | 'approved' | 'merged' | 'closed' | 'failed';

export interface GitHubPR {
  id?: string;
  incidentId: string;
  prNumber?: number;
  branchName: string;
  prUrl?: string;
  status: PRStatus;
  defaultBranch?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AutomationPayload {
  incidentId: string;
}
