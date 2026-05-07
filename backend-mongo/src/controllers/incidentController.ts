import { FastifyRequest, FastifyReply } from 'fastify';
import Incident from '../models/Incident';
import { logger } from '../logger/logger';

export const incidentController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const incidents = await Incident.find()
        .sort({ severity: 1, updatedAt: -1 });

      // Custom sort for severity (critical, warning, info, resolved)
      const severityOrder: Record<string, number> = { critical: 1, warning: 2, info: 3, resolved: 4 };
      const sortedIncidents = incidents.sort((a, b) => {
        return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
      });

      return reply.send({
        success: true,
        data: sortedIncidents,
      });
    } catch (error: any) {
      logger.error(`Incident list error: ${error.message}`);
      throw error;
    }
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    try {
      const incident = await Incident.findById(id);
      if (!incident) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' },
        });
      }

      return reply.send({
        success: true,
        data: incident,
      });
    } catch (error: any) {
      logger.error(`Incident get error: ${error.message}`);
      throw error;
    }
  },
};
