import { FastifyRequest, FastifyReply } from 'fastify';
import UserSettings from '../models/UserSettings';
import { logger } from '../logger/logger';

export const userSettingsController = {
  getTheme: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId = 'default-workspace' } = request.query as { workspaceId: string };
      let settings = await UserSettings.findOne({ workspaceId });
      
      if (!settings) {
        settings = new UserSettings({ workspaceId, theme: 'dark' });
        await settings.save();
      }

      return reply.send({
        success: true,
        data: { theme: settings.theme }
      });
    } catch (error: any) {
      logger.error(`Get theme error: ${error.message}`);
      throw error;
    }
  },

  updateTheme: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId = 'default-workspace', theme } = request.body as { workspaceId: string, theme: 'dark' | 'light' };
      
      if (!theme || !['dark', 'light'].includes(theme)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid theme value'
        });
      }

      const settings = await UserSettings.findOneAndUpdate(
        { workspaceId },
        { theme },
        { upsert: true, new: true }
      );

      return reply.send({
        success: true,
        data: { theme: settings.theme }
      });
    } catch (error: any) {
      logger.error(`Update theme error: ${error.message}`);
      throw error;
    }
  },
};
