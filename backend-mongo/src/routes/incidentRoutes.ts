import { FastifyInstance } from 'fastify';
import { incidentController } from '../controllers/incidentController';

export default async function incidentRoutes(fastify: FastifyInstance) {
  fastify.get('/incidents', incidentController.list);
  fastify.get('/incidents/export', incidentController.exportIncidents);
  fastify.get('/incidents/:id', incidentController.getById);
  fastify.get('/incidents/:id/analysis', incidentController.getAnalysis);
  fastify.patch('/incidents/:id/resolve', incidentController.resolve);
}
