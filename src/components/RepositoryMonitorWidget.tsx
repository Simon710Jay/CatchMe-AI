import React, { useEffect, useState } from 'react';
import { getSocket } from '@/services/socket';
import { dashboardApi } from '@/services/api';

interface RepositoryMonitorWidgetProps {
  repositoryName: string;
}

export const RepositoryMonitorWidget: React.FC<RepositoryMonitorWidgetProps> = ({ repositoryName }) => {
  const [monitorData, setMonitorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!repositoryName) return;

    // Initial fetch
    dashboardApi.getWebhookConfig(repositoryName, 'default-workspace')
      .then(res => {
        if (res.success && res.data) {
          setMonitorData(res.data);
        }
      })
      .catch(err => console.error('Failed to load monitor data', err))
      .finally(() => setIsLoading(false));

    // Listen to real-time updates
    const socket = getSocket();
    const handleUpdate = (data: any) => {
      if (data.repositoryName === repositoryName) {
        setMonitorData(data);
      }
    };
    socket.on('monitor-updated', handleUpdate);

    return () => {
      socket.off('monitor-updated', handleUpdate);
    };
  }, [repositoryName]);

  if (isLoading) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-6 shadow-lg animate-pulse mb-8">
        <div className="h-6 w-48 bg-white/5 rounded mb-4" />
        <div className="h-4 w-32 bg-white/5 rounded" />
      </div>
    );
  }

  if (!monitorData || monitorData.monitoringStatus === 'paused') {
    return null; // Don't show if not actively monitoring
  }

  return (
    <div className="mb-8 bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow indicating active monitoring */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Live Repository Monitoring
          </h2>
          <p className="text-sm text-gray-400 mt-1">Watching <span className="font-mono text-blue-400">{repositoryName}</span> for webhook events</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Health Score</p>
            <p className={`text-2xl font-black ${monitorData.healthScore > 80 ? 'text-green-400' : monitorData.healthScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {monitorData.healthScore}%
            </p>
          </div>
          <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Last Scan Time</p>
            <p className="text-sm text-white">{monitorData.lastScanTime ? new Date(monitorData.lastScanTime).toLocaleString() : 'Waiting for first event...'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Last Commit</p>
            <p className="text-sm font-mono text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 break-words">
              {monitorData.lastCommitMessage || 'N/A'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
            <span>Active Risks Detected</span>
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">{monitorData.activeRisks?.length || 0}</span>
          </p>
          {monitorData.activeRisks && monitorData.activeRisks.length > 0 ? (
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {monitorData.activeRisks.slice().reverse().map((risk: any) => (
                <div key={risk.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${risk.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {risk.severity}
                  </span>
                  <p className="text-sm text-gray-300">{risk.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-lg text-sm text-green-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              No high-severity risks detected recently.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
