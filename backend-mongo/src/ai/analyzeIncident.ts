import { z } from 'zod';
import { logger } from '../logger/logger';
import Log from '../models/Log';
import AIAnalysis from '../models/AIAnalysis';
import { IIncident } from '../models/Incident';
import { OllamaService } from './ollamaService';
import { AIAnalysisResponse } from './aiTypes';

export const AIAnalysisResponseSchema = z.object({
  probableCause: z.string(),
  impactAssessment: z.string(),
  recommendedAction: z.string(),
  confidence: z.number(), 
  severity: z.enum(['critical', 'warning', 'info']).optional(),
});

export class AIService {
  static async analyzeIncident(incidentId: string, incident: IIncident): Promise<any> {
    let analysisRecord = await AIAnalysis.findOne({ incidentId });

    if (!analysisRecord) {
      analysisRecord = await AIAnalysis.create({
        incidentId,
        status: 'processing',
      });
    } else {
      analysisRecord.status = 'processing';
      await analysisRecord.save();
    }

    try {
      // 1. Fetch relevant logs for context (Reduced to 5 for performance)
      const logs = await Log.find({ 
        $or: [
          { service: incident.service },
          { message: { $regex: incident.title.split(' ')[0], $options: 'i' } }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(5);

      const logContext = logs.map(l => `[${l.severity}] ${l.message}`).join('\n');

      // 2. Streamlined Prompt for faster inference
      const prompt = `
Analyze this incident and return ONLY a JSON object.
Title: ${incident.title}
Service: ${incident.service}
Logs:
${logContext}

JSON Format:
{
  "probableCause": "Technical cause",
  "impactAssessment": "System/user impact",
  "recommendedAction": "Fix steps",
  "confidence": 0-100,
  "severity": "critical"|"warning"|"info"
}
`;

      // 3. Call Ollama Service
      const rawResponse = await OllamaService.generate(prompt, true);
      logger.debug(`Raw Ollama Response: ${rawResponse}`);
      
      // 4. Parse and Validate
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch (e) {
        // Attempt to extract JSON if Ollama added markdown or text
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      const validated = AIAnalysisResponseSchema.parse(parsedResponse);

      // Normalize confidence if it's in 0-1 range
      if (validated.confidence <= 1 && validated.confidence > 0) {
        validated.confidence = Math.round(validated.confidence * 100);
      }

      // 5. Save to MongoDB
      analysisRecord.probableCause = validated.probableCause;
      analysisRecord.impactAssessment = validated.impactAssessment;
      analysisRecord.recommendedAction = validated.recommendedAction;
      analysisRecord.confidence = validated.confidence;
      analysisRecord.severity = validated.severity || incident.severity;
      analysisRecord.analyzedLogs = logContext;
      analysisRecord.rawResponse = rawResponse;
      analysisRecord.status = 'completed';

      await analysisRecord.save();
      logger.info(`AI analysis successfully completed for incident: ${incidentId}`);
      
      return analysisRecord;
    } catch (error: any) {
      logger.error(`AI Analysis failed for incident ${incidentId}: ${error.message}`);
      
      analysisRecord.status = 'failed';
      analysisRecord.rawResponse = error.message;
      await analysisRecord.save();
      
      throw error;
    }
  }
}
