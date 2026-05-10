import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './technicians.dto';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.technician.findMany({
      include: {
        bookings: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.technician.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });
  }

  async create(createTechnicianDto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: createTechnicianDto,
    });
  }

  async update(id: string, updateTechnicianDto: UpdateTechnicianDto) {
    return this.prisma.technician.update({
      where: { id },
      data: updateTechnicianDto,
    });
  }

  async delete(id: string) {
    return this.prisma.technician.delete({
      where: { id },
    });
  }
}
