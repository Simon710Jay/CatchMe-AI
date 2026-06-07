import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../logger/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'catchme-super-secret-key-12345';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const { fullName, email, password } = request.body as any;

      if (!fullName || !email || !password) {
        return reply.status(400).send({ error: 'All fields are required' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return reply.status(400).send({ error: 'Email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Extract initials for avatar
      const initials = fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        avatar: initials,
        lastLoginAt: new Date(),
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      reply.setCookie('catchme_session', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      };
    } catch (error: any) {
      logger.error(`Registration error: ${error.message}`);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as any;

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      reply.setCookie('catchme_session', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      };
    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Logout
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('catchme_session', { path: '/' });
    return { success: true };
  });

  // Get current user (me)
  fastify.get('/me', async (request, reply) => {
    try {
      const token = request.cookies.catchme_session;

      if (!token) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user) {
        return reply.status(401).send({ error: 'User not found' });
      }

      return {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      };
    } catch (error: any) {
      // If token is expired or invalid
      reply.clearCookie('catchme_session', { path: '/' });
      return reply.status(401).send({ error: 'Not authenticated' });
    }
  });
};

export default authRoutes;
