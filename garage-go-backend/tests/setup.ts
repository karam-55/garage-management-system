import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@/utils/redis';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Connect to test Redis
  await Redis.connect();
});

afterAll(async () => {
  // Clean up database
  await prisma.user.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.service.deleteMany();
  await prisma.partsInventory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  
  // Disconnect
  await prisma.$disconnect();
  await Redis.disconnect();
});

beforeEach(async () => {
  // Clean up before each test
  await prisma.user.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.service.deleteMany();
  await prisma.partsInventory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  
  // Clear Redis
  await Redis.invalidatePattern('*');
});

afterEach(async () => {
  // Clean up after each test
  await Redis.invalidatePattern('*');
});

export { prisma };
