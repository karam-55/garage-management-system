import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { AddAdditionalServiceDto, CreateBookingDto, UpdateBookingDto } from './bookings.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
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
    this.logger.log(`Creating booking for vehicle: ${createBookingDto.vehicleId}, customer: ${createBookingDto.customerId}`);
    try {
      const qrToken = randomUUID();
      const frontendUrl = process.env.FRONTEND_URL || '';
      const qrUrl = frontendUrl
        ? `${frontendUrl}/track/${createBookingDto.vehicleId}?token=${qrToken}`
        : '';

      // Explicit field mapping to avoid Prisma type issues
      const data: any = {
        customerId: createBookingDto.customerId,
        vehicleId: createBookingDto.vehicleId,
        serviceType: createBookingDto.serviceType,
        scheduledAt: new Date(createBookingDto.scheduledAt),
        status: 'RECEIVED',
        services: (createBookingDto.services && createBookingDto.services.length > 0)
          ? createBookingDto.services
          : [],
        additionalServices: [],
        qrToken,
        qrUrl,
      };

      if (createBookingDto.technicianId) data.technicianId = createBookingDto.technicianId;
      if (createBookingDto.notes) data.notes = createBookingDto.notes;
      if (createBookingDto.expectedFinishAt) {
        data.expectedFinishAt = new Date(createBookingDto.expectedFinishAt);
      }

      this.logger.log(`Booking data prepared, inserting into DB...`);

      const booking = await this.prisma.booking.create({
        data,
        include: { customer: true, vehicle: true },
      });

      this.logger.log(`Booking created successfully: ${booking.id}`);
      return booking;
    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`);
      this.logger.error(`Error code: ${error.code}`);
      this.logger.error(`Stack: ${error.stack}`);
      throw new InternalServerErrorException(
        `فشل إنشاء الحجز: ${error.message ?? error}`
      );
    }
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
