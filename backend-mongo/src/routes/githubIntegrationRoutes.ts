import { FastifyInstance } from 'fastify';
import { githubIntegrationController } from '../controllers/githubIntegrationController';
import { authMiddleware } from '../middleware/auth';

export default async function githubIntegrationRoutes(fastify: FastifyInstance) {
  // New secure OAuth integration routes
  fastify.get('/integrations/github/login', { preHandler: authMiddleware }, githubIntegrationController.login);
  fastify.get('/integrations/github/callback', githubIntegrationController.callback);
  fastify.get('/integrations/github/status', { preHandler: authMiddleware }, githubIntegrationController.status);
  fastify.post('/integrations/github/disconnect', { preHandler: authMiddleware }, githubIntegrationController.disconnect);
  fastify.post('/integrations/github/select-repo', { preHandler: authMiddleware }, githubIntegrationController.selectRepository);

  // Legacy/PAT backwards-compatible routes
  fastify.get('/github/settings', githubIntegrationController.getSettings);
  fastify.post('/github/manual', githubIntegrationController.saveManualToken);
  fastify.post('/github/test', githubIntegrationController.testConnection);
  fastify.post('/github/disconnect', githubIntegrationController.disconnect);
  fastify.get('/github/oauth-url', githubIntegrationController.getOAuthUrl);
  fastify.get('/github/callback', githubIntegrationController.handleCallback);
}
