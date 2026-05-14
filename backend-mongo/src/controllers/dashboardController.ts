import { FastifyRequest, FastifyReply } from 'fastify';
import { StatsService } from '../services/statsService';
import { logger } from '../logger/logger';

export const dashboardController = {
  getSummary: async (request: FastifyRequest, reply: FastifyReply) => {
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
          avgResponseTime: stats.responseTime,
          systemHealth: stats.healthScore,
          criticalIncidents: stats.criticalIncidents,
          resolvedIncidents: stats.resolvedIncidents,
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
