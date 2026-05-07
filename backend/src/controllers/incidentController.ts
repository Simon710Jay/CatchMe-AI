import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const incidentController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const incidents = await prisma.incident.findMany({
      orderBy: [
        { severity: 'asc' }, // critical is first alphabetically if we order right, but let's be explicit
        { updatedAt: 'desc' },
      ],
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });

    // Custom sort for severity
    const severityOrder: Record<string, number> = { critical: 1, warning: 2, info: 3, resolved: 4 };
    const sortedIncidents = incidents.sort((a, b) => {
      return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
    });

    return reply.send({
      success: true,
      data: sortedIncidents,
    });
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

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
  },

  getAnalysis: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const analysis = await prisma.aIAnalysis.findUnique({
      where: { incidentId: id },
    });

    if (!analysis) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found for this incident' },
      });
    }

    return reply.send({
      success: true,
      data: analysis,
    });
  },
};
