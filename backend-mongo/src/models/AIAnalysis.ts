import mongoose, { Schema, Document } from 'mongoose';

export interface IAIAnalysis extends Document {
  incidentId: mongoose.Types.ObjectId;
  probableCause: string;
  impactAssessment: string;
  recommendedAction: string;
  confidence: number;
  severity: string;
  rawResponse: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema: Schema = new Schema({
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
  probableCause: { type: String, required: true },
  impactAssessment: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  confidence: { type: Number, required: true },
  severity: { type: String, required: true },
  rawResponse: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
