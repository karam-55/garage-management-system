import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse, UserRole } from '@/types';

const prisma = new PrismaClient() as any;

class UserController {
  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              vehicles: true,
              bookings: true,
              ownedGarages: true,
            },
          },
        },
      }),
      prisma.user.count(),
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

  getUserById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            vehicles: true,
            bookings: true,
            ownedGarages: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { fullName, phone, avatar, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };

    res.status(200).json(response);
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Don't allow deletion of users with active bookings or garages
    const [activeBookings, ownedGarages] = await Promise.all([
      prisma.booking.count({
        where: {
          userId: id,
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        },
      }),
      prisma.garage.count({
        where: { ownerId: id },
      }),
    ]);

    if (activeBookings > 0) {
      throw new CustomError('Cannot delete user with active bookings', 400);
    }

    if (ownedGarages > 0) {
      throw new CustomError('Cannot delete user who owns garages', 400);
    }

    await prisma.user.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    res.status(200).json(response);
  });

  activateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    const response: ApiResponse = {
      success: true,
      message: 'User activated successfully',
    };

    res.status(200).json(response);
  });

  deactivateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    const response: ApiResponse = {
      success: true,
      message: 'User deactivated successfully',
    };

    res.status(200).json(response);
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

  getUserBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          garage: {
            select: { id: true, name: true, address: true, phone: true },
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

  getUserInvoices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

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
              garage: { select: { id: true, name: true } },
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

  getUserNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10, isRead } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

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

  markAllNotificationsAsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    const response: ApiResponse = {
      success: true,
      message: 'All notifications marked as read',
    };

    res.status(200).json(response);
  });
}

export const userController = new UserController();

