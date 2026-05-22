import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyJwt } from '../utils/jwt';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email?: string;
    name?: string;
  };
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if ((request.query as any).token) {
      token = (request.query as any).token;
    }

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token is missing' }
      });
    }

    const decoded = verifyJwt(token);
    if (!decoded) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' }
      });
    }

    (request as AuthenticatedRequest).user = decoded;
  } catch (error: any) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' }
    });
  }
}
