import React from 'react';
import { Navbar } from '@/components/Navbar';
import { OverviewCards } from '@/components/OverviewCards';
import { LogTable } from '@/components/LogTable';
import { AIInsightPanel } from '@/components/AIInsightPanel';
import { Log, SystemMetrics, AIInsight } from '@/types';

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

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">System Overview</h1>
            <p className="text-gray-400">Real-time monitoring and AI analysis</p>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors text-sm font-medium">
              Export Report
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-500/20">
              Resolve Incidents
            </button>
          </div>
        </div>

        <OverviewCards metrics={mockMetrics} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LogTable logs={mockLogs} />
          </div>
          <div className="lg:col-span-1">
            <AIInsightPanel insight={mockInsight} />
          </div>
        </div>
      </main>
    </div>
  );
}
