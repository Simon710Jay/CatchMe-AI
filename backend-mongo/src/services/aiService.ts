import axios from 'axios';
import { logger } from '../logger/logger';
import Log from '../models/Log';
import { IIncident } from '../models/Incident';

export interface AnalysisResult {
  probableCause: string;
  impactAssessment: string;
  recommendedAction: string;
  confidence: number;
  severity: string;
}

export class AIService {
  private static OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  private static MODEL = process.env.OLLAMA_MODEL || 'llama3';

  static async analyzeIncident(incident: IIncident): Promise<AnalysisResult | null> {
    try {
      // 1. Fetch relevant logs for context
      const logs = await Log.find({ message: incident.title, service: incident.service })
        .sort({ timestamp: -1 })
        .limit(10);

      const logContext = logs.map(l => `[${l.timestamp}] ${l.severity.toUpperCase()}: ${l.message}`).join('\n');

      // 2. Construct Prompt
      const prompt = `
        You are a Senior SRE and DevOps Engineer. Analyze the following incident and provide a structured JSON response.
        
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
          "severity": "critical|warning|info"
        }

        Do not include any text outside the JSON block. Be precise and avoid hallucinations.
      `;

      // 3. Call Ollama
      logger.info(`Starting AI analysis for incident: ${incident._id} using ${this.MODEL}`);
      
      const response = await axios.post(this.OLLAMA_URL, {
        model: this.MODEL,
        prompt: prompt,
        stream: false,
        format: 'json'
      }, { timeout: 30000 });

      const result = typeof response.data.response === 'string' 
        ? JSON.parse(response.data.response) 
        : response.data.response;

      logger.info(`AI analysis completed for incident: ${incident._id}`);
      return result;
    } catch (error: any) {
      logger.error(`AI Analysis failed: ${error.message}`);
      return null;
    }
  }
}
