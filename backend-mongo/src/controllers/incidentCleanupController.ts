import { FastifyRequest, FastifyReply } from 'fastify';
import { IncidentCleanupService, ClearTestIncidentsResponse } from '../services/incidentCleanupService';
import { logger } from '../logger/logger';

export const incidentCleanupController = {
  /**
   * DELETE /api/incidents/test/clear
   * Clears all test incidents and related data with a required confirmation flag.
   */
  clearTest: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { confirm?: boolean };

      // Safety protection: require explicit confirmation flag
      if (!body?.confirm) {
        return reply.status(400).send({
          success: false,
          error: "Confirmation required. Please send { confirm: true } to clear test incidents."
        });
      }

      const result = await IncidentCleanupService.clearTestIncidents();

      const response: ClearTestIncidentsResponse = {
        success: true,
        deletedIncidents: result.deletedIncidents,
        deletedLogs: result.deletedLogs,
        message: 'Test incidents cleared successfully',
      };

      return reply.send(response);
    } catch (error: any) {
      logger.error(`Failed to clear test incidents: ${error.message}`);
      return reply.status(500).send({
        success: false,
        error: 'Failed to clear test incidents due to an internal server error',
        details: error.message
      });
    }
  },

  /**
   * GET /api/incidents/test/count
   * Returns the number of test incidents currently in the database.
   */
  getTestCount: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const count = await IncidentCleanupService.getTestIncidentCount();
      return reply.send({
        testIncidents: count
      });
    } catch (error: any) {
      logger.error(`Failed to get test incident count: ${error.message}`);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve test incident count'
      });
    }
  }
};
