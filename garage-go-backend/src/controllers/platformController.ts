import { Response, NextFunction } from 'express';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse } from '@/types';
import { PermissionService, Role, Permission } from '@/models/permissions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

class PlatformController {
  // الحصول على معلومات المنصة للمستخدم
  getPlatformInfo = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const platform = req.headers['x-platform'] as string || 'web';
    
    const permissions = PermissionService.getPlatformPermissions(user.role as Role, platform as any);
    
    const platformInfo = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions,
      },
      platform: {
        type: platform,
        features: this.getPlatformFeatures(platform, user.role as Role),
        restrictions: this.getPlatformRestrictions(platform, user.role as Role),
      },
      garage: user.garageId ? await this.getGarageInfo(user.garageId) : null,
    };

    const response: ApiResponse = {
      success: true,
      data: platformInfo,
    };

    res.status(200).json(response);
  });

  // تسجيل الدخول حسب المنصة
  platformLogin = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password, platform, deviceInfo } = req.body;
    const userAgent = req.headers['user-agent'];

    // التحقق من صحة المنصة
    const validPlatforms = ['web', 'mobile', 'desktop'];
    if (!validPlatforms.includes(platform)) {
      throw new CustomError('Invalid platform', 400);
    }

    // التحقق من بيانات المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        garage: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new CustomError('Invalid credentials', 401);
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid credentials', 401);
    }

    // التحقق من صلاحيات المنصة
    const userRole = user.roles[0]?.role?.name as Role;
    const platformPermissions = PermissionService.getPlatformPermissions(userRole, platform);
    
    if (platformPermissions.length === 0) {
      throw new CustomError('Access denied for this platform', 403);
    }

    // إنشاء جلسة جديدة
    const session = await this.createSession(user.id, platform, deviceInfo, userAgent);

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: userRole,
          permissions: platformPermissions,
          garage: user.garage,
        },
        session: {
          token: session.token,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt,
        },
        platform: {
          type: platform,
          features: this.getPlatformFeatures(platform, userRole),
        },
      },
      message: 'Login successful',
    };

    res.status(200).json(response);
  });

  // تحديث إعدادات المنصة
  updatePlatformSettings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const platform = req.headers['x-platform'] as string || 'web';
    const { settings } = req.body;

    const platformSettings = await prisma.platformSettings.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform,
        },
      },
      update: {
        settings,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform,
        settings,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: platformSettings,
      message: 'Platform settings updated successfully',
    };

    res.status(200).json(response);
  });

  // مزامنة البيانات للمنصات المحمولة
  syncData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const { lastSyncTime, platform } = req.query;

    const syncData = await this.getSyncData(user.id, platform as string, lastSyncTime ? new Date(lastSyncTime as string) : undefined);

    const response: ApiResponse = {
      success: true,
      data: {
        syncData,
        lastSyncTime: new Date(),
        nextSyncTime: new Date(Date.now() + 5 * 60 * 1000), // 5 دقائق
      },
    };

    res.status(200).json(response);
  });

  // إرسال إشعارات للمنصات المختلفة
  sendPlatformNotification = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userIds, title, message, type, data, platforms } = req.body;

    const notifications = await Promise.all(
      userIds.map(async (userId: string) => {
        const userPlatforms = await prisma.userPlatform.findMany({
          where: {
            userId,
            isActive: true,
            ...(platforms && { platform: { in: platforms } }),
          },
        });

        return userPlatforms.map(async (userPlatform) => {
          return await prisma.notification.create({
            data: {
              userId,
              title,
              message,
              type,
              data,
              platform: userPlatform.platform,
              deviceToken: userPlatform.deviceToken,
              status: 'PENDING',
              createdAt: new Date(),
            },
          });
        });
      })
    );

    const response: ApiResponse = {
      success: true,
      data: { notifications: notifications.flat() },
      message: 'Notifications sent successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على إحصائيات المنصة
  getPlatformStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const platform = req.headers['x-platform'] as string || 'web';
    const { dateFrom, dateTo } = req.query;

    const stats = await this.getPlatformStatistics(user.id, platform, dateFrom, dateTo);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });

  // === دوال مساعدة ===

  private async getGarageInfo(garageId: string) {
    return await prisma.garage.findUnique({
      where: { id: garageId },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        workingHours: true,
        settings: true,
      },
    });
  }

  private getPlatformFeatures(platform: string, role: Role): string[] {
    const features = {
      web: {
        [Role.ADMIN]: ['dashboard', 'users', 'bookings', 'inventory', 'invoices', 'reports', 'settings'],
        [Role.GARAGE_OWNER]: ['dashboard', 'bookings', 'inventory', 'invoices', 'reports'],
        [Role.MECHANIC]: ['schedule', 'job-cards', 'time-tracking'],
        [Role.CUSTOMER]: ['bookings', 'vehicles', 'invoices', 'payments'],
        [Role.RECEPTIONIST]: ['bookings', 'customers', 'invoices'],
        [Role.ACCOUNTANT]: ['invoices', 'payments', 'reports'],
        [Role.INVENTORY_MANAGER]: ['inventory', 'purchase-orders', 'reports'],
      },
      mobile: {
        [Role.ADMIN]: ['dashboard', 'notifications', 'quick-actions'],
        [Role.GARAGE_OWNER]: ['dashboard', 'notifications', 'bookings'],
        [Role.MECHANIC]: ['job-cards', 'time-tracking', 'camera', 'notifications'],
        [Role.CUSTOMER]: ['bookings', 'vehicles', 'payments', 'notifications'],
        [Role.RECEPTIONIST]: ['bookings', 'customers', 'notifications'],
        [Role.ACCOUNTANT]: ['invoices', 'payments'],
        [Role.INVENTORY_MANAGER]: ['inventory', 'scan', 'notifications'],
      },
      desktop: {
        [Role.ADMIN]: ['full-system', 'advanced-reports', 'system-config'],
        [Role.GARAGE_OWNER]: ['full-management', 'detailed-reports', 'settings'],
        [Role.MECHANIC]: ['job-management', 'time-tracking', 'inventory'],
        [Role.CUSTOMER]: [], // العملاء لا يستخدمون تطبيق ويندوز
        [Role.RECEPTIONIST]: ['booking-management', 'customer-service', 'invoicing'],
        [Role.ACCOUNTANT]: ['full-accounting', 'financial-reports', 'tax-reports'],
        [Role.INVENTORY_MANAGER]: ['inventory-management', 'purchase-orders', 'reports'],
      },
    };

    return features[platform]?.[role] || [];
  }

  private getPlatformRestrictions(platform: string, role: Role): string[] {
    const restrictions = {
      web: {
        [Role.CUSTOMER]: ['no-admin-access', 'limited-reports'],
        [Role.MECHANIC]: ['no-inventory-management', 'no-financial-data'],
        [Role.RECEPTIONIST]: ['no-system-settings', 'no-user-management'],
      },
      mobile: {
        [Role.CUSTOMER]: ['no-advanced-features', 'limited-data-access'],
        [Role.MECHANIC]: ['no-financial-reports', 'no-user-management'],
        [Role.ACCOUNTANT]: ['read-only-access'],
      },
      desktop: {
        [Role.CUSTOMER]: ['no-access'],
        [Role.MECHANIC]: ['no-system-config', 'no-user-management'],
      },
    };

    return restrictions[platform]?.[role] || [];
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // استخدام bcrypt للتحقق من كلمة المرور
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
  }

  private async createSession(userId: string, platform: string, deviceInfo: any, userAgent: string) {
    const jwt = require('jsonwebtoken');
    const uuid = require('uuid');

    const token = jwt.sign(
      { 
        userId, 
        platform,
        sessionId: uuid.v4(),
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId, platform },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    const session = await prisma.userSession.create({
      data: {
        userId,
        platform,
        token,
        refreshToken,
        deviceInfo,
        userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
    });

    return session;
  }

  private async getSyncData(userId: string, platform: string, lastSyncTime?: Date) {
    const where: any = {
      userId,
    };

    if (lastSyncTime) {
      where.updatedAt = {
        gte: lastSyncTime,
      };
    }

    // جلب البيانات المحدثة للمزامنة
    const [bookings, jobCards, notifications] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          vehicle: { select: { id: true, make: true, model: true, plate: true } },
          service: { select: { id: true, title: true, duration: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      
      prisma.jobCard.findMany({
        where: {
          technicianId: userId,
          ...(lastSyncTime && { updatedAt: { gte: lastSyncTime } }),
        },
        include: {
          booking: {
            include: {
              customer: { select: { fullName: true } },
              vehicle: { select: { make: true, model: true } },
            },
          },
          timeTracking: {
            orderBy: { startTime: 'desc' },
            take: 10,
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
      
      prisma.notification.findMany({
        where: {
          userId,
          platform,
          status: 'PENDING',
          ...(lastSyncTime && { createdAt: { gte: lastSyncTime } }),
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    return {
      bookings,
      jobCards,
      notifications,
      timestamp: new Date(),
    };
  }

  private async getPlatformStatistics(userId: string, platform: string, dateFrom?: any, dateTo?: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        garage: true,
        roles: { include: { role: true } },
      },
    });

    if (!user) return null;

    const role = user.roles[0]?.role?.name as Role;
    const garageId = user.garageId;

    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);

    switch (role) {
      case Role.MECHANIC:
        return await this.getMechanicStats(userId, garageId!, dateFilter);
      case Role.GARAGE_OWNER:
      case Role.ADMIN:
        return await this.getOwnerStats(garageId!, dateFilter);
      case Role.CUSTOMER:
        return await this.getCustomerStats(userId, dateFilter);
      default:
        return null;
    }
  }

  private async getMechanicStats(technicianId: string, garageId: string, dateFilter: any) {
    const [totalJobs, completedJobs, totalHours, earnings] = await Promise.all([
      prisma.jobCard.count({
        where: {
          technicianId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      
      prisma.jobCard.count({
        where: {
          technicianId,
          status: 'COMPLETED',
          ...(Object.keys(dateFilter).length > 0 && { completedAt: dateFilter }),
        },
      }),
      
      prisma.timeSheet.aggregate({
        where: {
          technicianId,
          status: 'APPROVED',
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        _sum: { totalHours: true },
      }),
      
      prisma.commissionRecord.aggregate({
        where: {
          technicianId,
          status: 'PAID',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _sum: { commissionAmount: true },
      }),
    ]);

    return {
      totalJobs,
      completedJobs,
      completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      totalHours: totalHours._sum.totalHours || 0,
      earnings: earnings._sum.commissionAmount || 0,
    };
  }

  private async getOwnerStats(garageId: string, dateFilter: any) {
    const [totalBookings, totalRevenue, activeJobs, customerCount] = await Promise.all([
      prisma.booking.count({
        where: {
          garageId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      
      prisma.invoice.aggregate({
        where: {
          jobCard: { garageId },
          status: 'PAID',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _sum: { total: true },
      }),
      
      prisma.jobCard.count({
        where: {
          garageId,
          status: 'IN_PROGRESS',
        },
      }),
      
      prisma.customer.count({
        where: {
          bookings: {
            some: { garageId },
          },
        },
      }),
    ]);

    return {
      totalBookings,
      totalRevenue: totalRevenue._sum.total || 0,
      activeJobs,
      customerCount,
    };
  }

  private async getCustomerStats(customerId: string, dateFilter: any) {
    const [totalBookings, totalSpent, activeBookings, vehicles] = await Promise.all([
      prisma.booking.count({
        where: {
          customerId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      
      prisma.invoice.aggregate({
        where: {
          customerId,
          status: 'PAID',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _sum: { total: true },
      }),
      
      prisma.booking.count({
        where: {
          customerId,
          status: { in: ['CONFFIRMED', 'IN_PROGRESS'] },
        },
      }),
      
      prisma.vehicle.count({
        where: { customerId },
      }),
    ]);

    return {
      totalBookings,
      totalSpent: totalSpent._sum.total || 0,
      activeBookings,
      vehicles,
    };
  }
}

export const platformController = new PlatformController();
