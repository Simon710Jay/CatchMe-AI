import axios from 'axios';
import { config } from '../config';
import { logger } from '../logger/logger';
import { LogPayload, MetricsPayload, HealthPayload } from '../types';

export class ApiClient {
  private buffer: any[] = [];
  private isProcessingBuffer = false;

  constructor() {
    // Attempt to clear buffer every 30 seconds
    setInterval(() => this.processBuffer(), 30000);
  }

  async sendLogs(logs: LogPayload[]) {
    await this.sendWithRetry('/api/logs', logs);
  }

  async sendMetrics(metrics: MetricsPayload) {
    await this.sendWithRetry('/api/metrics', metrics);
  }

  async sendHealth(health: HealthPayload) {
    await this.sendWithRetry('/api/health', health);
  }

  private async sendWithRetry(endpoint: string, data: any) {
    try {
      await axios.post(`${config.serverUrl}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      logger.debug(`Successfully sent data to ${endpoint}`);
    } catch (error: any) {
      logger.warn(`Failed to send data to ${endpoint}: ${error.message}. Buffering for retry.`);
      this.buffer.push({ endpoint, data, timestamp: Date.now() });
    }
  }

  private async processBuffer() {
    if (this.isProcessingBuffer || this.buffer.length === 0) return;

    this.isProcessingBuffer = true;
    logger.info(`Processing offline buffer: ${this.buffer.length} items`);

    const itemsToProcess = [...this.buffer];
    this.buffer = [];

    for (const item of itemsToProcess) {
      try {
        await axios.post(`${config.serverUrl}${item.endpoint}`, item.data, {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        });
      } catch (error) {
        // If still failing, put back in buffer
        this.buffer.push(item);
      }
    }

    this.isProcessingBuffer = false;
  }
}

export const apiClient = new ApiClient();
