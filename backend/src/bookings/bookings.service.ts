import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        customer: true,
        vehicle: true,
        technician: true,
        invoices: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        technician: true,
        invoices: true,
      },
    });
  }

  async create(createBookingDto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: createBookingDto as any,
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto as any,
    });
  }

  async delete(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
