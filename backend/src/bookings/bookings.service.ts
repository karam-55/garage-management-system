import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { AddAdditionalServiceDto, CreateBookingDto, UpdateBookingDto } from './bookings.dto';

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
      orderBy: { createdAt: 'desc' },
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

  async findByTechnician(technicianId: string) {
    return this.prisma.booking.findMany({
      where: { technicianId },
      include: {
        customer: true,
        vehicle: true,
        technician: true,
        invoices: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async create(createBookingDto: CreateBookingDto) {
    const qrToken = randomUUID();
    const frontendUrl = process.env.FRONTEND_URL || '';
    const qrUrl = frontendUrl
      ? `${frontendUrl}/track/${createBookingDto.vehicleId}?token=${qrToken}`
      : '';

    return this.prisma.booking.create({
      data: {
        ...(createBookingDto as any),
        qrToken,
        qrUrl,
        services: createBookingDto.services ?? [],
        additionalServices: [],
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto as any,
      include: {
        customer: true,
        vehicle: true,
        technician: true,
        invoices: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async addAdditionalService(bookingId: string, dto: AddAdditionalServiceDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('الحجز غير موجود');

    const existing: any[] = ((booking as any).additionalServices as any[]) ?? [];
    const newService = {
      id: randomUUID(),
      name: dto.name,
      estimatedPrice: dto.estimatedPrice ?? null,
      status: 'PENDING',
      addedAt: new Date().toISOString(),
    };

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { additionalServices: [...existing, newService] } as any,
    });
  }
}
