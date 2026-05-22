import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { signJwt, verifyJwt } from '../utils/jwt';
import { logger } from '../logger/logger';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/auth/session', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      let token = '';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      if (token) {
        const decoded = verifyJwt(token);
        if (decoded) {
          return reply.send({
            success: true,
            authenticated: true,
            user: {
              userId: decoded.userId,
              email: decoded.email,
              name: decoded.name
            },
            token
          });
        }
      }

      // Default user session if not authenticated
      const defaultUser = {
        userId: 'default-admin-user-id',
        email: 'admin@catchme.ai',
        name: 'System Admin'
      };

      const newToken = signJwt(defaultUser, 10080); // 7 days expiry
      logger.info(`Issued new session token for System Admin: ${defaultUser.userId}`);

      return reply.send({
        success: true,
        authenticated: true,
        user: defaultUser,
        token: newToken
      });
    } catch (error: any) {
      logger.error(`Session verification error: ${error.message}`);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error in session initialization'
      });
    }
  });
}
