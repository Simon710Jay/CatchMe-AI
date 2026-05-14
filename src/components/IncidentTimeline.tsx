import React from 'react';
import { IncidentTimelineEvent } from '@/types';
import { format } from 'date-fns';

interface IncidentTimelineProps {
  events: IncidentTimelineEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'incident_created': return '🚨';
      case 'investigation_started': return '🔍';
      case 'ai_analysis_started': return '🧠';
      case 'ai_analysis_completed': return '✅';
      case 'pr_opened': return '🐙';
      case 'review_requested': return '👀';
      case 'pr_approved': return '👍';
      case 'incident_resolved': return '🏁';
      default: return '📍';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'incident_created': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ai_analysis_started':
      case 'ai_analysis_completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pr_opened': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'incident_resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
        <p className="text-gray-500 text-sm">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
      {events.map((event, index) => (
        <div key={event._id} className="relative group">
          {/* Timeline Node */}
          <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 bg-[#111827] z-10 transition-transform group-hover:scale-125 ${
            event.eventType === 'incident_resolved' ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'border-white/20'
          }`} />
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getEventColor(event.eventType)}`}>
                {event.eventType.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {format(new Date(event.createdAt), 'MMM d, HH:mm:ss')}
              </span>
            </div>
            
            <div className="flex items-start gap-2 pt-1">
              <span className="text-lg leading-none">{getEventIcon(event.eventType)}</span>
              <p className="text-gray-300 text-sm leading-relaxed">
                {event.message}
              </p>
            </div>

            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div className="mt-2 ml-7 p-2 bg-white/5 rounded border border-white/5 text-[11px] text-gray-400 font-mono">
                {JSON.stringify(event.metadata, null, 2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
