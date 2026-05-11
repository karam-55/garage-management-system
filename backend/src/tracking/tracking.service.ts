import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  constructor(private prisma: PrismaService) {}

  async trackVehicle(vehicleId: string, token?: string) {
    this.logger.log(`trackVehicle called: vehicleId=${vehicleId}, token=${token ? 'present' : 'missing'}`);
    try {
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

      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${vehicleId}`);
        return null;
      }

      const bookings = (vehicle as any).bookings as any[];
      this.logger.log(`Vehicle found. Bookings count: ${bookings.length}`);

      if (token && bookings.length === 0) {
        this.logger.warn(`Token provided but no matching booking found for vehicle ${vehicleId}`);
        return null;
      }

      return vehicle;
    } catch (error) {
      this.logger.error(`trackVehicle error: ${error.message}`);
      throw error;
    }
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
