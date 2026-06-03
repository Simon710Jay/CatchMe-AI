"use client";

import React from 'react';
import { OverviewCards } from '@/components/OverviewCards';
import { SystemHealthCharts } from '@/components/SystemHealthCharts';
import { RepositoryMonitorWidget } from '@/components/RepositoryMonitorWidget';
import { useDashboard } from '@/hooks/useDashboard';

export default function OverviewPage() {
  const { summary } = useDashboard();

  if (!summary) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-2">System Overview</h1>
        <p className="text-gray-400">High-level view of your infrastructure and AI monitoring status.</p>
      </div>

      <OverviewCards metrics={summary} />

      {summary.isRepositoryAnalyzed && summary.repositoryName && (
        <RepositoryMonitorWidget repositoryName={summary.repositoryName} />
      )}

      {summary.isRepositoryAnalyzed && (
        <div className="bg-black/40 backdrop-blur-xl border border-blue-500/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <div className="flex items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            <h2 className="text-xl font-bold text-white">Repository Deep Dive: {summary.repositoryName}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Branches</p>
              <p className="text-2xl font-black text-white">{summary.branchesCount || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Commits</p>
              <p className="text-2xl font-black text-white">{summary.commitsCount || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">PRs</p>
              <p className="text-2xl font-black text-white">{summary.pullRequestsCount || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Workflows</p>
              <p className="text-2xl font-black text-white">{summary.workflowsCount || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Contributors</p>
              <p className="text-2xl font-black text-white">{summary.contributorsCount || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Issues</p>
              <p className="text-2xl font-black text-white">{summary.issuesCount || 0}</p>
            </div>
          </div>
        </div>
      )}

      <SystemHealthCharts />
    </div>
  );
}
