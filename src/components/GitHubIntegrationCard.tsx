"use client";
import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { GitHubIntegration, GitHubRepository } from '../types';
import { toast } from 'sonner';
import { getSocket } from '../services/socket';

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

  const workspaceId = 'default-workspace';

  useEffect(() => {
    const initSessionAndFetch = async () => {
      try {
        // 1. Get user session JWT token and save in localStorage
        const sessionRes = await dashboardApi.authSession();
        if (sessionRes.success && sessionRes.token) {
          localStorage.setItem('catchme_jwt', sessionRes.token);
        }
        
        // 2. Fetch connection settings
        await fetchSettings();
      } catch (error) {
        console.error('Session initialization error:', error);
        setIsLoading(false);
      }
    };

    initSessionAndFetch();

    // 3. Handle OAuth URL query parameters
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const success = searchParams.get('oauth_success');
      const errorMsg = searchParams.get('oauth_error');

      if (success === 'true') {
        toast.success('Successfully connected to GitHub via OAuth!', {
          description: 'Your repositories have been synced successfully.',
          duration: 5000,
        });
        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (errorMsg) {
        toast.error('GitHub Connection Failed', {
          description: decodeURIComponent(errorMsg),
          duration: 6000,
        });
        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // 4. Set up socket listeners for real-time updates
    const socket = getSocket();
    
    const handleConnected = (data: any) => {
      console.log('[SOCKET] github-connected received:', data);
      fetchSettings();
      toast.success('GitHub connection updated via WebSocket!');
    };

    const handleDisconnected = (data: any) => {
      console.log('[SOCKET] github-disconnected received:', data);
      setIntegration(null);
      setOwner('');
      setRepo('');
      setDefaultBranch('main');
      toast.info('GitHub integration disconnected.');
    };

    const handleSynced = (data: any) => {
      console.log('[SOCKET] repositories-synced received:', data);
      fetchSettings();
    };

    socket.on('github-connected', handleConnected);
    socket.on('github-disconnected', handleDisconnected);
    socket.on('repositories-synced', handleSynced);

    return () => {
      socket.off('github-connected', handleConnected);
      socket.off('github-disconnected', handleDisconnected);
      socket.off('repositories-synced', handleSynced);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await dashboardApi.getGitHubOAuthStatus();
      if (res.success && res.connected) {
        setIntegration(res.data);
        if (res.data.activeRepo) {
          setOwner(res.data.activeRepo.owner);
          setRepo(res.data.activeRepo.repo);
          setDefaultBranch(res.data.activeRepo.defaultBranch || 'main');
        }
      } else {
        // Fall back to legacy settings in case PAT is used
        const legacyRes = await dashboardApi.getGitHubSettings(workspaceId);
        if (legacyRes.success && legacyRes.data.connected) {
          setIntegration({
            ...legacyRes.data,
            authType: legacyRes.data.authType || 'token'
          });
          setOwner(legacyRes.data.owner || '');
          setRepo(legacyRes.data.repo || '');
          setDefaultBranch(legacyRes.data.defaultBranch || 'main');
        } else {
          setIntegration(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
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
        toast.success('GitHub Personal Access Token connection saved!');
        setIntegration({
          ...res.data,
          authType: 'token'
        });
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
    setIsLoading(true);
    try {
      const token = localStorage.getItem('catchme_jwt');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      window.location.href = `${backendUrl}/api/integrations/github/login?token=${token}`;
    } catch (error) {
      toast.error('Failed to start OAuth flow');
      setIsLoading(false);
    }
  };

  const handleSelectRepository = async (repoNameWithOwner: string) => {
    if (!repoNameWithOwner) return;
    const [selectedOwner, selectedRepo] = repoNameWithOwner.split('/');
    
    // Find the repo in connectedRepositories to get the defaultBranch
    const repoInfo = integration?.connectedRepositories?.find(
      r => r.owner === selectedOwner && r.name === selectedRepo
    );
    const selectedBranch = repoInfo?.defaultBranch || 'main';

    setIsLoading(true);
    try {
      const res = await dashboardApi.selectGitHubRepository(selectedOwner, selectedRepo, selectedBranch);
      if (res.success) {
        toast.success(`Active repository configured to ${selectedOwner}/${selectedRepo}`);
        setOwner(selectedOwner);
        setRepo(selectedRepo);
        setDefaultBranch(selectedBranch);
        fetchSettings();
      } else {
        toast.error(res.message || 'Failed to select repository');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error configuring active repository');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const res = await dashboardApi.testGitHubConnection(workspaceId);
      if (res.success && res.isValid) {
        toast.success('GitHub connection is active and verified!');
      } else {
        toast.error('Connection verification failed. Please check permissions or token validity.');
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect GitHub? This will remove all repository permissions.')) return;
    setIsLoading(true);
    try {
      const res = await dashboardApi.disconnectGitHubOAuth();
      if (res.success) {
        toast.success('GitHub integration disconnected');
        setIntegration(null);
        setOwner('');
        setRepo('');
        setDefaultBranch('main');
      } else {
        toast.error(res.message || 'Failed to disconnect');
      }
    } catch (error) {
      toast.error('Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card/40 backdrop-blur-md border border-card-border rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center animate-pulse">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl" />
            <div className="space-y-2 py-1">
              <div className="h-4 bg-white/10 w-32 rounded" />
              <div className="h-3 bg-white/10 w-48 rounded" />
            </div>
          </div>
          <div className="w-24 h-6 bg-white/10 rounded-full" />
        </div>
        <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  const isConnected = !!integration;
  const connectedDate = integration?.connectedAt 
    ? new Date(integration.connectedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="bg-card/40 backdrop-blur-md border border-card-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5">
      {/* Card Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              GitHub Integration
              {isConnected && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400">Automate remediation PRs in your repositories</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
          isConnected 
            ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-sm shadow-green-500/10' 
            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }`}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!isConnected ? (
          <div className="space-y-6">
            <p className="text-sm text-gray-400 leading-relaxed">
              Connect your GitHub account to enable CatchMe AI to automatically detect vulnerabilities, run security scans, and submit remediation Pull Requests directly to your codebase.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={handleOAuthConnect}
                className="flex flex-col text-left p-5 bg-gradient-to-br from-blue-600/10 to-blue-500/5 hover:from-blue-600/20 hover:to-blue-500/10 border border-blue-500/25 hover:border-blue-500/40 rounded-xl transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  </svg>
                </div>
                <span className="font-bold text-white text-base">Connect with OAuth</span>
                <span className="text-xs text-blue-300/60 mt-1.5 leading-relaxed">
                  Fast, secure authentication. Automatically pulls and lists your repositories.
                </span>
              </button>

              <button 
                onClick={() => setIsManualMode(!isManualMode)}
                className={`flex flex-col text-left p-5 transition-all duration-300 border rounded-xl hover:scale-[1.02] cursor-pointer ${
                  isManualMode 
                    ? 'bg-purple-600/10 border-purple-500/40' 
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center mb-4 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <span className="font-bold text-white text-base">Personal Access Token</span>
                <span className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  Use for granular control or locked down corporate environments.
                </span>
              </button>
            </div>

            {isManualMode && (
              <form onSubmit={handleManualSave} className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in-50 duration-300">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Token Settings</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Access Token</label>
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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repository Owner</label>
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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repository Name</label>
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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default Branch</label>
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
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 hover:shadow-purple-500/30"
                >
                  {isLoading ? 'Connecting...' : 'Save & Connect Repository'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connected User Profile Card */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                {integration.avatarUrl ? (
                  <img 
                    src={integration.avatarUrl} 
                    alt={integration.username || 'GitHub User'} 
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg border border-white/10">
                    {integration.username?.charAt(0).toUpperCase() || 'GH'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white">{integration.username || 'Connected User'}</h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    GitHub Account Integration
                  </p>
                </div>
              </div>
              
              <div className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                integration.authType === 'oauth' 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {integration.authType === 'oauth' ? 'OAuth App' : 'PAT Token'}
              </div>
            </div>

            {/* Sync Metadata Dashboard */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Repositories</p>
                <p className="text-lg font-black text-white mt-1">
                  {integration.connectedRepositories?.length || 1}
                </p>
              </div>
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Auth Method</p>
                <p className="text-xs font-bold text-white mt-2 uppercase tracking-wide">
                  {integration.authType === 'oauth' ? 'OAuth 2.0' : 'Token'}
                </p>
              </div>
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connected</p>
                <p className="text-xs font-bold text-white mt-2">
                  {connectedDate || 'Recent'}
                </p>
              </div>
            </div>

            {/* Repository Select Dropdown (Active Repos Selector) */}
            {integration.authType === 'oauth' ? (
              <div className="space-y-2.5 bg-white/[0.01] border border-white/5 rounded-xl p-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Select Monitored Repository
                </label>
                <div className="relative">
                  <select
                    value={owner && repo ? `${owner}/${repo}` : ''}
                    onChange={(e) => handleSelectRepository(e.target.value)}
                    className="w-full bg-black/60 hover:bg-black/90 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer transition-all pr-10"
                  >
                    <option value="" disabled className="bg-neutral-900 text-gray-500">-- Choose a repository --</option>
                    {integration.connectedRepositories?.map((r, idx) => (
                      <option 
                        key={idx} 
                        value={`${r.owner}/${r.name}`}
                        className="bg-neutral-900 text-white py-2"
                      >
                        {r.owner}/{r.name} {r.private ? '🔒' : '🌐'}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
                
                {owner && repo && (
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <line x1="6" x2="10" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                      </svg>
                      Active Branch: <strong className="text-white font-mono">{defaultBranch}</strong>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // PAT static active repository display
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Repository (PAT)</p>
                    <p className="text-white font-mono text-sm font-semibold">{owner}/{repo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Branch</p>
                  <p className="text-white font-mono text-sm">{defaultBranch}</p>
                </div>
              </div>
            )}

            {/* Test connection and Disconnect Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={testConnection}
                disabled={isTesting}
                className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
              >
                {isTesting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                  </svg>
                )}
                Verify Connection
              </button>
              <button 
                onClick={handleDisconnect}
                className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-all hover:scale-[1.01]"
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
