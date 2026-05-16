import { Octokit } from '@octokit/rest';
import { logger } from '../logger/logger';
import { PullRequestAutomation } from '../models/PullRequestAutomation';
import { githubEvents } from './githubEvents';
import { GitHubPR } from './githubTypes';
import { sanitizeBranchName } from '../utils/sanitizeBranchName';
import { WorkflowService } from '../services/workflowService';

// Initialize Octokit with a specific token
const getOctokit = (token?: string) => {
  const finalToken = token || process.env.GITHUB_TOKEN;
  if (!finalToken) {
    logger.error('CRITICAL: GITHUB_TOKEN is missing');
    throw new Error('GitHub token not configured');
  }
  return new Octokit({ auth: finalToken });
};

export const githubService = {
  async triggerSafeAutomation(incidentId: string, integrationConfig?: { token: string, owner: string, repo: string }): Promise<GitHubPR> {
    logger.info(`[GITHUB] Starting remediation workflow for incident: ${incidentId}`);
    
    // 1. Validate Environment
    const owner = integrationConfig?.owner || process.env.GITHUB_OWNER;
    const repo = integrationConfig?.repo || process.env.GITHUB_REPO;
    const token = integrationConfig?.token || process.env.GITHUB_TOKEN;

    if (!owner || !repo) {
      logger.error('[GITHUB] GITHUB_OWNER or GITHUB_REPO is missing');
      throw new Error('GitHub repository configuration missing (OWNER/REPO)');
    }

    try {
      const octokit = getOctokit(token);
      
      // 2. Fetch Repository Metadata (Dynamic Default Branch)
      logger.info(`[GITHUB] Fetching repository metadata for ${owner}/${repo}...`);
      await WorkflowService.logEvent(incidentId, 'investigation_started', 'Repository metadata fetched');
      const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo,
      }).catch(err => {
        logger.error(`[GITHUB] Failed to fetch repository metadata: ${err.message}`);
        throw new Error(`Repository ${owner}/${repo} not found or inaccessible`);
      });

      const defaultBranch = repoData.default_branch;
      logger.info(`[GITHUB] Detected default branch: ${defaultBranch}`);
      await WorkflowService.logEvent(incidentId, 'investigation_started', `Default branch detected: ${defaultBranch}`);

      // 3. Validate Default Branch Exists
      logger.info(`[GITHUB] Validating default branch ${defaultBranch} existence...`);
      const { data: branches } = await octokit.rest.repos.listBranches({
        owner,
        repo,
      });

      const branchExists = branches.some(b => b.name === defaultBranch);
      if (!branchExists) {
        logger.error(`[GITHUB] Default branch ${defaultBranch} not found in branch list`);
        throw new Error(`Default branch '${defaultBranch}' not found in repository`);
      }

      // 4. Fetch Incident & AI Analysis
      const Incident = require('../models/Incident').default;
      const AIAnalysis = require('../models/AIAnalysis').default;

      logger.info(`[GITHUB] Looking up incident ${incidentId}...`);
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        logger.error(`[GITHUB] Incident ${incidentId} not found`);
        throw new Error('Incident not found in database');
      }

      const analysis = await AIAnalysis.findOne({ incidentId }).sort({ createdAt: -1 });
      
      // Secondary Guard: Block test incidents
      if (incident.source === 'ai' || incident.isTest) {
        logger.error(`[GITHUB] Attempted PR automation on test incident: ${incidentId}`);
        throw new Error('Test incidents cannot trigger PR automation');
      }
      
      // 5. Prepare Branch Name
      const serviceSlug = sanitizeBranchName(incident.service || 'unknown');
      const titleSlug = sanitizeBranchName(incident.title || 'fix').slice(0, 30);
      const branchName = `fix/${serviceSlug}-${titleSlug}-${Date.now().toString().slice(-6)}`;
      
      logger.info(`[GITHUB] Generated remediation branch name: ${branchName}`);
      await WorkflowService.logEvent(incidentId, 'investigation_started', 'Branch created');

      // 6. Get Base Branch SHA
      logger.info(`[GITHUB] Fetching ${defaultBranch} ref SHA...`);
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
      }).catch(err => {
        logger.error(`[GITHUB] Failed to fetch base branch ref: ${err.message}`);
        throw new Error(`Could not resolve ref for branch '${defaultBranch}'`);
      });

      // 7. Create New Branch
      logger.info(`[GITHUB] Creating branch ${branchName}...`);
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      }).catch(err => {
        logger.error(`[GITHUB] Failed to create branch: ${err.message}`);
        throw new Error(`Failed to create branch: ${err.message}`);
      });
      
      // 8. CRITICAL: Add propagation delay
      logger.info(`[GITHUB] Waiting 1.5s for branch propagation...`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 9. Create/Update Safe File
      const testFilePath = 'catchme-remediation-trace.json';
      logger.info(`[GITHUB] Creating remediation log at ${testFilePath}...`);
      
      const fileContent = JSON.stringify({
        generatedBy: 'CatchMe AI',
        incident: {
          id: incidentId,
          title: incident.title,
          service: incident.service
        },
        analysis: {
          probableCause: analysis?.probableCause || 'N/A',
          recommendedAction: analysis?.recommendedAction || 'N/A'
        },
        timestamp: new Date().toISOString()
      }, null, 2);

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: testFilePath,
        message: `[CatchMe AI] Remediation trace for incident ${incidentId}`,
        content: Buffer.from(fileContent).toString('base64'),
        branch: branchName,
      }).catch(err => {
        logger.error(`[GITHUB] Failed to create file: ${err.message}`);
        throw new Error(`Failed to create commit: ${err.message}`);
      });

      await WorkflowService.logEvent(incidentId, 'investigation_started', 'Commit created');

      // 10. Prepare PR Body
      const prBody = `
## 🚨 CatchMe AI: Automated Remediation PR

This is an automated **draft** PR generated by CatchMe AI for incident **#${incidentId}**.

### 🧠 AI Diagnostic Summary
- **Incident**: ${incident.title}
- **Service**: ${incident.service}
- **Probable Cause**: ${analysis?.probableCause || 'No analysis data found'}
- **Impact**: ${analysis?.impactAssessment || 'No impact assessment data found'}
- **Confidence Score**: ${analysis ? Math.round(analysis.confidence * 100) : 0}%

### 🛠️ Recommended Remediation
> ${analysis?.recommendedAction || 'No automated recommendation available at this time.'}

### 📝 Operational Changes
- Automated remediation trace created at \`${testFilePath}\`.
- Base branch: \`${defaultBranch}\`
- Remediation branch: \`${branchName}\`

---
_Generated by CatchMe AI Ops Center. Please review before merging._
`;

      // 11. Create Pull Request
      logger.info(`[GITHUB] Opening draft Pull Request on base: ${defaultBranch}...`);
      const { data: prData } = await octokit.rest.pulls.create({
        owner,
        repo,
        title: `[FIX] ${incident.service}: ${incident.title}`,
        head: branchName,
        base: defaultBranch,
        body: prBody,
        draft: true,
      }).catch(err => {
        logger.error(`[GITHUB] Failed to create PR: ${err.message}`);
        throw new Error(`GitHub PR creation failed: ${err.message}`);
      });

      // 12. Persist Metadata
      logger.info(`[GITHUB] PR #${prData.number} created. Saving metadata...`);
      const prRecord = await PullRequestAutomation.create({
        incidentId,
        prNumber: prData.number,
        branchName,
        prUrl: prData.html_url,
        status: 'draft',
      });

      const result: GitHubPR = {
        id: prRecord._id.toString(),
        incidentId,
        prNumber: prRecord.prNumber,
        branchName: prRecord.branchName,
        prUrl: prRecord.prUrl,
        status: prRecord.status,
        defaultBranch: defaultBranch,
      };

      // 13. Notify & Return
      githubEvents.emitPROpened(result);
      logger.info(`[GITHUB] Remediation workflow successful for PR #${prData.number}`);

      return result;
    } catch (error: any) {
      logger.error(`[GITHUB] Workflow FAILED for incident ${incidentId}: ${error.message}`);
      await WorkflowService.logEvent(incidentId, 'incident_failed', `GitHub automation failed: ${error.message}`);
      throw error;
    }
  },

  async getPullRequests(): Promise<GitHubPR[]> {
    const prs = await PullRequestAutomation.find().sort({ createdAt: -1 }).limit(50);
    return prs.map((pr) => ({
      id: pr._id.toString(),
      incidentId: pr.incidentId,
      prNumber: pr.prNumber,
      branchName: pr.branchName,
      prUrl: pr.prUrl,
      status: pr.status as any,
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
    }));
  },

  async getPullRequest(id: string): Promise<GitHubPR | null> {
    const pr = await PullRequestAutomation.findById(id);
    if (!pr) return null;
    return {
      id: pr._id.toString(),
      incidentId: pr.incidentId,
      prNumber: pr.prNumber,
      branchName: pr.branchName,
      prUrl: pr.prUrl,
      status: pr.status as any,
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
    };
  },

  async verifyToken(token: string, owner: string, repo: string): Promise<boolean> {
    try {
      const octokit = new Octokit({ auth: token });
      await octokit.rest.repos.get({ owner, repo });
      return true;
    } catch (error: any) {
      logger.error(`[GITHUB] Token verification failed: ${error.message}`);
      return false;
    }
  },
};
