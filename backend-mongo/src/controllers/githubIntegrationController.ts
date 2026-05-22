import { FastifyRequest, FastifyReply } from 'fastify';
import GitHubIntegration from '../models/GitHubIntegration';
import { encrypt, decrypt } from '../utils/encryption';
import { githubService } from '../github/githubService';
import { logger } from '../logger/logger';
import axios from 'axios';
import crypto from 'crypto';

// 🎯 STRICT TYPE SAFETY INTERFACES (Requirement 13)
export interface GitHubOAuthState {
  payload: {
    workspaceId: string;
    userId: string;
    timestamp: number;
  };
  sig: string;
}

export interface GitHubAccessTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  email?: string;
}

export interface GitHubRepository {
  name: string;
  owner: {
    login: string;
  };
  private: boolean;
  default_branch?: string;
}

export const githubIntegrationController = {
  // --- LEGACY ENDPOINTS (Preserved for backwards-compatibility) ---
  
  getSettings: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId = 'default-workspace' } = request.query as { workspaceId: string };
      const integration = await GitHubIntegration.findOne({ workspaceId }).select('-accessToken -accessTokenEncrypted');
      
      return reply.send({
        success: true,
        data: integration || { connected: false }
      });
    } catch (error: any) {
      logger.error(`Get settings error: ${error.message}`);
      throw error;
    }
  },

  saveManualToken: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId = 'default-workspace', token, owner, repo, defaultBranch } = request.body as any;

      if (!token || !owner || !repo) {
        return reply.status(400).send({
          success: false,
          message: 'Missing required fields: token, owner, repo'
        });
      }

      const isValid = await githubService.verifyToken(token, owner, repo);
      if (!isValid) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid GitHub token or repository access'
        });
      }

      const encryptedToken = encrypt(token);

      const integration = await GitHubIntegration.findOneAndUpdate(
        { workspaceId },
        {
          owner,
          repo,
          accessToken: encryptedToken,
          accessTokenEncrypted: encryptedToken,
          authType: 'token',
          defaultBranch: defaultBranch || 'main',
          connected: true,
          status: 'connected',
          connectedAt: new Date(),
          lastUsedAt: new Date()
        },
        { upsert: true, new: true }
      ).select('-accessToken -accessTokenEncrypted');

      const { broadcast } = require('../websocket/socket');
      broadcast('github-connected', {
        workspaceId,
        authType: 'token',
        owner,
        repo,
        status: 'connected'
      });

      return reply.send({
        success: true,
        data: integration
      });
    } catch (error: any) {
      logger.error(`Save manual token error: ${error.message}`);
      throw error;
    }
  },

  testConnection: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId = 'default-workspace' } = request.body as { workspaceId: string };
      const integration = await GitHubIntegration.findOne({ workspaceId });

      if (!integration) {
        return reply.status(404).send({
          success: false,
          message: 'No integration found'
        });
      }

      const token = decrypt(integration.accessToken || integration.accessTokenEncrypted || '');
      const isValid = await githubService.verifyToken(token, integration.owner, integration.repo);

      return reply.send({
        success: true,
        isValid
      });
    } catch (error: any) {
      logger.error(`Test connection error: ${error.message}`);
      throw error;
    }
  },

  getOAuthUrl: async (request: FastifyRequest, reply: FastifyReply) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/github/callback`;
    const scope = 'repo read:org workflow';
    
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    return reply.send({ success: true, url });
  },

  handleCallback: async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.query as { code: string };
    
    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      }, {
        headers: { Accept: 'application/json' }
      });

      const { access_token } = response.data;
      if (!access_token) throw new Error('Failed to obtain access token');
      
      return reply.send({
        success: true,
        token: access_token
      });
    } catch (error: any) {
      logger.error(`OAuth callback error: ${error.message}`);
      throw error;
    }
  },

  // --- 🎯 NEW SECURE PRODUCTION GITHUB OAUTH ENDPOINTS ---

  login: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Detailed Pino Logger support (Requirement 7 & 14)
      logger.info("Starting GitHub OAuth flow...");

      const { workspaceId = 'default-workspace', userId = 'dev-user-123' } = request.query as any;

      // 1. Generate secure OAuth state token (Requirement 8)
      const statePayload = { workspaceId, userId, timestamp: Date.now() };
      const stateSig = crypto
        .createHmac('sha256', process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long-!!!')
        .update(JSON.stringify(statePayload))
        .digest('hex');
      const state = Buffer.from(JSON.stringify({ payload: statePayload, sig: stateSig })).toString('base64url');

      // 2. Build GitHub OAuth URL using exact template (Requirement 3 / v8)
      const githubOAuthUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${process.env.GITHUB_CLIENT_ID}` +
        `&redirect_uri=${process.env.GITHUB_CALLBACK_URL}` +
        `&scope=repo read:user user:email` +
        `&state=${state}`;

      logger.info(`GitHub OAuth redirect generated: ${githubOAuthUrl}`);

      // 3. Redirect user to GitHub (v9)
      return reply.redirect(githubOAuthUrl);
    } catch (error: any) {
      logger.error(`GitHub OAuth login error: ${error.message}`);
      return reply.status(500).send({
        success: false,
        error: { code: 'OAUTH_URL_FAILURE', message: 'Failed to generate GitHub OAuth URL' }
      });
    }
  },

  callback: async (request: FastifyRequest, reply: FastifyReply) => {
    // Pino Log: Callback received (Requirement 7)
    logger.info("GitHub OAuth callback received.");

    const { code, state } = request.query as { code: string, state: string };

    try {
      if (!code || !state) {
        logger.error("GitHub OAuth callback failure: Missing auth code or CSRF state parameter.");
        
        // Emit socket failure event
        const { broadcast } = require('../websocket/socket');
        broadcast('oauth-failed', { message: 'Missing auth code or CSRF state parameter' });

        return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/integrations?error=missing_params`);
      }

      // 1. Validate Returned State Parameter (Requirement 8)
      let workspaceId = 'default-workspace';
      let userId = 'dev-user-123';
      try {
        const decodedState: GitHubOAuthState = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        const expectedSig = crypto
          .createHmac('sha256', process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long-!!!')
          .update(JSON.stringify(decodedState.payload))
          .digest('hex');
        
        if (decodedState.sig !== expectedSig) {
          logger.error("GitHub OAuth callback failure: CSRF Warning - State token signature mismatch.");
          
          const { broadcast } = require('../websocket/socket');
          broadcast('oauth-failed', { message: 'CSRF Protection: State token signature mismatch' });

          return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/integrations?error=invalid_state`);
        }

        // Expire state token after 15 minutes (Requirement 8 / 10)
        const timeDiff = Date.now() - decodedState.payload.timestamp;
        if (timeDiff > 15 * 60 * 1000) {
          logger.error("GitHub OAuth callback failure: Expired state token presented.");
          
          const { broadcast } = require('../websocket/socket');
          broadcast('oauth-failed', { message: 'CSRF Protection: State token expired' });

          return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/integrations?error=expired_state`);
        }

        workspaceId = decodedState.payload.workspaceId;
        userId = decodedState.payload.userId;
      } catch (err: any) {
        logger.error(`GitHub OAuth callback failure: State verification error: ${err.message}`);
        return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/integrations?error=state_verification_error`);
      }

      // 2. Exchange Authorization Code for GitHub Access Token (Requirement 5 & 7)
      logger.info("GitHub OAuth token exchange started...");
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      }, {
        headers: { Accept: 'application/json' }
      });

      const tokenData = tokenResponse.data as GitHubAccessTokenResponse;
      const { access_token, error, error_description } = tokenData;
      
      if (error || !access_token) {
        logger.error(`GitHub OAuth callback failure: Token exchange failed: ${error} - ${error_description}`);
        
        const { broadcast } = require('../websocket/socket');
        broadcast('oauth-failed', { message: error_description || error || 'Token exchange failed' });

        return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/integrations?error=token_exchange_failed`);
      }

      // 3. Fetch GitHub Profile details (Requirement 5 & 7)
      logger.info("Requesting developer profile from GitHub API...");
      const profileResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json'
        }
      });
      
      const githubUser = profileResponse.data as GitHubUser;
      const githubId = String(githubUser.id);
      const username = githubUser.login;
      const avatarUrl = githubUser.avatar_url;
      logger.info(`GitHub profile fetched: ${username}`);

      // 4. Fetch Connected Repositories list (Requirement 5 & 7)
      logger.info("Fetching repository directory from GitHub API...");
      const reposResponse = await axios.get('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json'
        }
      });
      
      const reposList = reposResponse.data as GitHubRepository[];
      logger.info(`GitHub repositories fetched: Found ${reposList.length} repositories.`);

      const connectedRepositories = reposList.map((r) => ({
        name: r.name,
        owner: r.owner.login,
        private: r.private,
        defaultBranch: r.default_branch || 'main'
      }));

      // Encrypt the access token securely using AES-256 (Requirement 12)
      const encryptedToken = encrypt(access_token);

      // Default the primary active repo to the first repository in list for backwards compatibility
      const defaultActiveRepo = connectedRepositories[0] || { name: 'none', owner: 'none', defaultBranch: 'main' };

      // 5. Store / Update Integration Record in MongoDB (Requirement 5)
      const integration = await GitHubIntegration.findOneAndUpdate(
        { workspaceId },
        {
          userId,
          githubId,
          username,
          avatarUrl,
          accessToken: encryptedToken, // legacy PAT fallback compatibility
          accessTokenEncrypted: encryptedToken, // OAuth encrypted token
          connectedRepositories,
          connectedAt: new Date(),
          lastUsedAt: new Date(),
          status: 'connected',
          owner: defaultActiveRepo.owner,
          repo: defaultActiveRepo.name,
          defaultBranch: defaultActiveRepo.defaultBranch,
          authType: 'oauth',
          connected: true
        },
        { upsert: true, new: true }
      );

      logger.info(`GitHub connection successfully stored for ${username} on workspace ${workspaceId}`);

      // 6. Broadcast socket events to frontend instantly (Requirement 11)
      const { broadcast } = require('../websocket/socket');
      broadcast('github-connected', {
        workspaceId,
        username,
        avatarUrl,
        repoCount: connectedRepositories.length,
        connectedAt: integration.connectedAt,
        status: 'connected',
        activeRepo: `${integration.owner}/${integration.repo}`
      });
      broadcast('repositories-synced', { repos: connectedRepositories });

      // 7. Generate JWT Session Token for frontend callback authentication
      const { signToken } = require('../middleware/auth');
      const frontendJwt = signToken({ userId, workspaceId });

      // Redirect back to integrations page with JWT parameter (Requirement 5)
      return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/integrations?success=true&token=${frontendJwt}`);
    } catch (err: any) {
      logger.error(`GitHub OAuth callback failure: Callback flow failure: ${err.message}`);
      
      const { broadcast } = require('../websocket/socket');
      broadcast('oauth-failed', { message: err.message || 'Internal callback error' });

      return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/integrations?error=callback_failed`);
    }
  },

  status: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const workspaceId = request.user?.workspaceId || 'default-workspace';
      const integration = await GitHubIntegration.findOne({ workspaceId }).select('-accessToken -accessTokenEncrypted');
      
      return reply.send({
        success: true,
        data: integration || { connected: false }
      });
    } catch (error: any) {
      logger.error(`GitHub OAuth status retrieval error: ${error.message}`);
      return reply.status(500).send({
        success: false,
        error: { code: 'STATUS_FETCH_FAILURE', message: 'Failed to read connection status' }
      });
    }
  },

  selectActiveRepo: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const workspaceId = request.user?.workspaceId || 'default-workspace';
      const { owner, repo, defaultBranch } = request.body as any;

      if (!owner || !repo) {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_PARAMETERS', message: 'Missing owner or repository properties' }
        });
      }

      const integration = await GitHubIntegration.findOneAndUpdate(
        { workspaceId },
        {
          owner,
          repo,
          defaultBranch: defaultBranch || 'main',
          lastUsedAt: new Date()
        },
        { new: true }
      ).select('-accessToken -accessTokenEncrypted');

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: { code: 'INTEGRATION_NOT_FOUND', message: 'Integration record not found' }
        });
      }

      logger.info(`GitHub switched active repository to ${owner}/${repo}`);

      const { broadcast } = require('../websocket/socket');
      broadcast('github-connected', {
        workspaceId,
        username: integration.username,
        avatarUrl: integration.avatarUrl,
        repoCount: integration.connectedRepositories?.length || 0,
        connectedAt: integration.connectedAt,
        status: 'connected',
        activeRepo: `${owner}/${repo}`
      });

      return reply.send({
        success: true,
        data: integration
      });
    } catch (error: any) {
      logger.error(`GitHub active repository selector error: ${error.message}`);
      return reply.status(500).send({
        success: false,
        error: { code: 'REPO_SELECT_FAILURE', message: 'Failed to set active repository' }
      });
    }
  },

  disconnect: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const workspaceId = request.user?.workspaceId || (request.body as any)?.workspaceId || 'default-workspace';
      
      logger.info(`GitHub terminating connection for workspace: ${workspaceId}`);
      await GitHubIntegration.deleteOne({ workspaceId });
      
      const { broadcast } = require('../websocket/socket');
      broadcast('github-disconnected', { workspaceId });

      return reply.send({
        success: true,
        message: 'GitHub OAuth integration revoked successfully'
      });
    } catch (error: any) {
      logger.error(`GitHub disconnection failure: ${error.message}`);
      return reply.status(500).send({
        success: false,
        error: { code: 'DISCONNECT_FAILURE', message: 'Failed to disconnect GitHub' }
      });
    }
  }
};
