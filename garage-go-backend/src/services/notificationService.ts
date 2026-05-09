import { PrismaClient } from '@prisma/client';
import { Logger } from '@/utils/logger';
import { Redis } from '@/utils/redis';
import { EmailService } from '@/utils/email';
import { NotificationType } from '@/types';

const prisma = new PrismaClient();

class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: any
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data,
        },
      });

      // Cache notification for quick access
      await Redis.set(`notification:${notification.id}`, notification, 3600);

      Logger.info('Notification created', { notificationId: notification.id, userId, type });

      return notification;
    } catch (error) {
      Logger.error('Failed to create notification', error);
      throw error;
    }
  }

  static async sendBookingNotification(
    userId: string,
    bookingId: string,
    type: 'created' | 'confirmed' | 'cancelled' | 'completed',
    garageName: string,
    serviceTitle: string,
    scheduledAt?: Date
  ) {
    const notifications = {
      created: {
        title: 'Booking Created',
        message: `Your booking for ${serviceTitle} at ${garageName} has been created.`,
        type: NotificationType.BOOKING_CREATED,
      },
      confirmed: {
        title: 'Booking Confirmed',
        message: `Your booking for ${serviceTitle} at ${garageName} has been confirmed.`,
        type: NotificationType.BOOKING_UPDATED,
      },
      cancelled: {
        title: 'Booking Cancelled',
        message: `Your booking for ${serviceTitle} at ${garageName} has been cancelled.`,
        type: NotificationType.BOOKING_CANCELLED,
      },
      completed: {
        title: 'Service Completed',
        message: `Your service ${serviceTitle} at ${garageName} has been completed.`,
        type: NotificationType.BOOKING_UPDATED,
      },
    };

    const notification = notifications[type];
    if (!notification) return;

    return this.createNotification(
      userId,
      notification.title,
      notification.message,
      notification.type,
      { bookingId, garageName, serviceTitle, scheduledAt }
    );
  }

  static async sendPaymentNotification(
    userId: string,
    invoiceId: string,
    amount: number,
    garageName: string
  ) {
    return this.createNotification(
      userId,
      'Payment Received',
      `Your payment of $${amount.toFixed(2)} for ${garageName} has been received.`,
      NotificationType.PAYMENT_RECEIVED,
      { invoiceId, amount, garageName }
    );
  }

  static async sendInvoiceNotification(
    userId: string,
    invoiceId: string,
    amount: number,
    dueDate: Date,
    garageName: string
  ) {
    return this.createNotification(
      userId,
      'Invoice Issued',
      `A new invoice of $${amount.toFixed(2)} from ${garageName} is due on ${dueDate.toLocaleDateString()}.`,
      NotificationType.INVOICE_ISSUED,
      { invoiceId, amount, dueDate, garageName }
    );
  }

  static async sendMaintenanceDueNotification(
    userId: string,
    vehicleId: string,
    vehiclePlate: string,
    nextServiceDate: Date
  ) {
    return this.createNotification(
      userId,
      'Maintenance Due',
      `Your vehicle ${vehiclePlate} is due for maintenance on ${nextServiceDate.toLocaleDateString()}.`,
      NotificationType.MAINTENANCE_DUE,
      { vehicleId, vehiclePlate, nextServiceDate }
    );
  }

  static async sendGarageUpdateNotification(
    userId: string,
    garageId: string,
    garageName: string,
    update: string
  ) {
    return this.createNotification(
      userId,
      'Garage Update',
      `${garageName}: ${update}`,
      NotificationType.GARAGE_UPDATE,
      { garageId, garageName, update }
    );
  }

  static async sendSystemNotification(
    userId: string,
    title: string,
    message: string
  ) {
    return this.createNotification(
      userId,
      title,
      message,
      NotificationType.SYSTEM_NOTIFICATION
    );
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
        },
      });

      if (notification.count > 0) {
        // Update cache
        await Redis.del(`notification:${notificationId}`);
        Logger.info('Notification marked as read', { notificationId, userId });
      }

      return notification.count > 0;
    } catch (error) {
      Logger.error('Failed to mark notification as read', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      // Clear user's notification cache
      await Redis.invalidatePattern(`notification:*`);

      Logger.info('All notifications marked as read', { userId, count: result.count });

      return result.count;
    } catch (error) {
      Logger.error('Failed to mark all notifications as read', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (notification.count > 0) {
        // Remove from cache
        await Redis.del(`notification:${notificationId}`);
        Logger.info('Notification deleted', { notificationId, userId });
      }

      return notification.count > 0;
    } catch (error) {
      Logger.error('Failed to delete notification', error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      Logger.error('Failed to get unread count', error);
      throw error;
    }
  }

  static async sendEmailNotification(
    userId: string,
    type: 'booking_confirmation' | 'booking_reminder' | 'invoice' | 'welcome',
    data: any
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const emailService = EmailService.getInstance();
      let sent = false;

      switch (type) {
        case 'booking_confirmation':
          sent = await emailService.sendBookingConfirmationEmail(
            user.email,
            user.fullName,
            data.garageName,
            data.serviceTitle,
            data.scheduledAt
          );
          break;
        case 'booking_reminder':
          sent = await emailService.sendBookingReminderEmail(
            user.email,
            user.fullName,
            data.garageName,
            data.serviceTitle,
            data.scheduledAt
          );
          break;
        case 'invoice':
          sent = await emailService.sendInvoiceEmail(
            user.email,
            user.fullName,
            data.invoiceNumber,
            data.amount,
            data.dueDate
          );
          break;
        case 'welcome':
          sent = await emailService.sendWelcomeEmail(user.email, user.fullName);
          break;
      }

      if (sent) {
        Logger.info('Email notification sent', { userId, type, email: user.email });
      }

      return sent;
    } catch (error) {
      Logger.error('Failed to send email notification', error);
      return false;
    }
  }

  static async cleanupOldNotifications(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true,
        },
      });

      Logger.info('Old notifications cleaned up', { count: result.count, daysOld });

      return result.count;
    } catch (error) {
      Logger.error('Failed to cleanup old notifications', error);
      throw error;
    }
  }
}

export { NotificationService };
