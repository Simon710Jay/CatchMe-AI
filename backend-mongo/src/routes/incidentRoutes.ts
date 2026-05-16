import { FastifyInstance } from 'fastify';
import { incidentController } from '../controllers/incidentController';

export default async function incidentRoutes(fastify: FastifyInstance) {
  fastify.get('/incidents', incidentController.list);
  fastify.get('/incidents/export', incidentController.exportIncidents);
  fastify.get('/incidents/:id', incidentController.getById);
  fastify.get('/incidents/:id/analysis', incidentController.getAnalysis);
  fastify.patch('/incidents/:id/resolve', incidentController.resolve);
  fastify.patch('/incidents/:id/promote', incidentController.promote);
  fastify.post('/incidents/:id/create-pr', incidentController.createPR);
  fastify.get('/incidents/:id/timeline', incidentController.getTimeline);
  fastify.delete('/incidents/clear-all', incidentController.clearAll);
  fastify.delete('/incidents/test', incidentController.clearTest);
}
