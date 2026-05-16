import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  service: string;
  severity: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  status: string;
  workflowStatus: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  prCreated?: boolean;
  prNumber?: number;
  prUrl?: string;
  source: 'real' | 'ai';
  isTest: boolean;
  githubRepo?: string;
  githubIssueId?: string;
}

const IncidentSchema: Schema = new Schema({
  title: { type: String, required: true, index: true },
  service: { type: String, required: true, index: true },
  severity: { type: String, required: true, index: true },
  count: { type: Number, default: 1 },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  status: { type: String, default: 'open', index: true },
  source: { type: String, enum: ['real', 'ai'], default: 'real', index: true },
  isTest: { type: Boolean, default: false, index: true },
  githubRepo: { type: String },
  githubIssueId: { type: String },
  workflowStatus: { 
    type: String, 
    enum: ['open', 'investigating', 'pr_created', 'resolved', 'failed'],
    default: 'open',
    index: true 
  },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  prCreated: { type: Boolean, default: false },
  prNumber: { type: Number },
  prUrl: { type: String },
}, { timestamps: true });

export default mongoose.model<IIncident>('Incident', IncidentSchema);
