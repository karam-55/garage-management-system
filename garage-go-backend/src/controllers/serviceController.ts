import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient() as any;

class ServiceController {
  createService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, code, title, description, price, duration, metadata } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user owns the garage or is admin
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only create services for your own garage.', 403);
    }

    // Check if service code already exists for this garage (if provided)
    if (code) {
      const existingService = await prisma.service.findFirst({
        where: { garageId, code },
      });

      if (existingService) {
        throw new CustomError('Service with this code already exists for this garage', 409);
      }
    }

    const service = await prisma.service.create({
      data: {
        garageId,
        code,
        title,
        description,
        price,
        duration,
        metadata,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: service,
      message: 'Service created successfully',
    };

    res.status(201).json(response);
  });

  getAllServices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, garageId, search } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (garageId) where.garageId = garageId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { code: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { title: 'asc' },
        include: {
          garage: {
            select: { id: true, name: true },
          },
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: services,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getServiceById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: service,
    };

    res.status(200).json(response);
  });

  updateService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { code, title, description, price, duration, isActive, metadata } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if service exists and user has access
    const service = await prisma.service.findUnique({
      where: { id },
      include: { garage: { select: { ownerId: true } } },
    });

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    if (service.garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only update services for your own garage.', 403);
    }

    // Check if new code conflicts with existing services (if changing)
    if (code && code !== service.code) {
      const codeConflict = await prisma.service.findFirst({
        where: { garageId: service.garageId, code, id: { not: id } },
      });

      if (codeConflict) {
        throw new CustomError('Service with this code already exists for this garage', 409);
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(duration !== undefined && { duration }),
        ...(isActive !== undefined && { isActive }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        garage: {
          select: { id: true, name: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedService,
      message: 'Service updated successfully',
    };

    res.status(200).json(response);
  });

  deleteService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if service exists and user has access
    const service = await prisma.service.findUnique({
      where: { id },
      include: { 
        garage: { select: { ownerId: true } },
        _count: { select: { bookings: true } },
      },
    });

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    if (service.garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only delete services for your own garage.', 403);
    }

    // Check for active bookings
    if (service._count.bookings > 0) {
      throw new CustomError('Cannot delete service with existing bookings', 400);
    }

    await prisma.service.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Service deleted successfully',
    };

    res.status(200).json(response);
  });

  activateService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.service.update({
      where: { id },
      data: { isActive: true },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Service activated successfully',
    };

    res.status(200).json(response);
  });

  deactivateService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        serviceId: id,
        status: { in: ['PENDING', 'CommIRMED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw new CustomError('Cannot deactivate service with active bookings', 400);
    }

    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Service deactivated successfully',
    };

    res.status(200).json(response);
  });

  getGarageServices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { garageId, isActive: true },
        skip,
        take: Number(limit),
        orderBy: { title: 'asc' },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.service.count({ where: { garageId, isActive: true } }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: services,
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

export const serviceController = new ServiceController();
