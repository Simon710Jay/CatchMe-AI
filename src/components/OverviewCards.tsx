import React from 'react';
import { DashboardSummary } from '@/types';

interface OverviewCardsProps {
  metrics: DashboardSummary;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ metrics }) => {
  const isAnalyzed = metrics.isRepositoryAnalyzed;

  return (
    <div className="mb-8">
      {isAnalyzed && metrics.detectedTechnologies && metrics.detectedTechnologies.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-gray-400 font-medium self-center mr-2">Detected Stack:</span>
          {metrics.detectedTechnologies.map((tech) => (
            <span key={tech} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
              {tech}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Active Incidents / Open PRs */}
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-white/20 hover:shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">{isAnalyzed ? 'Open PRs' : 'Active Incidents'}</h3>
            <div className="w-8 h-8 rounded-lg bg-critical/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-critical)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics.activeIncidents}</span>
          </div>
        </div>

        {/* Errors / Failed Workflows */}
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-white/20 hover:shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">{isAnalyzed ? 'Failed Workflows' : 'Total Errors'}</h3>
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics.totalErrors}</span>
          </div>
        </div>

        {/* Response Time / Recent Commits */}
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-white/20 hover:shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">{isAnalyzed ? 'Recent Commits' : 'Avg Response Time'}</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{Math.round(metrics.avgResponseTime)}{isAnalyzed ? '' : 'ms'}</span>
          </div>
        </div>

        {/* System Health / Repo Health */}
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-white/20 hover:shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">{isAnalyzed ? 'Repo Health' : 'System Health'}</h3>
            <div className="w-8 h-8 rounded-lg bg-resolved/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-resolved)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{Math.round(metrics.systemHealth)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
