import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async trackVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        customer: true,
        vehicleTracking: true,
        bookings: {
          where: { status: { not: 'CANCELED' } },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      return null;
    }

    return vehicle;
  }
}
