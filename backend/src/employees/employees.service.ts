import { Injectable, OnModuleInit, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employees.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default owner account if no employees exist
    const count = await this.prisma.employee.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.prisma.employee.create({
        data: {
          name: 'المدير العام',
          phone: '0500000000',
          password: hashedPassword,
          role: 'OWNER',
        },
      });
      console.log('✅ Default owner account created: phone=0500000000, password=admin123');
    }
  }

  async findAll() {
    return this.prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!emp) throw new NotFoundException('الموظف غير موجود');
    return emp;
  }

  async create(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) throw new ConflictException('رقم الهاتف مستخدم بالفعل');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.employee.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        password: hashedPassword,
        role: (dto.role as any) || 'RECEPTIONIST',
        notes: dto.notes,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.phone) data.phone = dto.phone;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.role) data.role = dto.role;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.employee.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.employee.delete({ where: { id } });
    return { message: 'تم حذف الموظف بنجاح' };
  }
}
