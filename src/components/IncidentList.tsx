import React, { useState } from 'react';
import { Incident } from '@/types';
import { StatusBadge } from './StatusBadge';
import { IncidentModal } from './IncidentModal';

interface IncidentListProps {
  incidents: Incident[];
}

export const IncidentList: React.FC<IncidentListProps> = ({ incidents }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Active Incidents</h2>
      <div className="grid grid-cols-1 gap-4">
        {incidents.filter(i => i.severity !== 'resolved').map((incident) => (
          <div 
            key={incident.id} 
            onClick={() => setSelectedIncident(incident)}
            className="bg-[#111827] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition hover:border-white/20"
          >
            <div className="flex items-center gap-4">
              <StatusBadge severity={incident.severity} />
              <div>
                <p className="text-white font-medium">{incident.title}</p>
                <p className="text-gray-400 text-sm">
                  {incident.service} • {incident.totalEvents} events • Last seen {incident.lastSeen}
                </p>
              </div>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-1 hover:bg-blue-400/10 rounded-lg transition-colors">
              Investigate
            </button>
          </div>
        ))}
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
