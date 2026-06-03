"use client";

import React from 'react';
import { NotificationPanel } from '@/components/NotificationPanel';

export default function NotificationsPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-gray-400">Review alerts, workflow updates, and system messages.</p>
      </div>

      <div className="flex-1 min-h-0 relative max-w-2xl">
        <NotificationPanel />
      </div>
    </div>
  );
}
