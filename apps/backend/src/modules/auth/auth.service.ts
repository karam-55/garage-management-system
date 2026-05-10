import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: any) {
    const { phone, password } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: { phone },
      include: { garage: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account is locked. Try again in ${minutesLeft} minute(s).`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed attempts and lock if threshold reached
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const lockData: any = { failedLoginAttempts: newAttempts };
      if (newAttempts >= 5) {
        lockData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.prisma.user.update({ where: { id: user.id }, data: lockData }).catch(() => {});
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    }).catch(() => {});

    const payload = { sub: user.id, phone: user.phone, role: user.role, garageId: user.garageId };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1h',
    });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Log login attempt
    await this.prisma.auditLog.create({
      data: {
        action: 'LOGIN' as any,
        tableName: 'users',
        recordId: user.id,
        userId: user.id,
        ipAddress: '',
        userAgent: '',
        oldValues: null,
        newValues: JSON.stringify({ phone, timestamp: new Date() }),
      },
    }).catch(() => {});

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        garage_id: user.garageId,
        garage: user.garage,
      },
    };
  }

  async register(registerDto: any) {
    const { password, fullName, phone, role, garageId } = registerDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already exists');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData: any = {
      passwordHash: hashedPassword,
      fullName,
      phone,
      role: role || 'CUSTOMER',
      isActive: true,
    };

    if (garageId) {
      userData.garageId = garageId;
    }

    const user = await this.prisma.user.create({
      data: userData,
    });

    const payload = { sub: user.id, phone: user.phone, role: user.role, garageId: user.garageId };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1h',
    });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Log registration
    await this.prisma.auditLog.create({
      data: {
        action: 'REGISTER' as any,
        tableName: 'users',
        recordId: user.id,
        userId: user.id,
        ipAddress: '',
        userAgent: '',
        oldValues: null,
        newValues: JSON.stringify({ phone, role: user.role, timestamp: new Date() }),
      },
    }).catch(() => {});

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        garage_id: user.garageId,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Check if token is blacklisted
      const blacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token: refreshToken },
      });

      if (blacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('User account is not active');
      }

      const access_token = this.jwtService.sign({
        sub: payload.sub,
        phone: payload.phone,
        role: payload.role,
        garageId: payload.garageId,
      }, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1h',
      });

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    // Add refresh token to blacklist if provided
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken);
        const expiresAt = new Date((payload.exp || 0) * 1000);

        await this.prisma.tokenBlacklist.create({
          data: {
            token: refreshToken,
            userId,
            expiresAt,
          },
        });
      } catch (error) {
        // Token might be invalid, but still log the logout
      }
    }

    // Log logout
    await this.prisma.auditLog.create({
      data: {
        action: 'LOGOUT' as any,
        tableName: 'users',
        recordId: userId,
        userId,
        ipAddress: '',
        userAgent: '',
        oldValues: null,
        newValues: JSON.stringify({ timestamp: new Date() }),
      },
    }).catch(() => {});

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Log password reset
    await this.prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET' as any,
        tableName: 'users',
        recordId: userId,
        userId,
        ipAddress: '',
        userAgent: '',
        oldValues: null,
        newValues: JSON.stringify({ timestamp: new Date() }),
      },
    }).catch(() => {});

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(phone: string) {
    const user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      // Don't reveal if phone exists or not
      return { message: 'If the phone exists, a password reset link will be sent' };
    }

    // Generate reset token (in production, send SMS with reset link)
    const resetToken = this.jwtService.sign(
      { sub: user.id, phone: user.phone },
      { expiresIn: '1h' },
    );

    // Log password reset request
    await this.prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET_REQUEST' as any,
        tableName: 'users',
        recordId: user.id,
        userId: user.id,
        ipAddress: '',
        userAgent: '',
        oldValues: null,
        newValues: JSON.stringify({ phone, timestamp: new Date() }),
      },
    }).catch(() => {});

    // NOTE: In production, send resetToken via SMS only. Never expose in API response.
    // TODO: Integrate with SMS service to send password reset SMS
    // await this.smsService.sendPasswordResetSMS(user.phone, resetToken);
    return { message: 'If the phone exists, a password reset link will be sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      if (newPassword.length < 8) {
        throw new BadRequestException('New password must be at least 8 characters long');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash: hashedPassword },
      });

      // Log password reset
      await this.prisma.auditLog.create({
        data: {
          action: 'PASSWORD_RESET' as any,
          tableName: 'users',
          recordId: payload.sub,
          userId: payload.sub,
          ipAddress: '',
          userAgent: '',
          oldValues: null,
          newValues: JSON.stringify({ timestamp: new Date() }),
        },
      }).catch(() => {});

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
