import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, AuthResponse, RegisterRequest, LoginRequest } from '@/types';
import { revokeToken, incrementFailedAttempts, resetFailedAttempts } from '@/middleware/auth';

const prisma = new PrismaClient() as any;

class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password, fullName, phone, role = 'CUSTOMER' }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user,
        token,
        refreshToken,
      },
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  });

  login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lockedUntil: true,
        failedLoginAttempts: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new CustomError(
        `Account is locked. Please try again after ${user.lockedUntil.toLocaleString()}`,
        403
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const isLocked = await incrementFailedAttempts(user.id);
      
      if (isLocked) {
        throw new CustomError(
          'Too many failed login attempts. Account has been locked for 15 minutes.',
          403
        );
      }

      const remainingAttempts = 5 - ((user.failedLoginAttempts || 0) + 1);
      throw new CustomError(
        `Invalid credentials. ${remainingAttempts} attempts remaining.`,
        401
      );
    }

    // Reset failed login attempts on successful login
    await resetFailedAttempts(user.id);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    // Generate tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
      message: 'Login successful',
    };

    res.status(200).json(response);
  });

  refreshToken = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user || !user.isActive) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const newToken = this.generateToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);

      const response: ApiResponse<{ token: string; refreshToken: string }> = {
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
        message: 'Token refreshed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      throw new CustomError('Invalid refresh token', 401);
    }
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const userId = req.user!.id;

    // Add token to blacklist
    if (token) {
      await revokeToken(token, userId);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { fullName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'Profile updated successfully',
    };

    res.status(200).json(response);
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new CustomError('Current password and new password are required', 400);
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new CustomError('Current password is incorrect', 400);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    res.status(200).json(response);
  });

  private generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET! as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET! as any,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as any
    );
  }
}

export const authController = new AuthController();
