import { Server } from 'socket.io';
import { prisma } from '../config/database';

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join doctor monitoring room (for multi-patient view)
    socket.on('join-doctor-room', (doctorId: string) => {
      socket.join(`doctor:${doctorId}`);
      console.log(`Doctor ${doctorId} joined monitoring room`);
    });

    // Heartbeat simulation (for testing)
    socket.on('simulate-heartbeat', async (data: { userId: string; bpm: number }) => {
      try {
        const record = await prisma.heartbeatRecord.create({
          data: {
            userId: data.userId,
            bpm: data.bpm,
            source: 'simulated',
          },
          include: {
            user: {
              select: { name: true },
            },
          },
        });

        // Broadcast to all clients
        io.emit('bpm-update', {
          userId: data.userId,
          userName: record.user.name,
          bpm: data.bpm,
          timestamp: record.timestamp,
        });
      } catch (error) {
        console.error('Simulation error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });

  // Heartbeat to keep connections alive
  setInterval(() => {
    io.emit('heartbeat', { timestamp: new Date() });
  }, 30000);
};
