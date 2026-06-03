import { FastifyRequest, FastifyReply } from 'fastify';
import { githubService } from './githubService';
import { AutomationPayload } from './githubTypes';

import GitHubIntegration from '../models/GitHubIntegration';
import { decrypt } from '../utils/encryption';

export const githubController = {
  async createPR(
    request: FastifyRequest<{ Body: AutomationPayload }>,
    reply: FastifyReply
  ) {
    try {
      const { incidentId } = request.body;
      if (!incidentId) {
        return reply.status(400).send({ error: 'incidentId is required' });
      }

      // 3. GitHub Integration Lookup
      const workspaceId = 'default-workspace'; // TODO: Get from auth context
      const integration = await GitHubIntegration.findOne({ workspaceId });
      
      if (!integration) {
        return reply.status(400).send({
          success: false,
          error: 'GitHub not connected. Please go to Settings > Integrations to connect your repository.'
        });
      }

      const token = decrypt(integration.accessToken);
      const { owner, repo } = integration;

      const pr = await githubService.triggerSafeAutomation(incidentId, { token, owner, repo });
      return reply.status(201).send({
        success: true,
        message: 'Draft PR created successfully',
        data: pr,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create PR automation',
      });
    }
  },

  async listPRs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const prs = await githubService.getPullRequests();
      return reply.send({
        success: true,
        data: prs,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch pull requests',
      });
    }
  },

  async getPR(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const pr = await githubService.getPullRequest(id);
      
      if (!pr) {
        return reply.status(404).send({ error: 'Pull request not found' });
      }

      return reply.send({
        success: true,
        data: pr,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch pull request',
      });
    }
  },
};
