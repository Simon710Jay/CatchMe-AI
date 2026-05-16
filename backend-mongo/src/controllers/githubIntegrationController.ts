import { FastifyRequest, FastifyReply } from 'fastify';
import GitHubIntegration from '../models/GitHubIntegration';
import { encrypt } from '../utils/encryption';
import { githubService } from '../github/githubService';
import { logger } from '../logger/logger';
import axios from 'axios';

export const githubIntegrationController = {
  getSettings: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId } = request.query as { workspaceId: string };
      const integration = await GitHubIntegration.findOne({ workspaceId }).select('-accessToken');
      
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
      const { workspaceId, token, owner, repo, defaultBranch } = request.body as any;

      if (!token || !owner || !repo) {
        return reply.status(400).send({
          success: false,
          message: 'Missing required fields: token, owner, repo'
        });
      }

      // Test connection before saving
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
          authType: 'token',
          defaultBranch: defaultBranch || 'main',
          connected: true
        },
        { upsert: true, new: true }
      ).select('-accessToken');

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
      const { workspaceId } = request.body as { workspaceId: string };
      const integration = await GitHubIntegration.findOne({ workspaceId });

      if (!integration) {
        return reply.status(404).send({
          success: false,
          message: 'No integration found'
        });
      }

      const { decrypt } = require('../utils/encryption');
      const token = decrypt(integration.accessToken);

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

  disconnect: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId } = request.body as { workspaceId: string };
      await GitHubIntegration.deleteOne({ workspaceId });
      
      return reply.send({
        success: true,
        message: 'Disconnected successfully'
      });
    } catch (error: any) {
      logger.error(`Disconnect error: ${error.message}`);
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

      // Note: In a real multi-tenant app, we'd need to know the workspaceId here.
      // Usually passed via 'state' param in OAuth.
      // For this demo, we'll use a default workspaceId or handle state.
      
      return reply.send({
        success: true,
        token: access_token // Send back to frontend to complete setup
      });
    } catch (error: any) {
      logger.error(`OAuth callback error: ${error.message}`);
      throw error;
    }
  }
};
