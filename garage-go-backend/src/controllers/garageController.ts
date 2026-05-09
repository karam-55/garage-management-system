import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient() as any;

class GarageController {
  getAllGarages = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { address: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [garages, total] = await Promise.all([
      prisma.garage.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          _count: {
            select: {
              mechanics: true,
              services: true,
              bookings: true,
            },
          },
        },
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

  getGarageById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const garage = await prisma.garage.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        mechanics: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        _count: {
          select: {
            services: true,
            bookings: true,
            inventory: true,
          },
        },
      },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: garage,
    };

    res.status(200).json(response);
  });

  createGarage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { name, description, address, phone, email, website } = req.body;

    const garage = await prisma.garage.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: garage,
      message: 'Garage created successfully',
    };

    res.status(201).json(response);
  });

  updateGarage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { name, description, address, phone, email, website, logo } = req.body;

    // Check if user owns the garage or is admin
    const garage = await prisma.garage.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only update your own garage.', 403);
    }

    const updatedGarage = await prisma.garage.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(logo !== undefined && { logo }),
      },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedGarage,
      message: 'Garage updated successfully',
    };

    res.status(200).json(response);
  });

  deleteGarage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user owns the garage or is admin
    const garage = await prisma.garage.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only delete your own garage.', 403);
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        garageId: id,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw new CustomError('Cannot delete garage with active bookings', 400);
    }

    await prisma.garage.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Garage deleted successfully',
    };

    res.status(200).json(response);
  });

  getGarageServices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { garageId: id, isActive: true },
        skip,
        take: Number(limit),
        orderBy: { title: 'asc' },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.service.count({ where: { garageId: id, isActive: true } }),
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

  getGarageMechanics = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const mechanics = await prisma.user.findMany({
      where: {
        role: 'MECHANIC',
        mechanicGarage: { id },
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            maintenanceRecords: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: mechanics,
    };

    res.status(200).json(response);
  });

  getGarageBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { garageId: id };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          vehicle: {
            select: { id: true, plate: true, make: true, model: true },
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

  getGarageInventory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { page = 1, limit = 10, lowStock } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { garageId: id };
    if (lowStock === 'true') {
      where.quantity = { lte: prisma.partsInventory.fields.minStock };
    }

    const [inventory, total] = await Promise.all([
      prisma.partsInventory.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.partsInventory.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: inventory,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getGarageInvoices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { garageId: id };
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              user: { select: { fullName: true, email: true } },
              vehicle: { select: { plate: true, make: true, model: true } },
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: invoices,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getGarageReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query as any;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    const [totalBookings, completedBookings, cancelledBookings, totalRevenue] = await Promise.all([
      prisma.booking.count({
        where: { garageId: id, ...dateFilter },
      }),
      prisma.booking.count({
        where: { garageId: id, status: 'COMPLETED', ...dateFilter },
      }),
      prisma.booking.count({
        where: { garageId: id, status: 'CANCELLED', ...dateFilter },
      }),
      prisma.invoice.aggregate({
        where: { 
          garageId: id, 
          status: 'PAID',
          createdAt: dateFilter.createdAt || undefined,
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const reports = {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
    };

    const response: ApiResponse = {
      success: true,
      data: reports,
    };

    res.status(200).json(response);
  });

  addMechanic = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { mechanicId } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user owns the garage or is admin
    const garage = await prisma.garage.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only manage your own garage.', 403);
    }

    // Check if mechanic exists and is a mechanic
    const mechanic = await prisma.user.findUnique({
      where: { id: mechanicId, role: 'MECHANIC' },
    });

    if (!mechanic) {
      throw new CustomError('Mechanic not found', 404);
    }

    // Update mechanic to be associated with this garage
    const updatedMechanic = await prisma.user.update({
      where: { id: mechanicId },
      data: { mechanicGarage: { connect: { id } } },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedMechanic,
      message: 'Mechanic added to garage successfully',
    };

    res.status(200).json(response);
  });

  removeMechanic = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id, mechanicId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user owns the garage or is admin
    const garage = await prisma.garage.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only manage your own garage.', 403);
    }

    // Remove mechanic from garage
    await prisma.user.update({
      where: { id: mechanicId },
      data: { mechanicGarage: { disconnect: true } },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Mechanic removed from garage successfully',
    };

    res.status(200).json(response);
  });

  activateGarage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.garage.update({
      where: { id },
      data: { isActive: true },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Garage activated successfully',
    };

    res.status(200).json(response);
  });

  deactivateGarage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        garageId: id,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw new CustomError('Cannot deactivate garage with active bookings', 400);
    }

    await prisma.garage.update({
      where: { id },
      data: { isActive: false },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Garage deactivated successfully',
    };

    res.status(200).json(response);
  });
}

export const garageController = new GarageController();

