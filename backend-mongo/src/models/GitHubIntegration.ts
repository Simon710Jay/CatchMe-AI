import mongoose, { Schema, Document } from 'mongoose';

export interface IGitHubIntegration extends Document {
  workspaceId: string;
  userId?: string;
  provider: 'github';
  owner: string;
  repo: string;
  accessToken: string; // Encrypted (for legacy or PAT)
  authType: 'oauth' | 'token';
  defaultBranch: string;
  connected: boolean;
  githubId?: string;
  username?: string;
  avatarUrl?: string;
  accessTokenEncrypted?: string; // Encrypted (for OAuth)
  connectedRepositories?: Array<{
    name: string;
    owner: string;
    private: boolean;
    defaultBranch: string;
  }>;
  connectedAt?: Date;
  lastUsedAt?: Date;
  status?: 'connected' | 'disconnected';
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
  githubId: { type: String },
  username: { type: String },
  avatarUrl: { type: String },
  accessTokenEncrypted: { type: String },
  connectedRepositories: [{
    name: { type: String, required: true },
    owner: { type: String, required: true },
    private: { type: Boolean, default: false },
    defaultBranch: { type: String, default: 'main' }
  }],
  connectedAt: { type: Date },
  lastUsedAt: { type: Date },
  status: { type: String, enum: ['connected', 'disconnected'], default: 'connected' }
}, { timestamps: true });

export default mongoose.model<IGitHubIntegration>('GitHubIntegration', GitHubIntegrationSchema);
