import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient() as any;

class TimeLogController {
  // بدء تسجيل وقت
  startTimeLog = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId, description } = req.body;
    const mechanicId = req.user!.id;

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        garage: {
          select: { id: true },
        },
      },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Verify mechanic is assigned to this garage
    const mechanic = await prisma.user.findFirst({
      where: {
        id: mechanicId,
        role: 'MECHANIC',
        mechanicGarageId: booking.garage.id,
      },
    });

    if (!mechanic && req.user!.role !== 'ADMIN') {
      throw new CustomError('Mechanic is not assigned to this garage', 403);
    }

    // Check if there's already an active time log for this booking and mechanic
    const activeLog = await prisma.timeLog.findFirst({
      where: {
        mechanicId,
        bookingId,
        endTime: null,
      },
    });

    if (activeLog) {
      throw new CustomError('There is already an active time log for this booking', 400);
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        mechanicId,
        bookingId,
        description,
        startTime: new Date(),
      },
      include: {
        mechanic: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: timeLog,
      message: 'Time log started successfully',
    };

    res.status(201).json(response);
  });

  // إنهاء تسجيل وقت
  stopTimeLog = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const mechanicId = req.user!.id;

    const timeLog = await prisma.timeLog.findUnique({
      where: { id },
    });

    if (!timeLog) {
      throw new CustomError('Time log not found', 404);
    }

    if (timeLog.mechanicId !== mechanicId && req.user!.role !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    if (timeLog.endTime) {
      throw new CustomError('Time log is already stopped', 400);
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeLog.startTime.getTime()) / 1000 / 60); // in minutes

    const updated = await prisma.timeLog.update({
      where: { id },
      data: {
        endTime,
        duration,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Time log stopped successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على سجلات وقت لميكانيكي
  getMechanicTimeLogs = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId } = req.params;
    const { page = 1, limit = 20, startDate, endDate, bookingId } = req.query as any;

    const where: any = { mechanicId };
    if (bookingId) where.bookingId = bookingId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [timeLogs, total] = await Promise.all([
      prisma.timeLog.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              vehicle: {
                select: {
                  plate: true,
                  make: true,
                  model: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'desc' },
      }),
      prisma.timeLog.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: timeLogs,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على سجلات وقت لحجز
  getBookingTimeLogs = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const { page = 1, limit = 20 } = req.query as any;

    const [timeLogs, total] = await Promise.all([
      prisma.timeLog.findMany({
        where: { bookingId },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          mechanic: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      }),
      prisma.timeLog.count({ where: { bookingId } }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: timeLogs,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على ملخص الوقت
  getTimeSummary = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId, startDate, endDate } = req.query as any;

    const where: any = {};
    if (mechanicId) where.mechanicId = mechanicId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const timeLogs = await prisma.timeLog.findMany({
      where,
      select: {
        duration: true,
        startTime: true,
      },
    });

    const totalMinutes = timeLogs.reduce((sum: number, log: any) => sum + (log.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = totalMinutes % 60;

    const response: ApiResponse = {
      success: true,
      data: {
        totalMinutes,
        totalHours,
        totalRemainingMinutes,
        formatted: `${totalHours}h ${totalRemainingMinutes}m`,
        logCount: timeLogs.length,
      },
    };

    res.status(200).json(response);
  });

  // تحديث وصف تسجيل الوقت
  updateTimeLog = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { description } = req.body;
    const mechanicId = req.user!.id;

    const timeLog = await prisma.timeLog.findUnique({
      where: { id },
    });

    if (!timeLog) {
      throw new CustomError('Time log not found', 404);
    }

    if (timeLog.mechanicId !== mechanicId && req.user!.role !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    const updated = await prisma.timeLog.update({
      where: { id },
      data: { description },
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Time log updated successfully',
    };

    res.status(200).json(response);
  });

  // حذف تسجيل وقت
  deleteTimeLog = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const mechanicId = req.user!.id;

    const timeLog = await prisma.timeLog.findUnique({
      where: { id },
    });

    if (!timeLog) {
      throw new CustomError('Time log not found', 404);
    }

    if (timeLog.mechanicId !== mechanicId && req.user!.role !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    await prisma.timeLog.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Time log deleted successfully',
    };

    res.status(200).json(response);
  });
}

export const timeLogController = new TimeLogController();
