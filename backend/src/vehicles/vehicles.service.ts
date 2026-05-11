import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicles.dto';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
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
    this.logger.log(`Creating vehicle: ${createVehicleDto.plateNumber}`);
    try {
      const data: any = { ...createVehicleDto };
      if (!data.customerId || data.customerId === '') delete data.customerId;
      const vehicle = await this.prisma.vehicle.create({ data });
      this.logger.log(`Vehicle created: ${vehicle.id}`);
      return vehicle;
    } catch (error) {
      this.logger.error(`Failed to create vehicle: ${error.message} (code: ${error.code})`);
      if (error.code === 'P2002') {
        throw new ConflictException(`رقم اللوحة ${createVehicleDto.plateNumber} مسجل مسبقاً`);
      }
      throw new InternalServerErrorException(`فشل إنشاء السيارة: ${error.message}`);
    }
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
