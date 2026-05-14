import { FastifyRequest, FastifyReply } from 'fastify';
import Log from '../models/Log';
import { LogSchema } from '../validators/logValidator';
import { IncidentGroupingService } from '../services/incidentGroupingService';
import { broadcast } from '../websocket/socket';
import { logger } from '../logger/logger';
import { parse } from 'json2csv';

export const logController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const logData = LogSchema.parse(request.body);

      const log = new Log({
        ...logData,
        timestamp: logData.timestamp ? new Date(logData.timestamp) : new Date(),
      });
      await log.save();

      // Broadcast new log
      broadcast('new-log', log);

      // Trigger incident grouping
      await IncidentGroupingService.groupLogIntoIncident((log._id as any).toString());

      return reply.status(201).send({
        success: true,
        data: log,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid log format', details: error.errors },
        });
      }
      logger.error(`Log creation error: ${error.message}`);
      throw error;
    }
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, limit = 20, severity, service } = request.query as any;
    const query: any = {};
    if (severity) query.severity = severity;
    if (service) query.service = service;

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('incidentId');

    return reply.send({
      success: true,
      data: logs,
    });
  },

  exportLogs: async (request: FastifyRequest, reply: FastifyReply) => {
    const { format } = request.query as { format?: string };
    try {
      const logs = await Log.find().lean();

      if (format === 'csv') {
        const fields = ['_id', 'message', 'service', 'severity', 'timestamp', 'statusCode', 'endpoint'];
        const csv = parse(logs, { fields });
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename=logs.csv');
        return reply.send(csv);
      }

      return reply.send({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      logger.error(`Log export error: ${error.message}`);
      throw error;
    }
  },
};
