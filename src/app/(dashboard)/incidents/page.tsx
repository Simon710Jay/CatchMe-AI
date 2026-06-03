"use client";

import React from 'react';
import { IncidentList } from '@/components/IncidentList';
import { useDashboard } from '@/hooks/useDashboard';

export default function IncidentsPage() {
  const { incidents } = useDashboard();

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-2">Incidents</h1>
        <p className="text-gray-400">View and manage all system incidents and AI remediations.</p>
      </div>

      <div className="flex-1">
        <IncidentList incidents={incidents} />
      </div>
    </div>
  );
}
