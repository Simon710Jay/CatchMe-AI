import { FastifyRequest, FastifyReply } from 'fastify';
import { StatsService } from '../services/statsService';
import RepositoryInsight from '../models/RepositoryInsight';
import { logger } from '../logger/logger';

export const dashboardController = {
  getSummary: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await StatsService.getDashboardStats();
      
      if (!stats) {
        throw new Error('Failed to retrieve dashboard stats');
      }

      // Check if a RepositoryInsight exists
      const workspaceId = 'default-workspace';
      const insight = await RepositoryInsight.findOne({ workspaceId });

      if (insight) {
        return reply.send({
          success: true,
          data: {
            activeIncidents: insight.openPRs,
            totalErrors: insight.failedWorkflows,
            avgResponseTime: insight.recentCommits,
            systemHealth: insight.healthScore,
            criticalIncidents: insight.staleBranches,
            resolvedIncidents: stats.resolvedIncidents,
            
            // Mixin repository info
            isRepositoryAnalyzed: true,
            repositoryName: insight.repositoryName,
            detectedTechnologies: insight.detectedTechnologies,
            healthScore: insight.healthScore,
            openPRs: insight.openPRs,
            failedWorkflows: insight.failedWorkflows,
            recentCommits: insight.recentCommits,
            staleBranches: insight.staleBranches,
            branchesCount: insight.branchesCount,
            commitsCount: insight.commitsCount,
            pullRequestsCount: insight.pullRequestsCount,
            workflowsCount: insight.workflowsCount,
            contributorsCount: insight.contributorsCount,
            issuesCount: insight.issuesCount
          },
        });
      }

      return reply.send({
        success: true,
        data: {
          activeIncidents: stats.activeIncidents,
          totalErrors: stats.totalErrors,
          avgResponseTime: stats.responseTime,
          systemHealth: stats.healthScore,
          criticalIncidents: stats.criticalIncidents,
          resolvedIncidents: stats.resolvedIncidents,
          isRepositoryAnalyzed: false
        },
      });
    } catch (error: any) {
      logger.error(`Dashboard summary error: ${error.message}`);
      throw error;
    }
  },

  getStats: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await StatsService.getDashboardStats();
      
      if (!stats) {
        throw new Error('Failed to retrieve dashboard stats');
      }

      return reply.send({
        success: true,
        data: {
          activeIncidents: stats.activeIncidents,
          totalErrors: stats.totalErrors,
          resolvedIncidents: stats.resolvedIncidents,
          criticalIncidents: stats.criticalIncidents,
        },
      });
    } catch (error: any) {
      logger.error(`Dashboard stats error: ${error.message}`);
      throw error;
    }
  },
};
