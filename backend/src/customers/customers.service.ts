import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customer.findMany({
      include: {
        vehicles: true,
        bookings: true,
        invoices: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        bookings: true,
        invoices: true,
      },
    });
  }

  async create(createCustomerDto: CreateCustomerDto) {
    this.logger.log(`Creating customer: ${createCustomerDto.phone}`);
    try {
      const customer = await this.prisma.customer.create({
        data: createCustomerDto as any,
      });
      this.logger.log(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message} (code: ${error.code})`);
      if (error.code === 'P2002') {
        throw new ConflictException(`رقم الهاتف ${createCustomerDto.phone} مسجل مسبقاً`);
      }
      throw new InternalServerErrorException(`فشل إنشاء العميل: ${error.message}`);
    }
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto as any,
    });
  }

  async delete(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
