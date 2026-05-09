import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient() as any;

class VehicleController {
  createVehicle = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { plate, make, model, year, vin, color, mileage } = req.body;

    // Check if vehicle with same plate already exists for this user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { userId, plate },
    });

    if (existingVehicle) {
      throw new CustomError('Vehicle with this plate already exists', 409);
    }

    // Check if VIN is already registered (if provided)
    if (vin) {
      const existingVin = await prisma.vehicle.findUnique({
        where: { vin },
      });

      if (existingVin) {
        throw new CustomError('Vehicle with this VIN is already registered', 409);
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        plate,
        make,
        model,
        year,
        vin,
        color,
        mileage,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully',
    };

    res.status(201).json(response);
  });

  getUserVehicles = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: { userId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true,
              maintenanceRecords: true,
            },
          },
        },
      }),
      prisma.vehicle.count({ where: { userId } }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: vehicles,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getAllVehicles = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, search } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { plate: { contains: search, mode: 'insensitive' as const } },
        { make: { contains: search, mode: 'insensitive' as const } },
        { model: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
          _count: {
            select: {
              bookings: true,
              maintenanceRecords: true,
            },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: vehicles,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getVehicleById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        _count: {
          select: {
            bookings: true,
            maintenanceRecords: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    // Check if user owns the vehicle or is admin
    if (vehicle.userId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied', 403);
    }

    const response: ApiResponse = {
      success: true,
      data: vehicle,
    };

    res.status(200).json(response);
  });

  updateVehicle = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { plate, make, model, year, vin, color, mileage } = req.body;

    // Check if vehicle exists and belongs to user
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingVehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    if (existingVehicle.userId !== userId) {
      throw new CustomError('Access denied. You can only update your own vehicles.', 403);
    }

    // Check if new plate conflicts with existing vehicles (if changing)
    if (plate && plate !== existingVehicle.plate) {
      const plateConflict = await prisma.vehicle.findFirst({
        where: { userId, plate, id: { not: id } },
      });

      if (plateConflict) {
        throw new CustomError('Vehicle with this plate already exists', 409);
      }
    }

    // Check if new VIN conflicts with existing vehicles (if changing)
    if (vin) {
      const vinConflict = await prisma.vehicle.findFirst({
        where: { vin, id: { not: id } },
      });

      if (vinConflict) {
        throw new CustomError('Vehicle with this VIN is already registered', 409);
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(plate !== undefined && { plate }),
        ...(make !== undefined && { make }),
        ...(model !== undefined && { model }),
        ...(year !== undefined && { year }),
        ...(vin !== undefined && { vin }),
        ...(color !== undefined && { color }),
        ...(mileage !== undefined && { mileage }),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedVehicle,
      message: 'Vehicle updated successfully',
    };

    res.status(200).json(response);
  });

  deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if vehicle exists and belongs to user
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!vehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    if (vehicle.userId !== userId) {
      throw new CustomError('Access denied. You can only delete your own vehicles.', 403);
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId: id,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw new CustomError('Cannot delete vehicle with active bookings', 400);
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Vehicle deleted successfully',
    };

    res.status(200).json(response);
  });

  getVehicleBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if vehicle exists and belongs to user
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!vehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    if (vehicle.userId !== userId) {
      throw new CustomError('Access denied', 403);
    }

    const where: any = { vehicleId: id };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'desc' },
        include: {
          garage: {
            select: { id: true, name: true, address: true, phone: true },
          },
          service: {
            select: { id: true, title: true, price: true, duration: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: bookings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getVehicleMaintenanceRecords = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if vehicle exists and belongs to user
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
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
        where: { vehicleId: id },
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
      prisma.maintenanceRecord.count({ where: { vehicleId: id } }),
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

export const vehicleController = new VehicleController();

