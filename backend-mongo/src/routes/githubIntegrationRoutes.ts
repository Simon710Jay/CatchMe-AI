import { FastifyInstance } from 'fastify';
import { githubIntegrationController } from '../controllers/githubIntegrationController';

export default async function githubIntegrationRoutes(fastify: FastifyInstance) {
  fastify.get('/github/settings', githubIntegrationController.getSettings);
  fastify.post('/github/manual', githubIntegrationController.saveManualToken);
  fastify.post('/github/test', githubIntegrationController.testConnection);
  fastify.post('/github/disconnect', githubIntegrationController.disconnect);
  fastify.get('/github/oauth-url', githubIntegrationController.getOAuthUrl);
  fastify.get('/github/callback', githubIntegrationController.handleCallback);
}
