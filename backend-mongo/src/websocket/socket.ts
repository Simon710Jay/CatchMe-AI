import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { logger } from '../logger/logger';

let io: Server;

export const initSocket = (app: FastifyInstance) => {
  io = new Server(app.server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const broadcast = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
    logger.debug(`📡 Broadcasted event: ${event}`);
  }
};
