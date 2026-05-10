"use client";

import React, { useState, useEffect } from 'react';
import { AIAnalysis, AIStatus } from '@/types';
import { StatusBadge } from './StatusBadge';

interface AIInsightPanelProps {
  analysis: AIAnalysis | null;
  status?: AIStatus;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ analysis, status = 'pending' }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      className={`bg-[#111827] rounded-2xl border border-white/10 p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden relative transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Subtle glass/gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status === 'processing' ? 'bg-yellow-400' : analysis ? 'bg-blue-400' : status === 'failed' ? 'bg-red-400' : 'bg-gray-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'processing' ? 'bg-yellow-500' : analysis ? 'bg-blue-500' : status === 'failed' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {status === 'processing' ? 'AI is Analyzing...' : status === 'failed' ? 'AI Analysis Failed' : analysis ? 'AI Analysis Available' : 'No Recent Analysis'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
            {status === 'processing' ? 'Processing Telemetry' : status === 'failed' ? 'Diagnosis Unavailable' : analysis ? 'Probable Cause Identified' : 'Awaiting Incident Detection'}
          </h2>
        </div>
        {analysis && status === 'completed' && (
          <div className="flex-shrink-0">
            <StatusBadge severity={analysis.severity} />
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="relative z-10 flex-1 flex flex-col space-y-5">
        {status === 'pending' && !analysis ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-xl">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 text-2xl">⚡</div>
            <p className="text-gray-400 text-sm max-w-[200px]">System is currently stable. AI is monitoring for anomalies.</p>
          </div>
        ) : status === 'processing' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-yellow-500/10 bg-yellow-500/5 rounded-xl">
            <div className="w-12 h-12 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin mb-4"></div>
            <p className="text-yellow-200 text-sm font-medium mb-1">Diagnosing Incident...</p>
            <p className="text-yellow-500/70 text-xs">Ollama AI is analyzing historical logs and patterns.</p>
          </div>
        ) : status === 'failed' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-red-500/10 bg-red-500/5 rounded-xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-2xl text-red-400">⚠️</div>
            <p className="text-red-200 text-sm font-medium mb-1">AI Service Error</p>
            <p className="text-red-400/70 text-xs max-w-[250px]">The AI analysis engine is currently unavailable or timed out. Please investigate the incident manually.</p>
          </div>
        ) : analysis ? (
          <>
            {/* Probable Cause */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧠</span> Probable Cause
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {analysis.probableCause}
              </p>
            </div>
            
            {/* Impact */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-1.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️</span> Impact Assessment
              </h3>
              <p className="text-gray-200 text-sm font-medium">
                {analysis.impactAssessment}
              </p>
            </div>

            {/* Confidence */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">AI Confidence</span>
                <span className="text-blue-400 font-bold">{Math.round(analysis.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${analysis.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Recommended Fix */}
            <div className="mt-auto pt-4">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl rounded-l-sm p-4 transition-colors group-hover:bg-blue-500/15">
                <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                  Recommended Action
                </h3>
                <p className="text-blue-50 text-base leading-relaxed">
                  {analysis.recommendedAction}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
