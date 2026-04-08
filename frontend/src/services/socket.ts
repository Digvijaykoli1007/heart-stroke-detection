import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✓ WebSocket connected');
      
      if (userId) {
        this.socket?.emit('join-user-room', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('✗ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data);
  }

  joinUserRoom(userId: string) {
    this.socket?.emit('join-user-room', userId);
  }

  joinDoctorRoom(doctorId: string) {
    this.socket?.emit('join-doctor-room', doctorId);
  }

  simulateHeartbeat(userId: string, bpm: number) {
    this.socket?.emit('simulate-heartbeat', { userId, bpm });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
