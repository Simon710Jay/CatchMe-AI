"use client";

import React, { useEffect, useState } from 'react';
import { Incident, AIStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { IncidentTimeline } from './IncidentTimeline';
import { dashboardApi } from '@/services/api';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

interface IncidentModalProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ incident, onClose }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  
  const { 
    aiAnalyses, setAIAnalysis, 
    aiStatuses, setAIStatus,
    pullRequests, setPullRequest,
    workflowEvents, setWorkflowEvents,
    updateIncident
  } = useStore();

  const analysis = aiAnalyses[incident._id];
  const aiStatus = aiStatuses[incident._id] || 'pending';
  const pr = pullRequests[incident._id];
  const events = workflowEvents[incident._id] || [];

  // Data Fetching
  useEffect(() => {
    // Fetch Analysis if missing
    if (!analysis && aiStatus !== 'processing') {
      dashboardApi.getIncidentAnalysis(incident._id)
        .then(res => {
          setAIAnalysis(incident._id, res.data);
          setAIStatus(incident._id, 'completed');
        })
        .catch(() => {
          // If 404, analysis might still be queued
        });
    }

    // Fetch Timeline
    dashboardApi.getTimeline(incident._id)
      .then(res => setWorkflowEvents(incident._id, res.data))
      .catch(err => console.error('Failed to fetch timeline', err));

    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [incident._id]);

  const handleResolve = async () => {
    if (isResolving || incident.status === 'resolved') return;
    
    setIsResolving(true);
    try {
      const res = await dashboardApi.resolveIncident(incident._id);
      updateIncident(res.data);
      toast.success('Incident resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve incident');
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreatePR = async () => {
    if (isCreatingPR || pr) return;

    setIsCreatingPR(true);
    try {
      const res = await dashboardApi.createPR(incident._id);
      setPullRequest(incident._id, res.data);
      toast.success('GitHub Pull Request created successfully');
    } catch (error: any) {
      toast.error('Failed to create Pull Request', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setIsCreatingPR(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#0B0F1A] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">{incident.title}</h2>
              <StatusBadge severity={incident.severity} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {incident.service}
              </span>
              <span>•</span>
              <span>ID: {incident._id.slice(-8).toUpperCase()}</span>
              <span>•</span>
              <span>Detected {format(new Date(incident.createdAt), 'MMM d, HH:mm')}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
          
          {/* SECTION: SERVICE DETAILS & STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-semibold text-white capitalize">{incident.status.replace('_', ' ')}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Impact</p>
              <p className="text-sm font-semibold text-white">{incident.count} occurrences</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Workflow State</p>
              <p className="text-sm font-semibold text-blue-400 capitalize">{incident.workflowStatus?.replace('_', ' ') || 'Awaiting Action'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT COLUMN: ANALYSIS & REMEDIATION (3/5) */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* AI ANALYSIS SECTION */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 12L12 12"/><path d="M12 7L12 7"/><path d="M12 17L12 17"/></svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">AI Diagnostic Analysis</h3>
                </div>

                <div className={`bg-blue-500/5 rounded-2xl border border-blue-500/10 overflow-hidden transition-all duration-500 ${!analysis ? 'animate-pulse' : ''}`}>
                  {!analysis ? (
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                      <div className="h-4 bg-white/5 rounded w-full"></div>
                      <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <>
                      <div className="px-6 py-3 bg-blue-500/10 border-b border-blue-500/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Probable Cause identified</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                          {Math.round(analysis.confidence * 100)}% Confidence
                        </span>
                      </div>
                      <div className="p-6 space-y-6">
                        <div>
                          <p className="text-gray-300 text-sm leading-relaxed">{analysis.probableCause}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Impact Assessment</p>
                          <p className="text-gray-300 text-sm">{analysis.impactAssessment}</p>
                        </div>
                        
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2 text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                            <h4 className="text-sm font-bold uppercase tracking-wider">Recommended Fix</h4>
                          </div>
                          <p className="text-gray-200 text-sm font-medium leading-relaxed bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                            {analysis.recommendedAction}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* GITHUB PR SECTION */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Remediation Workflow</h3>
                </div>

                {!pr ? (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-2xl">🐙</div>
                    <div className="max-w-xs mx-auto">
                      <p className="text-white font-medium mb-1">No Remediation PR Created</p>
                      <p className="text-gray-500 text-sm">Automate the fix by generating a draft Pull Request with AI suggestions.</p>
                    </div>
                    <button 
                      onClick={handleCreatePR}
                      disabled={isCreatingPR || incident.status === 'resolved'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      {isCreatingPR ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Spinning up branch...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                          Create Remediation PR
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-purple-500/5 rounded-2xl border border-purple-500/10 overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-purple-500/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Pull Request #{pr.prNumber}</p>
                          <p className="text-[10px] font-mono text-purple-300/60 uppercase">{pr.branchName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 uppercase tracking-widest">
                        {pr.status}
                      </span>
                    </div>
                    <div className="p-6 bg-white/[0.02]">
                      <a 
                        href={pr.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                      >
                        Review on GitHub
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT COLUMN: WORKFLOW TIMELINE (2/5) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Operational Timeline</h3>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[300px]">
                <IncidentTimeline events={events} />
              </div>
            </div>
          </div>

        </div>

        {/* STICKY FOOTER ACTIONS */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex gap-3">
            <button className="px-4 py-2 text-gray-400 hover:text-white text-sm font-semibold transition-all">
              Mute Alert
            </button>
            <button className="px-4 py-2 text-gray-400 hover:text-white text-sm font-semibold transition-all">
              Escalate
            </button>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-sm font-bold"
            >
              Close
            </button>
            <button 
              onClick={handleResolve}
              disabled={isResolving || incident.status === 'resolved'}
              className={`px-8 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all flex items-center gap-2 shadow-xl ${
                incident.status === 'resolved' 
                  ? 'bg-green-500/20 text-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 hover:scale-[1.02]'
              } ${isResolving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isResolving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Resolving...
                </>
              ) : incident.status === 'resolved' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Resolved
                </>
              ) : (
                'Mark as Resolved'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
