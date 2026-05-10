import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicles.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      include: {
        customer: true,
        bookings: true,
        invoices: true,
        vehicleTracking: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
        bookings: true,
        invoices: true,
        vehicleTracking: true,
      },
    });
  }

  async create(createVehicleDto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: createVehicleDto as any,
    });
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto as any,
    });
  }

  async delete(id: string) {
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
