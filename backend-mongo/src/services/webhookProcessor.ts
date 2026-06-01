import crypto from 'crypto';
import { logger } from '../logger/logger';
import RepositoryMonitor from '../models/RepositoryMonitor';
import { riskAnalyzer, WebhookEventPayload } from '../ai/riskAnalyzer';

export const webhookProcessor = {
  verifySignature: (payload: string, signature: string, secret: string) => {
    if (!signature || !secret) return false;
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  },

  processEvent: async (event: string, payload: any, signature: string) => {
    try {
      const repositoryFullName = payload.repository?.full_name;
      if (!repositoryFullName) return;

      const monitor = await RepositoryMonitor.findOne({ repositoryName: repositoryFullName });
      
      // If monitoring is not active, ignore
      if (!monitor || monitor.monitoringStatus !== 'active') {
        return;
      }

      // Verify signature if a secret is configured
      if (monitor.webhookSecret) {
        if (!webhookProcessor.verifySignature(JSON.stringify(payload), signature, monitor.webhookSecret)) {
          logger.warn(`Invalid webhook signature for ${repositoryFullName}`);
          return;
        }
      }

      let parsedEvent: WebhookEventPayload | null = null;

      if (event === 'push') {
        // Aggregate push
        const commits = payload.commits || [];
        const filesChanged = new Set<string>();
        const commitMessages = [];

        for (const commit of commits) {
          commitMessages.push(commit.message);
          commit.added?.forEach((f: string) => filesChanged.add(f));
          commit.modified?.forEach((f: string) => filesChanged.add(f));
          commit.removed?.forEach((f: string) => filesChanged.add(f));
        }

        parsedEvent = {
          repositoryFullName,
          eventType: 'push',
          sender: payload.sender?.login || 'unknown',
          filesChanged: Array.from(filesChanged),
          commitMessages
        };

        if (payload.after) {
          monitor.lastCommitSha = payload.after;
        }

      } else if (event === 'pull_request') {
        parsedEvent = {
          repositoryFullName,
          eventType: 'pull_request',
          action: payload.action,
          sender: payload.sender?.login || 'unknown',
          filesChanged: [], // Normally we'd fetch the PR diff via Octokit if we need the exact files
          commitMessages: [payload.pull_request?.title || '']
        };
      } else if (event === 'issues') {
        parsedEvent = {
          repositoryFullName,
          eventType: 'issues',
          action: payload.action,
          sender: payload.sender?.login || 'unknown',
          filesChanged: [],
          commitMessages: [payload.issue?.title || '']
        };
      } else if (event === 'workflow_run') {
        parsedEvent = {
          repositoryFullName,
          eventType: 'workflow_run',
          action: payload.action,
          sender: payload.sender?.login || 'unknown',
          filesChanged: [],
          commitMessages: [`Workflow ${payload.workflow_run?.name} completed with ${payload.workflow_run?.conclusion}`]
        };
      } else if (event === 'deployment_status') {
        parsedEvent = {
          repositoryFullName,
          eventType: 'deployment',
          action: payload.deployment_status?.state,
          sender: payload.sender?.login || 'unknown',
          filesChanged: [],
          commitMessages: [`Deployment ${payload.deployment_status?.state}`]
        };
      }

      if (parsedEvent) {
        // Pass to the risk analyzer in the background
        riskAnalyzer.analyzeWebhookEvent(monitor.workspaceId, parsedEvent);
      }

    } catch (error: any) {
      logger.error(`Error processing webhook event: ${error.message}`);
    }
  }
};
