import axios from 'axios';
import { z } from 'zod';
import { logger } from '../logger/logger';
import Log from '../models/Log';
import { IIncident } from '../models/Incident';
import { AIAnalysisResponse } from './aiTypes';

export const AIAnalysisResponseSchema = z.object({
  probableCause: z.string(),
  impactAssessment: z.string(),
  recommendedAction: z.string(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['critical', 'warning', 'info']),
});

export class AIService {
  private static OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  private static MODEL = process.env.OLLAMA_MODEL || 'llama3';

  static async analyzeIncident(incident: IIncident): Promise<AIAnalysisResponse | null> {
    try {
      // 1. Fetch relevant logs for context
      const logs = await Log.find({ message: incident.title, service: incident.service })
        .sort({ timestamp: -1 })
        .limit(10);

      const logContext = logs.map(l => `[${l.timestamp}] ${l.severity.toUpperCase()}: ${l.message}`).join('\n');

      // 2. Construct Prompt
      const prompt = `
        You are a Senior SRE and DevOps Engineer. Analyze the following infrastructure incident and provide a structured JSON response.
        
        INCIDENT:
        Title: ${incident.title}
        Service: ${incident.service}
        Severity: ${incident.severity}
        Event Count: ${incident.count}
        
        LOG CONTEXT:
        ${logContext}

        RESPONSE FORMAT (STRICT JSON ONLY):
        {
          "probableCause": "Short explanation of why this is happening",
          "impactAssessment": "Description of the impact on the system and users",
          "recommendedAction": "Step-by-step fix recommendation",
          "confidence": 0.95,
          "severity": "critical"
        }

        Do not include any text outside the JSON block. Be precise and avoid hallucinations.
      `;

      // 3. Call Ollama
      logger.info(`Starting AI analysis for incident: ${incident._id} using ${this.MODEL}`);
      
      const startTime = Date.now();
      const response = await axios.post(this.OLLAMA_URL, {
        model: this.MODEL,
        prompt: prompt,
        stream: false,
        format: 'json'
      }, { timeout: 30000 });
      
      const latency = Date.now() - startTime;
      logger.info(`Ollama responded in ${latency}ms`);

      const rawResult = typeof response.data.response === 'string' 
        ? JSON.parse(response.data.response) 
        : response.data.response;

      // 4. Validate with Zod
      const validatedResult = AIAnalysisResponseSchema.parse(rawResult);

      logger.info(`AI analysis completed and validated for incident: ${incident._id}`);
      return validatedResult;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        logger.error(`AI Analysis Validation failed for incident ${incident._id}: ${JSON.stringify(error.format())}`);
      } else {
        logger.error(`AI Analysis failed: ${error.message}`);
      }
      return this.getSafeFallbackResponse();
    }
  }

  private static getSafeFallbackResponse(): AIAnalysisResponse {
    return {
      probableCause: "AI diagnosis unavailable due to a processing timeout or parsing error.",
      impactAssessment: "Unable to determine precise impact autonomously. Manual investigation required.",
      recommendedAction: "1. Check recent deployments.\n2. Review system logs manually.\n3. Verify resource utilization.",
      confidence: 0,
      severity: "warning"
    };
  }
}
