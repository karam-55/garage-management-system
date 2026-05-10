import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('make-admin')
  @ApiOperation({ summary: 'Upgrade user to ADMIN (requires setup secret)' })
  async makeAdmin(@Body() body: { phone: string; secret: string }) {
    const setupSecret = process.env.SETUP_SECRET || 'garage-setup-2025';
    if (body.secret !== setupSecret) {
      throw new UnauthorizedException('Invalid setup secret');
    }
    const user = await this.prisma.user.updateMany({
      where: { phone: body.phone },
      data: { role: 'ADMIN' as any },
    });
    if (user.count === 0) {
      throw new UnauthorizedException('User not found');
    }
    const updatedUser = await this.prisma.user.findFirst({
      where: { phone: body.phone },
      select: { id: true, phone: true, fullName: true, role: true },
    });
    return { message: 'User upgraded to ADMIN', user: updatedUser };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Request() req, @Body() body: { refresh_token?: string }) {
    return this.authService.logout(req.user.id, body.refresh_token);
  }
}
