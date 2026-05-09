import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { CustomError } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new CustomError('Access denied. No token provided.', 401);
    }

    // Check if token is blacklisted
    const blacklistedToken = await prisma.tokenBlacklist.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (blacklistedToken) {
      throw new CustomError('Token has been revoked. Please login again.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        isActive: true,
        lockedUntil: true,
      },
    });

    if (!user || !user.isActive) {
      throw new CustomError('Invalid token or user not found.', 401);
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new CustomError(
        `Account is locked. Please try again after ${user.lockedUntil.toLocaleString()}`,
        403
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new CustomError('Access denied. User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new CustomError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

export const authenticateToken = authenticate;
export const requireRole = authorize;

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      // Check if token is blacklisted
      const blacklistedToken = await prisma.tokenBlacklist.findFirst({
        where: {
          token,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!blacklistedToken) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true, isActive: true },
        });

        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

// Check if user owns the resource or has admin privileges
export const checkOwnership = (resourceField: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new CustomError('Access denied. User not authenticated.', 401));
    }

    // Admin can access everything
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params.id || req.body[resourceField];
    if (resourceId !== req.user.id) {
      return next(new CustomError('Access denied. You can only access your own resources.', 403));
    }

    next();
  };
};

// Check if user is garage owner or mechanic for the specific garage
export const checkGarageAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new CustomError('Access denied. User not authenticated.', 401));
    }

    // Admin can access everything
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const garageId = req.params.garageId || req.params.id || req.body.garageId;
    
    if (!garageId) {
      return next(new CustomError('Garage ID is required.', 400));
    }

    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      return next(new CustomError('Garage not found.', 404));
    }

    // Check if user is the owner
    if (garage.ownerId === req.user.id) {
      return next();
    }

    // Check if user is a mechanic for this garage
    const mechanic = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        role: 'MECHANIC',
        mechanicGarage: { id: garageId },
      },
    });

    if (mechanic) {
      return next();
    }

    throw new CustomError('Access denied. You are not authorized to access this garage.', 403);
  } catch (error) {
    next(error);
  }
};

// Revoke token (add to blacklist)
export const revokeToken = async (token: string, userId: string): Promise<void> => {
  try {
    const decoded = jwt.decode(token) as any;
    const expiresAt = new Date((decoded.exp || 0) * 1000);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    // Clean up expired tokens
    await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error revoking token:', error);
  }
};

// Lock account after failed login attempts
export const lockAccount = async (userId: string): Promise<void> => {
  try {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil,
        failedLoginAttempts: 0,
      },
    });
  } catch (error) {
    console.error('Error locking account:', error);
  }
};

// Increment failed login attempts
export const incrementFailedAttempts = async (userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    });

    if (!user) return false;

    const newAttempts = (user.failedLoginAttempts || 0) + 1;

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newAttempts,
      },
    });

    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      await lockAccount(userId);
      return true; // Account locked
    }

    return false; // Account not locked yet
  } catch (error) {
    console.error('Error incrementing failed attempts:', error);
    return false;
  }
};

// Reset failed login attempts on successful login
export const resetFailedAttempts = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
  }
};
