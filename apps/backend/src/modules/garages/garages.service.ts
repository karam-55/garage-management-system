import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GaragesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.garage.findMany({
      where: { deletedAt: null },
      include: {
        owner: {
          select: { id: true, fullName: true, phone: true, role: true },
        },
        services: true,
      },
    });
  }

  async findOne(id: string) {
    const garage = await this.prisma.garage.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, fullName: true, phone: true, role: true },
        },
        services: true,
      },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    return garage;
  }

  async create(createGarageDto: any) {
    return this.prisma.garage.create({
      data: createGarageDto,
    });
  }

  async update(id: string, updateGarageDto: any) {
    return this.prisma.garage.update({
      where: { id },
      data: updateGarageDto,
    });
  }

  async remove(id: string) {
    const garage = await this.prisma.garage.findUnique({ where: { id } });
    if (!garage) {
      throw new NotFoundException('Garage not found');
    }
    return this.prisma.garage.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
