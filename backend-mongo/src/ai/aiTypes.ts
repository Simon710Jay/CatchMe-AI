export type AIStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AIAnalysisResponse {
  probableCause: string;
  impactAssessment: string;
  recommendedAction: string;
  confidence: number;
  severity: 'critical' | 'warning' | 'info';
}

export interface AIJobPayload {
  incidentId: string;
}

export interface AIAnalysisEvent {
  incidentId: string;
  status: AIStatus;
  analysis?: AIAnalysisResponse & { _id?: string; rawResponse?: string; createdAt?: string; updatedAt?: string };
  error?: string;
}
