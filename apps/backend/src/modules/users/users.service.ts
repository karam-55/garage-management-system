import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  GARAGE_OWNER: ['manage_garage', 'manage_users', 'view_reports', 'manage_bookings', 'manage_invoices'],
  GARAGE_MANAGER: ['manage_bookings', 'manage_invoices', 'view_reports', 'manage_inventory'],
  MECHANIC: ['view_assignments', 'update_work_status'],
  RECEPTIONIST: ['create_bookings', 'view_customers', 'manage_bookings'],
  CASHIER: ['manage_payments', 'manage_invoices'],
  CUSTOMER: ['view_own_bookings', 'view_own_invoices', 'create_bookings'],
  INVENTORY_MANAGER: ['manage_inventory', 'view_reports'],
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { role?: string; garageId?: string; isActive?: boolean }) {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.garageId) where.garageId = filters.garageId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        garage: true,
        isActive: true,
        availabilityStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        garage: true,
        notificationPreferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        garage: true,
        avatarUrl: true,
        isActive: true,
        availabilityStatus: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: any) {
    const { email, password, role, garageId, ...rest } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        garageId,
        ...rest,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: any) {
    const { password, ...rest } = updateUserDto;

    const data: any = { ...rest };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        garageId: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }

  async deactivateUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async activateUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  // RBAC: Check if user has specific role
  async hasRole(userId: string, role: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user ? user.role === role : false;
  }

  // RBAC: Check if user has any of the specified roles
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user ? roles.includes(user.role) : false;
  }

  // RBAC: Check if user has permission based on role
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }

  // RBAC: Get all permissions for a user
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) return [];

    return ROLE_PERMISSIONS[user.role] || [];
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async incrementFailedLoginAttempts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    });

    if (!user) return;

    const newAttempts = user.failedLoginAttempts + 1;
    const data: any = { failedLoginAttempts: newAttempts };

    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      data.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async resetFailedLoginAttempts(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });

    if (!user || !user.lockedUntil) return false;

    return user.lockedUntil > new Date();
  }
}
