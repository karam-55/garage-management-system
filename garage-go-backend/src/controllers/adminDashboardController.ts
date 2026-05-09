import { Response, NextFunction } from 'express';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';
import { PrismaClient } from '@prisma/client';
import { PermissionService, Role, Permission } from '@/models/permissions';

const prisma = new PrismaClient() as any;

class AdminDashboardController {
  // === لوحة التحكم الرئيسية ===

  // الحصول على نظرة عامة للنظام
  getSystemOverview = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, dateFrom, dateTo } = req.query as any;

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const where: any = {};
    if (garageId) where.garageId = garageId;

    const [
      totalUsers,
      totalGarages,
      activeUsers,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      activeBookings,
      completedJobs,
      pendingPayments,
      systemHealth,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.garage.count({ where: { isActive: true } }),
      prisma.userSession.count({
        where: {
          expiresAt: { gt: new Date() },
          lastAccessAt: { gte: weekAgo },
        },
      }),
      this.getRevenueByDate(today, today, garageId),
      this.getRevenueByDate(weekAgo, today, garageId),
      this.getRevenueByDate(monthAgo, today, garageId),
      prisma.booking.count({
        where: {
          ...where,
          status: { in: ['CONFirmed', 'IN_PROGRESS'] },
        },
      }),
      prisma.jobCard.count({
        where: {
          ...where,
          status: 'COMPLETED',
          completedAt: { gte: monthAgo },
        },
      }),
      prisma.invoice.count({
        where: {
          ...where,
          status: { in: ['SENT', 'OVERDUE'] },
        },
      }),
      this.getSystemHealthStatus(),
    ]);

    const overview = {
      users: {
        total: totalUsers,
        active: activeUsers,
        growthRate: await this.calculateGrowthRate('users', monthAgo, today),
      },
      garages: {
        total: totalGarages,
        active: await prisma.garage.count({ where: { isActive: true } }),
      },
      revenue: {
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        growthRate: await this.calculateGrowthRate('revenue', monthAgo, today),
      },
      operations: {
        activeBookings,
        completedJobs,
        pendingPayments,
        completionRate: await this.calculateCompletionRate(garageId),
      },
      system: {
        health: systemHealth,
        uptime: await this.getSystemUptime(),
        performance: await this.getSystemPerformance(),
      },
    };

    const response: ApiResponse = {
      success: true,
      data: overview,
    };

    res.status(200).json(response);
  });

  // === إدارة المستخدمين ===

  // الحصول على قائمة المستخدمين
  getUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      role,
      status,
      garageId,
      search,
      page = 1,
      limit = 20,
    } = req.query as any;

    const where: any = {};
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    if (garageId) where.garageId = garageId;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
          garage: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              userSessions: true,
              auditLogs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // إنشاء مستخدم جديد
  createUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      email,
      password,
      fullName,
      phone,
      roleIds,
      garageId,
    } = req.body;

    // التحقق من وجود البريد الإلكتروني
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new CustomError('Email already exists', 409);
    }

    // تشفير كلمة المرور
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
        garageId,
        userRoles: {
          create: roleIds.map((roleId: string) => ({
            roleId,
          })),
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        garage: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User created successfully',
    };

    res.status(201).json(response);
  });

  // تحديث بيانات المستخدم
  updateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      fullName,
      phone,
      roleIds,
      isActive,
      garageId,
    } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        phone,
        isActive,
        garageId,
        userRoles: roleIds ? {
          deleteMany: {},
          create: roleIds.map((roleId: string) => ({
            roleId,
          })),
        } : undefined,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        garage: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };

    res.status(200).json(response);
  });

  // === إدارة الورشات ===

  // الحصول على قائمة الورشات
  getGarages = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      status,
      search,
      page = 1,
      limit = 20,
    } = req.query as any;

    const where: any = {};
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [garages, total] = await Promise.all([
      prisma.garage.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          owner: {
            select: { id: true, fullName: true, email: true },
          },
          _count: {
            select: {
              bookings: true,
              jobCards: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.garage.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: garages,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // === التقارير المتقدمة ===

  // تقرير الأداء الشامل
  getPerformanceReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      garageId,
      dateFrom,
      dateTo,
      reportType = 'comprehensive',
    } = req.query as any;

    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();

    const report = await this.generatePerformanceReport(garageId, startDate, endDate, reportType);

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // تقرير الاستخدام حسب المنصة
  getPlatformUsageReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      dateFrom,
      dateTo,
    } = req.query as any;

    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();

    const [
      platformStats,
      userActivity,
      featureUsage,
      performanceMetrics,
    ] = await Promise.all([
      this.getPlatformStatistics(startDate, endDate),
      this.getUserActivityByPlatform(startDate, endDate),
      this.getFeatureUsageByPlatform(startDate, endDate),
      this.getPerformanceMetricsByPlatform(startDate, endDate),
    ]);

    const report = {
      period: { startDate, endDate },
      platforms: platformStats,
      userActivity,
      featureUsage,
      performance: performanceMetrics,
      insights: await this.generatePlatformInsights(platformStats, userActivity),
    };

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // === إعدادات النظام ===

  // الحصول على إعدادات النظام
  getSystemSettings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const settings = await prisma.systemSettings.findFirst({
      include: {
        emailSettings: true,
        smsSettings: true,
        paymentSettings: true,
        securitySettings: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: settings,
    };

    res.status(200).json(response);
  });

  // تحديث إعدادات النظام
  updateSystemSettings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      generalSettings,
      emailSettings,
      smsSettings,
      paymentSettings,
      securitySettings,
    } = req.body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        generalSettings,
        emailSettings: emailSettings ? { update: emailSettings } : undefined,
        smsSettings: smsSettings ? { update: smsSettings } : undefined,
        paymentSettings: paymentSettings ? { update: paymentSettings } : undefined,
        securitySettings: securitySettings ? { update: securitySettings } : undefined,
      },
      create: {
        id: 'default',
        generalSettings,
        emailSettings: emailSettings ? { create: emailSettings } : undefined,
        smsSettings: smsSettings ? { create: smsSettings } : undefined,
        paymentSettings: paymentSettings ? { create: paymentSettings } : undefined,
        securitySettings: securitySettings ? { create: securitySettings } : undefined,
      },
      include: {
        emailSettings: true,
        smsSettings: true,
        paymentSettings: true,
        securitySettings: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: settings,
      message: 'System settings updated successfully',
    };

    res.status(200).json(response);
  });

  // === مراقبة النظام ===

  // الحصول على سجل الأنشطة
  getActivityLogs = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      userId,
      action,
      resource,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query as any;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: logs,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // === دوال مساعدة ===

  private async getRevenueByDate(startDate: Date, endDate: Date, garageId?: string): Promise<number> {
    const where: any = {
      status: 'PAID',
      createdAt: { gte: startDate, lte: endDate },
    };

    if (garageId) {
      where.jobCard = { garageId };
    }

    const result = await prisma.invoice.aggregate({
      where,
      _sum: { total: true },
    });

    return result._sum.total || 0;
  }

  private async calculateGrowthRate(type: string, startDate: Date, endDate: Date): Promise<number> {
    // حساب معدل النمو
    const previousPeriod = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    
    const [current, previous] = await Promise.all([
      this.getRevenueByDate(startDate, endDate),
      this.getRevenueByDate(previousPeriod, startDate),
    ]);

    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private async calculateCompletionRate(garageId?: string): Promise<number> {
    const where: any = {};
    if (garageId) where.garageId = garageId;

    const [total, completed] = await Promise.all([
      prisma.jobCard.count({ where }),
      prisma.jobCard.count({
        where: { ...where, status: 'COMPLETED' },
      }),
    ]);

    return total > 0 ? (completed / total) * 100 : 0;
  }

  private async getSystemHealthStatus(): Promise<string> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return 'HEALTHY';
    } catch (error) {
      return 'UNHEALTHY';
    }
  }

  private async getSystemUptime(): Promise<number> {
    // يمكن حساب وقت التشغيل الفعلي
    return Math.floor(process.uptime());
  }

  private async getSystemPerformance(): Promise<any> {
    return {
      cpu: 0, // يمكن استخدام مكتبة مثل systeminformation
      memory: process.memoryUsage(),
      disk: 0,
      network: 0,
    };
  }

  private async generatePerformanceReport(
    garageId: string | undefined,
    startDate: Date,
    endDate: Date,
    reportType: string
  ): Promise<any> {
    // تنفيذ منطق التقرير حسب النوع
    return {
      period: { startDate, endDate },
      type: reportType,
      data: {},
    };
  }

  private async getPlatformStatistics(startDate: Date, endDate: Date): Promise<any> {
    const platforms = await prisma.userSession.groupBy({
      by: ['platform'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { platform: true },
    });

    return platforms.reduce((acc, item) => {
      acc[item.platform] = item._count.platform;
      return acc;
    }, {});
  }

  private async getUserActivityByPlatform(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getFeatureUsageByPlatform(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getPerformanceMetricsByPlatform(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async generatePlatformInsights(platformStats: any, userActivity: any): Promise<string[]> {
    const insights: string[] = [];
    
    // تحليل البيانات وتوليد رؤى
    if (platformStats.mobile > platformStats.web) {
      insights.push('Mobile usage exceeds web usage');
    }

    return insights;
  }
}

export const adminDashboardController = new AdminDashboardController();
