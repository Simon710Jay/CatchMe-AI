import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import logRoutes from './routes/logRoutes';
import incidentRoutes from './routes/incidentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import metricsRoutes from './routes/metricsRoutes';
import githubRoutes from './github/githubRoutes';
import githubIntegrationRoutes from './routes/githubIntegrationRoutes';
import userSettingsRoutes from './routes/userSettingsRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './websocket/socket';
import './queue/workers/aiWorker';
import { SystemMetricsCollector } from './metrics/systemMetricsCollector';

const app = fastify({
  logger: true,
  disableRequestLogging: process.env.NODE_ENV === 'production'
});

// Middleware
app.register(cors, {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Routes
app.register(logRoutes, { prefix: '/api' });
app.register(incidentRoutes, { prefix: '/api' });
app.register(notificationRoutes, { prefix: '/api' });
app.register(dashboardRoutes, { prefix: '/api' });
app.register(metricsRoutes, { prefix: '/api' });
app.register(githubRoutes, { prefix: '/api' });
app.register(githubIntegrationRoutes, { prefix: '/api' });
app.register(userSettingsRoutes, { prefix: '/api' });
app.register(authRoutes, { prefix: '/api' });

// Health check
app.get('/health', async () => {
  return { status: 'ok' };
});

// Test route
app.get('/api/test', async () => {
  return { message: 'Backend connected successfully' };
});

// Error handling
app.setErrorHandler(errorHandler);

export const startApp = async () => {
  // Start Background Services
  SystemMetricsCollector.start();
  
  // Initialize WebSocket after the server starts listening
  initSocket(app);
  return app;
};

export default app;
