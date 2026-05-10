import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany();
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(createVehicleDto: any) {
    const { licensePlate, year, customerId, ...rest } = createVehicleDto;

    // Validate customer exists
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer || customer.role !== 'CUSTOMER') {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.vehicle.create({
      data: {
        customerId,
        plate: licensePlate || rest.plate,
        year: year ? (typeof year === 'string' ? parseInt(year) : year) : null,
        ...rest,
      },
    });
  }

  async update(id: string, updateVehicleDto: any) {
    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
    });
  }

  async remove(id: string) {
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
