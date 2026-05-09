import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { customerId?: string; garageId?: string; status?: string }) {
    const where: any = {};
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.garageId) where.garageId = filters.garageId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.payment.findMany({
      where,
      include: {
        invoice: true,
        customer: true,
        garage: true,
        processedByUser: true,
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
        customer: true,
        garage: true,
        processedByUser: true,
        history: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByInvoice(invoiceId: string) {
    return this.prisma.payment.findMany({
      where: { invoiceId },
      include: {
        invoice: true,
        customer: true,
        garage: true,
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async create(createPaymentDto: any, userId?: string) {
    const { invoiceId, amount, paymentMethod, ...rest } = createPaymentDto;

    // Validate invoice
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if payment amount exceeds invoice balance
    const paidAmount = invoice.payments.reduce((sum, payment) => {
      return sum + (payment.status === 'COMPLETED' ? Number(payment.amount) : 0);
    }, 0);

    const balance = Number(invoice.totalAmount) - paidAmount;

    if (Number(amount) > balance) {
      throw new BadRequestException(`Payment amount exceeds invoice balance. Balance: ${balance}`);
    }

    // Check payment limits
    if (userId) {
      await this.checkPaymentLimits(userId, Number(amount));
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        customerId: invoice.customerId,
        garageId: invoice.garageId,
        amount,
        paymentMethod: paymentMethod || 'CASH' as any,
        status: 'COMPLETED' as any,
        paymentDate: new Date(),
        processedBy: userId,
        ...rest,
      },
    });

    // Log payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        status: 'COMPLETED' as any,
        changedAt: new Date(),
        changedBy: userId,
        notes: 'Payment created',
      },
    });

    // Update invoice status
    const newPaidAmount = paidAmount + Number(amount);
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' as any : 'SENT' as any,
        paidDate: newPaidAmount >= Number(invoice.totalAmount) ? new Date() : null,
      },
    });

    // Update payment limits
    if (userId) {
      await this.updatePaymentLimits(userId, Number(amount));
    }

    return this.findOne(payment.id);
  }

  async update(id: string, updatePaymentDto: any, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Prevent updates if payment is already completed
    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Cannot update a completed payment');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });

    // Log payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: id,
        status: updatePaymentDto.status || payment.status,
        changedAt: new Date(),
        changedBy: userId,
        notes: 'Payment updated',
      },
    });

    return this.findOne(id);
  }

  async remove(id: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Prevent deletion if payment is completed
    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Cannot delete a completed payment');
    }

    await this.prisma.payment.delete({
      where: { id },
    });

    // Log payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: id,
        status: payment.status,
        changedAt: new Date(),
        changedBy: userId,
        notes: 'Payment deleted',
      },
    });

    return { success: true };
  }

  async refund(paymentId: string, refundDto: any, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only refund completed payments');
    }

    const { amount, reason } = refundDto;
    const refundAmount = amount || payment.amount;

    // Create refund payment
    const refundPayment = await this.prisma.payment.create({
      data: {
        invoiceId: payment.invoiceId,
        customerId: payment.customerId,
        garageId: payment.garageId,
        amount: refundAmount,
        paymentMethod: payment.paymentMethod,
        status: 'REFUNDED' as any,
        paymentDate: new Date(),
        processedBy: userId,
        notes: reason || 'Refund',
      },
    });

    // Log payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: refundPayment.id,
        status: 'REFUNDED' as any,
        changedAt: new Date(),
        changedBy: userId,
        notes: reason || 'Refund',
      },
    });

    // Update original payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PARTIALLY_REFUNDED' as any,
      },
    });

    // Update invoice status
    await this.prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        status: 'SENT' as any,
        paidDate: null,
      },
    });

    return this.findOne(refundPayment.id);
  }

  async partialRefund(paymentId: string, amount: number, reason?: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (Number(amount) >= Number(payment.amount)) {
      throw new BadRequestException('Use full refund for complete amount');
    }

    // Create partial refund payment
    const refundPayment = await this.prisma.payment.create({
      data: {
        invoiceId: payment.invoiceId,
        customerId: payment.customerId,
        garageId: payment.garageId,
        amount,
        paymentMethod: payment.paymentMethod,
        status: 'REFUNDED' as any,
        paymentDate: new Date(),
        processedBy: userId,
        notes: reason || 'Partial refund',
      },
    });

    // Log payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: refundPayment.id,
        status: 'REFUNDED' as any,
        changedAt: new Date(),
        changedBy: userId,
        notes: reason || 'Partial refund',
      },
    });

    // Update original payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PARTIALLY_REFUNDED' as any,
      },
    });

    return this.findOne(refundPayment.id);
  }

  async checkPaymentLimits(userId: string, amount: number) {
    const limit = await this.prisma.paymentLimit.findUnique({
      where: { userId },
    });

    if (!limit) {
      return true; // No limits set
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get today's payments
    const todayPayments = await this.prisma.payment.findMany({
      where: {
        processedBy: userId,
        paymentDate: {
          gte: today,
        },
        status: 'COMPLETED',
      },
    });

    const dailySpent = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Get this month's payments
    const monthPayments = await this.prisma.payment.findMany({
      where: {
        processedBy: userId,
        paymentDate: {
          gte: thisMonth,
        },
        status: 'COMPLETED',
      },
    });

    const monthlySpent = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Check limits
    if (dailySpent + amount > Number(limit.dailyLimit)) {
      throw new BadRequestException(`Daily payment limit exceeded. Remaining: ${Number(limit.dailyLimit) - dailySpent}`);
    }

    if (monthlySpent + amount > Number(limit.monthlyLimit)) {
      throw new BadRequestException(`Monthly payment limit exceeded. Remaining: ${Number(limit.monthlyLimit) - monthlySpent}`);
    }

    if (amount > Number(limit.perTransactionLimit)) {
      throw new BadRequestException(`Per transaction limit exceeded. Max: ${limit.perTransactionLimit}`);
    }

    return true;
  }

  async updatePaymentLimits(userId: string, amount: number) {
    const limit = await this.prisma.paymentLimit.findUnique({
      where: { userId },
    });

    if (!limit) {
      await this.prisma.paymentLimit.create({
        data: {
          userId,
          dailyLimit: 10000,
          monthlyLimit: 50000,
          perTransactionLimit: 5000,
          dailySpent: amount,
          monthlySpent: amount,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Reset daily if new day
      if (new Date(limit.resetDate) < today) {
        await this.prisma.paymentLimit.update({
          where: { userId },
          data: {
            dailySpent: amount,
            resetDate: today,
          },
        });
      } else {
        await this.prisma.paymentLimit.update({
          where: { userId },
          data: {
            dailySpent: { increment: amount },
          },
        });
      }

      // Update monthly
      await this.prisma.paymentLimit.update({
        where: { userId },
        data: {
          monthlySpent: { increment: amount },
        },
      });
    }
  }

  async getPaymentHistory(paymentId: string) {
    return this.prisma.paymentHistory.findMany({
      where: { paymentId },
      orderBy: { changedAt: 'desc' },
    });
  }

  async getStatistics(garageId?: string) {
    const where = garageId ? { garageId } : {};

    const totalPayments = await this.prisma.payment.count({ where });
    const completedPayments = await this.prisma.payment.count({ where: { ...where, status: 'COMPLETED' } });
    const refundedPayments = await this.prisma.payment.count({ where: { ...where, status: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] } } });

    const payments = await this.prisma.payment.findMany({
      where: { ...where, status: 'COMPLETED' },
      select: { amount: true },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Group by payment method
    const paymentsByMethod = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: { ...where, status: 'COMPLETED' },
      _sum: {
        amount: true,
      },
    });

    return {
      totalPayments,
      completedPayments,
      refundedPayments,
      totalRevenue,
      paymentsByMethod: paymentsByMethod.map(pbm => ({
        method: pbm.paymentMethod,
        total: Number(pbm._sum.amount),
      })),
    };
  }

  async setPaymentLimits(userId: string, limits: any) {
    return this.prisma.paymentLimit.upsert({
      where: { userId },
      update: limits,
      create: {
        userId,
        ...limits,
        dailySpent: 0,
        monthlySpent: 0,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    });
  }

  async getPaymentLimits(userId: string) {
    return this.prisma.paymentLimit.findUnique({
      where: { userId },
    });
  }
}
