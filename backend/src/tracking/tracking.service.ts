import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async trackVehicle(vehicleId: string, token?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        customer: true,
        vehicleTracking: true,
        bookings: {
          where: token
            ? ({ qrToken: token } as any)
            : ({ status: { not: 'CANCELED' } } as any),
          orderBy: { scheduledAt: 'desc' },
          take: 1,
          include: { invoices: true },
        },
      },
    });

    if (!vehicle) return null;

    if (token && ((vehicle as any).bookings as any[]).length === 0) {
      return null;
    }

    return vehicle;
  }

  async approveAdditionalService(
    vehicleId: string,
    token: string,
    serviceId: string,
    approve: boolean,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { vehicleId, qrToken: token } as any,
    });

    if (!booking) throw new UnauthorizedException('رمز QR غير صالح');

    const services: any[] = ((booking as any).additionalServices as any[]) ?? [];
    const updated = services.map((s: any) =>
      s.id === serviceId ? { ...s, status: approve ? 'APPROVED' : 'REJECTED' } : s,
    );

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { additionalServices: updated } as any,
    });

    return { success: true, message: approve ? 'تمت الموافقة' : 'تم الرفض' };
  }
}
