import { FastifyInstance } from 'fastify';
import { incidentController } from '../controllers/incidentController';
import { authMiddleware } from '../middleware/auth';

export default async function incidentRoutes(fastify: FastifyInstance) {
  fastify.get('/incidents', { preHandler: [authMiddleware] }, incidentController.list);
  fastify.get('/incidents/:id', { preHandler: [authMiddleware] }, incidentController.getById);
  fastify.get('/incidents/:id/analysis', { preHandler: [authMiddleware] }, incidentController.getAnalysis);
}
