import { FastifyInstance } from 'fastify';
import { logController } from '../controllers/logController';
import { authMiddleware } from '../middleware/auth';

export default async function logRoutes(fastify: FastifyInstance) {
  fastify.post('/logs', { preHandler: [authMiddleware] }, logController.create);
  fastify.get('/logs', { preHandler: [authMiddleware] }, logController.list);
}
