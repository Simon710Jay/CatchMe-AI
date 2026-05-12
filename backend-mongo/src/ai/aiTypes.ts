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
  analysis?: any; // Use any or specific DB model type
  error?: string;
}
