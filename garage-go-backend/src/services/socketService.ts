import { Server as SocketIOServer } from 'socket.io';
import { Logger } from '@/utils/logger';
import { NotificationService } from './notificationService';

class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer;

  private constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  public static getInstance(io?: SocketIOServer): SocketService {
    if (!SocketService.instance && io) {
      SocketService.instance = new SocketService(io);
    }
    return SocketService.instance;
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      Logger.info('Client connected', { socketId: socket.id });

      // Join garage room
      socket.on('join-garage', (garageId: string) => {
        socket.join(`garage:${garageId}`);
        Logger.info('Client joined garage room', { socketId: socket.id, garageId });
      });

      // Leave garage room
      socket.on('leave-garage', (garageId: string) => {
        socket.leave(`garage:${garageId}`);
        Logger.info('Client left garage room', { socketId: socket.id, garageId });
      });

      // Join user room for personal notifications
      socket.on('join-user', (userId: string) => {
        socket.join(`user:${userId}`);
        Logger.info('Client joined user room', { socketId: socket.id, userId });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        Logger.info('Client disconnected', { socketId: socket.id });
      });
    });
  }

  // Booking events
  public emitBookingCreated(garageId: string, bookingData: any): void {
    this.io.to(`garage:${garageId}`).emit('booking-created', bookingData);
    Logger.info('Booking created event emitted', { garageId });
  }

  public emitBookingUpdated(garageId: string, bookingData: any): void {
    this.io.to(`garage:${garageId}`).emit('booking-updated', bookingData);
    Logger.info('Booking updated event emitted', { garageId });
  }

  public emitBookingCancelled(garageId: string, bookingData: any): void {
    this.io.to(`garage:${garageId}`).emit('booking-cancelled', bookingData);
    Logger.info('Booking cancelled event emitted', { garageId });
  }

  // Garage events
  public emitGarageUpdate(garageId: string, garageData: any): void {
    this.io.to(`garage:${garageId}`).emit('garage-update', garageData);
    Logger.info('Garage update event emitted', { garageId });
  }

  // Notification events
  public emitNotification(userId: string, notificationData: any): void {
    this.io.to(`user:${userId}`).emit('notification', notificationData);
    Logger.info('Notification event emitted', { userId });
  }

  // Mechanic events
  public emitMechanicAssigned(garageId: string, assignmentData: any): void {
    this.io.to(`garage:${garageId}`).emit('mechanic-assigned', assignmentData);
    Logger.info('Mechanic assigned event emitted', { garageId });
  }

  public emitJobCompleted(garageId: string, jobData: any): void {
    this.io.to(`garage:${garageId}`).emit('job-completed', jobData);
    Logger.info('Job completed event emitted', { garageId });
  }

  // System events
  public emitSystemMaintenance(message: string): void {
    this.io.emit('system-maintenance', { message, timestamp: new Date() });
    Logger.info('System maintenance event emitted', { message });
  }

  public emitSystemAlert(level: 'info' | 'warning' | 'error', message: string): void {
    this.io.emit('system-alert', { level, message, timestamp: new Date() });
    Logger.info('System alert event emitted', { level, message });
  }

  // Real-time garage status
  public emitGarageStatus(garageId: string, status: {
    activeBookings: number;
    queueLength: number;
    averageWaitTime: number;
  }): void {
    this.io.to(`garage:${garageId}`).emit('garage-status', status);
  }

  // Real-time mechanic availability
  public emitMechanicAvailability(garageId: string, mechanics: Array<{
    id: string;
    name: string;
    status: 'available' | 'busy' | 'offline';
    currentJob?: string;
  }>): void {
    this.io.to(`garage:${garageId}`).emit('mechanic-availability', mechanics);
  }

  // Queue management
  public emitQueueUpdate(garageId: string, queueData: {
    position: number;
    estimatedWaitTime: number;
    status: string;
  }): void {
    this.io.to(`garage:${garageId}`).emit('queue-update', queueData);
  }

  // Chat/Messaging (for future implementation)
  public emitNewMessage(garageId: string, messageData: {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
  }): void {
    this.io.to(`garage:${garageId}`).emit('new-message', messageData);
  }

  public emitTypingIndicator(garageId: string, typingData: {
    userId: string;
    userName: string;
    isTyping: boolean;
  }): void {
    this.io.to(`garage:${garageId}`).emit('typing-indicator', typingData);
  }

  // Utility methods
  public getConnectedClients(garageId?: string): number {
    if (garageId) {
      const room = this.io.sockets.adapter.rooms.get(`garage:${garageId}`);
      return room ? room.size : 0;
    }
    return this.io.engine.clientsCount;
  }

  public broadcastToGarage(garageId: string, event: string, data: any): void {
    this.io.to(`garage:${garageId}`).emit(event, data);
    Logger.info('Broadcast to garage', { garageId, event });
  }

  public broadcastToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
    Logger.info('Broadcast to user', { userId, event });
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
    Logger.info('Broadcast to all', { event });
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      const clientsCount = this.getConnectedClients();
      Logger.info('Socket service health check', { connectedClients: clientsCount });
      return true;
    } catch (error) {
      Logger.error('Socket service health check failed', error);
      return false;
    }
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    try {
      this.io.emit('server-shutdown', { message: 'Server is shutting down' });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Give clients time to receive message
      this.io.close();
      Logger.info('Socket service shut down successfully');
    } catch (error) {
      Logger.error('Socket service shutdown failed', error);
    }
  }
}

export { SocketService };
