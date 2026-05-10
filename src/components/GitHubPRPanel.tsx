"use client";

import React, { useState, useEffect } from 'react';
import { Incident } from '@/types';
import { useStore } from '@/store/useStore';
import { dashboardApi } from '@/services/api';
import { toast } from 'sonner';
import { PRStatus } from '@/types';

interface GitHubPRPanelProps {
  incident: Incident;
  onClose: () => void;
  onResolve?: () => void;
}

export const GitHubPRPanel: React.FC<GitHubPRPanelProps> = ({ incident, onClose, onResolve }) => {
  const { pullRequests, setPullRequest } = useStore();
  const prData = pullRequests[incident._id];
  const [isLoading, setIsLoading] = useState(false);
  
  // Default to draft if not opened yet
  const status = prData?.status || 'draft';
  const branchName = prData?.branchName || `fix/${incident.service}-timeout-issue`;
  
  // Use a mock timeline up to the current status
  const [timeline, setTimeline] = useState<{ label: string; time: string; status: PRStatus }[]>([]);

  useEffect(() => {
    // Generate initial timeline based on status
    const now = new Date().toLocaleTimeString();
    if (status === 'draft') {
      setTimeline([]);
    } else if (status === 'open') {
      setTimeline([{ label: "Pull request opened", time: now, status: "open" }]);
    }
    // Future statuses can be added here if needed
  }, [status]);

  const getStatusColor = (s: PRStatus) => {
    switch (s) {
      case "draft": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "open": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "review_requested": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "approved": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "merged": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "closed": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "failed": return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  const handleCreatePR = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.createPR(incident._id);
      if (response.success && response.data) {
        setPullRequest(incident._id, response.data);
      }
    } catch (error) {
      toast.error('Failed to create PR automation');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0F1A] rounded-2xl p-6 border border-white/10 space-y-6 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Create Pull Request</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-mono">{branchName}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* PR Description */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">PR Description</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-300 font-bold underline decoration-blue-500/30">Issue Overview</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Automated fix for {incident.title}. Resolved {incident.count} events triggering since {incident.lastSeen || 'recently'}.
          </p>
          <p className="text-sm text-gray-300 font-bold underline decoration-green-500/30 pt-2">Proposed Fix</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            This is an automated Safe test PR using CatchMe AI to verify GitHub Integration.
          </p>
        </div>
      </div>

      {/* File Changes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          File Changes: test.json
        </h3>
        <div className="bg-black/40 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-white/5">
          <div className="text-green-400">+  &#123;</div>
          <div className="text-green-400">+    "generatedBy": "CatchMe AI",</div>
          <div className="text-green-400">+    "incidentId": "{incident._id}",</div>
          <div className="text-green-400">+    "note": "Safe test commit for MVP"</div>
          <div className="text-green-400">+  &#125;</div>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">PR Timeline</h3>
          <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-center gap-3 pl-5 relative">
                <div className="absolute left-0 w-[15px] h-[15px] bg-[#0B0F1A] border-2 border-blue-500 rounded-full flex items-center justify-center">
                   <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <div className="flex-1 flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-300 font-medium">{t.label}</span>
                  <span className="text-[10px] text-gray-500">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
        {!prData && (
          <button 
            onClick={handleCreatePR}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            {isLoading ? 'Generating Draft PR...' : 'Generate PR via AI'}
          </button>
        )}

        {prData?.prUrl && (
          <a 
            href={prData.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            Review Draft PR on GitHub
          </a>
        )}
        
        <button 
          onClick={onClose}
          className="px-4 py-2 text-gray-500 hover:text-white text-sm font-semibold transition-colors border border-white/5 rounded-lg bg-white/5 hover:bg-white/10"
        >
          {prData ? "Close Panel" : "Cancel"}
        </button>
      </div>
    </div>
  );
};
