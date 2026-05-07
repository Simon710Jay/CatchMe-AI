import { FastifyRequest, FastifyReply } from 'fastify';
import Notification from '../models/Notification';
import { broadcast } from '../websocket/socket';
import { logger } from '../logger/logger';

export const notificationController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(50);
      
      return reply.send({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      logger.error(`Notification list error: ${error.message}`);
      throw error;
    }
  },

  markAsRead: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const notification = await Notification.findByIdAndUpdate(
        id, 
        { read: true }, 
        { new: true }
      );
      
      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Notification not found' },
        });
      }

      broadcast('notification-read', notification);
      
      return reply.send({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      logger.error(`Mark as read error: ${error.message}`);
      throw error;
    }
  },
};
