"use client";

import React, { useEffect, useState } from 'react';
import { Incident } from '@/types';
import { StatusBadge } from './StatusBadge';
import { GitHubPRPanel } from './GitHubPRPanel';

import { dashboardApi } from '@/services/api';
import { toast } from 'sonner';

interface IncidentModalProps {
  incident: Incident;
  onClose: () => void;
}

import { useStore } from '@/store/useStore';

export const IncidentModal: React.FC<IncidentModalProps> = ({ incident, onClose }) => {
  const [showPRPanel, setShowPRPanel] = useState(false);
  const [isResolved, setIsResolved] = useState(incident.status === 'resolved');
  const [isResolving, setIsResolving] = useState(false);
  const { aiAnalyses, setAIAnalysis } = useStore();
  const analysis = aiAnalyses[incident._id];

  useEffect(() => {
    if (!analysis) {
      dashboardApi.getAIAnalysis(incident._id)
        .then(res => setAIAnalysis(incident._id, res.data))
        .catch(() => console.log('No analysis found yet'));
    }
  }, [incident._id, analysis]);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await dashboardApi.resolveIncident(incident._id);
      setIsResolved(true);
      toast.success('Incident marked as resolved');
      setTimeout(onClose, 1500); 
    } catch (error) {
      toast.error('Failed to resolve incident');
    } finally {
      setIsResolving(false);
    }
  };
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl bg-[#111827] rounded-2xl p-6 border border-white/10 shadow-lg max-h-[90vh] overflow-y-auto transition-all duration-200 scale-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {showPRPanel ? (
          <GitHubPRPanel 
            incident={incident} 
            onClose={() => setShowPRPanel(false)} 
            onResolve={handleResolve}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">{incident.title}</h2>
                <StatusBadge severity={isResolved ? 'resolved' : incident.severity} />
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-8">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs uppercase tracking-wider mb-1">Service</p>
                <p className="text-white font-medium">{incident.service}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs uppercase tracking-wider mb-1">Total Events</p>
                <p className="text-white font-medium">{incident.totalEvents} triggers</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs uppercase tracking-wider mb-1">First Seen</p>
                <p className="text-white font-medium">{incident.firstSeen}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs uppercase tracking-wider mb-1">Last Seen</p>
                <p className="text-white font-medium">{incident.lastSeen}</p>
              </div>
            </div>

            {/* Grouped Logs List */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Grouped Logs</h3>
              <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {incident.logs.map((log) => (
                  <div key={log.id} className="bg-black/30 p-3 rounded-lg text-sm flex justify-between items-center border border-white/5">
                    <div className="flex flex-col gap-1">
                      <p className="text-gray-200 font-medium">{log.message}</p>
                      <p className="text-gray-500 text-xs">{log.timestamp}</p>
                    </div>
                    <StatusBadge severity={log.severity} />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-blue-500/5 rounded-xl border border-blue-500/10 overflow-hidden mb-6">
              <div className="bg-blue-500/10 px-4 py-2 border-b border-blue-500/10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${analysis ? 'bg-blue-400' : 'bg-yellow-400 animate-pulse'}`}></div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {analysis ? 'AI Diagnosis' : 'AI Analysis in Progress...'}
                </span>
              </div>
              <div className="p-4 space-y-4">
                {!analysis ? (
                  <div className="flex flex-col gap-2">
                    <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-blue-400/60 uppercase tracking-wider mb-1 font-bold">Probable Cause</p>
                      <p className="text-sm text-blue-100/90 leading-relaxed">{analysis.probableCause}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-400/60 uppercase tracking-wider mb-1 font-bold">Impact</p>
                      <p className="text-sm text-blue-100/90 leading-relaxed">{analysis.impactAssessment}</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-green-400 uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                        Recommended Fix
                      </p>
                      <p className="text-sm text-green-100/90 leading-relaxed font-medium">{analysis.recommendedAction}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI Suggested Fix */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">AI Suggested Fix</h3>
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">src/services/{incident.service}/handler.ts</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    94% Confidence
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="bg-black/40 font-mono text-sm p-4 rounded-lg overflow-x-auto leading-relaxed">
                    <div className="text-gray-500 opacity-50">-  await stripe.charges.create(params);</div>
                    <div className="text-green-400">+  await stripe.charges.create(params, &#123;</div>
                    <div className="text-green-400">+    idempotencyKey: `charge_$...`,</div>
                    <div className="text-green-400">+    maxNetworkRetries: 2,</div>
                    <div className="text-green-400">+    timeout: 5000</div>
                    <div className="text-green-400">+  &#125;);</div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Adding an idempotency key and explicit timeout prevents duplicate processing and resource exhaustion during Stripe API network instability.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setShowPRPanel(true)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md transition-all shadow-lg shadow-green-500/10 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5"/><path d="m15 12-8.5-8.5"/><path d="M19 12H15"/></svg>
                      Create Pull Request
                    </button>
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-md border border-white/10 transition-all">
                      Review
                    </button>
                    <button className="px-3 py-1.5 text-gray-500 hover:text-gray-400 text-xs font-semibold transition-all">
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 justify-end">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
              >
                Ignore
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
              >
                View Logs
              </button>
              <button 
                onClick={handleResolve}
                disabled={isResolving || isResolved}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg ${
                  isResolved ? 'bg-green-600 shadow-green-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                } ${(isResolving || isResolved) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isResolving ? 'Resolving...' : isResolved ? 'Resolved' : 'Mark as Resolved'}
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
