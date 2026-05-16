import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  workspaceId: string;
  userId?: string;
  theme: 'dark' | 'light';
}

const UserSettingsSchema: Schema = new Schema({
  workspaceId: { type: String, required: true, unique: true, index: true },
  userId: { type: String },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
}, { timestamps: true });

export default mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
