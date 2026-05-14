import { FastifyRequest, FastifyReply } from 'fastify';
import SystemMetric from '../models/SystemMetric';
import Incident from '../models/Incident';
import { logger } from '../logger/logger';
import { StatsService } from '../services/statsService';

export const metricsController = {
  getOverview: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await StatsService.getDashboardStats();
      
      return reply.send({
        success: true,
        data: {
          activeIncidents: stats?.activeIncidents || 0,
          totalErrors: stats?.totalErrors || 0,
          avgResponseTime: stats?.responseTime || 0,
          systemHealth: stats?.healthScore || 100,
        },
      });
    } catch (error: any) {
      logger.error(`Get overview metrics error: ${error.message}`);
      throw error;
    }
  },

  getHealthHistory: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const history = await SystemMetric.find()
        .sort({ timestamp: -1 })
        .limit(24) // Last 24 points (approx 4 mins if 10s interval, or adjust as needed)
        .select('timestamp healthScore cpuUsage memoryUsage responseTime');

      return reply.send({
        success: true,
        data: history.reverse(),
      });
    } catch (error: any) {
      logger.error(`Get health history error: ${error.message}`);
      throw error;
    }
  },

  getErrorDistribution: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const distribution = await Incident.aggregate([
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        critical: distribution.find(d => d._id === 'critical')?.count || 0,
        warning: distribution.find(d => d._id === 'warning')?.count || 0,
        resolved: await Incident.countDocuments({ status: 'resolved' })
      };

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error(`Get error distribution error: ${error.message}`);
      throw error;
    }
  },
};
