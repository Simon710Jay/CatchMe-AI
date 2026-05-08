import { FastifyRequest, FastifyReply } from 'fastify';
import Incident from '../models/Incident';
import AIAnalysis from '../models/AIAnalysis';
import { logger } from '../logger/logger';
import { broadcast } from '../websocket/socket';
import { parse } from 'json2csv';

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

  resolve: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const incident = await Incident.findByIdAndUpdate(
        id,
        { status: 'resolved', severity: 'resolved' },
        { new: true }
      );

      if (!incident) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' },
        });
      }

      broadcast('incident-resolved', incident);
      logger.info(`Incident resolved: ${id}`);

      return reply.send({
        success: true,
        data: incident,
      });
    } catch (error: any) {
      logger.error(`Incident resolve error: ${error.message}`);
      throw error;
    }
  },

  exportIncidents: async (request: FastifyRequest, reply: FastifyReply) => {
    const { format } = request.query as { format?: string };
    try {
      const incidents = await Incident.find().lean();

      if (format === 'csv') {
        const fields = ['_id', 'title', 'service', 'severity', 'count', 'status', 'firstSeen', 'lastSeen'];
        const csv = parse(incidents, { fields });
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename=incidents.csv');
        return reply.send(csv);
      }

      return reply.send({
        success: true,
        data: incidents,
      });
    } catch (error: any) {
      logger.error(`Incident export error: ${error.message}`);
      throw error;
    }
  },

  getAnalysis: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const analysis = await AIAnalysis.findOne({ incidentId: id })
        .sort({ createdAt: -1 });

      if (!analysis) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'AI Analysis not found for this incident' },
        });
      }

      return reply.send({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      logger.error(`Get analysis error: ${error.message}`);
      throw error;
    }
  },
};
