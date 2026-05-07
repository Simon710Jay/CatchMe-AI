import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { LogSchema, LogInput } from '../types';
import { IncidentGroupingService } from '../services/incidentGroupingService';
import { addLogToQueue } from '../queue/logQueue';

const prisma = new PrismaClient();

export const logController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const logData = LogSchema.parse(request.body);
      
      // Store log
      const log = await prisma.log.create({
        data: {
          ...logData,
          timestamp: logData.timestamp ? new Date(logData.timestamp) : new Date(),
        },
      });

      // Group into incident
      const incident = await IncidentGroupingService.groupLogIntoIncident(log);

      // Queue for future AI analysis if critical
      if (log.severity === 'critical') {
        await addLogToQueue(incident.id, 'AI_ANALYSIS');
      }

      return reply.status(201).send({
        success: true,
        data: { log, incident },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid log format', details: error.errors },
        });
      }
      throw error;
    }
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, limit = 20, severity, service } = request.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const logs = await prisma.log.findMany({
      where: {
        severity: severity as string,
        service: service as string,
      },
      skip,
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
      include: { incident: true },
    });

    return reply.send({
      success: true,
      data: logs,
    });
  },
};
