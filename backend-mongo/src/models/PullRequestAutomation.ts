import mongoose, { Document, Schema } from 'mongoose';

export interface IPullRequestAutomation extends Document {
  incidentId: string;
  prNumber?: number;
  branchName: string;
  prUrl?: string;
  status: 'draft' | 'open' | 'review_requested' | 'approved' | 'merged' | 'closed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PullRequestAutomationSchema = new Schema<IPullRequestAutomation>(
  {
    incidentId: {
      type: String,
      required: true,
      index: true,
    },
    prNumber: {
      type: Number,
    },
    branchName: {
      type: String,
      required: true,
    },
    prUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'review_requested', 'approved', 'merged', 'closed', 'failed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

export const PullRequestAutomation = mongoose.model<IPullRequestAutomation>(
  'PullRequestAutomation',
  PullRequestAutomationSchema
);
