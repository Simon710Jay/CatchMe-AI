import { FastifyInstance } from 'fastify';
import { githubIntegrationController } from '../controllers/githubIntegrationController';
import { authenticateRequest } from '../middleware/auth';

export default async function githubIntegrationRoutes(fastify: FastifyInstance) {
  // Legacy / manual token integration endpoints
  fastify.get('/github/settings', githubIntegrationController.getSettings);
  fastify.post('/github/manual', githubIntegrationController.saveManualToken);
  fastify.post('/github/test', githubIntegrationController.testConnection);
  fastify.post('/github/disconnect', githubIntegrationController.disconnect);
  fastify.get('/github/oauth-url', githubIntegrationController.getOAuthUrl);
  fastify.get('/github/callback', githubIntegrationController.handleCallback);

  // 🎯 Production GitHub OAuth Integration endpoints (aligned with task)
  fastify.get('/integrations/github/login', githubIntegrationController.login);
  fastify.get('/integrations/github/callback', githubIntegrationController.callback);
  fastify.get('/integrations/github/status', { preHandler: authenticateRequest }, githubIntegrationController.status);
  fastify.post('/integrations/github/disconnect', { preHandler: authenticateRequest }, githubIntegrationController.disconnect);
  
  // Custom API endpoint for repository selection
  fastify.post('/integrations/github/select-repo', { preHandler: authenticateRequest }, githubIntegrationController.selectActiveRepo);
}
