import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// In-memory rate limiter with different limits for different endpoints
// In production, use Redis or a proper rate limiting solution
const rateLimitMap = new Map<string, RateLimitRecord>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  // Different limits for different endpoints
  private getLimitConfig(url: string, method: string) {
    // Auth endpoints - stricter limits
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return { maxRequests: 5, windowMs: 60 * 1000 }; // 5 requests per minute
    }

    // Payment endpoints - stricter limits
    if (url.includes('/payments')) {
      return { maxRequests: 10, windowMs: 60 * 1000 }; // 10 requests per minute
    }

    // API endpoints - normal limits
    if (url.includes('/api')) {
      return { maxRequests: 100, windowMs: 60 * 1000 }; // 100 requests per minute
    }

    // Default limits
    return { maxRequests: 200, windowMs: 60 * 1000 }; // 200 requests per minute
  }

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const url = req.url;
    const method = req.method;
    const userId = (req as any).user?.id;

    const { maxRequests, windowMs } = this.getLimitConfig(url, method);
    const now = Date.now();

    // Use IP + User ID as key for authenticated users, IP only for anonymous
    const key = userId ? `${ip}:${userId}` : ip;
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      });
      return next();
    }

    if (record.blocked) {
      throw new HttpException(
        'Too many requests - please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (record.count >= maxRequests) {
      record.blocked = true;
      
      // Log rate limit violation
      this.logRateLimitViolation({
        ip,
        userId,
        url,
        method,
        count: record.count,
        maxRequests,
      }).catch((err) => {
        console.error(`Failed to log rate limit violation: ${err.message}`);
      });

      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - record.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    next();
  }

  private async logRateLimitViolation(data: any): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'RATE_LIMIT_VIOLATION' as any,
          tableName: 'RATE_LIMIT',
          recordId: data.url,
          userId: data.userId,
          ipAddress: data.ip,
          userAgent: '',
          oldValues: null,
          newValues: JSON.stringify(data),
        },
      });
    } catch (error) {
      // Silently fail if database logging fails
      console.error(`Database logging failed: ${error}`);
    }
  }
}
