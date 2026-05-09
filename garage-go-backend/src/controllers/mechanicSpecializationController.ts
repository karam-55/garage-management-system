import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient() as any;

class MechanicSpecializationController {
  // إضافة تخصص لميكانيكي
  addSpecialization = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId, serviceId, skillLevel } = req.body;

    // Verify mechanic exists
    const mechanic = await prisma.user.findFirst({
      where: {
        id: mechanicId,
        role: 'MECHANIC',
      },
    });

    if (!mechanic) {
      throw new CustomError('Mechanic not found', 404);
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    // Check if specialization already exists
    const existing = await prisma.mechanicSpecialization.findFirst({
      where: {
        mechanicId,
        serviceId,
      },
    });

    if (existing) {
      throw new CustomError('Mechanic already has this specialization', 400);
    }

    const specialization = await prisma.mechanicSpecialization.create({
      data: {
        mechanicId,
        serviceId,
        skillLevel: skillLevel || 'INTERMEDIATE',
      },
      include: {
        mechanic: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: specialization,
      message: 'Specialization added successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على تخصصات ميكانيكي
  getMechanicSpecializations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { mechanicId } = req.params;
    const { page = 1, limit = 20 } = req.query as any;

    const [specializations, total] = await Promise.all([
      prisma.mechanicSpecialization.findMany({
        where: { mechanicId },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          service: {
            select: {
              id: true,
              title: true,
              price: true,
              duration: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mechanicSpecialization.count({ where: { mechanicId } }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: specializations,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على الميكانيكيين المتخصصين في خدمة معينة
  getMechanicsByService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { serviceId } = req.params;
    const { skillLevel, garageId } = req.query as any;

    const where: any = { serviceId };
    if (skillLevel) where.skillLevel = skillLevel;

    const specializations = await prisma.mechanicSpecialization.findMany({
      where,
      include: {
        mechanic: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            availabilityStatus: true,
            mechanicGarageId: true,
          },
        },
      },
      orderBy: { skillLevel: 'desc' },
    });

    // Filter by garage if specified
    let filteredSpecializations = specializations;
    if (garageId) {
      filteredSpecializations = specializations.filter(
        (spec: any) => spec.mechanic.mechanicGarageId === garageId
      );
    }

    const response: ApiResponse = {
      success: true,
      data: filteredSpecializations,
    };

    res.status(200).json(response);
  });

  // تحديث تخصص
  updateSpecialization = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { skillLevel } = req.body;

    const specialization = await prisma.mechanicSpecialization.findUnique({
      where: { id },
    });

    if (!specialization) {
      throw new CustomError('Specialization not found', 404);
    }

    const updated = await prisma.mechanicSpecialization.update({
      where: { id },
      data: { skillLevel },
      include: {
        mechanic: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Specialization updated successfully',
    };

    res.status(200).json(response);
  });

  // حذف تخصص
  deleteSpecialization = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const specialization = await prisma.mechanicSpecialization.findUnique({
      where: { id },
    });

    if (!specialization) {
      throw new CustomError('Specialization not found', 404);
    }

    await prisma.mechanicSpecialization.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Specialization deleted successfully',
    };

    res.status(200).json(response);
  });
}

export const mechanicSpecializationController = new MechanicSpecializationController();
