import mongoose, { Document, Schema } from 'mongoose';

export interface IRepositoryMonitor extends Document {
  workspaceId: string;
  repositoryName: string;
  webhookUrl?: string;
  webhookSecret?: string;
  monitoringStatus: 'active' | 'paused' | 'error';
  lastScanTime?: Date;
  lastCommitSha?: string;
  lastCommitMessage?: string;
  healthScore: number;
  activeRisks: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    detectedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const RepositoryMonitorSchema: Schema = new Schema({
  workspaceId: { type: String, required: true },
  repositoryName: { type: String, required: true },
  webhookUrl: { type: String },
  webhookSecret: { type: String },
  monitoringStatus: { type: String, enum: ['active', 'paused', 'error'], default: 'paused' },
  lastScanTime: { type: Date },
  lastCommitSha: { type: String },
  lastCommitMessage: { type: String },
  healthScore: { type: Number, default: 100 },
  activeRisks: [{
    id: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    message: { type: String },
    detectedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Ensure one monitor per workspace/repository pair
RepositoryMonitorSchema.index({ workspaceId: 1, repositoryName: 1 }, { unique: true });

export default mongoose.models.RepositoryMonitor || mongoose.model<IRepositoryMonitor>('RepositoryMonitor', RepositoryMonitorSchema);
