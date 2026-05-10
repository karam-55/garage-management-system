import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-revenue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDailyRevenue() {
    return this.reportsService.getDailyRevenue();
  }

  @Get('mechanic-performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMechanicPerformance() {
    return this.reportsService.getMechanicPerformance();
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLowStock() {
    return this.reportsService.getLowStock();
  }

  @Get('overdue-invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOverdueInvoices() {
    return this.reportsService.getOverdueInvoices();
  }
}
