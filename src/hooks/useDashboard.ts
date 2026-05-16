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
    setAIAnalysis,
    setPullRequests,
    setSummary, setHealthHistory, addHealthPoint, setErrorDistribution,
    setConnected,
    setTheme 
  } = useStore();

  useEffect(() => {
    // 1. Initial Data Fetch
    const fetchData = async () => {
      try {
        const [logsRes, incidentsRes, notificationsRes, summaryRes, historyRes, distributionRes, prsRes, themeRes] = await Promise.all([
          dashboardApi.getLogs(),
          dashboardApi.getIncidents(),
          dashboardApi.getNotifications(),
          dashboardApi.getSummary(),
          dashboardApi.getHealthHistory(),
          dashboardApi.getErrorDistribution(),
          dashboardApi.getPullRequests(),
          dashboardApi.getTheme()
        ]);
        setLogs(logsRes.data);
        setIncidents(incidentsRes.data);
        setNotifications(notificationsRes.data);
        setSummary(summaryRes.data);
        setHealthHistory(historyRes.data);
        setErrorDistribution(distributionRes.data);
        
        if (themeRes.success) {
          setTheme(themeRes.data.theme);
          document.documentElement.setAttribute('data-theme', themeRes.data.theme);
        }
        
        // Fetch latest AI analysis if available
        if (incidentsRes.data && incidentsRes.data.length > 0) {
          const latestIncident = incidentsRes.data[0];
          try {
            const analysisRes = await dashboardApi.getIncidentAnalysis(latestIncident._id);
            if (analysisRes.success && analysisRes.data) {
              setAIAnalysis(latestIncident._id, analysisRes.data);
              useStore.getState().setAIStatus(latestIncident._id, analysisRes.data.status || 'completed');
            }
          } catch (err) {
            // Might not have analysis yet, which is fine
          }
        }
        
        if (prsRes.success && Array.isArray(prsRes.data)) {
          const prRecord: Record<string, any> = {};
          prsRes.data.forEach((pr: any) => {
            prRecord[pr.incidentId] = pr;
          });
          setPullRequests(prRecord);
        }
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

    const updateErrorDistribution = async () => {
      try {
        const res = await dashboardApi.getErrorDistribution();
        useStore.getState().setErrorDistribution(res.data);
      } catch (err) {
        console.error('Failed to update error distribution', err);
      }
    };

    socket.on('incident-created', (incident) => {
      addIncident(incident);
      updateErrorDistribution();
      toast.error(`New Incident: ${incident.title}`, {
        description: `Service: ${incident.service}`,
      });
    });

    socket.on('incident-updated', (incident) => {
      updateIncident(incident);
      updateErrorDistribution();
    });

    socket.on('incident-resolved', (incident) => {
      updateIncident(incident);
      updateErrorDistribution();
      toast.success(`Incident Resolved: ${incident.title}`);
    });

    socket.on('notification-created', (notification) => {
      addNotification(notification);
    });

    socket.on('notification-read', (notification) => {
      updateNotification(notification);
    });

    socket.on('notifications-cleared', () => {
      setNotifications([]);
    });
    
    socket.on('incidents-cleared', () => {
      setIncidents([]);
      setSummary({ ...useStore.getState().summary!, activeIncidents: 0, criticalIncidents: 0, resolvedIncidents: 0 } as any);
      toast.success('All incidents cleared');
    });

    socket.on('logs-cleared', () => {
      setLogs([]);
      toast.success('All logs cleared');
    });

    socket.on('incidents-updated', () => {
      // Refresh incidents from API
      const refreshIncidents = async () => {
        try {
          const res = await dashboardApi.getIncidents();
          setIncidents(res.data);
          const logsRes = await dashboardApi.getLogs();
          setLogs(logsRes.data);
        } catch (err) {
          console.error('Failed to refresh incidents', err);
        }
      };
      refreshIncidents();
    });

    socket.on('notifications-updated', () => {
      const refreshNotifications = async () => {
        try {
          const res = await dashboardApi.getNotifications();
          setNotifications(res.data);
        } catch (err) {
          console.error('Failed to refresh notifications', err);
        }
      };
      refreshNotifications();
    });

    socket.on('ai-analysis-started', ({ incidentId, status }) => {
      useStore.getState().setAIStatus(incidentId, status);
    });

    socket.on('ai-analysis-completed', ({ incidentId, status, analysis }) => {
      setAIAnalysis(incidentId, analysis);
      useStore.getState().setAIStatus(incidentId, status);
      toast.info('AI Diagnosis Available', {
        description: `Deep analysis completed for incident: ${incidentId.slice(-6)}`,
      });
    });

    socket.on('ai-analysis-failed', ({ incidentId, status, error }) => {
      useStore.getState().setAIStatus(incidentId, status);
      toast.error('AI Analysis Failed', {
        description: error || 'Failed to analyze incident',
      });
    });

    socket.on('metrics-updated', (metric) => {
      setSummary({
        activeIncidents: metric.activeIncidents,
        totalErrors: metric.totalErrors,
        avgResponseTime: metric.responseTime,
        systemHealth: metric.healthScore,
        criticalIncidents: metric.criticalIncidents,
        resolvedIncidents: metric.resolvedIncidents
      });
      addHealthPoint({
        timestamp: metric.timestamp,
        healthScore: metric.healthScore,
        cpuUsage: metric.cpuUsage,
        memoryUsage: metric.memoryUsage,
        responseTime: metric.responseTime
      });
    });

    socket.on('stats-updated', (stats) => {
      setSummary({
        activeIncidents: stats.activeIncidents,
        totalErrors: stats.totalErrors,
        avgResponseTime: stats.responseTime,
        systemHealth: stats.healthScore,
        criticalIncidents: stats.criticalIncidents,
        resolvedIncidents: stats.resolvedIncidents
      });
    });

    socket.on('pr-opened', (pr) => {
      useStore.getState().setPullRequest(pr.incidentId, pr);
      toast.success('Automated PR Created', {
        description: `Draft PR #${pr.prNumber} opened on GitHub`,
      });
    });

    socket.on('pr-status-updated', (pr) => {
      useStore.getState().setPullRequest(pr.incidentId, pr);
      toast.info('PR Status Updated', {
        description: `PR #${pr.prNumber} is now ${pr.status}`,
      });
    });
    
    socket.on('workflow-event-created', (event) => {
      useStore.getState().addWorkflowEvent(event.incidentId, event);
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
      socket.off('notifications-cleared');
      socket.off('ai-analysis-started');
      socket.off('ai-analysis-completed');
      socket.off('ai-analysis-failed');
      socket.off('metrics-updated');
      socket.off('stats-updated');
      socket.off('pr-opened');
      socket.off('pr-status-updated');
      socket.off('workflow-event-created');
    };
  }, []);

  return {
    logs: useStore((state) => state.logs),
    incidents: useStore((state) => state.incidents),
    notifications: useStore((state) => state.notifications),
    summary: useStore((state) => state.summary),
    healthHistory: useStore((state) => state.healthHistory),
    errorDistribution: useStore((state) => state.errorDistribution),
    isConnected: useStore((state) => state.isConnected),
  };
};
