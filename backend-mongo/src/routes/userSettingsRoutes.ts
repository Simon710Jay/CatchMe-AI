import { FastifyInstance } from 'fastify';
import { userSettingsController } from '../controllers/userSettingsController';

export default async function userSettingsRoutes(fastify: FastifyInstance) {
  fastify.get('/user/theme', userSettingsController.getTheme);
  fastify.put('/user/theme', userSettingsController.updateTheme);
}
