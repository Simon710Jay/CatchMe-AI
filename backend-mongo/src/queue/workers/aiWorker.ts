import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';
import { AIService } from '../../ai/analyzeIncident';
import Incident from '../../models/Incident';
import AIAnalysis from '../../models/AIAnalysis';
import { broadcast } from '../../websocket/socket';
import { logger } from '../../logger/logger';
import { AIStatus } from '../../ai/aiTypes';

export const aiWorker = new Worker('ai-analysis', async (job: Job) => {
  const { incidentId } = job.data;
  
  try {
    const incident = await Incident.findById(incidentId);
    if (!incident) return;

    // Emit started event
    broadcast('ai-analysis-started', {
      incidentId,
      status: 'processing' as AIStatus
    });

    const analysis = await AIService.analyzeIncident(incident);
    
    if (!analysis) {
      throw new Error("Analysis failed to produce a result");
    }

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
      status: 'completed' as AIStatus,
      analysis: aiRecord
    });

    logger.info(`AI Worker successfully processed incident: ${incidentId}`);
  } catch (error: any) {
    logger.error(`AI Worker error for incident ${incidentId}: ${error.message}`);
    
    // Emit failed event
    broadcast('ai-analysis-failed', {
      incidentId,
      status: 'failed' as AIStatus,
      error: error.message
    });
    
    throw error;
  }
}, { connection: redisConnection });

aiWorker.on('failed', (job, err) => {
  logger.error(`AI Job ${job?.id} failed: ${err.message}`);
});
