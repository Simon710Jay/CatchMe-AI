"use client";

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your workspace, billing, and team members.</p>
      </div>

      <div className="flex-1 flex items-center justify-center border border-white/5 bg-white/5 rounded-2xl border-dashed">
        <p className="text-gray-500 font-medium">Settings module coming soon...</p>
      </div>
    </div>
  );
}
