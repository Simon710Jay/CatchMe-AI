import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { dashboardApi } from '../services/api';
import { getSocket } from '../services/socket';
import { toast } from 'sonner';

export const useDashboard = () => {
  const { 
    setLogs, addLog, 
    setIncidents, addIncident, updateIncident,
    setNotifications, addNotification, updateNotification,
    setSummary,
    setConnected 
  } = useStore();

  useEffect(() => {
    // 1. Initial Data Fetch
    const fetchData = async () => {
      try {
        const [logsRes, incidentsRes, notificationsRes, summaryRes] = await Promise.all([
          dashboardApi.getLogs(),
          dashboardApi.getIncidents(),
          dashboardApi.getNotifications(),
          dashboardApi.getSummary(),
        ]);
        setLogs(logsRes.data);
        setIncidents(incidentsRes.data);
        setNotifications(notificationsRes.data);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Failed to fetch initial dashboard data:', error);
      }
    };

    fetchData();

    // 2. Initialize WebSocket
    const socket = getSocket();

    socket.on('connect', () => {
      toast.success('Connected to live telemetry feed');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      toast.error('Disconnected from live feed. Reconnecting...');
      setConnected(false);
    });

    socket.on('new-log', (log) => {
      addLog(log);
    });

    socket.on('incident-created', (incident) => {
      addIncident(incident);
      toast.error(`New Incident: ${incident.title}`, {
        description: `Service: ${incident.service}`,
      });
    });

    socket.on('incident-updated', (incident) => {
      updateIncident(incident);
    });

    socket.on('incident-resolved', (incident) => {
      updateIncident(incident);
      toast.success(`Incident Resolved: ${incident.title}`);
    });

    socket.on('notification-created', (notification) => {
      addNotification(notification);
    });

    socket.on('notification-read', (notification) => {
      updateNotification(notification);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-log');
      socket.off('incident-created');
      socket.off('incident-updated');
      socket.off('incident-resolved');
      socket.off('notification-created');
      socket.off('notification-read');
    };
  }, []);

  return {
    logs: useStore((state) => state.logs),
    incidents: useStore((state) => state.incidents),
    notifications: useStore((state) => state.notifications),
    summary: useStore((state) => state.summary),
    isConnected: useStore((state) => state.isConnected),
  };
};
