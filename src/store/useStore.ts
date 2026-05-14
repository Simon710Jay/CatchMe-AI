import { create } from 'zustand';
import { Log, Incident, Notification, DashboardSummary, AIAnalysis, AIStatus, HealthHistoryPoint, ErrorDistribution, GitHubPR } from '../types';

interface DashboardState {
  logs: Log[];
  incidents: Incident[];
  aiAnalyses: Record<string, AIAnalysis>;
  aiStatuses: Record<string, AIStatus>;
  pullRequests: Record<string, GitHubPR>;
  summary: DashboardSummary | null;
  healthHistory: HealthHistoryPoint[];
  errorDistribution: ErrorDistribution | null;
  isConnected: boolean;
  notifications: Notification[];
  workflowEvents: Record<string, IncidentTimelineEvent[]>;
  
  setLogs: (logs: Log[]) => void;
  addLog: (log: Log) => void;
  setIncidents: (incidents: Incident[]) => void;
  updateIncident: (incident: Incident) => void;
  addIncident: (incident: Incident) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (notification: Notification) => void;
  setAIAnalysis: (incidentId: string, analysis: AIAnalysis) => void;
  setAIStatus: (incidentId: string, status: AIStatus) => void;
  setPullRequest: (incidentId: string, pr: GitHubPR) => void;
  setPullRequests: (prs: Record<string, GitHubPR>) => void;
  setSummary: (summary: DashboardSummary) => void;
  setHealthHistory: (history: HealthHistoryPoint[]) => void;
  addHealthPoint: (point: HealthHistoryPoint) => void;
  setErrorDistribution: (distribution: ErrorDistribution) => void;
  setConnected: (status: boolean) => void;
  setWorkflowEvents: (incidentId: string, events: IncidentTimelineEvent[]) => void;
  addWorkflowEvent: (incidentId: string, event: IncidentTimelineEvent) => void;
}

export const useStore = create<DashboardState>((set) => ({
  logs: [],
  incidents: [],
  notifications: [],
  aiAnalyses: {},
  aiStatuses: {},
  pullRequests: {},
  summary: null,
  healthHistory: [],
  errorDistribution: null,
  isConnected: false,
  workflowEvents: {},
  
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

  setAIStatus: (incidentId, status) => set((state) => ({
    aiStatuses: { ...state.aiStatuses, [incidentId]: status }
  })),

  setPullRequest: (incidentId, pr) => set((state) => ({
    pullRequests: { ...state.pullRequests, [incidentId]: pr }
  })),

  setPullRequests: (prs) => set({ pullRequests: prs }),

  setSummary: (summary) => set({ summary }),

  setHealthHistory: (history) => set({ healthHistory: history }),

  addHealthPoint: (point) => set((state) => ({
    healthHistory: [...state.healthHistory.slice(-23), point]
  })),

  setErrorDistribution: (distribution) => set({ errorDistribution: distribution }),
  
  setConnected: (status) => set({ isConnected: status }),

  setWorkflowEvents: (incidentId, events) => set((state) => ({
    workflowEvents: { ...state.workflowEvents, [incidentId]: events }
  })),

  addWorkflowEvent: (incidentId, event) => set((state) => ({
    workflowEvents: { 
      ...state.workflowEvents, 
      [incidentId]: [...(state.workflowEvents[incidentId] || []), event] 
    }
  })),
}));
