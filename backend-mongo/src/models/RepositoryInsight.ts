import mongoose, { Schema, Document } from 'mongoose';

export interface IRepositoryInsight extends Document {
  workspaceId: string;
  repositoryName: string; // owner/repo
  detectedTechnologies: string[];
  healthScore: number;
  openPRs: number;
  failedWorkflows: number;
  recentCommits: number;
  staleBranches: number;
  branchesCount: number;
  commitsCount: number;
  pullRequestsCount: number;
  workflowsCount: number;
  contributorsCount: number;
  issuesCount: number;
  analyzedAt: Date;
}

const RepositoryInsightSchema: Schema = new Schema({
  workspaceId: { type: String, required: true, unique: true, index: true },
  repositoryName: { type: String, required: true },
  detectedTechnologies: [{ type: String }],
  healthScore: { type: Number, required: true },
  openPRs: { type: Number, required: true },
  failedWorkflows: { type: Number, required: true },
  recentCommits: { type: Number, required: true },
  staleBranches: { type: Number, required: true },
  branchesCount: { type: Number, required: true },
  commitsCount: { type: Number, required: true },
  pullRequestsCount: { type: Number, required: true },
  workflowsCount: { type: Number, required: true },
  contributorsCount: { type: Number, required: true },
  issuesCount: { type: Number, required: true },
  analyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IRepositoryInsight>('RepositoryInsight', RepositoryInsightSchema);
