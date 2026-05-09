import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsAppService,
  ) {}

  async findAll(filters?: { recipientId?: string; status?: string; type?: string }) {
    const where: any = {};
    if (filters?.recipientId) where.recipientId = filters.recipientId;
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    return this.prisma.notificationsQueue.findMany({
      where,
      include: {
        recipient: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQueue() {
    return this.prisma.notificationsQueue.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        priority: 'desc',
        createdAt: 'asc',
      },
      include: {
        recipient: true,
      },
    });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notificationsQueue.findUnique({
      where: { id },
      include: {
        recipient: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async create(createNotificationDto: any) {
    const { recipientId, type, title, message, channel, priority, data, scheduledAt } = createNotificationDto;

    return this.prisma.notificationsQueue.create({
      data: {
        recipientId,
        type,
        title,
        message,
        channel: channel || 'IN_APP',
        priority: priority || 'MEDIUM',
        data: data || {},
        status: 'PENDING',
        scheduledAt: scheduledAt || new Date(),
      },
    });
  }

  async update(id: string, updateNotificationDto: any) {
    return this.prisma.notificationsQueue.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  async markAsSent(id: string) {
    return this.prisma.notificationsQueue.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  async markAsDelivered(id: string) {
    return this.prisma.notificationsQueue.update({
      where: { id },
      data: {
        status: 'DELIVERED',
      },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notificationsQueue.update({
      where: { id },
      data: {
        status: 'READ',
      },
    });
  }

  async markAsFailed(id: string, errorMessage: string) {
    const notification = await this.prisma.notificationsQueue.findUnique({
      where: { id },
      select: { retryCount: true, maxRetries: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const newRetryCount = notification.retryCount + 1;

    if (newRetryCount >= notification.maxRetries) {
      return this.prisma.notificationsQueue.update({
        where: { id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          errorMessage,
          retryCount: newRetryCount,
        },
      });
    }

    // Calculate next retry time with exponential backoff
    const nextRetryAt = new Date(Date.now() + Math.pow(2, newRetryCount) * 60 * 1000);

    return this.prisma.notificationsQueue.update({
      where: { id },
      data: {
        status: 'RETRYING',
        errorMessage,
        retryCount: newRetryCount,
        nextRetryAt,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.notificationsQueue.delete({
      where: { id },
    });
  }

  // Send notification to multiple channels
  async sendNotification(recipientId: string, type: any, title: string, message: string, channels: string[] = ['IN_APP'], data?: any, priority: string = 'MEDIUM') {
    const notifications = [];

    for (const channel of channels) {
      const notification = await this.prisma.notificationsQueue.create({
        data: {
          recipientId,
          type,
          title,
          message,
          channel: channel as any,
          priority: priority as any,
          data: data || {},
          status: 'PENDING',
          scheduledAt: new Date(),
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Queue Processing Logic
  async processQueue() {
    const pendingNotifications = await this.getQueue();

    const results = [];

    for (const notification of pendingNotifications) {
      try {
        if (notification.scheduledAt && new Date(notification.scheduledAt) > new Date()) {
          // Skip if scheduled for future
          continue;
        }

        let sent = false;

        switch (notification.channel) {
          case 'IN_APP':
            sent = await this.sendInAppNotification(notification);
            break;
          case 'EMAIL':
            sent = await this.sendEmailNotification(notification);
            break;
          case 'SMS':
            sent = await this.sendSMSNotification(notification);
            break;
          case 'WHATSAPP':
            sent = await this.sendWhatsAppNotification(notification);
            break;
          case 'PUSH':
            sent = await this.sendPushNotification(notification);
            break;
          default:
            console.log(`Unknown channel: ${notification.channel}`);
        }

        if (sent) {
          await this.markAsSent(notification.id);
          results.push({ id: notification.id, status: 'sent' });
        } else {
          await this.markAsFailed(notification.id, 'Failed to send notification');
          results.push({ id: notification.id, status: 'failed' });
        }
      } catch (error) {
        await this.markAsFailed(notification.id, error.message);
        results.push({ id: notification.id, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  // In-App Notification
  async sendInAppNotification(notification: any): Promise<boolean> {
    try {
      await this.prisma.inAppNotification.create({
        data: {
          userId: notification.recipientId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          data: notification.data,
          isRead: false,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to send in-app notification:', error);
      return false;
    }
  }

  // Email Notification
  async sendEmailNotification(notification: any): Promise<boolean> {
    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`Sending email to ${notification.recipient.email}: ${notification.title}`);
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  // SMS Notification
  async sendSMSNotification(notification: any): Promise<boolean> {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      const recipient = await this.prisma.user.findUnique({
        where: { id: notification.recipientId },
        select: { phone: true },
      });

      if (!recipient?.phone) {
        console.error('Recipient has no phone number');
        return false;
      }

      console.log(`Sending SMS to ${recipient.phone}: ${notification.message}`);
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      return false;
    }
  }

  // WhatsApp Notification
  async sendWhatsAppNotification(notification: any): Promise<boolean> {
    try {
      const recipient = await this.prisma.user.findUnique({
        where: { id: notification.recipientId },
        select: { phone: true },
      });

      if (!recipient?.phone) {
        console.error('Recipient has no phone number');
        return false;
      }

      // Use WhatsApp Service
      const result = await this.whatsappService.sendMessage(
        recipient.phone,
        notification.message,
      );

      return result.success;
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      return false;
    }
  }

  // Push Notification
  async sendPushNotification(notification: any): Promise<boolean> {
    try {
      // TODO: Integrate with Push Notification service (Firebase Cloud Messaging, OneSignal, etc.)
      console.log(`Sending push notification to ${notification.recipientId}: ${notification.title}`);
      // Simulate push sending
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Template Processing
  async getTemplate(type: any, language: string = 'ar') {
    return this.prisma.notificationTemplates.findFirst({
      where: {
        type,
        language,
        isActive: true,
      },
    });
  }

  async renderTemplate(template: any, variables: any): Promise<string> {
    let rendered = template.template;

    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, variables[key]);
    });

    return rendered;
  }

  // In-App Notifications for User
  async getInAppNotifications(userId: string, filters?: { isRead?: boolean }) {
    const where: any = { userId };
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;

    return this.prisma.inAppNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markInAppNotificationAsRead(id: string, userId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllInAppNotificationsAsRead(userId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Notification Preferences
  async getNotificationPreferences(userId: string) {
    return this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    return this.prisma.notificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
      },
    });
  }

  // WhatsApp Logs
  async getWhatsAppLogs(filters?: { phoneNumber?: string; status?: string }) {
    const where: any = {};
    if (filters?.phoneNumber) where.phoneNumber = filters.phoneNumber;
    if (filters?.status) where.status = filters.status;

    return this.prisma.whatsAppLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Retry failed notifications
  async retryFailedNotifications() {
    const retryingNotifications = await this.prisma.notificationsQueue.findMany({
      where: {
        status: 'RETRYING',
        nextRetryAt: {
          lte: new Date(),
        },
      },
      include: {
        recipient: true,
      },
    });

    const results = [];

    for (const notification of retryingNotifications) {
      try {
        let sent = false;

        switch (notification.channel) {
          case 'IN_APP':
            sent = await this.sendInAppNotification(notification);
            break;
          case 'EMAIL':
            sent = await this.sendEmailNotification(notification);
            break;
          case 'SMS':
            sent = await this.sendSMSNotification(notification);
            break;
          case 'WHATSAPP':
            sent = await this.sendWhatsAppNotification(notification);
            break;
          case 'PUSH':
            sent = await this.sendPushNotification(notification);
            break;
        }

        if (sent) {
          await this.markAsSent(notification.id);
          results.push({ id: notification.id, status: 'sent' });
        } else {
          await this.markAsFailed(notification.id, 'Retry failed');
          results.push({ id: notification.id, status: 'failed' });
        }
      } catch (error) {
        await this.markAsFailed(notification.id, error.message);
        results.push({ id: notification.id, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.notificationsQueue.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: {
          in: ['SENT', 'DELIVERED', 'READ', 'FAILED'],
        },
      },
    });
  }

  // Get notification statistics
  async getStatistics(userId?: string) {
    const where = userId ? { recipientId: userId } : {};

    const total = await this.prisma.notificationsQueue.count({ where });
    const pending = await this.prisma.notificationsQueue.count({ where: { ...where, status: 'PENDING' } });
    const sent = await this.prisma.notificationsQueue.count({ where: { ...where, status: 'SENT' } });
    const delivered = await this.prisma.notificationsQueue.count({ where: { ...where, status: 'DELIVERED' } });
    const failed = await this.prisma.notificationsQueue.count({ where: { ...where, status: 'FAILED' } });

    return {
      total,
      pending,
      sent,
      delivered,
      failed,
      successRate: total > 0 ? ((sent + delivered) / total) * 100 : 0,
    };
  }
}
