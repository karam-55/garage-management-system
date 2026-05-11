import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './auth.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'garage_secret_key_2024';

  constructor(private prisma: PrismaService) {}

  async login(loginDto: LoginDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { phone: loginDto.phone },
    });

    if (!employee || !employee.isActive) {
      throw new UnauthorizedException('رقم الهاتف أو كلمة السر غير صحيحة');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, employee.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('رقم الهاتف أو كلمة السر غير صحيحة');
    }

    const payload = {
      sub: employee.id,
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    return {
      token,
      access_token: token,
      employee: {
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        isActive: employee.isActive,
        createdAt: employee.createdAt,
      },
    };
  }

  async getProfile(employeeId: string) {
    return this.prisma.employee.findUnique({
      where: { id: employeeId },
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
}
