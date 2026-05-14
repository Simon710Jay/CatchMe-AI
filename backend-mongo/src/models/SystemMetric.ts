import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemMetric extends Document {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  healthScore: number;
  activeIncidents: number;
  criticalIncidents: number;
  resolvedIncidents: number;
  totalErrors: number;
  timestamp: Date;
}

const SystemMetricSchema: Schema = new Schema({
  cpuUsage: { type: Number, required: true },
  memoryUsage: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  healthScore: { type: Number, required: true },
  activeIncidents: { type: Number, required: true },
  criticalIncidents: { type: Number, required: true },
  resolvedIncidents: { type: Number, required: true },
  totalErrors: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

export default mongoose.model<ISystemMetric>('SystemMetric', SystemMetricSchema);
