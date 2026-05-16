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
import GitHubIntegration from '../models/GitHubIntegration';
import { decrypt } from '../utils/encryption';

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
  
  promote: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const incident = await Incident.findByIdAndUpdate(
        id,
        { 
          source: 'real', 
          isTest: false 
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
        'incident_updated',
        'Incident promoted from test to real status'
      );

      broadcast('incident-updated', incident);
      logger.info(`Incident promoted: ${id}`);

      return reply.send({
        success: true,
        data: incident,
      });
    } catch (error: any) {
      logger.error(`Incident promote error: ${error.message}`);
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

      // 2. Test Incident Guard
      if (incident.source === 'ai' || incident.isTest) {
        logger.warn(`[CONTROLLER] PR creation blocked for test incident: ${id}`);
        return reply.status(400).send({
          success: false,
          message: 'Cannot create PR from test incident. Please promote to a real incident first.'
        });
      }

      // 3. GitHub Integration Lookup
      const workspaceId = 'default-workspace'; // TODO: Get from auth context
      const integration = await GitHubIntegration.findOne({ workspaceId });
      
      if (!integration) {
        logger.warn(`[CONTROLLER] GitHub not connected for workspace ${workspaceId}`);
        return reply.status(400).send({
          success: false,
          message: 'GitHub not connected. Please go to Settings > Integrations to connect your repository.'
        });
      }

      const token = decrypt(integration.accessToken);
      const { owner, repo } = integration;

      // 4. Analysis Validation
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

      // 4. Trigger Service with integration config
      const pr = await githubService.triggerSafeAutomation(id, { token, owner, repo });

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

  clearAll: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Import models dynamically to avoid circular dependencies if any
      const Log = require('../models/Log').default;
      const IncidentWorkflowEvent = require('../models/IncidentWorkflowEvent').default;
      const AIAnalysis = require('../models/AIAnalysis').default;
      const Notification = require('../models/Notification').default;

      // Delete all related data
      await Promise.all([
        Incident.deleteMany({}),
        Log.deleteMany({}),
        IncidentWorkflowEvent.deleteMany({}),
        AIAnalysis.deleteMany({}),
        Notification.deleteMany({}),
      ]);

      // Broadcast clearing events
      broadcast('incidents-cleared', {});
      broadcast('logs-cleared', {});
      broadcast('notifications-cleared', {});
      
      logger.info('All incidents, logs, analyses, notifications and events cleared');
      StatsService.broadcastStats();

      return reply.send({
        success: true,
        message: 'All incidents and related data cleared successfully',
      });
    } catch (error: any) {
      logger.error(`Clear all incidents error: ${error.message}`);
      throw error;
    }
  },

  clearTest: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const Log = require('../models/Log').default;
      const IncidentWorkflowEvent = require('../models/IncidentWorkflowEvent').default;
      const AIAnalysis = require('../models/AIAnalysis').default;

      // 1. Find all test incident IDs
      const testIncidents = await Incident.find({ 
        $or: [{ isTest: true }, { source: 'ai' }] 
      }).select('_id');
      const testIds = testIncidents.map(inc => inc._id);

      if (testIds.length > 0) {
        // 2. Delete related data
        await Promise.all([
          Incident.deleteMany({ _id: { $in: testIds } }),
          Log.deleteMany({ incidentId: { $in: testIds } }),
          IncidentWorkflowEvent.deleteMany({ incidentId: { $in: testIds } }),
          AIAnalysis.deleteMany({ incidentId: { $in: testIds } }),
          Notification.deleteMany({ relatedIncidentId: { $in: testIds } }),
        ]);
      }

      // Broadcast clearing event
      broadcast('incidents-updated', {}); // Trigger a refresh
      broadcast('notifications-updated', {}); 
      
      logger.info(`Cleared ${testIds.length} test incidents`);
      StatsService.broadcastStats();

      return reply.send({
        success: true,
        message: `Cleared ${testIds.length} test incidents successfully`,
      });
    } catch (error: any) {
      logger.error(`Clear test incidents error: ${error.message}`);
      throw error;
    }
  },
};
