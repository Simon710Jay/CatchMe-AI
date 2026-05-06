"use client";

import React, { useEffect } from 'react';
import { Incident } from '@/types';
import { StatusBadge } from './StatusBadge';

interface IncidentModalProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ incident, onClose }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Mock AI data for the incident
  const mockAIInsight = {
    probableCause: "Multiple connection timeouts detected across the payment gateway nodes. Correlated with a 15% increase in traffic from unknown IPs.",
    impact: "Processing latency increased by 400ms. Potential checkout abandonment for ~10% of users.",
    recommendedFix: "Implement rate limiting on the edge nodes and verify the Stripe API status in the EU-CENTRAL region."
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#111827] rounded-2xl p-6 w-full max-w-3xl border border-white/10 shadow-lg max-h-[90vh] overflow-y-auto transition-all duration-200 scale-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{incident.title}</h2>
            <StatusBadge severity={incident.severity} />
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
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Insight</span>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-blue-400/60 uppercase tracking-wider mb-1 font-bold">Probable Cause</p>
              <p className="text-sm text-blue-100/90 leading-relaxed">{mockAIInsight.probableCause}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400/60 uppercase tracking-wider mb-1 font-bold">Impact</p>
              <p className="text-sm text-blue-100/90 leading-relaxed">{mockAIInsight.impact}</p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-green-400 uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                Recommended Fix
              </p>
              <p className="text-sm text-green-100/90 leading-relaxed font-medium">{mockAIInsight.recommendedFix}</p>
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
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
          >
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
};
