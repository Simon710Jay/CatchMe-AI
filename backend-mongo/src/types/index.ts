export type Severity = "critical" | "warning" | "info" | "resolved";

export interface LogPayload {
  message: string;
  service: string;
  severity: Severity;
  timestamp: string;
  stackTrace?: string;
  endpoint?: string;
  statusCode?: number;
  incidentId?: string;
}

export interface IncidentPayload {
  title: string;
  service: string;
  severity: Severity;
  count: number;
  status: string;
  firstSeen: Date;
  lastSeen: Date;
}

export interface WebSocketEvents {
  "new-log": (log: any) => void;
  "incident-created": (incident: any) => void;
  "incident-updated": (incident: any) => void;
}
