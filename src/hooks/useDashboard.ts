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
      const results = await Promise.allSettled([
        dashboardApi.getLogs(),
        dashboardApi.getIncidents(),
        dashboardApi.getNotifications(),
        dashboardApi.getSummary(),
        dashboardApi.getHealthHistory(),
        dashboardApi.getErrorDistribution(),
        dashboardApi.getPullRequests(),
        dashboardApi.getTheme()
      ]);

      const [logsRes, incidentsRes, notificationsRes, summaryRes, historyRes, distributionRes, prsRes, themeRes] = results;

      if (logsRes.status === 'fulfilled') {
        setLogs(logsRes.value.data);
      } else {
        console.error('Failed to fetch logs:', logsRes.reason);
      }

      let loadedIncidents: any[] = [];
      if (incidentsRes.status === 'fulfilled') {
        setIncidents(incidentsRes.value.data);
        loadedIncidents = incidentsRes.value.data;
      } else {
        console.error('Failed to fetch incidents:', incidentsRes.reason);
      }

      if (notificationsRes.status === 'fulfilled') {
        setNotifications(notificationsRes.value.data);
      } else {
        console.error('Failed to fetch notifications:', notificationsRes.reason);
      }

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data);
      } else {
        console.error('Failed to fetch summary:', summaryRes.reason);
        // Set a fallback summary so the UI doesn't remain in a loading spinner state forever
        setSummary({
          activeIncidents: 0,
          totalErrors: 0,
          avgResponseTime: 0,
          systemHealth: 0,
          criticalIncidents: 0,
          resolvedIncidents: 0
        });
      }

      if (historyRes.status === 'fulfilled') {
        setHealthHistory(historyRes.value.data);
      } else {
        console.error('Failed to fetch health history:', historyRes.reason);
      }

      if (distributionRes.status === 'fulfilled') {
        setErrorDistribution(distributionRes.value.data);
      } else {
        console.error('Failed to fetch error distribution:', distributionRes.reason);
      }

      if (themeRes.status === 'fulfilled' && themeRes.value.success) {
        setTheme(themeRes.value.data.theme);
        document.documentElement.setAttribute('data-theme', themeRes.value.data.theme);
      } else if (themeRes.status === 'rejected') {
        console.error('Failed to fetch theme:', themeRes.reason);
      }

      // Fetch latest AI analysis if available
      if (loadedIncidents && loadedIncidents.length > 0) {
        const latestIncident = loadedIncidents[0];
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

      if (prsRes.status === 'fulfilled' && prsRes.value.success && Array.isArray(prsRes.value.data)) {
        const prRecord: Record<string, any> = {};
        prsRes.value.data.forEach((pr: any) => {
          prRecord[pr.incidentId] = pr;
        });
        setPullRequests(prRecord);
      } else if (prsRes.status === 'rejected') {
        console.error('Failed to fetch pull requests:', prsRes.reason);
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
      const currentSummary = useStore.getState().summary;
      // If repo is analyzed, don't overwrite its fields with basic system stats
      if (!currentSummary?.isRepositoryAnalyzed) {
        setSummary({
          ...currentSummary,
          activeIncidents: metric.activeIncidents,
          totalErrors: metric.totalErrors,
          avgResponseTime: metric.responseTime,
          systemHealth: metric.healthScore,
          criticalIncidents: metric.criticalIncidents,
          resolvedIncidents: metric.resolvedIncidents
        });
      }
      addHealthPoint({
        timestamp: metric.timestamp,
        healthScore: metric.healthScore,
        cpuUsage: metric.cpuUsage,
        memoryUsage: metric.memoryUsage,
        responseTime: metric.responseTime
      });
    });

    socket.on('stats-updated', (stats) => {
      const currentSummary = useStore.getState().summary;
      if (!currentSummary?.isRepositoryAnalyzed) {
        setSummary({
          ...currentSummary,
          activeIncidents: stats.activeIncidents,
          totalErrors: stats.totalErrors,
          avgResponseTime: stats.responseTime,
          systemHealth: stats.healthScore,
          criticalIncidents: stats.criticalIncidents,
          resolvedIncidents: stats.resolvedIncidents
        });
      }
    });

    socket.on('repository-analyzed', () => {
      const refreshSummary = async () => {
        try {
          const res = await dashboardApi.getSummary();
          setSummary(res.data);
        } catch (err) {
          console.error('Failed to refresh summary after analysis', err);
        }
      };
      refreshSummary();
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
      socket.off('repository-analyzed');
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
