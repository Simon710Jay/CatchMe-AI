import { FastifyInstance } from 'fastify';
import { logController } from '../controllers/logController';

export default async function logRoutes(fastify: FastifyInstance) {
  fastify.post('/logs', logController.create);
  fastify.get('/logs', logController.list);
  fastify.get('/logs/export', logController.exportLogs);
}
