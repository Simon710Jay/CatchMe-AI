"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { OverviewCards } from '@/components/OverviewCards';
import { LogTable } from '@/components/LogTable';
import { AIInsightPanel } from '@/components/AIInsightPanel';
import { SystemHealthCharts } from '@/components/SystemHealthCharts';
import { IncidentList } from '@/components/IncidentList';
import { useDashboard } from '@/hooks/useDashboard';
import { Log, SystemMetrics, AIInsight, Incident } from '@/types';

// Mock Data
const mockMetrics: SystemMetrics = {
  activeIncidents: 3,
  errors: 142,
  responseTimeMs: 245,
  healthPercentage: 92
};

const mockLogs: Log[] = [
  {
    id: '1',
    timestamp: '2026-05-05 19:42:01',
    service: 'payment-gateway',
    message: 'Connection timeout to Stripe API',
    severity: 'critical'
  },
  {
    id: '2',
    timestamp: '2026-05-05 19:40:15',
    service: 'auth-service',
    message: 'High latency detected in token validation',
    severity: 'warning'
  },
  {
    id: '3',
    timestamp: '2026-05-05 19:35:22',
    service: 'user-db',
    message: 'Replication lag cleared, DB synced',
    severity: 'resolved'
  },
  {
    id: '4',
    timestamp: '2026-05-05 19:30:10',
    service: 'payment-gateway',
    message: 'Rate limit exceeded for client IP',
    severity: 'warning'
  },
  {
    id: '5',
    timestamp: '2026-05-05 19:15:05',
    service: 'email-worker',
    message: 'Job queue processing normally',
    severity: 'resolved'
  }
];

const mockInsight: AIInsight = {
  issue: 'Stripe API Connection Timeouts',
  severity: 'critical',
  probableCause: 'Network packet loss between primary AWS region and Stripe edge nodes. Anomalous traffic spikes identified prior to failure.',
  impact: 'Payment processing is currently failing for ~15% of transactions. Potential revenue loss if not addressed within 1 hour.',
  recommendedFix: '1. Switch payment routing to secondary region (EU-Central-1)\n2. Implement exponential backoff for failed retries\n3. Alert billing team to monitor failed transactions'
};

const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Stripe API Connection Failures',
    service: 'payment-gateway',
    severity: 'critical',
    totalEvents: 42,
    firstSeen: '2026-05-05 18:30:00',
    lastSeen: '2026-05-05 19:42:01',
    logs: [mockLogs[0], mockLogs[3]]
  },
  {
    id: 'inc-2',
    title: 'High Latency in Auth Service',
    service: 'auth-service',
    severity: 'warning',
    totalEvents: 128,
    firstSeen: '2026-05-05 19:00:00',
    lastSeen: '2026-05-05 19:40:15',
    logs: [mockLogs[1]]
  }
];

export default function DashboardPage() {
  const { logs, incidents, notifications, summary, isConnected } = useDashboard();

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
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/logs/export?format=csv`, '_blank')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all hover:scale-[1.02] text-sm font-medium"
            >
              Export Logs (CSV)
            </button>
            <button 
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/incidents/export?format=csv`, '_blank')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-[1.02] text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              Export Incidents
            </button>
          </div>
        </div>

        <OverviewCards metrics={{
          activeIncidents: summary?.activeIncidents || 0,
          errors: summary?.criticalLogs || 0,
          responseTimeMs: summary?.responseTimeMs || 0,
          healthPercentage: summary?.healthPercentage || 0
        }} />
        
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
          <AIInsightPanel insight={mockInsight} />
        </div>
      </main>
    </div>
  );
}
