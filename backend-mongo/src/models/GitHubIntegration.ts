import mongoose, { Schema, Document } from 'mongoose';

export interface IGitHubIntegration extends Document {
  workspaceId: string;
  userId?: string;
  provider: 'github';
  owner: string;
  repo: string;
  accessToken: string; // Encrypted
  authType: 'oauth' | 'token';
  defaultBranch: string;
  connected: boolean;
}

const GitHubIntegrationSchema: Schema = new Schema({
  workspaceId: { type: String, required: true, unique: true, index: true },
  userId: { type: String },
  provider: { type: String, default: 'github' },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  accessToken: { type: String, required: true },
  authType: { type: String, enum: ['oauth', 'token'], required: true },
  defaultBranch: { type: String, default: 'main' },
  connected: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IGitHubIntegration>('GitHubIntegration', GitHubIntegrationSchema);
