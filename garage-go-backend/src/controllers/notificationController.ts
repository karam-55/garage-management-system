import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';
import WhatsAppService from '@/services/whatsappService';

const prisma = new PrismaClient() as any;

class NotificationController {
  createNotification = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId, title, message, type, data } = req.body;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: notification,
      message: 'Notification created successfully',
    };

    res.status(201).json(response);
  });

  getAllNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, userId, type, isRead } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: notifications,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getUserNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10, isRead } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: notifications,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getUnreadNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { userId, isRead: false };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: notifications,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getNotificationById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new CustomError('Notification not found', 404);
    }

    // Check if user owns the notification or is admin
    if (notification.userId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    const response: ApiResponse = {
      success: true,
      data: notification,
    };

    res.status(200).json(response);
  });

  markAsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new CustomError('Notification not found', 404);
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    // Also mark in-app notification as read
    await prisma.inAppNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Notification marked as read',
    };

    res.status(200).json(response);
  });

  markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    await prisma.inAppNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    const response: ApiResponse = {
      success: true,
      message: 'All notifications marked as read',
    };

    res.status(200).json(response);
  });

  deleteNotification = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new CustomError('Notification not found', 404);
    }

    await prisma.notification.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Notification deleted successfully',
    };

    res.status(200).json(response);
  });

  getNotificationPreferences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // Create default preferences if not found
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId,
          emailEnabled: true,
          smsEnabled: true,
          whatsappEnabled: true,
          inAppEnabled: true,
          notificationTypes: JSON.stringify(['BOOKING', 'INVOICE', 'PROMOTION']),
        },
      });
    }

    const response: ApiResponse = {
      success: true,
      data: preferences,
    };

    res.status(200).json(response);
  });

  updateNotificationPreferences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { emailEnabled, smsEnabled, whatsappEnabled, inAppEnabled, preferredTime, notificationTypes } = req.body;

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: {
        emailEnabled,
        smsEnabled,
        whatsappEnabled,
        inAppEnabled,
        preferredTime,
        notificationTypes: notificationTypes ? JSON.stringify(notificationTypes) : undefined,
      },
      create: {
        userId,
        emailEnabled: emailEnabled ?? true,
        smsEnabled: smsEnabled ?? true,
        whatsappEnabled: whatsappEnabled ?? true,
        inAppEnabled: inAppEnabled ?? true,
        preferredTime,
        notificationTypes: notificationTypes ? JSON.stringify(notificationTypes) : JSON.stringify(['BOOKING', 'INVOICE', 'PROMOTION']),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: preferences,
      message: 'Notification preferences updated successfully',
    };

    res.status(200).json(response);
  });

  sendMaintenanceNotification = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId, type } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, phone: true, fullName: true } },
        vehicle: { select: { plate: true, make: true, model: true } },
        service: { select: { title: true } },
      },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Get notification template
    const template = await prisma.notificationTemplate.findFirst({
      where: {
        type,
        language: 'ar',
        isActive: true,
      },
    });

    let message = '';
    if (template) {
      // Replace variables in template
      const variables = JSON.parse(template.variables);
      message = template.template;
      variables.forEach((variable: string) => {
        let value = '';
        switch (variable) {
          case 'customerName':
            value = booking.user.fullName || 'العميل';
            break;
          case 'vehiclePlate':
            value = booking.vehicle.plate;
            break;
          case 'serviceName':
            value = booking.service.title;
            break;
          default:
            value = '';
        }
        message = message.replace(`{${variable}}`, value);
      });
    } else {
      // Default message if no template found
      message = `مرحباً ${booking.user.fullName}، تحديث جديد على حجزك للسيارة ${booking.vehicle.plate}`;
    }

    // Send WhatsApp notification
    if (booking.user.phone) {
      await WhatsAppService.getInstance().sendMessage({
        to: booking.user.phone,
        message: message,
      });
    }

    // Create in-app notification
    await prisma.inAppNotification.create({
      data: {
        userId: booking.user.id,
        title: 'تحديث الصيانة',
        message,
        type,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Maintenance notification sent successfully',
    };

    res.status(200).json(response);
  });

  createNotificationTemplate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, language, subject, template, variables } = req.body;

    const newTemplate = await prisma.notificationTemplate.create({
      data: {
        type,
        language: language || 'ar',
        subject,
        template,
        variables: variables ? JSON.stringify(variables) : '[]',
      },
    });

    const response: ApiResponse = {
      success: true,
      data: newTemplate,
      message: 'Notification template created successfully',
    };

    res.status(201).json(response);
  });

  getNotificationTemplates = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, language, isActive } = req.query as any;

    const where: any = {};
    if (type) where.type = type;
    if (language) where.language = language;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const templates = await prisma.notificationTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const response: ApiResponse = {
      success: true,
      data: templates,
    };

    res.status(200).json(response);
  });

  updateNotificationTemplate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { subject, template, variables, isActive } = req.body;

    const updatedTemplate = await prisma.notificationTemplate.update({
      where: { id },
      data: {
        subject,
        template,
        variables: variables ? JSON.stringify(variables) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedTemplate,
      message: 'Notification template updated successfully',
    };

    res.status(200).json(response);
  });

  deleteNotificationTemplate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.notificationTemplate.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Notification template deleted successfully',
    };

    res.status(200).json(response);
  });
}

export const notificationController = new NotificationController();

