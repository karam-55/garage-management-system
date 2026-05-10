import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(garageId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        ...(garageId ? { garageId } : {}),
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        garage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(createCustomerDto: any) {
    const { password, fullName, phone, email, ...rest } = createCustomerDto;
    const passwordHash = await bcrypt.hash(password || 'ChangeMe@123', 12);

    // Create User record
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: 'CUSTOMER',
        ...rest,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Split fullName into firstName and lastName
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create Customer record (userId is optional)
    const customer = await this.prisma.customer.create({
      data: {
        firstName,
        lastName,
        fullName,
        phone,
        email,
      },
    });

    return user;
  }

  async update(id: string, updateCustomerDto: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string) {
    const customer = await this.prisma.user.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
