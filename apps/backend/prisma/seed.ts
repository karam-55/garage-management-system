import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@garage.com' },
    update: {},
    create: {
      email: 'admin@garage.com',
      passwordHash: hashedPassword,
      fullName: 'Admin User',
      phone: '+966500000000',
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const testPassword = await bcrypt.hash('Test123!@#', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: testPassword,
      fullName: 'Test User',
      phone: '+966511111111',
      role: UserRole.CUSTOMER,
      isActive: true,
      emailVerified: true,
      phoneVerified: false,
    },
  });

  console.log('✅ Test user created:', testUser.email);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
