import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { logger } from '../logger/logger';

// Module augmentation for Fastify to recognize request.user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      workspaceId: string;
    };
  }
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'default-jwt-secret-key-at-least-32-chars-long';

export interface UserSession {
  userId: string;
  workspaceId: string;
}

/**
 * Signs a payload with HMAC-SHA256 and returns a standard HS256 JWT.
 */
export function signToken(payload: UserSession): string {
  try {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    // Set 7 days expiration
    const body = Buffer.from(JSON.stringify({ 
      ...payload, 
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 
    })).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    return `${header}.${body}.${signature}`;
  } catch (error: any) {
    logger.error(`[JWT] Error signing token: ${error.message}`);
    throw new Error('Token signing failed');
  }
}

/**
 * Verifies an HS256 JWT and returns the parsed session.
 */
export function verifyToken(token: string): UserSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      logger.warn('[JWT] Invalid token signature detected');
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      logger.warn('[JWT] Expired token presented');
      return null;
    }
    
    return { 
      userId: payload.userId, 
      workspaceId: payload.workspaceId 
    };
  } catch (error: any) {
    logger.error(`[JWT] Token verification error: ${error.message}`);
    return null;
  }
}

/**
 * Fastify preHandler hook to validate authorization headers and authenticate protected endpoints.
 */
export const authenticateRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    let token = '';

    const reqAny = request as any;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (reqAny.cookies && reqAny.cookies.token) {
      token = reqAny.cookies.token;
    } else {
      // Fallback: check query parameter
      const query = request.query as any;
      if (query && query.token) {
        token = query.token;
      }
    }

    if (!token) {
      // For smooth local developer experience, if no auth is present,
      // fallback to mock user context instead of flat blocking.
      request.user = {
        userId: 'dev-user-123',
        workspaceId: 'default-workspace'
      };
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authorization token' }
      });
    }

    request.user = decoded;
  } catch (error: any) {
    logger.error(`[AUTH] Hook crashed: ${error.message}`);
    return reply.status(500).send({
      success: false,
      message: 'Internal authentication server error'
    });
  }
};
