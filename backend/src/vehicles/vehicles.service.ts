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
    const data: any = { ...createVehicleDto };
    // Remove empty customerId to allow null in DB
    if (!data.customerId || data.customerId === '') {
      delete data.customerId;
    }
    return this.prisma.vehicle.create({ data });
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const data: any = { ...updateVehicleDto };
    // Remove empty customerId to prevent invalid relation
    if (data.customerId === '') {
      data.customerId = null;
    }
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
