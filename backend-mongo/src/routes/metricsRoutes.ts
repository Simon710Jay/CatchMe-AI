import { FastifyInstance } from 'fastify';
import { metricsController } from '../controllers/metricsController';

export default async function metricsRoutes(fastify: FastifyInstance) {
  fastify.get('/dashboard/metrics', metricsController.getOverview);
  fastify.get('/metrics/health-history', metricsController.getHealthHistory);
  fastify.get('/metrics/error-distribution', metricsController.getErrorDistribution);
}
