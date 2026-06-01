import { OllamaService } from './ollamaService';
import { logger } from '../logger/logger';
import Incident from '../models/Incident';
import RepositoryMonitor from '../models/RepositoryMonitor';
import crypto from 'crypto';

export interface WebhookEventPayload {
  repositoryFullName: string;
  eventType: 'push' | 'pull_request' | 'issues' | 'workflow_run' | 'deployment';
  action?: string;
  sender: string;
  filesChanged: string[];
  commitMessages: string[];
  diffSummary?: string;
}

const CRITICAL_FILES = [
  'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.env.example', '.env.production', 'docker-compose.yml', 'Dockerfile',
  'prisma/schema.prisma', 'nginx.conf'
];

export const riskAnalyzer = {
  analyzeWebhookEvent: async (workspaceId: string, payload: WebhookEventPayload) => {
    try {
      logger.info(`Starting risk analysis for event: ${payload.eventType} on ${payload.repositoryFullName}`);
      
      const isCriticalFileChanged = payload.filesChanged.some(file => 
        CRITICAL_FILES.some(critical => file.endsWith(critical)) ||
        file.includes('.github/workflows/') ||
        file.includes('auth/') ||
        file.includes('middleware/') ||
        file.includes('security/')
      );

      const analysisType = isCriticalFileChanged ? 'Deep Analysis' : 'Lightweight Analysis';
      logger.info(`Selected analysis strategy: ${analysisType}`);

      const prompt = `
        You are CatchMe AI, a repository risk and impact analyzer.
        Review the following GitHub event summary and classify the risk severity.
        Event Type: ${payload.eventType}
        Sender: ${payload.sender}
        Changed Files: ${payload.filesChanged.join(', ')}
        Commit Messages: ${payload.commitMessages.join(' | ')}
        
        Is Critical File Changed? ${isCriticalFileChanged}
        
        Provide your assessment in the following strict JSON format:
        {
          "severity": "low" | "medium" | "high" | "critical",
          "probableCause": "Brief description of the change",
          "impact": "What is the impact of this change?",
          "recommendation": "What should the developer do?"
        }
        
        Severity Rules:
        - Critical: Authentication changes, Permission changes, Production env changes, DB schema deletions, Failed deployments, Critical workflow failures.
        - High: Dependency vulnerabilities, Large refactors, Security-sensitive files changed, Massive config changes.
        - Medium: Package upgrades, Moderate code churn, Non-critical workflow changes.
        - Low: README updates, Comments, Documentation, Styling, Minor refactors.
      `;

      const responseText = await OllamaService.generate(prompt, true);
      let analysisResult;
      try {
        analysisResult = JSON.parse(responseText);
      } catch (e) {
        logger.error(`Failed to parse Ollama JSON response: ${responseText}`);
        return;
      }

      const { severity, probableCause, impact, recommendation } = analysisResult;

      // Update RepositoryMonitor active risks and health score
      const monitor = await RepositoryMonitor.findOne({ workspaceId, repositoryName: payload.repositoryFullName });
      if (monitor) {
        if (severity === 'high' || severity === 'critical') {
          monitor.activeRisks.push({
            id: crypto.randomUUID(),
            severity,
            message: impact,
            detectedAt: new Date()
          });
          monitor.healthScore = Math.max(0, monitor.healthScore - (severity === 'critical' ? 10 : 5));
        } else if (severity === 'medium') {
          monitor.healthScore = Math.max(0, monitor.healthScore - 2);
        }
        
        monitor.lastScanTime = new Date();
        monitor.lastCommitMessage = payload.commitMessages[0] || monitor.lastCommitMessage;
        await monitor.save();

        const { broadcast } = require('../websocket/socket');
        broadcast('monitor-updated', monitor);
      }

      // Generate Incident only for High/Critical
      if (severity === 'high' || severity === 'critical') {
        logger.info(`Generating incident for ${severity} risk from ${payload.eventType}`);
        
        const incident = new Incident({
          title: `[${payload.eventType.toUpperCase()}] ${probableCause.substring(0, 50)}...`,
          service: payload.repositoryFullName,
          severity,
          count: 1,
          status: 'open',
          source: 'ai',
          isTest: false,
          githubRepo: payload.repositoryFullName,
          lastSeen: new Date(),
          logs: [{
            timestamp: new Date(),
            service: payload.repositoryFullName,
            message: `Event: ${payload.eventType}\nChanged Files: ${payload.filesChanged.join(', ')}\nCommit: ${payload.commitMessages.join(' | ')}`,
            severity
          }]
        });

        await incident.save();

        const { broadcast } = require('../websocket/socket');
        broadcast('incident-created', incident);
        broadcast('risk-detected', { incident, analysis: analysisResult });
      } else {
        logger.info(`Activity recorded for ${severity} risk (no incident generated).`);
        // We could store an activity log here if we had an Activity model.
      }
      
    } catch (error: any) {
      logger.error(`Error analyzing webhook event: ${error.message}`);
    }
  }
};
