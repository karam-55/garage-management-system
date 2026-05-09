import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-revenue')
  @UseGuards()
  @ApiBearerAuth()
  async getDailyRevenue() {
    return this.reportsService.getDailyRevenue();
  }

  @Get('mechanic-performance')
  @UseGuards()
  @ApiBearerAuth()
  async getMechanicPerformance() {
    return this.reportsService.getMechanicPerformance();
  }

  @Get('low-stock')
  @UseGuards()
  @ApiBearerAuth()
  async getLowStock() {
    return this.reportsService.getLowStock();
  }

  @Get('overdue-invoices')
  @UseGuards()
  @ApiBearerAuth()
  async getOverdueInvoices() {
    return this.reportsService.getOverdueInvoices();
  }
}
