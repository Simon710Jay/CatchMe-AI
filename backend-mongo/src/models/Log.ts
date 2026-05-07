import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  message: string;
  service: string;
  severity: string;
  timestamp: Date;
  stackTrace?: string;
  endpoint?: string;
  statusCode?: number;
  incidentId?: mongoose.Types.ObjectId;
}

const LogSchema: Schema = new Schema({
  message: { type: String, required: true, index: true },
  service: { type: String, required: true, index: true },
  severity: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  stackTrace: { type: String },
  endpoint: { type: String },
  statusCode: { type: Number },
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', index: true },
}, { timestamps: true });

export default mongoose.model<ILog>('Log', LogSchema);
