import { FastifyInstance } from 'fastify';
import { githubController } from './githubController';

export default async function githubRoutes(fastify: FastifyInstance) {
  fastify.post('/github/create-pr', githubController.createPR);
  fastify.get('/github/pull-requests', githubController.listPRs);
  fastify.get('/github/pull-requests/:id', githubController.getPR);
}
