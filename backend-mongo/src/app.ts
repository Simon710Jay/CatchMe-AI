import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import logRoutes from './routes/logRoutes';
import incidentRoutes from './routes/incidentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import metricsRoutes from './routes/metricsRoutes';
import githubRoutes from './github/githubRoutes';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './websocket/socket';
import './queue/workers/aiWorker';
import { SystemMetricsCollector } from './metrics/systemMetricsCollector';

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

// Register Plugins
app.register(cors, {
  origin: true,
});

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Error Handling
app.setErrorHandler(errorHandler);

// Register Routes
app.register(logRoutes, { prefix: '/api' });
app.register(incidentRoutes, { prefix: '/api' });
app.register(notificationRoutes, { prefix: '/api' });
app.register(dashboardRoutes, { prefix: '/api' });
app.register(metricsRoutes, { prefix: '/api' });
app.register(githubRoutes, { prefix: '/api' });

// Health Check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date() };
});

export const startApp = async () => {
  // Start Background Services
  SystemMetricsCollector.start();
  
  // Initialize WebSocket after the server starts listening
  initSocket(app);
  return app;
};

export default app;
