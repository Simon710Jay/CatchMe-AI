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
    if (!incident) {
      logger.error(`AI Worker: Incident ${incidentId} not found`);
      return;
    }

    logger.info(`AI Worker: Starting analysis for incident ${incidentId}`);

    const { WorkflowService } = require('../../services/workflowService');
    await WorkflowService.logEvent(incidentId, 'ai_analysis_started', 'AI diagnostic engine starting analysis');

    // Emit started event
    broadcast('ai-analysis-started', {
      incidentId,
      status: 'processing' as AIStatus
    });

    const analysis = await AIService.analyzeIncident(incidentId, incident);
    
    await WorkflowService.logEvent(incidentId, 'ai_analysis_completed', 'AI diagnostic analysis completed successfully', { confidence: analysis.confidence });

    // Emit event to frontend
    broadcast('ai-analysis-completed', {
      incidentId,
      status: 'completed' as AIStatus,
      analysis: analysis
    });

    logger.info(`AI Worker: Successfully processed incident: ${incidentId}`);
  } catch (error: any) {
    logger.error(`AI Worker error for incident ${incidentId}: ${error.message}`);
    
    const { WorkflowService } = require('../../services/workflowService');
    await WorkflowService.logEvent(incidentId, 'ai_analysis_failed', `AI analysis failed: ${error.message}`);

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
