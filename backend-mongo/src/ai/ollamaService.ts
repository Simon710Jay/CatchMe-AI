import axios from 'axios';
import { logger } from '../logger/logger';

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaService {
  private static readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  private static readonly MODEL = process.env.OLLAMA_MODEL || 'llama3';

  /**
   * Generates a completion from Ollama
   * @param prompt The system/user prompt
   * @param jsonMode If true, requests JSON output
   */
  static async generate(prompt: string, jsonMode: boolean = true): Promise<string> {
    try {
      logger.info(`Sending prompt to Ollama [Model: ${this.MODEL}]`);
      const startTime = Date.now();

      const response = await axios.post<OllamaResponse>(this.OLLAMA_URL, {
        model: this.MODEL,
        prompt: prompt,
        stream: false,
        format: jsonMode ? 'json' : undefined,
        options: {
          temperature: 0.1,
          num_predict: 256,
        }
      }, {
        timeout: 120000, // 120 seconds
      });

      const latency = Date.now() - startTime;
      logger.info(`Ollama response received in ${latency}ms`);

      return response.data.response;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        logger.error(`Ollama request timed out after 120s`);
        throw new Error('Ollama analysis timed out. The model might be too slow on this hardware.');
      }
      
      if (error.response) {
        logger.error(`Ollama API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(`Ollama API returned an error: ${error.response.status}`);
      }

      logger.error(`Ollama connection error: ${error.message}`);
      throw error;
    }
  }
}
