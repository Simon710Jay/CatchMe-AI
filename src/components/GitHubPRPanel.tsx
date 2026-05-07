"use client";

import React, { useState, useEffect } from 'react';
import { Incident } from '@/types';

type PRStatus = "draft" | "open" | "reviewing" | "approved" | "merged" | "verifying" | "success" | "failed";

interface GitHubPRPanelProps {
  incident: Incident;
  onClose: () => void;
  onResolve?: () => void;
}

export const GitHubPRPanel: React.FC<GitHubPRPanelProps> = ({ incident, onClose, onResolve }) => {
  const [status, setStatus] = useState<PRStatus>("draft");
  const [timeline, setTimeline] = useState<{ label: string; time: string; status: PRStatus }[]>([]);

  useEffect(() => {
    if (status === "merged") {
      const timer = setTimeout(() => {
        handleStatusChange("verifying", "Post-merge verification started");
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    if (status === "verifying") {
      const timer = setTimeout(() => {
        // 80% success rate for simulation
        const isSuccess = Math.random() > 0.2;
        if (isSuccess) {
          handleStatusChange("success", "Verification complete: System healthy");
          if (onResolve) onResolve();
        } else {
          handleStatusChange("failed", "Verification failed: Error rate spiking");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getStatusColor = (s: PRStatus) => {
    switch (s) {
      case "draft": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "open": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "reviewing": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "approved": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "merged": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "verifying": return "bg-blue-400/10 text-blue-300 border-blue-400/20 animate-pulse";
      case "success": return "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
      case "failed": return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  const handleStatusChange = (nextStatus: PRStatus, label: string) => {
    setStatus(nextStatus);
    setTimeline(prev => [...prev, { label, time: new Date().toLocaleTimeString(), status: nextStatus }]);
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
          <p className="text-sm text-gray-500 font-mono">fix/{incident.service}-timeout-issue</p>
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
            Automated fix for {incident.title}. Resolved {incident.totalEvents} events triggering since {incident.firstSeen}.
          </p>
          <p className="text-sm text-gray-300 font-bold underline decoration-green-500/30 pt-2">Proposed Fix</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Implements idempotency keys and network timeout configurations in the {incident.service} handler to prevent duplicate processing and resource exhaustion.
          </p>
        </div>
      </div>

      {/* File Changes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          File Changes: src/services/{incident.service}/handler.ts
        </h3>
        <div className="bg-black/40 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-white/5">
          <div className="text-gray-500 opacity-50">-  await stripe.charges.create(params);</div>
          <div className="text-green-400">+  await stripe.charges.create(params, &#123;</div>
          <div className="text-green-400">+    idempotencyKey: `charge_$...`,</div>
          <div className="text-green-400">+    maxNetworkRetries: 2,</div>
          <div className="text-green-400">+    timeout: 5000</div>
          <div className="text-green-400">+  &#125;);</div>
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
        {status === "draft" && (
          <button 
            onClick={() => handleStatusChange("open", "Pull request opened")}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            Open PR
          </button>
        )}
        {status === "open" && (
          <button 
            onClick={() => handleStatusChange("reviewing", "Review requested")}
            className="flex-1 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 text-sm font-semibold rounded-lg border border-yellow-500/30 transition-all"
          >
            Request Review
          </button>
        )}
        {status === "reviewing" && (
          <button 
            onClick={() => handleStatusChange("approved", "PR approved by AI reviewer")}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-green-500/20"
          >
            Approve PR
          </button>
        )}
        {status === "approved" && (
          <button 
            onClick={() => handleStatusChange("merged", "PR merged to main branch")}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5"/><path d="m15 12-8.5-8.5"/><path d="M19 12H15"/></svg>
            Merge Pull Request
          </button>
        )}
        {status === "merged" && (
          <div className="flex-1 flex items-center justify-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
             <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
             <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Merging...</span>
          </div>
        )}
        {status === "verifying" && (
          <div className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
             <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Verifying Fix...</span>
          </div>
        )}
        {status === "success" && (
          <div className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl animate-in zoom-in-95 duration-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
             <span className="text-sm font-bold text-green-400 uppercase tracking-widest">Fix Verified & Stable</span>
          </div>
        )}
        {status === "failed" && (
          <div className="flex flex-col w-full gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
               <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Verification Failed</span>
            </div>
            <button 
              onClick={() => handleStatusChange("draft", "Rollback initiated - PR reverted")}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Immediate Rollback
            </button>
          </div>
        )}
        <button 
          onClick={onClose}
          className="px-4 py-2 text-gray-500 hover:text-white text-sm font-semibold transition-colors"
        >
          {status === "merged" ? "Close Panel" : "Cancel"}
        </button>
      </div>
    </div>
  );
};
