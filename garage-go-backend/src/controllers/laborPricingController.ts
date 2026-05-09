import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';
import { laborPricingService } from '@/models/laborPricing';

const prisma = new PrismaClient() as any;

class LaborPricingController {
  // إضافة فني جديد
  addTechnician = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const technicianData = {
      ...req.body,
      hourlyRate: req.body.hourlyRate || 0,
      skillLevel: req.body.skillLevel || 'INTERMEDIATE',
      experience: req.body.experience || 0,
      maxConcurrentJobs: req.body.maxConcurrentJobs || 3,
      isActive: req.body.isActive !== false,
    };

    const technician = await laborPricingService.addTechnician(technicianData);

    const response: ApiResponse = {
      success: true,
      data: technician,
      message: 'Technician added successfully',
    };

    res.status(201).json(response);
  });

  // تحديث بيانات الفني
  updateTechnician = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const technician = await laborPricingService.updateTechnician(id, updateData);

    const response: ApiResponse = {
      success: true,
      data: technician,
      message: 'Technician updated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على قائمة الفنيين
  getTechnicians = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      skillLevel,
      specialization,
      available,
      garageId,
    } = req.query as any;

    const filters = {
      skillLevel,
      specialization,
      available: available === 'true',
      garageId,
    };

    const technicians = await laborPricingService.getTechnicians(filters);

    const response: ApiResponse = {
      success: true,
      data: technicians,
      count: technicians.length,
    };

    res.status(200).json(response);
  });

  // حساب تكلفة العمالة
  calculateLaborCost = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      serviceId,
      technicianId,
      complexity = 'MEDIUM',
      urgency = 'MEDIUM',
      vehicleType,
      isOvertime,
      isWeekend,
      isHoliday,
    } = req.body;

    if (!serviceId || !technicianId) {
      throw new CustomError('Service ID and Technician ID are required', 400);
    }

    const laborCost = await laborPricingService.calculateLaborCost(
      serviceId,
      technicianId,
      complexity,
      urgency,
      vehicleType,
      isOvertime,
      isWeekend,
      isHoliday
    );

    const response: ApiResponse = {
      success: true,
      data: laborCost,
    };

    res.status(200).json(response);
  });

  // إنشاء بطاقة وقت
  createTimeSheet = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const timeSheetData = {
      ...req.body,
      date: new Date(req.body.date),
      clockIn: new Date(req.body.clockIn),
      clockOut: req.body.clockOut ? new Date(req.body.clockOut) : undefined,
    };

    const timeSheet = await laborPricingService.createTimeSheet(timeSheetData);

    const response: ApiResponse = {
      success: true,
      data: timeSheet,
      message: 'Time sheet created successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على جداول وقت الفني
  getTechnicianTimeSheets = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      dateFrom,
      dateTo,
      status,
      page = 1,
      limit = 50,
    } = req.query as any;

    const filters = {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo,
      status,
    };

    const timeSheets = await laborPricingService.getTechnicianTimeSheets(id, filters);

    // تطبيق الصفحة
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedTimeSheets = timeSheets.slice(startIndex, endIndex);

    const response: PaginatedResponse = {
      success: true,
      data: paginatedTimeSheets,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: timeSheets.length,
        totalPages: Math.ceil(timeSheets.length / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // حساب الرواتب والإنتاجية
  calculatePayroll = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { period, startDate, endDate } = req.body;

    if (!period || !startDate || !endDate) {
      throw new CustomError('Period, start date, and end date are required', 400);
    }

    const payroll = await laborPricingService.calculatePayroll(
      id,
      period,
      new Date(startDate),
      new Date(endDate)
    );

    const response: ApiResponse = {
      success: true,
      data: payroll,
    };

    res.status(200).json(response);
  });

  // الحصول على الفنيين المتاحرين
  getAvailableTechnicians = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      serviceId,
      requiredDate,
      requiredTime,
      duration,
    } = req.query as any;

    if (!serviceId || !requiredDate || !requiredTime || !duration) {
      throw new CustomError('Service ID, date, time, and duration are required', 400);
    }

    const technicians = await laborPricingService.getAvailableTechnicians(
      serviceId,
      new Date(requiredDate),
      requiredTime,
      Number(duration)
    );

    const response: ApiResponse = {
      success: true,
      data: technicians,
      count: technicians.length,
    };

    res.status(200).json(response);
  });

  // تحديث تسعير الخدمات
  updateServicePricing = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const pricingData = req.body;

    const service = await laborPricingService.updateServicePricing(id, pricingData);

    const response: ApiResponse = {
      success: true,
      data: service,
      message: 'Service pricing updated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على تقارير أداء الفنيين
  getPerformanceReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      technicianId,
      dateFrom,
      dateTo,
    } = req.query as any;

    const report = await laborPricingService.getTechnicianPerformanceReport(
      technicianId,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo
    );

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // الحصول على إحصائيات الفنيين
  getTechnicianStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, dateFrom, dateTo } = req.query as any;

    const where: any = { isActive: true };
    if (garageId) where.garageId = garageId;

    const [
      totalTechnicians,
      bySkillLevel,
      bySpecialization,
      averageHourlyRate,
      totalActiveJobs,
    ] = await Promise.all([
      prisma.technician.count({ where }),
      
      prisma.technician.groupBy({
        by: ['skillLevel'],
        where,
        _count: { skillLevel: true },
      }),
      
      prisma.technician.findMany({ where }).then(techs => {
        const specCount: Record<string, number> = {};
        techs.forEach(tech => {
          tech.specialization.forEach((spec: string) => {
            specCount[spec] = (specCount[spec] || 0) + 1;
          });
        });
        return specCount;
      }),
      
      prisma.technician.aggregate({
        where,
        _avg: { hourlyRate: true },
      }),
      
      prisma.jobCard.count({
        where: {
          status: 'IN_PROGRESS',
          ...(garageId && { garage: { id: garageId } }),
        },
      }),
    ]);

    const stats = {
      overview: {
        totalTechnicians,
        averageHourlyRate: averageHourlyRate._avg.hourlyRate || 0,
        totalActiveJobs,
      },
      bySkillLevel: bySkillLevel.reduce((acc, item) => {
        acc[item.skillLevel] = item._count.skillLevel;
        return acc;
      }, {}),
      bySpecialization,
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });

  // تحديث حالة بطاقة الوقت
  updateTimeSheetStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      throw new CustomError('Status is required', 400);
    }

    const timeSheet = await prisma.timeSheet.update({
      where: { id },
      data: {
        status,
        notes,
        approvedBy: status === 'APPROVED' ? req.user!.id : undefined,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
        updatedAt: new Date(),
      },
      include: {
        technician: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        jobCard: {
          select: {
            jobNumber: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: timeSheet,
      message: `Time sheet ${status.toLowerCase()} successfully`,
    };

    res.status(200).json(response);
  });

  // الحصول على سجلات الحضور
  getAttendanceRecords = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      technicianId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query as any;

    const where: any = {};
    if (technicianId) where.technicianId = technicianId;
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      prisma.timeSheet.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { date: 'desc' },
        include: {
          technician: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      }),
      prisma.timeSheet.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: records,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // تعديل سجلات الوقت
  editTimeSheet = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      clockIn,
      clockOut,
      breakTime,
      activities,
      notes,
    } = req.body;

    const timeSheet = await prisma.timeSheet.findUnique({
      where: { id },
    });

    if (!timeSheet) {
      throw new CustomError('Time sheet not found', 404);
    }

    if (timeSheet.status === 'APPROVED') {
      throw new CustomError('Cannot edit approved time sheet', 400);
    }

    // إعادة حساب الساعات والأرباح
    const totalMinutes = clockOut && clockIn 
      ? Math.floor((new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 60000)
      : 0;
    
    const totalHours = (totalMinutes - (breakTime || 0)) / 60;
    const totalEarnings = totalHours * timeSheet.hourlyRate;

    const updatedTimeSheet = await prisma.timeSheet.update({
      where: { id },
      data: {
        clockIn: new Date(clockIn),
        clockOut: clockOut ? new Date(clockOut) : undefined,
        breakTime,
        totalHours,
        totalEarnings,
        activities,
        notes,
        updatedAt: new Date(),
      },
      include: {
        technician: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        jobCard: {
          select: {
            jobNumber: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedTimeSheet,
      message: 'Time sheet updated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على ملخص الرواتب
  getPayrollSummary = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      period = 'MONTHLY',
      startDate,
      endDate,
      garageId,
    } = req.query as any;

    if (!startDate || !endDate) {
      throw new CustomError('Start date and end date are required', 400);
    }

    const technicians = await prisma.technician.findMany({
      where: {
        isActive: true,
        ...(garageId && { garageId }),
      },
    });

    const payrollData = await Promise.all(
      technicians.map(async (technician) => {
        try {
          const payroll = await laborPricingService.calculatePayroll(
            technician.id,
            period,
            new Date(startDate),
            new Date(endDate)
          );

          return {
            technicianId: technician.id,
            technicianName: technician.user?.fullName || 'Unknown',
            ...payroll.summary,
          };
        } catch (error) {
          return {
            technicianId: technician.id,
            technicianName: technician.user?.fullName || 'Unknown',
            error: error.message,
          };
        }
      })
    );

    const summary = {
      period,
      startDate,
      endDate,
      totalTechnicians: technicians.length,
      totalHours: payrollData.reduce((sum, p) => sum + (p.totalHours || 0), 0),
      totalEarnings: payrollData.reduce((sum, p) => sum + (p.totalEarnings || 0), 0),
      totalCommission: payrollData.reduce((sum, p) => sum + (p.commission || 0), 0),
      totalCompensation: payrollData.reduce((sum, p) => sum + (p.totalCompensation || 0), 0),
      completedJobs: payrollData.reduce((sum, p) => sum + (p.completedJobs || 0), 0),
    };

    const response: ApiResponse = {
      success: true,
      data: {
        summary,
        technicians: payrollData,
      },
    };

    res.status(200).json(response);
  });
}

export const laborPricingController = new LaborPricingController();
