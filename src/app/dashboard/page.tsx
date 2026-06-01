"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { OverviewCards } from '@/components/OverviewCards';
import { LogTable } from '@/components/LogTable';
import { AIInsightPanel } from '@/components/AIInsightPanel';
import { SystemHealthCharts } from '@/components/SystemHealthCharts';
import { IncidentList } from '@/components/IncidentList';
import { useDashboard } from '@/hooks/useDashboard';
import { useStore } from '@/store/useStore';
import { dashboardApi } from '@/services/api';
import { toast } from 'sonner';

import { RepositoryMonitorWidget } from '@/components/RepositoryMonitorWidget';

export default function DashboardPage() {
  const { logs, incidents, summary, isConnected } = useDashboard();
  const { aiAnalyses, aiStatuses } = useStore();

  // Get the latest available AI analysis
  const latestIncidentWithAnalysis = [...incidents]
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    .find(inc => aiAnalyses[inc._id]);
  
  const latestAnalysis = latestIncidentWithAnalysis ? aiAnalyses[latestIncidentWithAnalysis._id] : null;

  if (!summary) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">Initializing Observability Feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">System Overview</h1>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isConnected 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? 'Live' : 'Disconnected'}
              </div>
            </div>
            <p className="text-gray-400">Real-time monitoring and AI analysis</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api'}/logs/export?format=csv`, '_blank')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all hover:scale-[1.02] text-sm font-medium"
            >
              Export Logs (CSV)
            </button>
            <button 
              onClick={() => {
                if (confirm('Clear all test/AI-generated incidents?')) {
                  toast.promise(dashboardApi.clearTestIncidents(), {
                    loading: 'Clearing test incidents...',
                    success: (data) => `Success: ${data.message || 'Test incidents cleared'}`,
                    error: (err) => `Failed: ${err.response?.data?.error || err.message}`
                  });
                }
              }}
              className="px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 rounded-lg border border-yellow-600/20 transition-all hover:scale-[1.02] text-sm font-medium"
            >
              Clear Test Incidents
            </button>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to clear ALL data (incidents, logs, notifications)?')) {
                  toast.promise(dashboardApi.clearAllIncidents(), {
                    loading: 'Clearing all data...',
                    success: (data) => `Success: ${data.message || 'All data cleared'}`,
                    error: (err) => `Failed: ${err.response?.data?.error || err.message}`
                  });
                }
              }}
              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg border border-red-600/20 transition-all hover:scale-[1.02] text-sm font-medium"
            >
              Clear All Data
            </button>
            <button 
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api'}/incidents/export?format=csv`, '_blank')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-[1.02] text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              Export Incidents
            </button>
          </div>
        </div>

        <OverviewCards metrics={summary} />

        {summary.isRepositoryAnalyzed && summary.repositoryName && (
          <RepositoryMonitorWidget repositoryName={summary.repositoryName} />
        )}

        {summary.isRepositoryAnalyzed && (
          <div className="mb-8 bg-black/40 backdrop-blur-xl border border-blue-500/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
            <div className="flex items-center gap-2 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              <h2 className="text-xl font-bold text-white">Repository Deep Dive: {summary.repositoryName}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
              <div className="bg-white/5 border border-white/10 hover:border-blue-500/30 p-4 rounded-xl transition-all duration-300">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Branches</p>
                <p className="text-2xl font-black text-white">{summary.branchesCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 hover:border-blue-500/30 p-4 rounded-xl transition-all duration-300">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Commits (30d)</p>
                <p className="text-2xl font-black text-white">{summary.commitsCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 hover:border-blue-500/30 p-4 rounded-xl transition-all duration-300">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Pull Requests</p>
                <p className="text-2xl font-black text-white">{summary.pullRequestsCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 hover:border-blue-500/30 p-4 rounded-xl transition-all duration-300">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Workflows</p>
                <p className="text-2xl font-black text-white">{summary.workflowsCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 hover:border-blue-500/30 p-4 rounded-xl transition-all duration-300">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Contributors</p>
                <p className="text-2xl font-black text-white">{summary.contributorsCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 hover:border-blue-500/30 p-4 rounded-xl transition-all duration-300">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Issues</p>
                <p className="text-2xl font-black text-white">{summary.issuesCount}</p>
              </div>
            </div>
          </div>
        )}
        
        <SystemHealthCharts />

        <IncidentList incidents={incidents} />

        <div className="flex items-center justify-between mb-4 mt-12">
          <h2 className="text-xl font-bold text-white">Analysis & Logs</h2>
          <div className="flex items-center gap-2">
             <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
               Real-time Feed
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <LogTable logs={logs} />
          <AIInsightPanel 
            analysis={latestAnalysis} 
            status={latestIncidentWithAnalysis ? aiStatuses[latestIncidentWithAnalysis._id] : 'pending'} 
          />
        </div>
      </main>
    </div>
  );
}
