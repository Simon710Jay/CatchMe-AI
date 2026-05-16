"use client";
import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { GitHubIntegration } from '../types';
import { toast } from 'sonner';

export const GitHubIntegrationCard: React.FC = () => {
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Form state
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');

  const workspaceId = 'default-workspace'; // Mock for now

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await dashboardApi.getGitHubSettings(workspaceId);
      if (res.success && res.data.connected) {
        setIntegration(res.data);
        setOwner(res.data.owner);
        setRepo(res.data.repo);
        setDefaultBranch(res.data.defaultBranch);
      } else {
        setIntegration(null);
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await dashboardApi.saveGitHubManual({
        workspaceId,
        token,
        owner,
        repo,
        defaultBranch
      });
      if (res.success) {
        toast.success('GitHub connection saved!');
        setIntegration(res.data);
        setIsManualMode(false);
        setToken('');
      } else {
        toast.error(res.message || 'Failed to save connection');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthConnect = async () => {
    try {
      const res = await dashboardApi.getGitHubOAuthUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      toast.error('Failed to start OAuth flow');
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const res = await dashboardApi.testGitHubConnection(workspaceId);
      if (res.success && res.isValid) {
        toast.success('Connection verified successfully!');
      } else {
        toast.error('Connection failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const disconnect = async () => {
    if (!confirm('Are you sure you want to disconnect GitHub?')) return;
    try {
      const res = await dashboardApi.disconnectGitHub(workspaceId);
      if (res.success) {
        toast.success('GitHub disconnected');
        setIntegration(null);
      }
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  if (isLoading) return <div className="animate-pulse bg-white/5 h-64 rounded-2xl" />;

  return (
    <div className="bg-card/40 backdrop-blur-md border border-card-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">GitHub Integration</h3>
            <p className="text-sm text-gray-400">Automate remediation PRs in your repositories</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          integration?.connected 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }`}>
          {integration?.connected ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      <div className="p-6">
        {!integration?.connected ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={handleOAuthConnect}
                className="flex flex-col items-center justify-center p-6 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                </div>
                <span className="font-bold text-white">Connect with OAuth</span>
                <span className="text-xs text-blue-300/60 mt-1">Recommended for individuals</span>
              </button>

              <button 
                onClick={() => setIsManualMode(!isManualMode)}
                className={`flex flex-col items-center justify-center p-6 transition-all border rounded-xl ${
                  isManualMode 
                    ? 'bg-purple-600/20 border-purple-500/50' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <span className="font-bold text-white">Personal Access Token</span>
                <span className="text-xs text-gray-400 mt-1">Manual configuration</span>
              </button>
            </div>

            {isManualMode && (
              <form onSubmit={handleManualSave} className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Personal Access Token</label>
                    <input 
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Repository Owner</label>
                    <input 
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      placeholder="e.g. facebook"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Repository Name</label>
                    <input 
                      type="text"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="e.g. react"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Default Branch</label>
                    <input 
                      type="text"
                      value={defaultBranch}
                      onChange={(e) => setDefaultBranch(e.target.value)}
                      placeholder="main"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Save & Connect Repository'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Repository</p>
                  <p className="text-white font-mono">{integration.owner}/{integration.repo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Branch</p>
                <p className="text-white font-mono">{integration.defaultBranch}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={testConnection}
                disabled={isTesting}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isTesting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                )}
                Test Connection
              </button>
              <button 
                onClick={disconnect}
                className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
