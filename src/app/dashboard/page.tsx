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
