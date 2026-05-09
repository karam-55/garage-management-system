import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(createCustomerDto: any) {
    return this.prisma.user.create({
      data: {
        ...createCustomerDto,
        role: 'CUSTOMER',
      },
    });
  }

  async update(id: string, updateCustomerDto: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
