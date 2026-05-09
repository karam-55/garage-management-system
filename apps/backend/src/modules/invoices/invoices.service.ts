import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { customerId?: string; garageId?: string; status?: string }) {
    const where: any = {};
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.garageId) where.garageId = filters.garageId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.invoice.findMany({
      where,
      include: {
        booking: true,
        customer: true,
        garage: true,
        items: true,
        payments: true,
        discount: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: true,
        customer: true,
        garage: true,
        items: {
          include: {
            taxRate: true,
            part: true,
          },
        },
        payments: true,
        discount: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async create(createInvoiceDto: any) {
    const { items, discountCode, ...invoiceData } = createInvoiceDto;

    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    // Calculate subtotal and tax
    if (items && items.length > 0) {
      for (const item of items) {
        const itemTotal = Number(item.quantity) * Number(item.unitPrice);
        subtotal += itemTotal;
        taxAmount += itemTotal * (Number(item.taxRate) || 0.15);
      }
    }

    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        ...invoiceData,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        status: 'DRAFT' as any,
      },
    });

    // Create invoice items
    if (items && items.length > 0) {
      for (const item of items) {
        await this.prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            taxRateValue: item.taxRate || 0.15,
            taxAmount: (Number(item.quantity) * Number(item.unitPrice)) * (Number(item.taxRate) || 0.15),
            total: (Number(item.quantity) * Number(item.unitPrice)) * (1 + (Number(item.taxRate) || 0.15)),
            serviceId: item.serviceId,
            partId: item.partId,
          },
        });
      }
    }

    return this.findOne(invoice.id);
  }

  async createFromBooking(createFromBookingDto: any) {
    const { bookingId, discountCode } = createFromBookingDto;
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        vehicle: true,
        garage: true,
        service: true,
        additionalServices: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    let subtotal = 0;
    const items = [];

    // Add main service
    if (booking.service) {
      const serviceTotal = Number(booking.service.price);
      subtotal += serviceTotal;
      items.push({
        description: booking.service.name,
        quantity: 1,
        unitPrice: booking.service.price,
        taxRate: 0.15,
        serviceId: booking.serviceId,
      });
    }

    // Add additional services
    if (booking.additionalServices && booking.additionalServices.length > 0) {
      for (const as of booking.additionalServices) {
        if (as.approved) {
          const asTotal = Number(as.price);
          subtotal += asTotal;
          items.push({
            description: as.serviceName,
            quantity: 1,
            unitPrice: as.price,
            taxRate: 0.15,
          });
        }
      }
    }

    let taxAmount = subtotal * 0.15;
    let discountAmount = 0;
    let discountId = null;

    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        bookingId: booking.id,
        customerId: booking.customerId,
        garageId: booking.garageId,
        invoiceNumber: await this.generateInvoiceNumber(booking.garageId),
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        status: 'DRAFT' as any,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create invoice items
    for (const item of items) {
      await this.prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: 0,
          taxRateValue: item.taxRate,
          taxAmount: (Number(item.quantity) * Number(item.unitPrice)) * item.taxRate,
          total: (Number(item.quantity) * Number(item.unitPrice)) * (1 + item.taxRate),
          serviceId: item.serviceId,
        },
      });
    }

    return this.findOne(invoice.id);
  }

  async update(id: string, updateInvoiceDto: any) {
    const { items, ...invoiceData } = updateInvoiceDto;

    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Prevent updates if invoice is already paid
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    let subtotal = 0;
    let taxAmount = 0;

    // Recalculate if items are provided
    if (items && items.length > 0) {
      // Delete old items
      await this.prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Create new items
      for (const item of items) {
        const itemTotal = Number(item.quantity) * Number(item.unitPrice);
        subtotal += itemTotal;
        taxAmount += itemTotal * (Number(item.taxRate) || 0.15);

        await this.prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: 0,
            tax: item.quantity * item.price * (item.taxRate || 0.15),
            total: item.quantity * item.price * (1 + (item.taxRate || 0.15)),
            serviceId: item.serviceId,
            partId: item.partId,
          },
        });
      }
    } else {
      subtotal = Number(invoice.subtotal);
      taxAmount = Number(invoice.taxAmount);
    }

    const totalAmount = subtotal + taxAmount;

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        subtotal,
        taxAmount,
        totalAmount,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    // Soft delete
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED' as any,
      },
    });
  }

  async markAsSent(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'SENT' as any,
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
  }

  async markAsPaid(id: string, paymentData?: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID' as any,
        paidDate: new Date(),
      },
    });

    // Create payment record if payment data provided
    if (paymentData) {
      await this.prisma.payment.create({
        data: {
          invoiceId: id,
          customerId: invoice.customerId,
          garageId: invoice.garageId,
          amount: paymentData.amount || invoice.totalAmount,
          paymentMethod: paymentData.paymentMethod || 'CASH' as any,
          status: 'COMPLETED' as any,
          paymentDate: new Date(),
          processedBy: paymentData.processedBy,
        },
      });
    }

    return updatedInvoice;
  }

  async markAsOverdue(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'OVERDUE' as any,
      },
    });
  }

  async checkOverdueInvoices() {
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'SENT',
        dueDate: {
          lt: new Date(),
        },
      },
    });

    const updated = [];

    for (const invoice of overdueInvoices) {
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'OVERDUE' as any,
        },
      });
      updated.push(updatedInvoice);
    }

    return updated;
  }

  async generateInvoiceNumber(garageId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const count = await this.prisma.invoice.count({
      where: {
        garageId,
        createdAt: {
          gte: new Date(year, new Date().getMonth(), 1),
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  async addItem(invoiceId: string, itemDto: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot add items to a paid invoice');
    }

    const itemTotal = Number(itemDto.quantity) * Number(itemDto.unitPrice);
    const taxAmount = itemTotal * (Number(itemDto.taxRate) || 0.15);
    const total = itemTotal + taxAmount - (Number(itemDto.discount) || 0);

    await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        description: itemDto.description,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unitPrice,
        discount: itemDto.discount || 0,
        taxRateValue: itemDto.taxRate || 0.15,
        taxAmount,
        total,
        serviceId: itemDto.serviceId,
        partId: itemDto.partId,
      },
    });

    // Recalculate invoice totals
    return this.recalculateTotals(invoiceId);
  }

  async updateItem(itemId: string, itemDto: any) {
    const item = await this.prisma.invoiceItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    const itemTotal = Number(itemDto.quantity) * Number(itemDto.unitPrice);
    const taxAmount = itemTotal * (Number(itemDto.taxRate) || 0.15);
    const total = itemTotal + taxAmount - (Number(itemDto.discount) || 0);

    await this.prisma.invoiceItem.update({
      where: { id: itemId },
      data: {
        ...itemDto,
        taxAmount,
        total,
      },
    });

    return this.recalculateTotals(item.invoiceId);
  }

  async removeItem(itemId: string) {
    const item = await this.prisma.invoiceItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    await this.prisma.invoiceItem.delete({
      where: { id: itemId },
    });

    return this.recalculateTotals(item.invoiceId);
  }

  async recalculateTotals(invoiceId: string) {
    const items = await this.prisma.invoiceItem.findMany({
      where: { invoiceId },
    });

    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
      subtotal += Number(item.quantity) * Number(item.unitPrice);
      taxAmount += Number(item.tax);
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    let discountAmount = Number(invoice.discountAmount);

    // Discount calculation disabled until discount model is added to schema
    // if (invoice.discount) {
    //   if (invoice.discount.type === 'PERCENTAGE') {
    //     discountAmount = subtotal * (Number(invoice.discount.value) / 100);
    //   } else {
    //     discountAmount = Number(invoice.discount.value);
    //   }
    // }

    const totalAmount = subtotal + taxAmount - discountAmount;

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
      },
    });
  }

  async getStatistics(garageId?: string) {
    const where = garageId ? { garageId } : {};

    const totalInvoices = await this.prisma.invoice.count({ where });
    const paidInvoices = await this.prisma.invoice.count({ where: { ...where, status: 'PAID' } });
    const pendingInvoices = await this.prisma.invoice.count({ where: { ...where, status: { in: ['DRAFT', 'SENT'] } } });
    const overdueInvoices = await this.prisma.invoice.count({ where: { ...where, status: 'OVERDUE' } });

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        payments: true,
      },
    });

    let totalRevenue = 0;
    let totalOutstanding = 0;

    for (const invoice of invoices) {
      const paidAmount = invoice.payments.reduce((sum, payment) => {
        return sum + (payment.status === 'COMPLETED' ? Number(payment.amount) : 0);
      }, 0);
      totalRevenue += paidAmount;
      totalOutstanding += (Number(invoice.totalAmount) - paidAmount);
    }

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      totalOutstanding,
    };
  }
}
