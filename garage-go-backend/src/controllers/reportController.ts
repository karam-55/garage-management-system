import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse } from '@/types';

const prisma = new PrismaClient() as any;

class ReportController {
  getDailyReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // For non-admin users, only show reports for their garages
    const garageFilter = userRole === 'ADMIN' ? {} : { 
      garage: { ownerId: userId } 
    };

    const reports = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: dateFilter,
        ...garageFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalPrice: true,
      },
    });

    const processedReports = reports.map(report => ({
      date: report.createdAt,
      totalBookings: report._count.id,
      totalRevenue: report._sum.totalPrice || 0,
    }));

    const response: ApiResponse = {
      success: true,
      data: processedReports,
    };

    res.status(200).json(response);
  });

  getGarageDailyReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user has access to the garage
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const reports = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        garageId,
        createdAt: dateFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalPrice: true,
      },
    });

    const processedReports = reports.map(report => ({
      date: report.createdAt,
      totalBookings: report._count.id,
      totalRevenue: report._sum.totalPrice || 0,
    }));

    const response: ApiResponse = {
      success: true,
      data: processedReports,
    };

    res.status(200).json(response);
  });

  getGarageReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user has access to the garage
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      topServices,
      mechanicPerformance,
    ] = await Promise.all([
      prisma.booking.count({
        where: { garageId, createdAt: dateFilter },
      }),
      prisma.booking.count({
        where: { garageId, status: 'COMPLETED', createdAt: dateFilter },
      }),
      prisma.booking.count({
        where: { garageId, status: 'CANCELLED', createdAt: dateFilter },
      }),
      prisma.invoice.aggregate({
        where: { 
          garageId, 
          status: 'PAID',
          createdAt: dateFilter,
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.groupBy({
        by: ['serviceId'],
        where: { garageId, createdAt: dateFilter },
        _count: { id: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.maintenanceRecord.groupBy({
        by: ['mechanicId'],
        where: { garageId, createdAt: dateFilter },
        _count: { id: true },
        _avg: { laborHours: true },
        _sum: { totalCost: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    // Get service details for top services
    const serviceIds = topServices.map(s => s.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, title: true },
    });

    const serviceMap = services.reduce((acc, service) => {
      acc[service.id] = service.title;
      return acc;
    }, {});

    // Get mechanic details for performance
    const mechanicIds = mechanicPerformance.map(m => m.mechanicId);
    const mechanics = await prisma.user.findMany({
      where: { id: { in: mechanicIds } },
      select: { id: true, fullName: true },
    });

    const mechanicMap = mechanics.reduce((acc, mechanic) => {
      acc[mechanic.id] = mechanic.fullName;
      return acc;
    }, {});

    const report = {
      garageId,
      period: { startDate, endDate },
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
      topServices: topServices.map(service => ({
        serviceId: service.serviceId,
        serviceTitle: serviceMap[service.serviceId] || 'Unknown',
        count: service._count.id,
        revenue: service._sum.totalPrice || 0,
      })),
      mechanicPerformance: mechanicPerformance.map(mechanic => ({
        mechanicId: mechanic.mechanicId,
        mechanicName: mechanicMap[mechanic.mechanicId] || 'Unknown',
        completedBookings: mechanic._count.id,
        averageDuration: mechanic._avg.laborHours || 0,
        revenue: mechanic._sum.totalCost || 0,
      })),
    };

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  getGaragePerformanceReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user has access to the garage
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const performance = await prisma.booking.groupBy({
      by: ['status'],
      where: { garageId, createdAt: dateFilter },
      _count: { id: true },
      _sum: { totalPrice: true },
    });

    const response: ApiResponse = {
      success: true,
      data: performance,
    };

    res.status(200).json(response);
  });

  getGarageRevenueReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user has access to the garage
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const revenue = await prisma.invoice.groupBy({
      by: ['status'],
      where: { garageId, createdAt: dateFilter },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const response: ApiResponse = {
      success: true,
      data: revenue,
    };

    res.status(200).json(response);
  });

  getGarageServicesReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user has access to the garage
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const services = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: { garageId, createdAt: dateFilter },
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Get service details
    const serviceIds = services.map(s => s.serviceId);
    const serviceDetails = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, title: true, price: true },
    });

    const serviceMap = serviceDetails.reduce((acc, service) => {
      acc[service.id] = service;
      return acc;
    }, {});

    const report = services.map(service => ({
      serviceId: service.serviceId,
      serviceTitle: serviceMap[service.serviceId]?.title || 'Unknown',
      servicePrice: serviceMap[service.serviceId]?.price || 0,
      bookingCount: service._count.id,
      totalRevenue: service._sum.totalPrice || 0,
    }));

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  getMechanicReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId } = req.params;
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user is the mechanic or has admin access
    if (mechanicId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [
      totalRecords,
      totalHours,
      totalRevenue,
      averageHoursPerJob,
    ] = await Promise.all([
      prisma.maintenanceRecord.count({
        where: { mechanicId, createdAt: dateFilter },
      }),
      prisma.maintenanceRecord.aggregate({
        where: { mechanicId, createdAt: dateFilter },
        _sum: { laborHours: true },
      }),
      prisma.maintenanceRecord.aggregate({
        where: { mechanicId, createdAt: dateFilter },
        _sum: { totalCost: true },
      }),
      prisma.maintenanceRecord.aggregate({
        where: { mechanicId, createdAt: dateFilter },
        _avg: { laborHours: true },
      }),
    ]);

    const report = {
      mechanicId,
      period: { startDate, endDate },
      totalRecords,
      totalHours: totalHours._sum.laborHours || 0,
      totalRevenue: totalRevenue._sum.totalCost || 0,
      averageHoursPerJob: averageHoursPerJob._avg.laborHours || 0,
    };

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  getMechanicPerformanceReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId } = req.params;
    const { startDate, endDate } = req.query as any;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user is the mechanic or has admin access
    if (mechanicId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const performance = await prisma.maintenanceRecord.groupBy({
      by: ['garageId'],
      where: { mechanicId, createdAt: dateFilter },
      _count: { id: true },
      _sum: { laborHours: true, totalCost: true },
      _avg: { laborHours: true },
    });

    // Get garage details
    const garageIds = performance.map(p => p.garageId);
    const garages = await prisma.garage.findMany({
      where: { id: { in: garageIds } },
      select: { id: true, name: true },
    });

    const garageMap = garages.reduce((acc, garage) => {
      acc[garage.id] = garage.name;
      return acc;
    }, {});

    const report = performance.map(perf => ({
      garageId: perf.garageId,
      garageName: garageMap[perf.garageId] || 'Unknown',
      totalJobs: perf._count.id,
      totalHours: perf._sum.laborHours || 0,
      totalRevenue: perf._sum.totalCost || 0,
      averageHoursPerJob: perf._avg.laborHours || 0,
    }));

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // Admin reports
  getAdminOverviewReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as any;
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [
      totalUsers,
      totalGarages,
      totalBookings,
      totalRevenue,
      activeUsers,
      activeGarages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.garage.count(),
      prisma.booking.count({ where: { createdAt: dateFilter } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID', createdAt: dateFilter },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.garage.count({ where: { isActive: true } }),
    ]);

    const overview = {
      totalUsers,
      totalGarages,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeUsers,
      activeGarages,
      period: { startDate, endDate },
    };

    const response: ApiResponse = {
      success: true,
      data: overview,
    };

    res.status(200).json(response);
  });

  getAdminUsersReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as any;
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    const newUsers = await prisma.user.count({
      where: { createdAt: dateFilter },
    });

    const report = {
      usersByRole,
      newUsers,
      period: { startDate, endDate },
    };

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  getAdminGaragesReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as any;
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [
      totalGarages,
      activeGarages,
      newGarages,
    ] = await Promise.all([
      prisma.garage.count(),
      prisma.garage.count({ where: { isActive: true } }),
      prisma.garage.count({ where: { createdAt: dateFilter } }),
    ]);

    const report = {
      totalGarages,
      activeGarages,
      newGarages,
      period: { startDate, endDate },
    };

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // Export methods (simplified - in real implementation would generate CSV/PDF)
  exportDailyReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query as any;

    // Reuse getDailyReports logic and return data for export
    const reports = await this.getDailyReportsData(req.query as any);

    const response: ApiResponse = {
      success: true,
      data: reports,
      message: 'Daily reports data ready for export',
    };

    res.status(200).json(response);
  });

  exportGarageReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query as any;

    // Reuse getGarageReport logic and return data for export
    const report = await this.getGarageReportData(garageId, req.query as any);

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Garage report data ready for export',
    };

    res.status(200).json(response);
  });

  exportMechanicReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId } = req.params;
    const { startDate, endDate } = req.query as any;

    // Reuse getMechanicReport logic and return data for export
    const report = await this.getMechanicReportData(mechanicId, req.query as any);

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Mechanic report data ready for export',
    };

    res.status(200).json(response);
  });

  // Helper methods for data retrieval (used by export methods)
  private async getDailyReportsData(query: any) {
    // Implementation similar to getDailyReports
    return [];
  }

  private async getGarageReportData(garageId: string, query: any) {
    // Implementation similar to getGarageReport
    return {};
  }

  private async getMechanicReportData(mechanicId: string, query: any) {
    // Implementation similar to getMechanicReport
    return {};
  }
}

export const reportController = new ReportController();
