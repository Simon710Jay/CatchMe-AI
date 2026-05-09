import { create } from 'zustand';
import { Log, Incident, Notification, DashboardSummary, AIAnalysis, HealthHistoryPoint, ErrorDistribution } from '../types';

interface DashboardState {
  logs: Log[];
  incidents: Incident[];
  aiAnalyses: Record<string, AIAnalysis>;
  summary: DashboardSummary | null;
  healthHistory: HealthHistoryPoint[];
  errorDistribution: ErrorDistribution | null;
  isConnected: boolean;
  notifications: Notification[];
  
  setLogs: (logs: Log[]) => void;
  addLog: (log: Log) => void;
  setIncidents: (incidents: Incident[]) => void;
  updateIncident: (incident: Incident) => void;
  addIncident: (incident: Incident) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (notification: Notification) => void;
  setAIAnalysis: (incidentId: string, analysis: AIAnalysis) => void;
  setSummary: (summary: DashboardSummary) => void;
  setHealthHistory: (history: HealthHistoryPoint[]) => void;
  addHealthPoint: (point: HealthHistoryPoint) => void;
  setErrorDistribution: (distribution: ErrorDistribution) => void;
  setConnected: (status: boolean) => void;
}

export const useStore = create<DashboardState>((set) => ({
  logs: [],
  incidents: [],
  notifications: [],
  aiAnalyses: {},
  summary: null,
  healthHistory: [],
  errorDistribution: null,
  isConnected: false,
  
  setLogs: (logs) => set({ logs }),
  addLog: (log) => set((state) => ({ 
    logs: [log, ...state.logs].slice(0, 100)
  })),
  
  setIncidents: (incidents) => set({ incidents }),
  
  addIncident: (incident) => set((state) => ({
    incidents: [incident, ...state.incidents]
  })),
  
  updateIncident: (updatedIncident) => set((state) => ({
    incidents: state.incidents.map((inc) => 
      inc._id === updatedIncident._id ? updatedIncident : inc
    )
  })),

  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  updateNotification: (updated) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n._id === updated._id ? updated : n
    )
  })),

  setAIAnalysis: (incidentId, analysis) => set((state) => ({
    aiAnalyses: { ...state.aiAnalyses, [incidentId]: analysis }
  })),

  setSummary: (summary) => set({ summary }),

  setHealthHistory: (history) => set({ healthHistory: history }),

  addHealthPoint: (point) => set((state) => ({
    healthHistory: [...state.healthHistory.slice(-23), point]
  })),

  setErrorDistribution: (distribution) => set({ errorDistribution: distribution }),
  
  setConnected: (status) => set({ isConnected: status }),
}));
