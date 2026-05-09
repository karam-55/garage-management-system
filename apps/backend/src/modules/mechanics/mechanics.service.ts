import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MechanicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: 'MECHANIC',
      },
      include: {
        garage: true,
        mechanicSpecializations: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async findAvailable() {
    return this.prisma.user.findMany({
      where: {
        role: 'MECHANIC',
        availabilityStatus: 'AVAILABLE',
        isActive: true,
      },
    });
  }

  async findOne(id: string) {
    const mechanic = await this.prisma.user.findUnique({
      where: { id },
      include: {
        garage: true,
        mechanicSpecializations: {
          include: {
            service: true,
          },
        },
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
    return this.prisma.user.create({
      data: {
        ...createMechanicDto,
        role: 'MECHANIC',
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
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
