import { FastifyRequest, FastifyReply } from 'fastify';
import Incident from '../models/Incident';
import AIAnalysis from '../models/AIAnalysis';
import { logger } from '../logger/logger';
import { broadcast } from '../websocket/socket';
import { parse } from 'json2csv';
import { StatsService } from '../services/statsService';
import { WorkflowService } from '../services/workflowService';
import { githubService } from '../github/githubService';
import IncidentWorkflowEvent from '../models/IncidentWorkflowEvent';

export const incidentController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const incidents = await Incident.find()
        .sort({ severity: 1, updatedAt: -1 });

      const severityOrder: Record<string, number> = { critical: 1, warning: 2, info: 3, resolved: 4 };
      const sortedIncidents = incidents.sort((a, b) => {
        return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
      });

      return reply.send({
        success: true,
        data: sortedIncidents,
      });
    } catch (error: any) {
      logger.error(`Incident list error: ${error.message}`);
      throw error;
    }
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const incident = await Incident.findById(id);
      if (!incident) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' },
        });
      }
      return reply.send({
        success: true,
        data: incident,
      });
    } catch (error: any) {
      logger.error(`Incident get error: ${error.message}`);
      throw error;
    }
  },

  resolve: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const incident = await Incident.findByIdAndUpdate(
        id,
        { 
          status: 'resolved', 
          severity: 'resolved',
          workflowStatus: 'resolved',
          resolvedAt: new Date()
        },
        { new: true }
      );

      if (!incident) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' },
        });
      }

      await WorkflowService.logEvent(
        id,
        'incident_resolved',
        'Incident was marked as resolved by operator'
      );

      broadcast('incident-resolved', incident);
      logger.info(`Incident resolved: ${id}`);
      StatsService.broadcastStats();

      return reply.send({
        success: true,
        data: incident,
      });
    } catch (error: any) {
      logger.error(`Incident resolve error: ${error.message}`);
      throw error;
    }
  },

  createPR: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    logger.info(`[CONTROLLER] Received PR creation request for incident: ${id}`);
    
    try {
      // 1. Basic Validation
      const incident = await Incident.findById(id);
      if (!incident) {
        logger.warn(`[CONTROLLER] Incident ${id} not found for PR creation`);
        return reply.status(404).send({
          success: false,
          message: 'Incident not found'
        });
      }

      // 2. Analysis Validation
      const AIAnalysis = require('../models/AIAnalysis').default;
      const analysis = await AIAnalysis.findOne({ incidentId: id }).sort({ createdAt: -1 });
      if (!analysis) {
        logger.warn(`[CONTROLLER] AI Analysis missing for incident ${id}`);
        return reply.status(400).send({
          success: false,
          message: 'AI analysis missing. Please wait for analysis to complete before creating a PR.'
        });
      }

      // 3. Workflow Start
      await WorkflowService.updateStatus(
        id,
        'investigating',
        'Starting GitHub remediation workflow'
      );
      
      await WorkflowService.logEvent(id, 'investigation_started', 'Preparing GitHub remediation PR');

      // 4. Trigger Service
      const pr = await githubService.triggerSafeAutomation(id);

      // 5. Update Incident State
      await Incident.findByIdAndUpdate(id, {
        workflowStatus: 'pr_created',
        prCreated: true,
        prNumber: pr.prNumber,
        prUrl: pr.prUrl
      });

      // 6. Log Final Event
      await WorkflowService.logEvent(
        id,
        'pr_opened',
        'Draft PR opened',
        { prUrl: pr.prUrl, prNumber: pr.prNumber }
      );

      return reply.send({
        success: true,
        data: pr,
        defaultBranch: pr.defaultBranch,
        message: 'Draft remediation PR created successfully'
      });

    } catch (error: any) {
      logger.error(`[CONTROLLER] PR creation CRASHED for incident ${id}: ${error.message}`);
      
      // Update workflow status to failed
      await WorkflowService.updateStatus(id, 'failed', `PR automation failed: ${error.message}`);
      
      // Broadcast failure
      broadcast('pr-failed', { 
        incidentId: id, 
        message: error.message 
      });

      return reply.status(500).send({
        success: false,
        message: error.message || 'Internal server error during PR creation'
      });
    }
  },

  getTimeline: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const events = await IncidentWorkflowEvent.find({ incidentId: id })
        .sort({ createdAt: 1 });
      
      return reply.send({
        success: true,
        data: events,
      });
    } catch (error: any) {
      logger.error(`Get timeline error: ${error.message}`);
      throw error;
    }
  },

  exportIncidents: async (request: FastifyRequest, reply: FastifyReply) => {
    const { format } = request.query as { format?: string };
    try {
      const incidents = await Incident.find().lean();
      if (format === 'csv') {
        const fields = ['_id', 'title', 'service', 'severity', 'count', 'status', 'firstSeen', 'lastSeen'];
        const csv = parse(incidents, { fields });
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename=incidents.csv');
        return reply.send(csv);
      }
      return reply.send({
        success: true,
        data: incidents,
      });
    } catch (error: any) {
      logger.error(`Incident export error: ${error.message}`);
      throw error;
    }
  },

  getAnalysis: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const analysis = await AIAnalysis.findOne({ incidentId: id })
        .sort({ createdAt: -1 });
      if (!analysis) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'AI Analysis not found for this incident' },
        });
      }
      return reply.send({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      logger.error(`Get analysis error: ${error.message}`);
      throw error;
    }
  },
};
