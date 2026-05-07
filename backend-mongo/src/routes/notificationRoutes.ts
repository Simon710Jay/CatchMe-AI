import { FastifyInstance } from 'fastify';
import { notificationController } from '../controllers/notificationController';

export default async function notificationRoutes(fastify: FastifyInstance) {
  fastify.get('/notifications', notificationController.list);
  fastify.patch('/notifications/:id/read', notificationController.markAsRead);
}
