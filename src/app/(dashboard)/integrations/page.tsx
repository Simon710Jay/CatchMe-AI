"use client";

import React from 'react';
import { GitHubIntegrationCard } from '@/components/GitHubIntegrationCard';

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-2">Integrations</h1>
        <p className="text-gray-400">Connect CatchMe AI to your development lifecycle tools.</p>
      </div>

      <div className="flex-1">
        <div className="max-w-3xl">
          <GitHubIntegrationCard />
        </div>
      </div>
    </div>
  );
}
