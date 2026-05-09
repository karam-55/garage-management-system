import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient() as any;

class MaintenanceController {
  createMaintenanceRecord = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { vehicleId, bookingId, mechanicId, garageId, notes, partsUsed, laborHours, laborRate, totalCost, odometer, nextServiceDate, metadata } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Verify user has access to the garage
    const garage = await prisma.garage.findFirst({
      where: {
        id: garageId,
        OR: [
          { ownerId: userId },
          { mechanics: { some: { id: userId } } },
        ],
      },
    });

    if (!garage && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only create maintenance records for your garage.', 403);
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, vehicleId: true, garageId: true, status: true },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    if (booking.vehicleId !== vehicleId || booking.garageId !== garageId) {
      throw new CustomError('Booking does not match vehicle and garage', 400);
    }

    // Verify mechanic exists and belongs to garage
    const mechanic = await prisma.user.findFirst({
      where: {
        id: mechanicId,
        role: 'MECHANIC',
        mechanicGarage: { id: garageId },
      },
    });

    if (!mechanic) {
      throw new CustomError('Mechanic not found or does not belong to this garage', 404);
    }

    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        vehicleId,
        bookingId,
        mechanicId,
        garageId,
        notes,
        partsUsed,
        laborHours,
        laborRate,
        totalCost,
        odometer,
        nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
        metadata,
      },
      include: {
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        mechanic: {
          select: { id: true, fullName: true },
        },
        garage: {
          select: { id: true, name: true },
        },
        booking: {
          select: { id: true, scheduledAt: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: maintenanceRecord,
      message: 'Maintenance record created successfully',
    };

    res.status(201).json(response);
  });

  getAllMaintenanceRecords = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, garageId, vehicleId, mechanicId, startDate, endDate } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (garageId) where.garageId = garageId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (mechanicId) where.mechanicId = mechanicId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            select: { id: true, plate: true, make: true, model: true },
          },
          mechanic: {
            select: { id: true, fullName: true },
          },
          garage: {
            select: { id: true, name: true },
          },
          booking: {
            select: { id: true, scheduledAt: true },
          },
        },
      }),
      prisma.maintenanceRecord.count({ where }),
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

  getMaintenanceRecordById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const record = await prisma.maintenanceRecord.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        mechanic: {
          select: { id: true, fullName: true, email: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        booking: {
          select: { id: true, scheduledAt: true, status: true },
        },
      },
    });

    if (!record) {
      throw new CustomError('Maintenance record not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: record,
    };

    res.status(200).json(response);
  });

  updateMaintenanceRecord = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { notes, partsUsed, laborHours, laborRate, totalCost, odometer, nextServiceDate, metadata } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if record exists and user has access
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id },
      include: { garage: { select: { ownerId: true } } },
    });

    if (!record) {
      throw new CustomError('Maintenance record not found', 404);
    }

    const hasAccess = await prisma.garage.findFirst({
      where: {
        id: record.garageId,
        OR: [
          { ownerId: userId },
          { mechanics: { some: { id: userId } } },
        ],
      },
    });

    if (!hasAccess && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    const updatedRecord = await prisma.maintenanceRecord.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes }),
        ...(partsUsed !== undefined && { partsUsed }),
        ...(laborHours !== undefined && { laborHours }),
        ...(laborRate !== undefined && { laborRate }),
        ...(totalCost !== undefined && { totalCost }),
        ...(odometer !== undefined && { odometer }),
        ...(nextServiceDate !== undefined && { 
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null 
        }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        mechanic: {
          select: { id: true, fullName: true },
        },
        garage: {
          select: { id: true, name: true },
        },
        booking: {
          select: { id: true, scheduledAt: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedRecord,
      message: 'Maintenance record updated successfully',
    };

    res.status(200).json(response);
  });

  deleteMaintenanceRecord = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if record exists and user has access
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id },
      include: { garage: { select: { ownerId: true } } },
    });

    if (!record) {
      throw new CustomError('Maintenance record not found', 404);
    }

    if (record.garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. Only garage owners can delete maintenance records.', 403);
    }

    await prisma.maintenanceRecord.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Maintenance record deleted successfully',
    };

    res.status(200).json(response);
  });

  getVehicleMaintenanceRecords = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if vehicle belongs to user
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, userId: true },
    });

    if (!vehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    if (vehicle.userId !== userId) {
      throw new CustomError('Access denied', 403);
    }

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where: { vehicleId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          mechanic: {
            select: { id: true, fullName: true },
          },
          garage: {
            select: { id: true, name: true },
          },
          booking: {
            select: { id: true, scheduledAt: true },
          },
        },
      }),
      prisma.maintenanceRecord.count({ where: { vehicleId } }),
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

  getBookingMaintenanceRecords = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user has access to the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, userId: true, garageId: true },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    if (booking.userId !== userId && userRole !== 'ADMIN') {
      // Check if user is garage owner or mechanic
      const hasGarageAccess = await prisma.garage.findFirst({
        where: {
          id: booking.garageId,
          OR: [
            { ownerId: userId },
            { mechanics: { some: { id: userId } } },
          ],
        },
      });

      if (!hasGarageAccess) {
        throw new CustomError('Access denied', 403);
      }
    }

    const records = await prisma.maintenanceRecord.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        mechanic: {
          select: { id: true, fullName: true },
        },
        garage: {
          select: { id: true, name: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: records,
    };

    res.status(200).json(response);
  });

  getGarageMaintenanceRecords = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if user has access to the garage
    const hasAccess = await prisma.garage.findFirst({
      where: {
        id: garageId,
        OR: [
          { ownerId: req.user!.id },
          { mechanics: { some: { id: req.user!.id } } },
        ],
      },
    });

    if (!hasAccess && req.user!.role !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    const where: any = { garageId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            select: { id: true, plate: true, make: true, model: true },
          },
          mechanic: {
            select: { id: true, fullName: true },
          },
          booking: {
            select: { id: true, scheduledAt: true },
          },
        },
      }),
      prisma.maintenanceRecord.count({ where }),
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

  getMechanicMaintenanceRecords = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if user is the mechanic or has admin access
    if (mechanicId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    const where: any = { mechanicId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            select: { id: true, plate: true, make: true, model: true },
          },
          garage: {
            select: { id: true, name: true },
          },
          booking: {
            select: { id: true, scheduledAt: true },
          },
        },
      }),
      prisma.maintenanceRecord.count({ where }),
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
}

export const maintenanceController = new MaintenanceController();

