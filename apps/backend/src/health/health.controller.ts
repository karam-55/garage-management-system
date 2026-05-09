import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get()
  root() {
    return {
      message: 'Garage Management System API',
      version: '1.0.0',
      status: 'running',
    };
  }
}
