"use client";
import React from 'react';
import { Navbar } from '../../../components/Navbar';
import { GitHubIntegrationCard } from '../../../components/GitHubIntegrationCard';
import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-text font-sans selection:bg-blue-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-10">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-4 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Integrations</h1>
          <p className="text-gray-400 text-lg">Connect your development tools to automate your workflow.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <GitHubIntegrationCard />
            
            {/* Future Integrations Placeholders */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 opacity-40 grayscale pointer-events-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M18 20a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3"/><circle cx="12" cy="9" r="4"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Slack</h3>
                  <p className="text-sm text-gray-400">Receive incident alerts in your channels</p>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-blue-500/50" />
              </div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-4">Coming Soon</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
              <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4">Security Notice</h4>
              <p className="text-sm text-blue-200/80 leading-relaxed">
                CatchMe AI encrypts all access tokens using industry-standard AES-256 encryption. We never store tokens in plain text and only use them to perform the specific actions you authorize.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">Documentation</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-between group">
                    Setting up GitHub OAuth
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-between group">
                    Repository Permissions
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
