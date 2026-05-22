import { FastifyRequest, FastifyReply } from 'fastify';
import GitHubIntegration from '../models/GitHubIntegration';
import { encrypt, decrypt } from '../utils/encryption';
import { githubService } from '../github/githubService';
import { logger } from '../logger/logger';
import { broadcast } from '../websocket/socket';
import { signJwt, verifyJwt } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';
import axios from 'axios';
import { Octokit } from '@octokit/rest';

export const githubIntegrationController = {
  // GET /api/integrations/github/login
  login: async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('[OAUTH] Login initiated.');
    try {
      const authHeader = request.headers.authorization;
      let token = '';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if ((request.query as any).token) {
        token = (request.query as any).token;
      }

      if (!token) {
        logger.error('[OAUTH] Unauthorized login request: No token provided');
        return reply.status(401).send({ success: false, message: 'Authentication required' });
      }

      const decoded = verifyJwt(token);
      if (!decoded || !decoded.userId) {
        logger.error('[OAUTH] Unauthorized login request: Invalid token');
        return reply.status(401).send({ success: false, message: 'Invalid or expired session' });
      }

      const clientId = process.env.GITHUB_CLIENT_ID;
      const redirectUri = process.env.GITHUB_CALLBACK_URL;

      if (!clientId || !redirectUri) {
        logger.error('[OAUTH] Missing client_id or callback_url environment variables');
        return reply.status(500).send({ success: false, message: 'OAuth configuration missing on server' });
      }

      // Generate a secure 10-minute state token with the userId inside to prevent CSRF
      const stateToken = signJwt({ userId: decoded.userId }, 10);
      const scopes = 'repo read:user user:email';

      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${stateToken}`;
      
      logger.info(`[OAUTH] Redirecting user ${decoded.userId} to GitHub OAuth`);
      return reply.redirect(url);
    } catch (error: any) {
      logger.error(`[OAUTH] Login redirection error: ${error.message}`);
      return reply.status(500).send({ success: false, message: 'Failed to start OAuth flow' });
    }
  },

  // GET /api/integrations/github/callback
  callback: async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('[OAUTH] Callback received from GitHub.');
    const { code, state, error: oauthError, error_description } = request.query as any;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (oauthError) {
      logger.error(`[OAUTH] GitHub Authorization denied: ${oauthError} - ${error_description}`);
      return reply.redirect(`${clientUrl}/settings/integrations?oauth_error=${encodeURIComponent(error_description || 'Access denied by user')}`);
    }

    try {
      if (!code || !state) {
        logger.error('[OAUTH] Callback missing code or state parameter');
        return reply.redirect(`${clientUrl}/settings/integrations?oauth_error=Missing+code+or+state`);
      }

      // 1. Validate State Token
      const decodedState = verifyJwt(state);
      if (!decodedState || !decodedState.userId) {
        logger.error('[OAUTH] Invalid or expired state token');
        return reply.redirect(`${clientUrl}/settings/integrations?oauth_error=Invalid+state+token+or+session+expired`);
      }

      const userId = decodedState.userId;
      logger.info(`[OAUTH] Validated state token for user: ${userId}`);

      // 2. Exchange Authorization Code for Access Token
      logger.info('[OAUTH] Exchanging auth code for access token...');
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: { Accept: 'application/json' },
        }
      );

      const { access_token, error: tokenError, error_description: tokenErrorDesc } = tokenResponse.data;
      if (tokenError || !access_token) {
        logger.error(`[OAUTH] Access token exchange failed: ${tokenError} - ${tokenErrorDesc}`);
        return reply.redirect(`${clientUrl}/settings/integrations?oauth_error=${encodeURIComponent(tokenErrorDesc || 'Failed to exchange token')}`);
      }

      logger.info('[OAUTH] Access token exchanged successfully.');

      // 3. Fetch GitHub Profile Details
      const octokit = new Octokit({ auth: access_token });
      logger.info('[OAUTH] Fetching user profile from GitHub...');
      const { data: profile } = await octokit.rest.users.getAuthenticated();
      logger.info(`[OAUTH] Fetched profile for GitHub user: ${profile.login} (${profile.id})`);

      // 4. Fetch User's Repositories
      logger.info('[OAUTH] Fetching user repositories from GitHub...');
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });
      logger.info(`[OAUTH] Fetched ${repos.length} repositories.`);

      const connectedRepositories = repos.map((repo: any) => ({
        name: repo.name,
        owner: repo.owner.login,
        private: repo.private,
        defaultBranch: repo.default_branch || 'main',
      }));

      // 5. Encrypt Token
      logger.info('[OAUTH] Encrypting access token...');
      const encryptedToken = encrypt(access_token);

      // 6. Find first repository as default active selection
      const firstRepo = connectedRepositories[0] || null;

      // 7. Upsert GitHubIntegration record in MongoDB
      logger.info(`[OAUTH] Upserting integration record for user ${userId}...`);
      const integration = await GitHubIntegration.findOneAndUpdate(
        { workspaceId: 'default-workspace' }, // Query compatibility
        {
          userId,
          githubId: String(profile.id),
          username: profile.login,
          avatarUrl: profile.avatar_url,
          accessTokenEncrypted: encryptedToken,
          accessToken: encryptedToken, // Legacy compatibility
          connectedRepositories,
          connectedAt: new Date(),
          lastUsedAt: new Date(),
          status: 'connected',
          authType: 'oauth',
          connected: true, // Legacy compatibility
          // Select default repo if not currently set
          ...(firstRepo && {
            owner: firstRepo.owner,
            repo: firstRepo.name,
            defaultBranch: firstRepo.defaultBranch,
          }),
        },
        { upsert: true, new: true }
      ).select('-accessToken -accessTokenEncrypted');

      logger.info('[OAUTH] Integration saved successfully.');

      // 8. Emit Socket.IO events for real-time frontend update
      broadcast('github-connected', {
        userId,
        username: profile.login,
        avatarUrl: profile.avatar_url,
        connectedRepositoriesCount: connectedRepositories.length,
      });

      broadcast('repositories-synced', {
        userId,
        repositories: connectedRepositories,
      });

      logger.info('[OAUTH] Emitted socket connection events.');

      // 9. Redirect back to frontend settings page with success flag
      return reply.redirect(`${clientUrl}/settings/integrations?oauth_success=true`);
    } catch (error: any) {
      logger.error(`[OAUTH] Callback handling crashed: ${error.message}`);
      return reply.redirect(`${clientUrl}/settings/integrations?oauth_error=${encodeURIComponent(error.message || 'Internal server error during callback processing')}`);
    }
  },

  // GET /api/integrations/github/status
  status: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const req = request as AuthenticatedRequest;
      const userId = req.user?.userId;
      
      const integration = await GitHubIntegration.findOne({ workspaceId: 'default-workspace' });
      
      if (!integration || !integration.connected) {
        return reply.send({
          success: true,
          connected: false,
        });
      }

      return reply.send({
        success: true,
        connected: true,
        data: {
          username: integration.username,
          avatarUrl: integration.avatarUrl,
          githubId: integration.githubId,
          connectedRepositories: integration.connectedRepositories || [],
          activeRepo: integration.owner ? {
            owner: integration.owner,
            repo: integration.repo,
            defaultBranch: integration.defaultBranch,
          } : null,
          connectedAt: integration.connectedAt || integration.createdAt,
          lastUsedAt: integration.lastUsedAt,
          status: integration.status,
          authType: integration.authType,
        },
      });
    } catch (error: any) {
      logger.error(`[OAUTH] Error fetching status: ${error.message}`);
      return reply.status(500).send({
        success: false,
        message: 'Failed to retrieve connection status',
      });
    }
  },

  // POST /api/integrations/github/disconnect
  disconnect: async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('[OAUTH] Disconnection initiated.');
    try {
      const req = request as AuthenticatedRequest;
      const userId = req.user?.userId;

      const result = await GitHubIntegration.deleteOne({ workspaceId: 'default-workspace' });
      
      logger.info(`[OAUTH] Deleted GitHubIntegration records. Count: ${result.deletedCount}`);

      // Emit socket event for instant UI update
      broadcast('github-disconnected', { userId });

      return reply.send({
        success: true,
        message: 'Disconnected and integration removed successfully',
      });
    } catch (error: any) {
      logger.error(`[OAUTH] Disconnection error: ${error.message}`);
      return reply.status(500).send({
        success: false,
        message: 'Failed to disconnect integration',
      });
    }
  },

  // POST /api/integrations/github/select-repo
  selectRepository: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { owner, repo, defaultBranch } = request.body as { owner: string; repo: string; defaultBranch: string };

      if (!owner || !repo) {
        return reply.status(400).send({
          success: false,
          message: 'Missing owner or repo fields',
        });
      }

      const integration = await GitHubIntegration.findOneAndUpdate(
        { workspaceId: 'default-workspace' },
        {
          owner,
          repo,
          defaultBranch: defaultBranch || 'main',
          lastUsedAt: new Date(),
        },
        { new: true }
      ).select('-accessToken -accessTokenEncrypted');

      if (!integration) {
        return reply.status(404).send({
          success: false,
          message: 'No active integration found to configure',
        });
      }

      logger.info(`[OAUTH] Configured active repository to ${owner}/${repo}`);

      // Emit update socket event
      broadcast('repositories-synced', {
        owner,
        repo,
        defaultBranch,
      });

      return reply.send({
        success: true,
        data: integration,
      });
    } catch (error: any) {
      logger.error(`[OAUTH] Select repository error: ${error.message}`);
      return reply.status(500).send({
        success: false,
        message: 'Failed to configure repository selection',
      });
    }
  },

  // BACKWARDS COMPATIBILITY MAPPINGS FOR LEGACY SYSTEM
  getSettings: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId = 'default-workspace' } = request.query as { workspaceId: string };
      const integration = await GitHubIntegration.findOne({ workspaceId }).select('-accessToken -accessTokenEncrypted');
      
      return reply.send({
        success: true,
        data: integration || { connected: false },
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
          message: 'Missing required fields: token, owner, repo',
        });
      }

      const isValid = await githubService.verifyToken(token, owner, repo);
      if (!isValid) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid GitHub token or repository access',
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
        },
        { upsert: true, new: true }
      ).select('-accessToken -accessTokenEncrypted');

      return reply.send({
        success: true,
        data: integration,
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
          message: 'No integration found',
        });
      }

      const token = decrypt(integration.accessTokenEncrypted || integration.accessToken || '');
      const owner = integration.owner;
      const repo = integration.repo;

      if (!token || !owner || !repo) {
        return reply.status(400).send({
          success: false,
          message: 'Integration is missing required fields to test connection',
        });
      }

      const isValid = await githubService.verifyToken(token, owner, repo);

      return reply.send({
        success: true,
        isValid,
      });
    } catch (error: any) {
      logger.error(`Test connection error: ${error.message}`);
      throw error;
    }
  },
};
