import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    // @ts-ignore - Prisma v7 compatibility
    this.prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
  }

  get client() {
    return this.prisma;
  }

  // Delegate all PrismaClient methods
  get customer() { return this.prisma.customer; }
  get vehicle() { return this.prisma.vehicle; }
  get technician() { return this.prisma.technician; }
  get booking() { return this.prisma.booking; }
  get invoice() { return this.prisma.invoice; }
  get inventoryItem() { return this.prisma.inventoryItem; }
  get notification() { return this.prisma.notification; }
  get vehicleTracking() { return this.prisma.vehicleTracking; }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
