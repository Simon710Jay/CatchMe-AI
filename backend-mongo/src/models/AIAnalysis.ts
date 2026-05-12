import mongoose, { Schema, Document } from 'mongoose';

export interface IAIAnalysis extends Document {
  incidentId: mongoose.Types.ObjectId;
  probableCause: string;
  impactAssessment: string;
  recommendedAction: string;
  confidence: number;
  severity: string;
  analyzedLogs: string;
  rawResponse: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema: Schema = new Schema({
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
  probableCause: { type: String, required: false },
  impactAssessment: { type: String, required: false },
  recommendedAction: { type: String, required: false },
  confidence: { type: Number, required: false },
  severity: { type: String, required: false },
  analyzedLogs: { type: String, required: false },
  rawResponse: { type: String, required: false },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
}, { timestamps: true });

export default mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
