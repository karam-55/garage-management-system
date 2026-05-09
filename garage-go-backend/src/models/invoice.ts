import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface InvoiceData {
  invoiceNumber: string;
  customerId: string;
  jobCardId?: string;
  bookingId?: string;
  invoiceDate: Date;
  dueDate: Date;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountReason?: string;
  total: number;
  currency: string;
  paymentTerms: string;
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  items: Array<{
    type: 'LABOR' | 'PARTS' | 'SERVICE' | 'FEE' | 'DISCOUNT';
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number;
    taxAmount?: number;
    discountAmount?: number;
    referenceId?: string; // jobItemId, partId, serviceId
    referenceType?: string;
  }>;
  paymentSchedule?: Array<{
    dueDate: Date;
    amount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paymentMethod?: string;
    paidAt?: Date;
  }>;
}

export interface PaymentData {
  invoiceId: string;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CHECK' | 'ONLINE_PAYMENT';
  amount: number;
  paymentDate: Date;
  referenceNumber?: string;
  transactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  notes?: string;
  processedBy: string;
  gatewayResponse?: any;
}

export interface InvoiceTemplateData {
  name: string;
  description?: string;
  template: {
    header: {
      logo?: string;
      companyName: string;
      address: string;
      phone: string;
      email: string;
      website?: string;
      taxNumber?: string;
    };
    footer: {
      paymentInstructions?: string;
      thankYouMessage?: string;
      termsAndConditions?: string;
    };
    layout: {
      showCustomerDetails: boolean;
      showJobDetails: boolean;
      showTaxBreakdown: boolean;
      showDiscounts: boolean;
      showPaymentSchedule: boolean;
      showBarcode: boolean;
      showQrCode: boolean;
    };
  };
  isActive: boolean;
  createdBy: string;
}

export class InvoiceService {
  // إنشاء فاتورة جديدة
  async createInvoice(invoiceData: InvoiceData): Promise<any> {
    try {
      // إنشاء رقم فاتورة فريد
      const invoiceNumber = await this.generateInvoiceNumber();

      const invoice = await prisma.invoice.create({
        data: {
          ...invoiceData,
          invoiceNumber,
          invoiceDate: new Date(invoiceData.invoiceDate),
          dueDate: new Date(invoiceData.dueDate),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          jobCard: {
            select: {
              id: true,
              jobNumber: true,
              vehicle: {
                select: {
                  make: true,
                  model: true,
                  plate: true,
                },
              },
            },
          },
          booking: {
            select: {
              id: true,
              service: {
                select: {
                  title: true,
                },
              },
            },
          },
          items: true,
          payments: true,
          paymentSchedule: true,
        },
      });

      // تحديث حالة الحجز/بطاقة العمل المرتبطة
      if (invoice.jobCardId) {
        await prisma.jobCard.update({
          where: { id: invoice.jobCardId },
          data: {
            invoiceId: invoice.id,
            updatedAt: new Date(),
          },
        });
      }

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // إنشاء فاتورة من بطاقة عمل
  async createFromJobCard(jobCardId: string, customData?: Partial<InvoiceData>): Promise<any> {
    try {
      const jobCard = await prisma.jobCard.findUnique({
        where: { id: jobCardId },
        include: {
          booking: {
            include: {
              customer: true,
              service: true,
            },
          },
          jobItems: {
            include: {
              service: true,
            },
          },
          partsUsed: {
            include: {
              part: true,
            },
          },
          timeTracking: true,
        },
      });

      if (!jobCard) {
        throw new Error('Job card not found');
      }

      // حساب تكاليف العمالة
      const laborItems = jobCard.jobItems.map(item => ({
        type: 'LABOR' as const,
        description: item.service?.title || item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        referenceId: item.id,
        referenceType: 'JOB_ITEM',
      }));

      // حساب تكاليف القطع
      const partsItems = jobCard.partsUsed.map(part => ({
        type: 'PARTS' as const,
        description: `${part.part?.name || 'Unknown Part'} (${part.quantity}x)`,
        quantity: part.quantity,
        unitPrice: part.unitPrice,
        totalPrice: part.totalPrice,
        referenceId: part.id,
        referenceType: 'PART_USED',
      }));

      // تجميع كل العناصر
      const allItems = [...laborItems, ...partsItems];

      // حساب المجاميع
      const subtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxRate = 0.16; // 16% ضريبة
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      const invoiceData: InvoiceData = {
        invoiceNumber: '', // سيتم إنشاؤه تلقائياً
        customerId: jobCard.booking.customerId,
        jobCardId,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        status: 'DRAFT',
        subtotal,
        taxRate,
        taxAmount,
        total,
        currency: 'SAR',
        paymentTerms: 'NET 30',
        items: allItems,
        ...customData,
      };

      return await this.createInvoice(invoiceData);
    } catch (error) {
      console.error('Error creating invoice from job card:', error);
      throw error;
    }
  }

  // الحصول على قائمة الفواتير
  async getInvoices(filters?: {
    customerId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: string;
    jobCardId?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const where: any = {};

      if (filters?.customerId) {
        where.customerId = filters.customerId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.jobCardId) {
        where.jobCardId = filters.jobCardId;
      }

      if (filters?.overdue) {
        where.dueDate = {
          lt: new Date(),
        };
        where.status = {
          notIn: ['PAID', 'CANCELLED', 'REFUNDED'],
        };
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.invoiceDate = {};
        if (filters.dateFrom) where.invoiceDate.gte = filters.dateFrom;
        if (filters.dateTo) where.invoiceDate.lte = new Date(filters.dateTo);
      }

      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          jobCard: {
            select: {
              id: true,
              jobNumber: true,
            },
          },
          items: true,
          payments: true,
        },
        orderBy: {
          invoiceDate: 'desc',
        },
      });

      // تطبيق الصفحة إذا تم تحديدها
      if (filters?.page && filters?.limit) {
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit;
        return {
          data: invoices.slice(startIndex, endIndex),
          total: invoices.length,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(invoices.length / filters.limit),
        };
      }

      return {
        data: invoices,
        total: invoices.length,
      };
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }

  // الحصول على فاتورة محددة
  async getInvoiceById(invoiceId: string): Promise<any> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          jobCard: {
            include: {
              vehicle: true,
            },
          },
          booking: {
            include: {
              service: true,
            },
          },
          items: true,
          payments: true,
          paymentSchedule: true,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    } catch (error) {
      console.error('Error getting invoice by ID:', error);
      throw error;
    }
  }

  // تحديث الفاتورة
  async updateInvoice(invoiceId: string, updateData: Partial<InvoiceData>): Promise<any> {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          customer: true,
          items: true,
          payments: true,
        },
      });

      return invoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  // إضافة دفعة للفاتورة
  async addPayment(paymentData: PaymentData): Promise<any> {
    try {
      const payment = await prisma.payment.create({
        data: {
          ...paymentData,
          paymentDate: new Date(paymentData.paymentDate),
          createdAt: new Date(),
        },
        include: {
          invoice: {
            include: {
              customer: true,
              payments: true,
            },
          },
        },
      });

      // تحديث حالة الفاتورة
      await this.updateInvoicePaymentStatus(paymentData.invoiceId);

      return payment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  // تحديث حالة دفع الفاتورة
  private async updateInvoicePaymentStatus(invoiceId: string): Promise<void> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          payments: {
            where: {
              status: 'COMPLETED',
            },
          },
        },
      });

      if (!invoice) return;

      const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      let newStatus: string;
      if (totalPaid >= invoice.total) {
        newStatus = 'PAID';
      } else if (totalPaid > 0) {
        newStatus = 'SENT'; // Partially paid
      } else if (new Date() > invoice.dueDate) {
        newStatus = 'OVERDUE';
      } else {
        newStatus = 'SENT';
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating invoice payment status:', error);
    }
  }

  // إرسال الفاتورة للعميل
  async sendInvoice(invoiceId: string, method: 'EMAIL' | 'WHATSAPP' | 'SMS', customMessage?: string): Promise<void> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);

      const message = customMessage || this.generateInvoiceMessage(invoice);

      switch (method) {
        case 'EMAIL':
          if (invoice.customer.email) {
            await this.sendEmail(invoice.customer.email, `Invoice ${invoice.invoiceNumber}`, message, invoiceId);
          }
          break;
        case 'WHATSAPP':
          await this.sendWhatsAppMessage(invoice.customer.phone, message);
          break;
        case 'SMS':
          await this.sendSMSMessage(invoice.customer.phone, message);
          break;
      }

      // تحديث حالة الفاتورة
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  // إنشاء رسالة الفاتورة
  private generateInvoiceMessage(invoice: any): string {
    return `
      عزيزي/عزيزتي ${invoice.customer.fullName},
      
      يسعدنا إرسال فاتورتكم رقم: ${invoice.invoiceNumber}
      
      المبلغ الإجمالي: ${invoice.total} ${invoice.currency}
      تاريخ الاستحقاق: ${invoice.dueDate.toLocaleDateString('ar-SA')}
      
      يمكنكم الاطلاع على تفاصيل الفاتورة عبر حسابكم في تطبيق Garage Go
      
      مع أطيب التحيات،
      فريق Garage Go
    `;
  }

  // إنشاء رقم فاتورة فريد
  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const prefix = `INV-${year}${month}`;
    
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  // الحصول على تقارير الفواتير
  async getInvoiceReports(filters?: {
    dateFrom?: Date;
    dateTo?: string;
    customerId?: string;
    reportType?: 'SUMMARY' | 'DETAILED' | 'AGING' | 'REVENUE';
  }): Promise<any> {
    try {
      const where: any = {};
      
      if (filters?.dateFrom || filters?.dateTo) {
        where.invoiceDate = {};
        if (filters.dateFrom) where.invoiceDate.gte = filters.dateFrom;
        if (filters.dateTo) where.invoiceDate.lte = new Date(filters.dateTo);
      }

      if (filters?.customerId) {
        where.customerId = filters.customerId;
      }

      switch (filters?.reportType) {
        case 'SUMMARY':
          return await this.getSummaryReport(where);
        case 'DETAILED':
          return await this.getDetailedReport(where);
        case 'AGING':
          return await this.getAgingReport();
        case 'REVENUE':
          return await this.getRevenueReport(where);
        default:
          return await this.getSummaryReport(where);
      }
    } catch (error) {
      console.error('Error getting invoice reports:', error);
      throw error;
    }
  }

  // تقرير ملخص
  private async getSummaryReport(where: any): Promise<any> {
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        payments: true,
      },
    });

    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => 
      sum + inv.payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0), 0
    );
    const totalOutstanding = totalAmount - totalPaid;

    const byStatus = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});

    return {
      reportType: 'SUMMARY',
      summary: {
        totalInvoices,
        totalAmount,
        totalPaid,
        totalOutstanding,
        paymentRate: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
      },
      byStatus,
    };
  }

  // تقرير تفصيلي
  private async getDetailedReport(where: any): Promise<any> {
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            fullName: true,
            email: true,
          },
        },
        jobCard: {
          select: {
            jobNumber: true,
          },
        },
        items: true,
        payments: true,
      },
      orderBy: {
        invoiceDate: 'desc',
      },
    });

    return {
      reportType: 'DETAILED',
      invoices,
      summary: {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      },
    };
  }

  // تقرير الشيخوخة
  private async getAgingReport(): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED', 'REFUNDED'],
        },
      },
      include: {
        customer: {
          select: {
            fullName: true,
          },
        },
        payments: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    const agingBuckets = {
      current: [], // 0-30 days
      days30: [], // 31-60 days
      days60: [], // 61-90 days
      days90: [], // 90+ days
    };

    unpaidInvoices.forEach(invoice => {
      const paid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const outstanding = invoice.total - paid;
      
      if (outstanding <= 0) return;

      const daysOverdue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (24 * 60 * 60 * 1000));

      const bucketData = {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.fullName,
        dueDate: invoice.dueDate,
        daysOverdue,
        outstanding,
      };

      if (daysOverdue <= 0) {
        agingBuckets.current.push(bucketData);
      } else if (daysOverdue <= 30) {
        agingBuckets.days30.push(bucketData);
      } else if (daysOverdue <= 60) {
        agingBuckets.days60.push(bucketData);
      } else {
        agingBuckets.days90.push(bucketData);
      }
    });

    const totalOutstanding = Object.values(agingBuckets).reduce((sum, bucket: any) => 
      sum + bucket.reduce((s, item) => s + item.outstanding, 0), 0
    );

    return {
      reportType: 'AGING',
      buckets: agingBuckets,
      summary: {
        totalOutstanding,
        totalInvoices: unpaidInvoices.length,
        averageDaysOverdue: unpaidInvoices.length > 0 
          ? unpaidInvoices.reduce((sum, inv) => {
              const days = Math.max(0, Math.floor((now.getTime() - inv.dueDate.getTime()) / (24 * 60 * 60 * 1000)));
              return sum + days;
            }, 0) / unpaidInvoices.length
          : 0,
      },
    };
  }

  // تقرير الإيرادات
  private async getRevenueReport(where: any): Promise<any> {
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        payments: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    const revenueByMonth = invoices.reduce((acc, invoice) => {
      const month = invoice.invoiceDate.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          invoices: 0,
          revenue: 0,
          tax: 0,
        };
      }
      acc[month].invoices++;
      acc[month].revenue += invoice.total;
      acc[month].tax += invoice.taxAmount;
      return acc;
    }, {});

    const revenueByPaymentMethod = invoices.reduce((acc, invoice) => {
      invoice.payments.forEach(payment => {
        if (!acc[payment.paymentMethod]) {
          acc[payment.paymentMethod] = 0;
        }
        acc[payment.paymentMethod] += payment.amount;
      });
      return acc;
    }, {});

    return {
      reportType: 'REVENUE',
      revenueByMonth,
      revenueByPaymentMethod,
      summary: {
        totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
        totalTax: invoices.reduce((sum, inv) => sum + inv.taxAmount, 0),
        totalInvoices: invoices.length,
        averageInvoiceValue: invoices.length > 0 
          ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length 
          : 0,
      },
    };
  }

  // دوال الإرسال (يجب تنفيذها حسب مزود الخدمة)
  private async sendEmail(email: string, subject: string, message: string, invoiceId?: string): Promise<void> {
    console.log('Email to', email, ':', subject, '-', message);
    // هنا يمكن إرسال الفاتورة كمرفق PDF
  }

  private async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    console.log('WhatsApp message to', phone, ':', message);
  }

  private async sendSMSMessage(phone: string, message: string): Promise<void> {
    console.log('SMS message to', phone, ':', message);
  }

  // إنشاء PDF للفاتورة
  async generateInvoicePDF(invoiceId: string): Promise<string> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      
      // هنا يمكن استخدام مكتبة مثل PDFKit لإنشاء PDF
      const pdfPath = `/invoices/invoice_${invoice.invoiceNumber}.pdf`;
      
      console.log(`Generating PDF invoice: ${pdfPath}`);
      
      return pdfPath;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
