import { Controller, Get, UseGuards, Query, Request } from '@nestjs/common';
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
  async getDailyRevenue(@Request() req) {
    return this.reportsService.getDailyRevenue(req.user?.garageId);
  }

  @Get('mechanic-performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMechanicPerformance(@Request() req) {
    return this.reportsService.getMechanicPerformance(req.user?.garageId);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLowStock(@Request() req) {
    return this.reportsService.getLowStock(req.user?.garageId);
  }

  @Get('overdue-invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOverdueInvoices(@Request() req) {
    return this.reportsService.getOverdueInvoices(req.user?.garageId);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getRevenue(@Request() req, @Query('period') period?: string) {
    const garageId = req.user?.garageId;
    if (period === 'week') return this.reportsService.getWeeklyRevenue(garageId);
    return this.reportsService.getMonthlyRevenue(garageId);
  }

  @Get('performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPerformance(@Request() req) {
    return this.reportsService.getMechanicPerformance(req.user?.garageId);
  }

  @Get('inventory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getInventory(@Request() req) {
    return this.reportsService.getInventoryReport(req.user?.garageId);
  }

  @Get('customers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCustomers(@Request() req) {
    return this.reportsService.getOverdueInvoices(req.user?.garageId);
  }
}
