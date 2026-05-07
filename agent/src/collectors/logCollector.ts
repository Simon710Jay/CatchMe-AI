import chokidar from 'chokidar';
import fs from 'fs';
import { config } from '../config';
import { logger } from '../logger/logger';
import { LogPayload, Severity } from '../types';
import { apiClient } from '../transport/apiClient';

export class LogCollector {
  private watcher: chokidar.FSWatcher | null = null;
  private fileSize: number = 0;

  start() {
    const filePath = config.logFilePath;
    
    if (!fs.existsSync(filePath)) {
      logger.warn(`Log file not found at ${filePath}. Creating placeholder...`);
      fs.mkdirSync(require('path').dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, '');
    }

    this.fileSize = fs.statSync(filePath).size;
    logger.info(`Started monitoring log file: ${filePath}`);

    this.watcher = chokidar.watch(filePath, {
      persistent: true,
      usePolling: true,
      interval: 1000,
    });

    this.watcher.on('change', (path) => this.handleFileChange(path));
  }

  private handleFileChange(path: string) {
    const stats = fs.statSync(path);
    const newSize = stats.size;

    if (newSize <= this.fileSize) {
      this.fileSize = newSize;
      return;
    }

    const stream = fs.createReadStream(path, {
      start: this.fileSize,
      end: newSize,
    });

    let data = '';
    stream.on('data', (chunk) => {
      data += chunk.toString();
    });

    stream.on('end', () => {
      this.fileSize = newSize;
      this.processLogLines(data);
    });
  }

  private processLogLines(data: string) {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const payloads: LogPayload[] = lines.map(line => this.parseLogLine(line));
    
    if (payloads.length > 0) {
      apiClient.sendLogs(payloads);
    }
  }

  private parseLogLine(line: string): LogPayload {
    // Simple mock parser: looks for keywords to determine severity
    // In production, this would use a regex or JSON parser
    let severity: Severity = "info";
    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('critical')) {
      severity = "critical";
    } else if (line.toLowerCase().includes('warn')) {
      severity = "warning";
    }

    return {
      message: line,
      severity,
      service: config.serviceName,
      timestamp: new Date().toISOString(),
    };
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
