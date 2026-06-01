import { FastifyInstance } from 'fastify';
import { webhookProcessor } from '../services/webhookProcessor';
import RepositoryMonitor from '../models/RepositoryMonitor';

export default async function webhookRoutes(fastify: FastifyInstance) {
  
  // Endpoint to receive GitHub webhooks
  fastify.post('/api/webhooks/github', async (request, reply) => {
    const event = request.headers['x-github-event'] as string;
    const signature = request.headers['x-hub-signature-256'] as string;
    const payload = request.body;

    if (!event) {
      return reply.status(400).send({ error: 'Missing GitHub event header' });
    }

    // Process event asynchronously so we can quickly respond 200 OK to GitHub
    webhookProcessor.processEvent(event, payload, signature).catch(err => {
      fastify.log.error(`Webhook processing error: ${err.message}`);
    });

    return reply.status(200).send({ success: true, message: 'Webhook received' });
  });

  // Endpoint to configure monitoring for a repository
  fastify.post('/api/webhooks/config', async (request, reply) => {
    try {
      const { workspaceId = 'default-workspace', repositoryName, webhookUrl, webhookSecret, monitoringStatus } = request.body as any;

      if (!repositoryName) {
        return reply.status(400).send({ success: false, message: 'Repository name required' });
      }

      const monitor = await RepositoryMonitor.findOneAndUpdate(
        { workspaceId, repositoryName },
        {
          webhookUrl,
          webhookSecret,
          monitoringStatus: monitoringStatus || 'active'
        },
        { upsert: true, new: true }
      );

      return reply.send({ success: true, data: monitor });
    } catch (error: any) {
      fastify.log.error(`Webhook config error: ${error.message}`);
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  // Endpoint to get monitoring status
  fastify.get('/api/webhooks/config', async (request, reply) => {
    try {
      const { workspaceId = 'default-workspace', repositoryName } = request.query as any;
      if (!repositoryName) {
        return reply.status(400).send({ success: false, message: 'Repository name required' });
      }

      const monitor = await RepositoryMonitor.findOne({ workspaceId, repositoryName });
      return reply.send({ success: true, data: monitor || { monitoringStatus: 'paused' } });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });
}
