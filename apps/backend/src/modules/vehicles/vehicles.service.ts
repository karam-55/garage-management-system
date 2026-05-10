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
    const { licensePlate, year, customerId, make, model, vin, color, mileage, fuelType, transmission, engineSize, bodyType, notes } = createVehicleDto;

    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.vehicle.create({
      data: {
        customerId,
        plate: licensePlate,
        make,
        model,
        year: year ? (typeof year === 'string' ? parseInt(year) : year) : null,
        vin,
        color,
        mileage: mileage ? (typeof mileage === 'string' ? parseInt(mileage) : mileage) : null,
        fuelType,
        transmission,
        engineSize,
        bodyType,
        notes,
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
