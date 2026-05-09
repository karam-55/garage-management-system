import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger(LoggingMiddleware.name);

  constructor(private prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const userId = (req as any).user?.id;
    const garageId = (req as any).user?.garageId;

    this.logger.log(`${method} ${url} - IP: ${ip} - User: ${userId || 'anonymous'} - UserAgent: ${userAgent}`);

    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';

      this.logger[logLevel](
        `${method} ${url} - ${statusCode} - ${duration}ms - IP: ${ip} - User: ${userId || 'anonymous'}`,
      );

      // Log slow requests (> 1 second)
      if (duration > 1000) {
        this.logger.warn(`Slow request detected: ${method} ${url} - ${duration}ms`);
      }

      // Log to database for audit trail
      this.logToDatabase({
        method,
        url,
        statusCode,
        duration,
        ip,
        userId,
        garageId,
        userAgent,
        timestamp: new Date(),
      }).catch((err) => {
        this.logger.error(`Failed to log to database: ${err.message}`);
      });
    });

    next();
  }

  private async logToDatabase(logData: any): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'HTTP_REQUEST' as any,
          tableName: 'HTTP_LOG',
          recordId: logData.url,
          userId: logData.userId,
          ipAddress: logData.ip,
          userAgent: logData.userAgent,
          oldValues: null,
          newValues: JSON.stringify(logData),
        },
      });
    } catch (error) {
      // Silently fail if database logging fails
      this.logger.error(`Database logging failed: ${error}`);
    }
  }
}
