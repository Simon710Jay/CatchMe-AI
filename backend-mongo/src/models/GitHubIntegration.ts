import mongoose, { Schema, Document } from 'mongoose';

export interface IGitHubRepository {
  name: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
}

export interface IGitHubIntegration extends Document {
  workspaceId?: string;
  userId?: string;
  provider: 'github';
  owner?: string;
  repo?: string;
  accessToken?: string; // Encrypted (legacy name)
  accessTokenEncrypted?: string; // Encrypted (new name)
  authType: 'oauth' | 'token';
  defaultBranch?: string;
  connected?: boolean;
  
  // OAuth metadata
  githubId?: string;
  username?: string;
  avatarUrl?: string;
  connectedRepositories?: IGitHubRepository[];
  connectedAt?: Date;
  lastUsedAt?: Date;
  status?: 'connected' | 'disconnected';
}

const GitHubIntegrationSchema: Schema = new Schema({
  workspaceId: { type: String, default: 'default-workspace', index: true },
  userId: { type: String, index: true },
  provider: { type: String, default: 'github' },
  owner: { type: String },
  repo: { type: String },
  accessToken: { type: String }, // Optional for oauth mode
  accessTokenEncrypted: { type: String }, // New field
  authType: { type: String, enum: ['oauth', 'token'], required: true },
  defaultBranch: { type: String, default: 'main' },
  connected: { type: Boolean, default: true },
  
  // OAuth metadata fields
  githubId: { type: String, index: true },
  username: { type: String },
  avatarUrl: { type: String },
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
