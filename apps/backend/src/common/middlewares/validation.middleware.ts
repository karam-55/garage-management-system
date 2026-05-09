import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Basic validation logic
    // More complex validation should be done with class-validator
    
    // Validate request body
    if (req.body && typeof req.body === 'object') {
      // Remove any undefined values
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] === undefined) {
          delete req.body[key];
        }
      });

      // Sanitize input to prevent XSS attacks
      this.sanitizeInput(req.body);
    }

    // Validate query parameters
    if (req.query && typeof req.query === 'object') {
      this.sanitizeInput(req.query);
    }

    // Validate content-type for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && 
        !req.is('json') && !req.is('multipart/form-data') && !req.is('application/x-www-form-urlencoded')) {
      // Allow requests without content-type (like file uploads)
      if (req.get('content-length') && parseInt(req.get('content-length') || '0') > 0) {
        // Only validate if there's actual content
        // Continue as some requests might not have proper content-type header
      }
    }

    // Validate request size (prevent large payloads)
    const contentLength = parseInt(req.get('content-length') || '0');
    const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB
    if (contentLength > MAX_PAYLOAD_SIZE) {
      throw new BadRequestException('Request payload too large');
    }

    next();
  }

  private sanitizeInput(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          // Remove potential XSS scripts
          obj[key] = this.sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.sanitizeInput(obj[key]);
        }
      }
    }
  }

  private sanitizeString(str: string): string {
    // Basic XSS prevention
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
