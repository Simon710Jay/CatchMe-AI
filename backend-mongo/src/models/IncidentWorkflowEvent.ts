import mongoose, { Schema, Document } from 'mongoose';

export interface IIncidentWorkflowEvent extends Document {
  incidentId: mongoose.Types.ObjectId;
  eventType: string;
  message: string;
  metadata?: any;
  createdAt: Date;
}

const IncidentWorkflowEventSchema: Schema = new Schema({
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'incident_created',
      'ai_analysis_started',
      'ai_analysis_completed',
      'pr_opened',
      'review_requested',
      'pr_approved',
      'incident_resolved',
      'investigation_started',
      'ai_analysis_failed',
      'incident_failed'
    ]
  },
  message: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IIncidentWorkflowEvent>('IncidentWorkflowEvent', IncidentWorkflowEventSchema);
