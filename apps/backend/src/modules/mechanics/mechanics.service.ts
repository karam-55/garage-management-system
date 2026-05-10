import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MechanicsService {
  constructor(private prisma: PrismaService) {}

  async findAll(garageId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'MECHANIC',
        ...(garageId ? { garageId } : {}),
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        availabilityStatus: true,
        isActive: true,
        createdAt: true,
        garage: true,
        mechanicSpecializations: { include: { service: true } },
      },
    });
  }

  async findAvailable(garageId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'MECHANIC',
        availabilityStatus: 'AVAILABLE',
        isActive: true,
        deletedAt: null,
        ...(garageId ? { garageId } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        availabilityStatus: true,
        garage: true,
        mechanicSpecializations: { include: { service: true } },
      },
    });
  }

  async findOne(id: string) {
    const mechanic = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        availabilityStatus: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        garage: true,
        mechanicSpecializations: { include: { service: true } },
        mechanicWorkSessions: true,
        mechanicRatings: true,
      },
    });

    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    return mechanic;
  }

  async create(createMechanicDto: any) {
    const { password, ...rest } = createMechanicDto;
    const passwordHash = await bcrypt.hash(password || 'ChangeMe@123', 12);
    return this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
        role: 'MECHANIC',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateMechanicDto: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateMechanicDto,
    });
  }

  async remove(id: string) {
    const mechanic = await this.prisma.user.findUnique({ where: { id } });
    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
