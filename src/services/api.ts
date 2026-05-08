import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
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

  resolveIncident: async (id: string) => {
    const response = await api.patch(`/incidents/${id}/resolve`);
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

  getSummary: async () => {
    const response = await api.get('/dashboard/metrics');
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

  getAIAnalysis: async (incidentId: string) => {
    const response = await api.get(`/incidents/${incidentId}/analysis`);
    return response.data;
  },
};
