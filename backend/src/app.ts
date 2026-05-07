import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import logRoutes from './routes/logRoutes';
import incidentRoutes from './routes/incidentRoutes';
import { errorHandler } from './middleware/errorHandler';

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
  origin: true, // In production, replace with specific origins
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

// Health Check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date() };
});

export default app;
