import React, { useState } from 'react';
import { Incident } from '@/types';
import { StatusBadge } from './StatusBadge';
import { IncidentModal } from './IncidentModal';
import { useStore } from '@/store/useStore';

interface IncidentListProps {
  incidents: Incident[];
}

export const IncidentList: React.FC<IncidentListProps> = ({ incidents }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { pullRequests } = useStore();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Active Incidents</h2>
      <div className="grid grid-cols-1 gap-4">
        {incidents.filter(i => i.severity !== 'resolved').map((incident) => {
          const pr = pullRequests[incident._id];
          return (
          <div 
            key={incident._id} 
            onClick={() => setSelectedIncident(incident)}
            className="bg-[#111827] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition hover:border-white/20"
          >
            <div className="flex items-center gap-4">
              <StatusBadge severity={incident.severity} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{incident.title}</p>
                  {pr && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                      PR {pr.status}
                    </span>
                  )}
                  {(incident.source === 'ai' || incident.isTest) && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                      AI TEST
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  {incident.service} • {incident.count} events • Last seen {incident.lastSeen}
                </p>
              </div>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-1 hover:bg-blue-400/10 rounded-lg transition-colors">
              Investigate
            </button>
          </div>
        )})}
        {incidents.filter(i => i.severity !== 'resolved').length === 0 && (
          <div className="bg-[#111827] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-gray-400 italic">No active incidents detected. System is stable.</p>
          </div>
        )}
      </div>

      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
};
