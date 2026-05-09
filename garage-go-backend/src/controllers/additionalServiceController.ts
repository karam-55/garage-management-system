import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient() as any;

class AdditionalServiceController {
  createAdditionalService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId, serviceName, description, price, images, videoUrl, options } = req.body;
    const userId = req.user!.id;

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Create additional service with 2-hour approval deadline
    const additionalService = await prisma.additionalService.create({
      data: {
        bookingId,
        serviceName,
        description,
        price,
        images: images || [],
        videoUrl,
        approvalDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'PENDING',
        // Create service options if provided
        options: options ? {
          create: options.map((opt: any) => ({
            name: opt.name,
            description: opt.description,
            price: opt.price,
            isRecommended: opt.isRecommended || false,
            stockAvailable: opt.stockAvailable,
            imageUrl: opt.imageUrl,
          })),
        } : undefined,
      },
      include: {
        options: true,
      },
    });

    // Send notification to customer about new additional service
    // This would trigger WhatsApp notification requesting approval

    const response: ApiResponse = {
      success: true,
      data: additionalService,
      message: 'Additional service created successfully',
    };

    res.status(201).json(response);
  });

  getBookingAdditionalServices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      prisma.additionalService.findMany({
        where: { bookingId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.additionalService.count({ where: { bookingId } }),
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

  approveAdditionalService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { selectedOptionId, decisionReason } = req.body;
    const userId = req.user!.id;

    const service = await prisma.additionalService.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!service) {
      throw new CustomError('Additional service not found', 404);
    }

    // Only the customer who owns the booking can approve
    if (service.booking.userId !== userId) {
      throw new CustomError('Access denied', 403);
    }

    // Check if service is still pending
    if (service.status !== 'PENDING') {
      throw new CustomError('Service is not pending approval', 400);
    }

    // Check if approval deadline has passed
    if (service.approvalDeadline && service.approvalDeadline < new Date()) {
      throw new CustomError('Approval deadline has passed', 410);
    }

    const updatedService = await prisma.additionalService.update({
      where: { id },
      data: {
        approved: true,
        approvedBy: userId,
        approvedAt: new Date(),
        status: 'APPROVED',
        selectedOptionId: selectedOptionId || null,
        decisionReason: decisionReason || null,
        decisionMadeAt: new Date(),
      },
    });

    // Send notification to mechanic about approval
    // This would trigger WhatsApp notification

    const response: ApiResponse = {
      success: true,
      data: updatedService,
      message: 'Additional service approved successfully',
    };

    res.status(200).json(response);
  });

  rejectAdditionalService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { decisionReason } = req.body;
    const userId = req.user!.id;

    const service = await prisma.additionalService.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!service) {
      throw new CustomError('Additional service not found', 404);
    }

    // Only the customer who owns the booking can reject
    if (service.booking.userId !== userId) {
      throw new CustomError('Access denied', 403);
    }

    // Update service status to rejected
    const updatedService = await prisma.additionalService.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decisionReason: decisionReason || null,
        decisionMadeAt: new Date(),
      },
    });

    // Send notification to mechanic about rejection
    // This would trigger WhatsApp notification

    const response: ApiResponse = {
      success: true,
      data: updatedService,
      message: 'Additional service rejected successfully',
    };

    res.status(200).json(response);
  });

  deleteAdditionalService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userRole = req.user!.role;

    // Only ADMIN, OWNER, or MECHANIC can delete
    if (!['ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC'].includes(userRole)) {
      throw new CustomError('Access denied', 403);
    }

    await prisma.additionalService.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Additional service deleted successfully',
    };

    res.status(200).json(response);
  });
}

export const additionalServiceController = new AdditionalServiceController();
