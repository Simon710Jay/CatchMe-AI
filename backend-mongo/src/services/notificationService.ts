import Notification from '../models/Notification';
import { broadcast } from '../websocket/socket';
import { logger } from '../logger/logger';

export class NotificationService {
  static async create(data: {
    title: string;
    message: string;
    severity: string;
    relatedIncidentId?: any;
  }) {
    try {
      const notification = new Notification(data);
      await notification.save();
      
      broadcast('notification-created', notification);
      logger.debug(`Notification created: ${notification._id}`);
      return notification;
    } catch (error: any) {
      logger.error(`Error creating notification: ${error.message}`);
    }
  }
}
