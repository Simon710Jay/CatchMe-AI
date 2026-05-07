import { FastifyInstance } from 'fastify';
import { dashboardController } from '../controllers/dashboardController';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/dashboard/summary', dashboardController.getSummary);
}
