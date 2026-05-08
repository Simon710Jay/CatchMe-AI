import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';
import { AIService } from '../../services/aiService';
import Incident from '../../models/Incident';
import AIAnalysis from '../../models/AIAnalysis';
import { broadcast } from '../../websocket/socket';
import { logger } from '../../logger/logger';

export const aiWorker = new Worker('ai-analysis', async (job: Job) => {
  const { incidentId } = job.data;
  
  try {
    const incident = await Incident.findById(incidentId);
    if (!incident) return;

    const analysis = await AIService.analyzeIncident(incident);
    if (!analysis) return;

    // Store analysis result
    const aiRecord = await AIAnalysis.findOneAndUpdate(
      { incidentId },
      {
        ...analysis,
        rawResponse: JSON.stringify(analysis),
      },
      { upsert: true, new: true }
    );

    // Emit event to frontend
    broadcast('ai-analysis-completed', {
      incidentId,
      analysis: aiRecord
    });

    logger.info(`AI Worker successfully processed incident: ${incidentId}`);
  } catch (error: any) {
    logger.error(`AI Worker error for incident ${incidentId}: ${error.message}`);
    throw error;
  }
}, { connection: redisConnection });

aiWorker.on('failed', (job, err) => {
  logger.error(`AI Job ${job?.id} failed: ${err.message}`);
});
