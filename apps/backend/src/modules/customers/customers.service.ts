import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(garageId?: string) {
    return this.prisma.customer.findMany({
      where: {
        ...(garageId ? { garageId } : {}),
        deletedAt: null,
      },
      include: {
        vehicles: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        user: true,
        garage: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(createCustomerDto: any) {
    const { password, fullName, phone, address, city, notes, garageId, ...rest } = createCustomerDto;

    // Create User record if phone is provided
    let userId: string | undefined;
    if (phone) {
      const passwordHash = await bcrypt.hash(password || 'ChangeMe@123', 12);
      const user = await this.prisma.user.create({
        data: {
          passwordHash,
          fullName,
          phone,
          role: 'CUSTOMER',
          ...rest,
        },
      });
      userId = user.id;
    }

    // Split fullName into firstName and lastName
    const nameParts = (fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create Customer record
    const customer = await this.prisma.customer.create({
      data: {
        userId,
        firstName,
        lastName,
        fullName: fullName || firstName + ' ' + lastName,
        phone,
        address,
        city,
        notes,
        garageId,
      },
      include: {
        vehicles: true,
        user: true,
      },
    });

    return customer;
  }

  async update(id: string, updateCustomerDto: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const { fullName, ...rest } = updateCustomerDto;
    const data: any = { ...rest };

    if (fullName) {
      const nameParts = fullName.split(' ');
      data.firstName = nameParts[0] || '';
      data.lastName = nameParts.slice(1).join(' ') || '';
      data.fullName = fullName;
    }

    return this.prisma.customer.update({
      where: { id },
      data,
      include: {
        vehicles: true,
        user: true,
      },
    });
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Use transaction to delete customer and associated user
    return this.prisma.$transaction(async (tx) => {
      // Delete customer first (due to foreign key constraints)
      const deleted = await tx.customer.delete({
        where: { id },
      });

      // Delete associated user if exists
      if (customer.userId) {
        await tx.user.delete({
          where: { id: customer.userId },
        }).catch(() => {});
      }

      return deleted;
    });
  }
}
