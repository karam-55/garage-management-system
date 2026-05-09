import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@/utils/logger';
import { Redis } from '@/utils/redis';
import { CustomError } from '@/middleware/errorHandler';

const prisma = new PrismaClient();

class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ id: userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }
  }

  static async invalidateToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await Redis.set(`blacklist:${token}`, 'true', ttl);
        }
      }
    } catch (error) {
      Logger.error('Failed to invalidate token', error);
    }
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await Redis.get(`blacklist:${token}`);
      return result === 'true';
    } catch (error) {
      Logger.error('Failed to check token blacklist', error);
      return false;
    }
  }

  static async createSession(userId: string, sessionData: any): Promise<void> {
    const sessionId = this.generateSessionId();
    await Redis.setSession(sessionId, { userId, ...sessionData }, 86400); // 24 hours
    return sessionId;
  }

  static async getSession(sessionId: string): Promise<any | null> {
    return Redis.getSession(sessionId);
  }

  static async deleteSession(sessionId: string): Promise<void> {
    return Redis.deleteSession(sessionId);
  }

  private static generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  static async validateAuthRequirements(email: string, password: string): Promise<void> {
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new CustomError('Invalid email format', 400);
    }

    if (password.length < 8) {
      throw new CustomError('Password must be at least 8 characters long', 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      throw new CustomError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        400
      );
    }
  }

  static async checkRateLimit(identifier: string): Promise<void> {
    const attempts = await Redis.incrementRateLimit(identifier, 900); // 15 minutes
    if (attempts > 5) {
      throw new CustomError('Too many attempts. Please try again later.', 429);
    }
  }

  static async logAuthAttempt(email: string, success: boolean, ip?: string): Promise<void> {
    const logData = {
      email,
      success,
      ip,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      Logger.info('Successful authentication attempt', logData);
    } else {
      Logger.security('Failed authentication attempt', logData);
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
      
      // Check if refresh token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new CustomError('Refresh token has been invalidated', 401);
      }

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new CustomError('User not found or inactive', 401);
      }

      // Generate new access token
      return this.generateToken(user.id);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  static async logout(userId: string, token: string): Promise<void> {
    try {
      // Invalidate the current token
      await this.invalidateToken(token);
      
      // Invalidate all user sessions (optional)
      await Redis.invalidatePattern(`session:*`);
      
      Logger.info('User logged out', { userId });
    } catch (error) {
      Logger.error('Failed to logout user', error);
      throw new CustomError('Logout failed', 500);
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Validate new password
      await this.validateAuthRequirements('test@example.com', newPassword);

      // Get current password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // Invalidate all user sessions (force re-login)
      await Redis.invalidatePattern(`session:*`);

      Logger.info('Password changed successfully', { userId });
    } catch (error) {
      Logger.error('Failed to change password', error);
      throw error;
    }
  }
}

export { AuthService };
