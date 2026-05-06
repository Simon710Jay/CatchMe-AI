import React from 'react';
import { AIInsight } from '@/types';
import { StatusBadge } from './StatusBadge';

interface AIInsightPanelProps {
  insight: AIInsight;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ insight }) => {
  return (
    <div className="bg-card border border-card-border rounded-xl shadow-lg flex flex-col h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      <div className="px-4 md:px-6 py-4 border-b border-card-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-xs text-blue-400 font-medium tracking-wide uppercase">Real-time</span>
        </div>
      </div>
      
      <div className="p-4 md:p-6 flex-1 flex flex-col gap-5 md:gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Detected Issue</h3>
            <StatusBadge severity={insight.severity} />
          </div>
          <p className="text-white text-lg font-medium">{insight.issue}</p>
        </div>
        
        <div className="h-px bg-card-border w-full"></div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Probable Cause</h3>
          <p className="text-gray-300 bg-white/5 p-4 rounded-lg border border-white/5">
            {insight.probableCause}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Impact Assessment</h3>
          <p className="text-gray-300">
            {insight.impact}
          </p>
        </div>
        
        <div className="mt-auto pt-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
              Recommended Fix
            </h3>
            <p className="text-blue-100/90 font-mono text-sm">
              {insight.recommendedFix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
