import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Find admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('No admin user found');
    return;
  }

  // Update admin with phone number
  const updatedAdmin = await prisma.user.update({
    where: { id: admin.id },
    data: {
      phone: '0501234567',
    },
  });

  console.log('Admin updated with phone:', updatedAdmin.phone);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
