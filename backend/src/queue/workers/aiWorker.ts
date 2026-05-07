import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { OllamaService } from '../../ai/ollamaService';

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const aiWorker = new Worker(
  'log-processing',
  async (job: Job) => {
    const { incidentId } = job.data;
    
    if (job.name !== 'AI_ANALYSIS' || !incidentId) return;

    console.log(`[AI Worker] Analyzing incident: ${incidentId}`);

    try {
      // 1. Fetch incident and its logs
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId },
        include: { logs: { take: 20 } },
      });

      if (!incident) throw new Error('Incident not found');

      // Update status to analyzing
      await prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'analyzing' },
      });

      // 2. Extract logs messages
      const logMessages = incident.logs.map(l => l.message);

      // 3. Call Ollama
      const analysis = await OllamaService.analyzeIncident(
        incident.title,
        incident.service,
        incident.severity,
        logMessages
      );

      // 4. Store analysis in DB
      await prisma.aIAnalysis.upsert({
        where: { incidentId },
        create: {
          incidentId,
          probableCause: analysis.probableCause,
          impact: analysis.impact,
          recommendedFix: analysis.recommendedFix,
          codePatch: analysis.codePatch,
          confidenceScore: analysis.confidenceScore,
        },
        update: {
          probableCause: analysis.probableCause,
          impact: analysis.impact,
          recommendedFix: analysis.recommendedFix,
          codePatch: analysis.codePatch,
          confidenceScore: analysis.confidenceScore,
        },
      });

      // 5. Update incident status back to open (or stay as is)
      await prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'open' },
      });

      console.log(`[AI Worker] Successfully analyzed incident: ${incidentId}`);
    } catch (error: any) {
      console.error(`[AI Worker] Error analyzing incident ${incidentId}:`, error.message);
      
      // Update status back to open on error
      await prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'open' },
      });
      
      throw error;
    }
  },
  { connection }
);
