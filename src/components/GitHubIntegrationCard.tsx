"use client";
import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { GitHubIntegration } from '../types';
import { toast } from 'sonner';
import { getSocket } from '../services/socket';

export const GitHubIntegrationCard: React.FC = () => {
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  
  // Continuous Monitoring state
  const [monitoringConfig, setMonitoringConfig] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isConfiguringMonitor, setIsConfiguringMonitor] = useState(false);
  const [isSavingMonitor, setIsSavingMonitor] = useState(false);

  // Manual PAT form state
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');

  const workspaceId = 'default-workspace';

  useEffect(() => {
    // 1. Process OAuth query token from redirect url callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const oauthToken = urlParams.get('token');
      const error = urlParams.get('error');

      if (success === 'true' && oauthToken) {
        localStorage.setItem('github_integration_jwt', oauthToken);
        toast.success('Successfully connected to GitHub via OAuth!');
        
        // Clean URL query parameters immediately
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (error) {
        toast.error(`OAuth connection failed: ${error.replace(/_/g, ' ')}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // 2. Load active integration status
    fetchSettings();

    // 3. Register real-time Socket.IO events for instant updates
    const socket = getSocket();
    
    socket.on('github-connected', (data: any) => {
      console.log('📡 Real-time Socket: GitHub connected', data);
      toast.success(`GitHub integration updated (${data.username || 'active'})`);
      
      // Update integration data instantly
      setIntegration((prev) => ({
        ...prev,
        connected: true,
        authType: data.authType || 'oauth',
        username: data.username,
        avatarUrl: data.avatarUrl,
        connectedAt: data.connectedAt,
        owner: data.activeRepo ? data.activeRepo.split('/')[0] : prev?.owner || '',
        repo: data.activeRepo ? data.activeRepo.split('/')[1] : prev?.repo || '',
        status: 'connected',
        workspaceId: data.workspaceId || workspaceId,
        provider: 'github',
        defaultBranch: prev?.defaultBranch || 'main',
        updatedAt: new Date().toISOString()
      }));
    });

    socket.on('repositories-synced', (data: any) => {
      console.log('📡 Real-time Socket: Repositories synced', data);
      setIntegration((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          connectedRepositories: data.repos
        };
      });
    });

    socket.on('github-disconnected', (data: any) => {
      console.log('📡 Real-time Socket: GitHub disconnected', data);
      toast.error('GitHub connection disconnected');
      setIntegration(null);
    });

    socket.on('oauth-failed', (data: any) => {
      console.log('📡 Real-time Socket: OAuth failed', data);
      toast.error(`GitHub OAuth connection failed: ${data.message || 'Unknown error'}`);
      setIsLoading(false);
    });

    socket.on('analysis-progress', (data: any) => {
      console.log('📡 Real-time Socket: Analysis progress', data);
      setAnalysisProgress(data.message);
    });

    socket.on('monitor-updated', (data: any) => {
      console.log('📡 Real-time Socket: Monitor updated', data);
      setMonitoringConfig(data);
    });

    return () => {
      socket.off('github-connected');
      socket.off('repositories-synced');
      socket.off('github-disconnected');
      socket.off('oauth-failed');
      socket.off('analysis-progress');
      socket.off('monitor-updated');
    };
  }, []);

  // Fetch monitoring config when integration changes
  useEffect(() => {
    if (integration?.connected && integration?.owner && integration?.repo) {
      dashboardApi.getWebhookConfig(`${integration.owner}/${integration.repo}`, workspaceId)
        .then(res => {
          if (res.success && res.data) {
            setMonitoringConfig(res.data);
            setWebhookUrl(res.data.webhookUrl || '');
            setWebhookSecret(res.data.webhookSecret || '');
          }
        })
        .catch(err => console.error('Failed to load webhook config', err));
    }
  }, [integration?.owner, integration?.repo, integration?.connected]);

  const fetchSettings = async () => {
    setIsLoading(true);
    let oauthSuccess = false;

    try {
      // First, try loading the secure OAuth status
      const res = await dashboardApi.getGitHubOAuthStatus();
      if (res.success && res.data && res.data.status === 'connected') {
        setIntegration(res.data);
        oauthSuccess = true;
      }
    } catch (error: any) {
      // If unauthorized (e.g. invalid/expired JWT), clean up localStorage
      if (error.response?.status === 401) {
        localStorage.removeItem('github_integration_jwt');
      }
      console.log('GitHub OAuth status check skipped or failed, trying legacy settings.');
    }

    if (!oauthSuccess) {
      try {
        // Fallback to legacy manual connection parameters
        const legacyRes = await dashboardApi.getGitHubSettings(workspaceId);
        if (legacyRes.success && legacyRes.data.connected) {
          setIntegration(legacyRes.data);
        } else {
          setIntegration(null);
        }
      } catch (error) {
        console.error('Failed to fetch legacy connection settings:', error);
        setIntegration(null);
      }
    }

    setIsLoading(false);
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
        setIntegration(res.data);
        setIsManualMode(false);
        setToken('');
      } else {
        toast.error(res.message || 'Failed to save token connection');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving PAT connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthConnect = () => {
    setIsLoading(true);
    // Directly redirect browser to our secure fastify login endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.location.href = `${backendUrl}/api/integrations/github/login?workspaceId=${workspaceId}`;
  };

  const handleSelectActiveRepo = async (fullRepoString: string) => {
    if (!fullRepoString) return;
    const [selectedOwner, selectedRepo] = fullRepoString.split('/');
    
    // Find the repo inside connectedRepositories to grab its default branch
    const repoInfo = integration?.connectedRepositories?.find(
      r => r.owner === selectedOwner && r.name === selectedRepo
    );

    const defaultBranchName = repoInfo?.defaultBranch || 'main';

    try {
      toast.loading(`Activating repository ${fullRepoString}...`, { id: 'repo-select' });
      
      const res = await dashboardApi.selectActiveGitHubRepo({
        owner: selectedOwner,
        repo: selectedRepo,
        defaultBranch: defaultBranchName
      });

      if (res.success) {
        toast.success(`Active repository changed to ${fullRepoString}!`, { id: 'repo-select' });
        setIntegration(res.data);
      } else {
        toast.error(res.message || 'Failed to select repository', { id: 'repo-select' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating active repository', { id: 'repo-select' });
    }
  };

  const analyzeRepository = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress('Starting analysis...');
    try {
      const res = await dashboardApi.analyzeRepository(workspaceId);
      if (res.success) {
        toast.success('Repository analyzed successfully!');
      } else {
        toast.error(res.message || 'Failed to analyze repository.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error analyzing repository');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const disconnect = async () => {
    if (!confirm('Are you sure you want to completely disconnect GitHub? This will remove all local encrypted tokens.')) return;
    
    setIsLoading(true);
    try {
      let res;
      if (integration?.authType === 'oauth') {
        res = await dashboardApi.disconnectGitHubOAuth();
        localStorage.removeItem('github_integration_jwt');
      } else {
        res = await dashboardApi.disconnectGitHub(workspaceId);
      }

      if (res.success) {
        toast.success('GitHub disconnected successfully.');
        setIntegration(null);
        setMonitoringConfig(null);
      } else {
        toast.error(res.message || 'Failed to disconnect');
      }
    } catch (error) {
      toast.error('Error disconnecting integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMonitor(true);
    try {
      const res = await dashboardApi.updateWebhookConfig({
        repositoryName: `${integration?.owner}/${integration?.repo}`,
        workspaceId,
        webhookUrl,
        webhookSecret,
        monitoringStatus: 'active'
      });
      if (res.success) {
        toast.success('Continuous monitoring started!');
        setMonitoringConfig(res.data);
        setIsConfiguringMonitor(false);
      } else {
        toast.error(res.message || 'Failed to configure monitoring.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error configuring monitoring');
    } finally {
      setIsSavingMonitor(false);
    }
  };

  const toggleMonitoring = async (status: 'active' | 'paused') => {
    try {
      const res = await dashboardApi.updateWebhookConfig({
        repositoryName: `${integration?.owner}/${integration?.repo}`,
        workspaceId,
        webhookUrl: monitoringConfig?.webhookUrl || '',
        webhookSecret: monitoringConfig?.webhookSecret || '',
        monitoringStatus: status
      });
      if (res.success) {
        toast.success(`Monitoring ${status === 'active' ? 'resumed' : 'paused'}.`);
        setMonitoringConfig(res.data);
      }
    } catch (error) {
      toast.error('Failed to update monitoring status');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-3 w-48 bg-white/5 rounded" />
            </div>
          </div>
          <div className="h-6 w-20 bg-white/5 rounded-full" />
        </div>
        <div className="h-28 bg-white/5 rounded-xl" />
      </div>
    );
  }

  const isOAuthConnected = integration?.connected && integration?.authType === 'oauth';
  const isPatConnected = integration?.connected && integration?.authType === 'token';
  const hasRepositories = integration?.connectedRepositories && integration.connectedRepositories.length > 0;

  // Filter repos based on search input
  const filteredRepos = integration?.connectedRepositories?.filter(r => 
    `${r.owner}/${r.name}`.toLowerCase().includes(repoSearchQuery.toLowerCase())
  ) || [];

  return (
    <div className="relative group">
      {/* Dynamic backdrop glow for connected premium SaaS state */}
      {integration?.connected && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      )}

      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center border border-white/10 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">GitHub Platform</h3>
              <p className="text-sm text-gray-400">Power remediation PR automations</p>
            </div>
          </div>

          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-500 shadow-sm ${
            integration?.connected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
              : 'bg-white/5 text-gray-400 border-white/10'
          }`}>
            {integration?.connected ? 'CONNECTED' : 'NOT CONNECTED'}
          </span>
        </div>

        <div className="p-6">
          {!integration?.connected ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <button 
                  onClick={handleOAuthConnect}
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600/10 to-blue-600/5 hover:from-blue-600/20 hover:to-blue-600/10 border border-blue-500/20 rounded-xl transition-all duration-300 group cursor-pointer shadow-lg shadow-blue-950/20"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-md shadow-blue-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                  </div>
                  <span className="font-bold text-white tracking-wide">Connect with OAuth</span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-2 bg-blue-500/10 px-2 py-0.5 rounded">RECOMMENDED</span>
                </button>

                <button 
                  onClick={() => setIsManualMode(!isManualMode)}
                  className={`flex flex-col items-center justify-center p-6 transition-all duration-300 border rounded-xl cursor-pointer ${
                    isManualMode 
                      ? 'bg-purple-900/15 border-purple-500/40 shadow-inner' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mb-4 text-gray-400 group-hover:scale-105 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <span className="font-bold text-white tracking-wide">Personal Access Token</span>
                  <span className="text-xs text-gray-400 mt-2">Manual repository configuration</span>
                </button>
              </div>

              {isManualMode && (
                <form onSubmit={handleManualSave} className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-300">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Personal Access Token</label>
                      <input 
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Repository Owner</label>
                      <input 
                        type="text"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        placeholder="e.g. Simon710Jay"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
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
                        placeholder="e.g. CatchMe-AI"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
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
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    Save & Link Repository
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Connected OAuth Profile Card */}
              {isOAuthConnected && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/[0.02] to-transparent border border-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    {integration.avatarUrl ? (
                      <img 
                        src={integration.avatarUrl} 
                        alt={integration.username} 
                        className="w-12 h-12 rounded-xl border border-white/10 shadow shadow-black"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-white text-lg">
                        {integration.username?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Connected Developer</p>
                      <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                        {integration.username}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-300">OAuth</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Connected at: {integration.connectedAt ? new Date(integration.connectedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Repos</p>
                    <p className="text-xl font-black text-white">{integration.connectedRepositories?.length || 0}</p>
                  </div>
                </div>
              )}

              {isPatConnected && (
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Manual Integration Mode</p>
                    <h4 className="text-sm font-bold text-white">Linked via Personal Access Token</h4>
                  </div>
                </div>
              )}

              {/* Active Repository Selection Card */}
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Remediation Repository</p>
                    <p className="text-base font-mono font-bold text-white mt-1">
                      {integration.owner}/{integration.repo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Branch</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse"><circle cx="5" cy="5" r="4" fill="currentColor"/></svg>
                      {integration.defaultBranch}
                    </span>
                  </div>
                </div>

                {/* 🎯 Dynamic Repository Selector (OAuth Only) */}
                {isOAuthConnected && hasRepositories && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                      <span>Change Connected Target Repository</span>
                      <span className="text-[10px] text-gray-500 font-normal normal-case">Select from authorized list</span>
                    </label>

                    <div className="relative">
                      {/* Search Bar inside Selector */}
                      <input 
                        type="text"
                        placeholder="🔍 Search connected repositories..."
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40 mb-2"
                      />

                      <select 
                        value={`${integration.owner}/${integration.repo}`}
                        onChange={(e) => handleSelectActiveRepo(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 cursor-pointer shadow-inner"
                      >
                        {filteredRepos.map((r, i) => (
                          <option key={i} value={`${r.owner}/${r.name}`}>
                            {r.owner}/{r.name} {r.private ? '🔒' : '🌐'} ({r.defaultBranch})
                          </option>
                        ))}
                        {filteredRepos.length === 0 && (
                          <option disabled value="">
                            No repositories match "{repoSearchQuery}"
                          </option>
                        )}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Utility Operations Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={analyzeRepository}
                  disabled={isAnalyzing}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[60px]"
                >
                  <div className="flex items-center gap-2">
                    {isAnalyzing ? (
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                    )}
                    <span>Sync & Analyze Repository</span>
                  </div>
                  {isAnalyzing && analysisProgress && (
                    <span className="text-[10px] text-blue-400 font-medium animate-pulse">{analysisProgress}</span>
                  )}
                </button>
                <button 
                  onClick={disconnect}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer"
                >
                  Disconnect GitHub
                </button>
              </div>

              {/* Continuous Monitoring Section */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      Continuous Monitoring
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-1">Real-time webhook events and AI risk analysis</p>
                  </div>
                  
                  {monitoringConfig?.monitoringStatus === 'active' ? (
                    <button 
                      onClick={() => toggleMonitoring('paused')}
                      className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold hover:bg-yellow-500/20 transition-all cursor-pointer"
                    >
                      Pause Monitoring
                    </button>
                  ) : monitoringConfig?.monitoringStatus === 'paused' ? (
                    <button 
                      onClick={() => toggleMonitoring('active')}
                      className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-all cursor-pointer"
                    >
                      Resume Monitoring
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsConfiguringMonitor(!isConfiguringMonitor)}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-all cursor-pointer"
                    >
                      Configure Webhook
                    </button>
                  )}
                </div>

                {isConfiguringMonitor && (
                  <form onSubmit={handleSaveMonitor} className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5 mt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Generic Webhook Proxy URL</label>
                      <input 
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="e.g., https://abc123.ngrok-free.app/api/webhooks/github"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        required
                      />
                      <p className="text-[10px] text-gray-500">Provide the public URL (e.g., ngrok) that GitHub should send payloads to.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Webhook Secret (Optional)</label>
                      <input 
                        type="password"
                        value={webhookSecret}
                        onChange={(e) => setWebhookSecret(e.target.value)}
                        placeholder="Secret for payload signature validation"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSavingMonitor}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingMonitor ? 'Saving...' : 'Start Continuous Monitoring'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
