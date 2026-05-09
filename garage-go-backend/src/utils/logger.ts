// Simple logger utility for development
class Logger {
  private static isDevelopment = process.env.NODE_ENV !== 'production';

  static info(message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO]: ${message}`;
    
    if (meta) {
      console.log(logMessage, meta);
    } else {
      console.log(logMessage);
    }
  }

  static error(message: string, error?: Error | any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [ERROR]: ${message}`;
    
    if (error) {
      console.error(logMessage, error?.stack || error);
    } else {
      console.error(logMessage);
    }
  }

  static warn(message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [WARN]: ${message}`;
    
    if (meta) {
      console.warn(logMessage, meta);
    } else {
      console.warn(logMessage);
    }
  }

  static debug(message: string, meta?: any): void {
    if (Logger.isDevelopment) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [DEBUG]: ${message}`;
      
      if (meta) {
        console.log(logMessage, meta);
      } else {
        console.log(logMessage);
      }
    }
  }

  // Request logging helper
  static request(req: any, res: any, responseTime?: number): void {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime,
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      Logger.warn('HTTP Request', logData);
    } else {
      Logger.info('HTTP Request', logData);
    }
  }

  // Database operation logging
  static database(operation: string, table: string, duration?: number, error?: Error): void {
    const logData = {
      operation,
      table,
      duration,
    };

    if (error) {
      Logger.error('Database Operation Failed', error);
    } else {
      Logger.info('Database Operation', logData);
    }
  }

  // Security event logging
  static security(event: string, details: any): void {
    Logger.warn('Security Event', { event, ...details });
  }

  // Business event logging
  static business(event: string, details: any): void {
    Logger.info('Business Event', { event, ...details });
  }

  // Performance logging
  static performance(operation: string, duration: number, details?: any): void {
    const logData = {
      operation,
      duration,
      ...details,
    };

    if (duration > 1000) { // Log slow operations
      Logger.warn('Slow Operation', logData);
    } else {
      Logger.info('Performance', logData);
    }
  }
}

export { Logger };
