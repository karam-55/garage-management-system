import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';
import { invoiceService } from '@/models/invoice';

const prisma = new PrismaClient() as any;

class InvoiceController {
  // إنشاء فاتورة جديدة
  createInvoice = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const invoiceData = {
      ...req.body,
      invoiceDate: new Date(req.body.invoiceDate),
      dueDate: new Date(req.body.dueDate),
      taxRate: req.body.taxRate || 0.16,
      currency: req.body.currency || 'SAR',
      status: req.body.status || 'DRAFT',
    };

    const invoice = await invoiceService.createInvoice(invoiceData);

    const response: ApiResponse = {
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    };

    res.status(201).json(response);
  });

  // إنشاء فاتورة من بطاقة عمل
  createFromJobCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { jobCardId } = req.body;
    const customData = req.body.customData || {};

    const invoice = await invoiceService.createFromJobCard(jobCardId, customData);

    const response: ApiResponse = {
      success: true,
      data: invoice,
      message: 'Invoice created from job card successfully',
    };

    res.status(201).json(response);
  });

  // إنشاء فاتورة من حجز
  createFromBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId, discountCode } = req.body;
    const userId = req.user!.id;

    // Fetch booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        garage: true,
        vehicle: true,
        service: true,
        additionalServices: {
          where: { status: 'APPROVED' },
          include: {
            selectedOption: true,
          },
        },
      },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    if (booking.status !== 'COMPLETED') {
      throw new CustomError('Can only create invoice for completed bookings', 400);
    }

    // Calculate subtotal
    let subtotal = 0;
    const itemsData: any[] = [];

    // Add primary service
    const servicePrice = booking.service?.price || 0;
    subtotal += servicePrice;
    itemsData.push({
      description: booking.service?.title || 'خدمة أساسية',
      quantity: 1,
      unitPrice: servicePrice,
      total: servicePrice,
    });

    // Add approved additional services
    for (const service of booking.additionalServices) {
      const price = service.selectedOption?.price || service.price;
      subtotal += price;
      itemsData.push({
        description: service.serviceName,
        quantity: 1,
        unitPrice: price,
        total: price,
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    let discountId: string | null = null;
    if (discountCode) {
      const discount = await prisma.discount.findFirst({
        where: {
          code: discountCode,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (discount) {
        if (discount.type === 'PERCENTAGE') {
          discountAmount = subtotal * (discount.value / 100);
        } else {
          discountAmount = discount.value;
        }

        // Update discount usage count
        await prisma.discount.update({
          where: { id: discount.id },
          data: { usedCount: { increment: 1 } },
        });

        discountId = discount.id;
      }
    }

    const discountedSubtotal = subtotal - discountAmount;

    // Calculate tax (15%)
    const tax = discountedSubtotal * 0.15;
    const total = discountedSubtotal + tax;

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        bookingId,
        garageId: booking.garageId,
        userId: booking.userId,
        invoiceNumber,
        amount: discountedSubtotal,
        tax,
        totalAmount: total,
        currency: 'SAR',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        taxCalculationMethod: 'PER_ITEM',
        discountId,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        discount: true,
      },
    });

    // This would trigger WhatsApp notification

    const response: ApiResponse = {
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على قائمة الفواتير
  getInvoices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      customerId,
      status,
      dateFrom,
      dateTo,
      jobCardId,
      overdue,
      page = 1,
      limit = 20,
    } = req.query as any;

    const filters = {
      customerId,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo,
      jobCardId,
      overdue: overdue === 'true',
      page: Number(page),
      limit: Number(limit),
    };

    const result = await invoiceService.getInvoices(filters);

    const response: PaginatedResponse = {
      success: true,
      data: result.data,
      meta: {
        page: result.page || 1,
        limit: result.limit || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (result.limit || 20)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على فاتورة محددة
  getInvoiceById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const invoice = await invoiceService.getInvoiceById(id);

    const response: ApiResponse = {
      success: true,
      data: invoice,
    };

    res.status(200).json(response);
  });

  // تحديث الفاتورة
  updateInvoice = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.invoiceDate) {
      updateData.invoiceDate = new Date(updateData.invoiceDate);
    }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const invoice = await invoiceService.updateInvoice(id, updateData);

    const response: ApiResponse = {
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    };

    res.status(200).json(response);
  });

  // إضافة دفعة للفاتورة
  addPayment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const paymentData = {
      ...req.body,
      paymentDate: new Date(req.body.paymentDate),
      processedBy: req.user!.id,
    };

    const payment = await invoiceService.addPayment(paymentData);

    const response: ApiResponse = {
      success: true,
      data: payment,
      message: 'Payment added successfully',
    };

    res.status(201).json(response);
  });

  // إرسال الفاتورة للعميل
  sendInvoice = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { method, customMessage } = req.body;

    if (!method) {
      throw new CustomError('Send method is required', 400);
    }

    await invoiceService.sendInvoice(id, method, customMessage);

    const response: ApiResponse = {
      success: true,
      message: `Invoice sent via ${method}`,
    };

    res.status(200).json(response);
  });

  // الحصول على تقارير الفواتير
  getInvoiceReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      dateFrom,
      dateTo,
      customerId,
      reportType,
    } = req.query as any;

    const filters = {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo,
      customerId,
      reportType,
    };

    const report = await invoiceService.getInvoiceReports(filters);

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // إنشاء PDF للفاتورة
  generatePDF = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const pdfPath = await invoiceService.generateInvoicePDF(id);

    const response: ApiResponse = {
      success: true,
      data: { pdfPath },
      message: 'PDF generated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على الفواتير المتأخرة
  getOverdueInvoices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { customerId, page = 1, limit = 20 } = req.query as any;

    const filters = {
      customerId,
      overdue: true,
      page: Number(page),
      limit: Number(limit),
    };

    const result = await invoiceService.getInvoices(filters);

    const response: PaginatedResponse = {
      success: true,
      data: result.data,
      meta: {
        page: result.page || 1,
        limit: result.limit || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (result.limit || 20)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على ملخص الدفعات
  getPaymentSummary = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      dateFrom,
      dateTo,
      paymentMethod,
      status,
    } = req.query as any;

    const where: any = {};
    
    if (dateFrom || dateTo) {
      where.paymentDate = {};
      if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
      if (dateTo) where.paymentDate.lte = new Date(dateTo);
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (status) {
      where.status = status;
    }

    const [
      totalPayments,
      totalAmount,
      byMethod,
      byStatus,
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where,
        _count: { paymentMethod: true },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
        _sum: { amount: true },
      }),
    ]);

    const summary = {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      byMethod: byMethod.reduce((acc, item) => {
        acc[item.paymentMethod] = {
          count: item._count.paymentMethod,
          amount: item._sum.amount || 0,
        };
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: item._count.status,
          amount: item._sum.amount || 0,
        };
        return acc;
      }, {}),
    };

    const response: ApiResponse = {
      success: true,
      data: summary,
    };

    res.status(200).json(response);
  });

  // إلغاء الفاتورة
  cancelInvoice = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        internalNotes: reason,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: invoice,
      message: 'Invoice cancelled successfully',
    };

    res.status(200).json(response);
  });

  // استرداد دفعة
  refundPayment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new CustomError('Payment not found', 404);
    }

    if (payment.status !== 'COMPLETED') {
      throw new CustomError('Only completed payments can be refunded', 400);
    }

    if (amount > payment.amount) {
      throw new CustomError('Refund amount cannot exceed payment amount', 400);
    }

    // إنشاء استرداد
    const refund = await prisma.payment.create({
      data: {
        invoiceId: payment.invoiceId,
        paymentMethod: payment.paymentMethod,
        amount: -amount, // Negative amount for refund
        paymentDate: new Date(),
        referenceNumber: `REFUND-${payment.referenceNumber}`,
        status: 'COMPLETED',
        notes: `Refund: ${reason}`,
        processedBy: req.user!.id,
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    // تحديث حالة الفاتورة
    await invoiceService.updateInvoicePaymentStatus(payment.invoiceId);

    const response: ApiResponse = {
      success: true,
      data: refund,
      message: 'Payment refunded successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على سجل الدفعات
  getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      invoiceId,
      customerId,
      paymentMethod,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query as any;

    const where: any = {};
    
    if (invoiceId) where.invoiceId = invoiceId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (status) where.status = status;
    
    if (dateFrom || dateTo) {
      where.paymentDate = {};
      if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
      if (dateTo) where.paymentDate.lte = new Date(dateTo);
    }

    // إذا تم تحديد customerId، نبحث في الفواتير المرتبطة بالعميل
    if (customerId) {
      const customerInvoices = await prisma.invoice.findMany({
        where: { customerId },
        select: { id: true },
      });
      where.invoiceId = {
        in: customerInvoices.map(inv => inv.id),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { paymentDate: 'desc' },
        include: {
          invoice: {
            include: {
              customer: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: payments,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // تحديث حالة الدفعة
  updatePaymentStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      throw new CustomError('Status is required', 400);
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        notes,
        updatedAt: new Date(),
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    // تحديث حالة الفاتورة
    await invoiceService.updateInvoicePaymentStatus(payment.invoiceId);

    const response: ApiResponse = {
      success: true,
      data: payment,
      message: `Payment status updated to ${status}`,
    };

    res.status(200).json(response);
  });

  // الحصول على إحصائيات الفواتير
  getInvoiceStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, dateFrom, dateTo } = req.query as any;

    const where: any = {};
    
    if (dateFrom || dateTo) {
      where.invoiceDate = {};
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
      if (dateTo) where.invoiceDate.lte = new Date(dateTo);
    }

    // إذا تم تحديد garageId، نبحث في فواتير ورش العمل الخاصة
    if (garageId) {
      const garageInvoices = await prisma.invoice.findMany({
        where: {
          jobCard: {
            garageId,
          },
        },
        select: { id: true },
      });
      where.id = {
        in: garageInvoices.map(inv => inv.id),
      };
    }

    const [
      totalInvoices,
      totalAmount,
      paidAmount,
      overdueCount,
      byStatus,
    ] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.aggregate({
        where,
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          ...where,
          status: 'PAID',
        },
        _sum: { total: true },
      }),
      prisma.invoice.count({
        where: {
          ...where,
          dueDate: {
            lt: new Date(),
          },
          status: {
            notIn: ['PAID', 'CANCELLED', 'REFUNDED'],
          },
        },
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
        _sum: { total: true },
      }),
    ]);

    const stats = {
      overview: {
        totalInvoices,
        totalAmount: totalAmount._sum.total || 0,
        paidAmount: paidAmount._sum.total || 0,
        outstandingAmount: (totalAmount._sum.total || 0) - (paidAmount._sum.total || 0),
        overdueCount,
        paymentRate: totalAmount._sum.total > 0 
          ? ((paidAmount._sum.total || 0) / totalAmount._sum.total) * 100 
          : 0,
      },
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: item._count.status,
          amount: item._sum.total || 0,
        };
        return acc;
      }, {}),
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });

  // إضافة خصم على الفاتورة
  addDiscount = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { amount, type, reason } = req.body;

    if (!amount || !type) {
      throw new CustomError('Discount amount and type are required', 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      throw new CustomError('Invoice not found', 404);
    }

    if (invoice.status === 'PAID') {
      throw new CustomError('Cannot discount paid invoice', 400);
    }

    // حساب الخصم
    let discountAmount = amount;
    if (type === 'PERCENTAGE') {
      discountAmount = (invoice.subtotal * amount) / 100;
    }

    const newTotal = invoice.subtotal + invoice.taxAmount - discountAmount;

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        discountAmount,
        discountType: type,
        discountReason: reason,
        total: newTotal,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        items: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedInvoice,
      message: 'Discount applied successfully',
    };

    res.status(200).json(response);
  });
}

export const invoiceController = new InvoiceController();
