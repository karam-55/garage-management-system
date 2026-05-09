import { Injectable, NestMiddleware, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ErrorHandlingMiddleware implements NestMiddleware {
  private logger = new Logger(ErrorHandlingMiddleware.name);

  constructor(private prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const { statusCode } = res;
      const { method, url, ip, body, query } = req;
      const userId = (req as any).user?.id;
      const garageId = (req as any).user?.garageId;

      if (statusCode >= 400) {
        const errorData = {
          method,
          url,
          statusCode,
          ip,
          userId,
          garageId,
          body: this.sanitizeBody(body),
          query,
          timestamp: new Date(),
        };

        this.logger.error(
          `${method} ${url} - ${statusCode} - IP: ${ip} - User: ${userId || 'anonymous'}`,
        );

        // Log to database for audit trail
        this.logToDatabase(errorData).catch((err) => {
          this.logger.error(`Failed to log error to database: ${err.message}`);
        });
      }
    });

    next();
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};

    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'creditCard'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private async logToDatabase(errorData: any): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'HTTP_ERROR' as any,
          tableName: 'HTTP_REQUEST',
          recordId: errorData.url,
          userId: errorData.userId,
          ipAddress: errorData.ip,
          userAgent: (errorData as any).userAgent || '',
          oldValues: null,
          newValues: JSON.stringify(errorData),
        },
      });
    } catch (error) {
      // Silently fail if database logging fails
      this.logger.error(`Database logging failed: ${error}`);
    }
  }
}
