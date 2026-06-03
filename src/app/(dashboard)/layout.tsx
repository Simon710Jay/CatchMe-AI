"use client";

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar'; // Assuming existing Navbar might still be used for top bar, or we can just use children.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[var(--background)] overflow-hidden">
      {/* Sidebar - Hidden on mobile, or we could add a hamburger state later */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* We keep the old dashboard Navbar here for the top-right controls if desired, 
            or it could be replaced. For now, we'll assume it handles search/actions. */}
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <div className="max-w-[1600px] mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
