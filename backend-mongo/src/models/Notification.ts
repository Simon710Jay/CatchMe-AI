import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  severity: string;
  read: boolean;
  relatedIncidentId?: mongoose.Types.ObjectId;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, required: true, index: true },
  read: { type: Boolean, default: false, index: true },
  relatedIncidentId: { type: Schema.Types.ObjectId, ref: 'Incident', index: true },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
