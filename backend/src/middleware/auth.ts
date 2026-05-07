import { FastifyRequest, FastifyReply } from 'fastify';

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const apiKey = request.headers['authorization'];
  
  if (!apiKey || apiKey !== `Bearer ${process.env.API_KEY}`) {
    reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
      },
    });
  }
};
