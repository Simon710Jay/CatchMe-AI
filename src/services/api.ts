import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  testBackend: async () => {
    const response = await api.get('/test');
    return response.data;
  },
  getLogs: async (params?: any) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },
  
  getIncidents: async () => {
    const response = await api.get('/incidents');
    return response.data;
  },
  
  getIncidentById: async (id: string) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },

  getIncidentAnalysis: async (id: string) => {
    const response = await api.get(`/incidents/${id}/analysis`);
    return response.data;
  },
  resolveIncident: async (id: string) => {
    const response = await api.patch(`/incidents/${id}/resolve`);
    return response.data;
  },
  promoteIncident: async (id: string) => {
    const response = await api.patch(`/incidents/${id}/promote`);
    return response.data;
  },
  createPR: async (id: string) => {
    const response = await api.post(`/incidents/${id}/create-pr`);
    return response.data;
  },
  getTimeline: async (id: string) => {
    const response = await api.get(`/incidents/${id}/timeline`);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  clearAllNotifications: async () => {
    const response = await api.delete('/notifications/clear');
    return response.data;
  },

  clearAllIncidents: async () => {
    const response = await api.delete('/incidents/clear-all');
    return response.data;
  },

  clearTestIncidents: async () => {
    const response = await api.delete('/incidents/test/clear', {
      data: { confirm: true }
    });
    return response.data;
  },

  getTheme: async (workspaceId: string = 'default-workspace') => {
    const response = await api.get('/user/theme', { params: { workspaceId } });
    return response.data;
  },

  updateTheme: async (theme: 'dark' | 'light', workspaceId: string = 'default-workspace') => {
    const response = await api.put('/user/theme', { theme, workspaceId });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getHealthHistory: async () => {
    const response = await api.get('/metrics/health-history');
    return response.data;
  },

  getErrorDistribution: async () => {
    const response = await api.get('/metrics/error-distribution');
    return response.data;
  },

  getPullRequests: async () => {
    const response = await api.get('/github/pull-requests');
    return response.data;
  },

  getGitHubSettings: async (workspaceId: string) => {
    const response = await api.get('/github/settings', { params: { workspaceId } });
    return response.data;
  },

  saveGitHubManual: async (data: any) => {
    const response = await api.post('/github/manual', data);
    return response.data;
  },

  testGitHubConnection: async (workspaceId: string) => {
    const response = await api.post('/github/test', { workspaceId });
    return response.data;
  },

  disconnectGitHub: async (workspaceId: string) => {
    const response = await api.post('/github/disconnect', { workspaceId });
    return response.data;
  },

  getGitHubOAuthUrl: async () => {
    const response = await api.get('/github/oauth-url');
    return response.data;
  },
};

