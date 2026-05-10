import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailyRevenue(garageId?: string, date?: Date) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      status: 'COMPLETED' as any,
      paymentDate: {
        gte: targetDate,
        lte: endOfDay,
      },
    };

    if (garageId) where.garageId = garageId;

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        invoice: true,
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      date: targetDate,
      totalRevenue,
      paymentCount: payments.length,
      payments,
    };
  }

  async getWeeklyRevenue(garageId?: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const where: any = {
      status: 'COMPLETED' as any,
      paymentDate: {
        gte: startOfWeek,
      },
    };

    if (garageId) where.garageId = garageId;

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        invoice: true,
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Group by day
    const dailyRevenue = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];
      dailyRevenue[dayStr] = 0;
    }

    payments.forEach((payment) => {
      const dayStr = payment.paymentDate.toISOString().split('T')[0];
      if (dailyRevenue[dayStr] !== undefined) {
        dailyRevenue[dayStr] += Number(payment.amount);
      }
    });

    return {
      startDate: startOfWeek,
      endDate: now,
      totalRevenue,
      paymentCount: payments.length,
      dailyRevenue,
    };
  }

  async getMonthlyRevenue(garageId?: string, year?: number, month?: number) {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth();
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

    const where: any = {
      status: 'COMPLETED' as any,
      paymentDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    };

    if (garageId) where.garageId = garageId;

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        invoice: true,
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Group by day
    const dailyRevenue = {};
    const daysInMonth = endOfMonth.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(targetYear, targetMonth, i);
      const dayStr = day.toISOString().split('T')[0];
      dailyRevenue[dayStr] = 0;
    }

    payments.forEach((payment) => {
      const dayStr = payment.paymentDate.toISOString().split('T')[0];
      if (dailyRevenue[dayStr] !== undefined) {
        dailyRevenue[dayStr] += Number(payment.amount);
      }
    });

    return {
      month: targetMonth + 1,
      year: targetYear,
      startDate: startOfMonth,
      endDate: endOfMonth,
      totalRevenue,
      paymentCount: payments.length,
      dailyRevenue,
    };
  }

  async getMechanicPerformance(garageId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      role: 'MECHANIC',
    };

    if (garageId) where.garageId = garageId;

    const mechanics = await this.prisma.user.findMany({
      where,
    });

    const performanceData = mechanics.map((mechanic) => {
      // TODO: Implement mechanic performance tracking when Prisma Client is updated
      return {
        id: mechanic.id,
        name: mechanic.fullName,
        totalHours: 0,
        completedBookings: 0,
        averageRating: 0,
      };
    });

    return performanceData;
  }

  async getLowStock(garageId?: string) {
    const where: any = {
      isActive: true,
    };

    if (garageId) where.garageId = garageId;

    const items = await this.prisma.partsInventory.findMany({
      where,
    });

    return items.filter((item) => Number(item.quantity) <= Number(item.reorderPoint));
  }

  async getOverdueInvoices(garageId?: string) {
    const now = new Date();
    const where: any = {
      status: 'SENT' as any,
      dueDate: {
        lt: now,
      },
    };

    if (garageId) where.garageId = garageId;

    return this.prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        garage: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getInventoryReport(garageId?: string) {
    const where = garageId ? { garageId } : {};

    const totalItems = await this.prisma.partsInventory.count({ where: { ...where, isActive: true } });

    const items = await this.prisma.partsInventory.findMany({
      where: { ...where, isActive: true },
      select: { quantity: true, reorderPoint: true, sellingPrice: true },
    });

    const lowStockItems = items.filter((item) => Number(item.quantity) <= Number(item.reorderPoint)).length;
    const totalValue = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.sellingPrice), 0);

    return {
      totalItems,
      lowStockItems,
      totalValue,
    };
  }

  async getServiceReport(garageId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (garageId) where.garageId = garageId;
    if (startDate && endDate) {
      where.scheduledAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        service: true,
        garage: true,
      },
    });

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;

    // Group by service
    const serviceStats = {};
    bookings.forEach((booking) => {
      const serviceName = booking.service?.name || 'Unknown';
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = {
          count: 0,
          completed: 0,
          revenue: 0,
        };
      }
      serviceStats[serviceName].count++;
      if (booking.status === 'COMPLETED') {
        serviceStats[serviceName].completed++;
        serviceStats[serviceName].revenue += Number(booking.service?.price || 0);
      }
    });

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      serviceStats,
    };
  }

  async getCustomerReport(garageId?: string) {
    const where = garageId ? { garageId } : {};

    const customers = await this.prisma.customer.findMany({
      where,
      include: {
        user: true,
      },
    });

    const customerStats = customers.map((customer) => ({
      id: customer.id,
      name: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      totalBookings: customer.totalBookings,
      loyaltyPoints: customer.loyaltyPoints,
      isActive: customer.user?.isActive || false,
    }));

    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.user?.isActive).length,
      customerStats,
    };
  }

  async getFinancialReport(garageId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (garageId) where.garageId = garageId;
    if (startDate && endDate) {
      where.paymentDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const payments = await this.prisma.payment.findMany({
      where,
    });

    const totalRevenue = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const refundedAmount = payments
      .filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const invoices = await this.prisma.invoice.findMany({
      where: garageId ? { garageId } : {},
      include: { payments: true },
    });

    const totalOutstanding = invoices
      .filter((i) => i.status === 'SENT')
      .reduce((sum, i) => {
        const paid = i.payments?.reduce((s, p) => s + (p.status === 'COMPLETED' ? Number(p.amount) : 0), 0) || 0;
        return sum + (Number(i.totalAmount) - paid);
      }, 0);

    return {
      totalRevenue,
      refundedAmount,
      netRevenue: totalRevenue - refundedAmount,
      totalOutstanding,
      paymentCount: payments.length,
      refundCount: payments.filter((p) => p.status === 'REFUNDED').length,
    };
  }
}
