import { FastifyInstance } from 'fastify';
import { incidentController } from '../controllers/incidentController';

export default async function incidentRoutes(fastify: FastifyInstance) {
  fastify.get('/incidents', incidentController.list);
  fastify.get('/incidents/:id', incidentController.getById);
}
