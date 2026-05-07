import { config } from './config';
import { logger } from './logger/logger';
import { SystemMetrics } from './metrics/systemMetrics';
import { HealthMonitor } from './health/healthMonitor';
import { LogCollector } from './collectors/logCollector';
import { apiClient } from './transport/apiClient';

async function main() {
  logger.info(`🚀 Starting CatchMe Agent for service: ${config.serviceName}`);
  logger.info(`📡 Backend URL: ${config.serverUrl}`);

  // 1. Initialize Log Collector
  const logCollector = new LogCollector();
  logCollector.start();

  // 2. Start Metrics & Health Loop
  setInterval(async () => {
    try {
      // Collect system metrics
      const metrics = await SystemMetrics.collect();
      await apiClient.sendMetrics(metrics);

      // Analyze health
      const health = HealthMonitor.analyze(metrics);
      await apiClient.sendHealth(health);

      logger.debug(`Polled metrics and health status: ${health.status}`);
    } catch (error: any) {
      logger.error(`Error in main loop: ${error.message}`);
    }
  }, config.pollInterval);

  // 3. Graceful Shutdown
  const shutdown = () => {
    logger.info('Shutting down CatchMe Agent...');
    logCollector.stop();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // 4. Global Error Handling
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    // Keep running if possible, or restart
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

main().catch(error => {
  logger.error(`Failed to start agent: ${error.message}`);
  process.exit(1);
});
