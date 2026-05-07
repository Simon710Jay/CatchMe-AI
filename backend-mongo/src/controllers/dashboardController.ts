import { FastifyRequest, FastifyReply } from 'fastify';
import Log from '../models/Log';
import Incident from '../models/Incident';
import { logger } from '../logger/logger';

export const dashboardController = {
  getSummary: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [
        totalLogs,
        criticalLogs,
        activeIncidents,
        criticalIncidents,
        resolvedIncidents,
      ] = await Promise.all([
        Log.countDocuments(),
        Log.countDocuments({ severity: 'critical' }),
        Incident.countDocuments({ status: 'open' }),
        Incident.countDocuments({ status: 'open', severity: 'critical' }),
        Incident.countDocuments({ status: 'resolved' }),
      ]);

      // Mocking some metrics for now
      const healthPercentage = 100 - (criticalIncidents * 10);
      const responseTimeMs = 245;

      return reply.send({
        success: true,
        data: {
          activeIncidents,
          criticalIncidents,
          totalLogs,
          criticalLogs,
          resolvedIncidents,
          healthPercentage: Math.max(0, healthPercentage),
          responseTimeMs,
        },
      });
    } catch (error: any) {
      logger.error(`Dashboard summary error: ${error.message}`);
      throw error;
    }
  },
};
