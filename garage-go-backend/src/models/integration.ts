import { PrismaClient } from '@prisma/client';
import { jobCardService } from './jobCard';
import { inventoryService } from './inventory';
import { laborPricingService } from './laborPricing';
import { invoiceService } from './invoice';

const prisma = new PrismaClient();

export interface WorkflowTriggerData {
  triggerType: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'JOB_CARD_CREATED' | 'JOB_CARD_COMPLETED' | 'INSPECTION_COMPLETED' | 'PAYMENT_RECEIVED';
  referenceId: string;
  data: any;
  timestamp: Date;
}

export interface AutomationRuleData {
  name: string;
  description: string;
  trigger: string;
  conditions: Array<{
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN';
    value: any;
  }>;
  actions: Array<{
    type: 'SEND_NOTIFICATION' | 'CREATE_INVOICE' | 'UPDATE_INVENTORY' | 'ASSIGN_TECHNICIAN' | 'SEND_EMAIL' | 'CREATE_FOLLOW_UP';
    parameters: any;
  }>;
  isActive: boolean;
  priority: number;
}

export class IntegrationService {
  // معالجة إنشاء حجز جديد
  async handleBookingCreated(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          vehicle: true,
          service: true,
          garage: true,
        },
      });

      if (!booking) return;

      // 1. إرسال تأكيد للعميل
      await this.sendBookingConfirmation(booking);

      // 2. التحقق من توفر القطع المطلوبة
      await this.checkPartsAvailability(booking);

      // 3. إنشاء تنبيه للموظفين
      await this.createStaffNotification(booking, 'NEW_BOOKING');

      // 4. تحديث إحصائيات الورشة
      await this.updateGarageStats(booking.garageId, 'BOOKING_CREATED');

      // 5. التحقق من قواعد الأتمتة
      await this.processAutomationRules({
        triggerType: 'BOOKING_CREATED',
        referenceId: bookingId,
        data: booking,
        timestamp: new Date(),
      });

    } catch (error) {
      // Log error - implement proper logging
    }
  }

  // معالجة تأكيد الحجز
  async handleBookingConfirmed(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          vehicle: true,
          service: true,
        },
      });

      if (!booking) return;

      // 1. إنشاء بطاقة عمل تلقائياً
      const jobCard = await jobCardService.createJobCardFromBooking(bookingId);

      // 2. البحث عن فني متاح
      const availableTechnicians = await laborPricingService.getAvailableTechnicians(
        booking.serviceId,
        booking.scheduledAt,
        booking.scheduledAt.toTimeString().slice(0, 5),
        booking.service.duration || 60
      );

      // 3. تعيين فني إذا كان متاحاً
      if (availableTechnicians.length > 0) {
        await jobCardService.updateJobCard(jobCard.id, {
          assignedTechnicianId: availableTechnicians[0].id,
        });
      }

      // 4. إرسال إشعار للفني المعين
      if (availableTechnicians.length > 0) {
        await this.notifyTechnician(availableTechnicians[0].id, jobCard);
      }

      // 5. حجز القطع المطلوبة من المخزون
      await this.reserveParts(booking);

    } catch (error) {
      console.error('Error handling booking confirmed:', error);
    }
  }

  // معالجة إكمال بطاقة العمل
  async handleJobCardCompleted(jobCardId: string): Promise<void> {
    try {
      const jobCard = await jobCardService.getJobCardById(jobCardId);

      // 1. إنشاء الفاتورة تلقائياً
      const invoice = await invoiceService.createFromJobCard(jobCardId);

      // 2. تحديث المخزون (خصم القطع المستخدمة)
      await this.updateInventoryFromJobCard(jobCard);

      // 3. حساب مكافآت الفني
      await this.calculateTechnicianCommission(jobCard);

      // 4. إرسال إشعار للعميل بجاهزية السيارة
      await this.notifyVehicleReady(jobCard);

      // 5. تحديث إحصائيات الأداء
      await this.updatePerformanceStats(jobCard);

      // 6. إنشاء متابعة إذا لزم الأمر
      if (jobCard.followUpRequired) {
        await this.createFollowUpTask(jobCard);
      }

      // 7. معالجة قواعد الأتمتة
      await this.processAutomationRules({
        triggerType: 'JOB_CARD_COMPLETED',
        referenceId: jobCardId,
        data: jobCard,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Error handling job card completed:', error);
    }
  }

  // معالجة استلام الدفعة
  async handlePaymentReceived(paymentId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          invoice: {
            include: {
              customer: true,
              jobCard: true,
            },
          },
        },
      });

      if (!payment) return;

      // 1. إرسال إشعار استلام الدفعة
      await this.sendPaymentConfirmation(payment);

      // 2. تحديث حالة الفاتورة
      await (invoiceService as any).updateInvoicePaymentStatus(payment.invoiceId);

      // 3. تحديث إحصائيات المبيعات
      await this.updateSalesStats(payment);

      // 4. التحقق من وجود دفعة متبقية
      const invoice = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        include: {
          payments: {
            where: { status: 'COMPLETED' },
          },
        },
      });

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        if (totalPaid >= invoice.total) {
          // الفاتورة مدفوعة بالكامل
          await this.handleFullyPaidInvoice(invoice.id);
        }
      }

    } catch (error) {
      console.error('Error handling payment received:', error);
    }
  }

  // إرسال تأكيد الحجز
  private async sendBookingConfirmation(booking: any): Promise<void> {
    const message = `
      تم تأكيد حجزكم رقم: ${booking.id}
      
      التاريخ: ${booking.scheduledAt.toLocaleDateString('ar-SA')}
      الوقت: ${booking.scheduledAt.toLocaleTimeString('ar-SA')}
      الخدمة: ${booking.service.title}
      
      نحن في انتظاركم في Garage Go
    `;

    // إرسال عبر البريد الإلكتروني
    if (booking.customer.email) {
      console.log(`Email to ${booking.customer.email}: ${message}`);
    }

    // إرسال عبر WhatsApp
    if (booking.customer.phone) {
      console.log(`WhatsApp to ${booking.customer.phone}: ${message}`);
    }
  }

  // التحقق من توفر القطع
  private async checkPartsAvailability(booking: any): Promise<void> {
    // الحصول على القطع المطلوبة للخدمة
    const requiredParts = await prisma.servicePart.findMany({
      where: { serviceId: booking.serviceId },
      include: { part: true },
    });

    const unavailableParts = [];

    for (const servicePart of requiredParts) {
      if (servicePart.part.currentStock < servicePart.quantity) {
        unavailableParts.push({
          part: servicePart.part.name,
          required: servicePart.quantity,
          available: servicePart.part.currentStock,
        });
      }
    }

    if (unavailableParts.length > 0) {
      // إنشاء تنبيه بضرورة طلب القطع
      await this.createInventoryAlert(unavailableParts, booking.garageId);
    }
  }

  // إنشاء إشعار للموظفين
  private async createStaffNotification(booking: any, type: string): Promise<void> {
    await prisma.notification.create({
      data: {
        type,
        title: 'حجز جديد',
        message: `حجز جديد للعميل ${booking.customer.fullName} - ${booking.service.title}`,
        referenceId: booking.id,
        referenceType: 'BOOKING',
        garageId: booking.garageId,
        createdAt: new Date(),
      },
    });
  }

  // تحديث إحصائيات الورشة
  private async updateGarageStats(garageId: string, event: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await prisma.garageStats.findFirst({
      where: {
        garageId,
        date: today,
      },
    });

    if (stats) {
      const updateData: any = {};
      switch (event) {
        case 'BOOKING_CREATED':
          updateData.newBookings = { increment: 1 };
          break;
        case 'JOB_CARD_COMPLETED':
          updateData.completedJobs = { increment: 1 };
          break;
        case 'PAYMENT_RECEIVED':
          updateData.revenue = { increment: 1 }; // سيتم تحديث القيمة لاحقاً
          break;
      }

      await prisma.garageStats.update({
        where: { id: stats.id },
        data: updateData,
      });
    } else {
      // إنشاء سجل إحصائيات جديد
      await prisma.garageStats.create({
        data: {
          garageId,
          date: today,
          newBookings: event === 'BOOKING_CREATED' ? 1 : 0,
          completedJobs: event === 'JOB_CARD_COMPLETED' ? 1 : 0,
          revenue: 0,
        },
      });
    }
  }

  // معالجة قواعد الأتمتة
  private async processAutomationRules(trigger: WorkflowTriggerData): Promise<void> {
    const rules = await prisma.automationRule.findMany({
      where: {
        trigger: trigger.triggerType,
        isActive: true,
      },
      orderBy: { priority: 'asc' },
    });

    for (const rule of rules) {
      const conditionsMet = await this.evaluateConditions(rule.conditions, trigger.data);
      
      if (conditionsMet) {
        await this.executeActions(rule.actions, trigger);
      }
    }
  }

  // تقييم الشروط
  private async evaluateConditions(conditions: any[], data: any): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(data, condition.field);
      
      let conditionMet = false;
      switch (condition.operator) {
        case 'EQUALS':
          conditionMet = fieldValue === condition.value;
          break;
        case 'NOT_EQUALS':
          conditionMet = fieldValue !== condition.value;
          break;
        case 'GREATER_THAN':
          conditionMet = Number(fieldValue) > Number(condition.value);
          break;
        case 'LESS_THAN':
          conditionMet = Number(fieldValue) < Number(condition.value);
          break;
        case 'CONTAINS':
          conditionMet = String(fieldValue).includes(String(condition.value));
          break;
        case 'IN':
          conditionMet = Array.isArray(condition.value) && condition.value.includes(fieldValue);
          break;
      }

      if (!conditionMet) {
        return false;
      }
    }
    return true;
  }

  // الحصول على قيمة متداخلة
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // تنفيذ الإجراءات
  private async executeActions(actions: any[], trigger: WorkflowTriggerData): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'SEND_NOTIFICATION':
          await this.sendAutomatedNotification(action.parameters, trigger);
          break;
        case 'CREATE_INVOICE':
          await this.createAutomatedInvoice(action.parameters, trigger);
          break;
        case 'UPDATE_INVENTORY':
          await this.updateAutomatedInventory(action.parameters, trigger);
          break;
        case 'ASSIGN_TECHNICIAN':
          await this.assignAutomatedTechnician(action.parameters, trigger);
          break;
        case 'SEND_EMAIL':
          await this.sendAutomatedEmail(action.parameters, trigger);
          break;
        case 'CREATE_FOLLOW_UP':
          await this.createAutomatedFollowUp(action.parameters, trigger);
          break;
      }
    }
  }

  // إرسال إشعار تلقائي
  private async sendAutomatedNotification(parameters: any, trigger: WorkflowTriggerData): Promise<void> {
    await prisma.notification.create({
      data: {
        type: 'AUTOMATION',
        title: parameters.title,
        message: parameters.message,
        referenceId: trigger.referenceId,
        referenceType: trigger.triggerType,
        createdAt: new Date(),
      },
    });
  }

  // إنشاء فاتورة تلقائية
  private async createAutomatedInvoice(parameters: any, trigger: WorkflowTriggerData): Promise<void> {
    if (trigger.triggerType === 'JOB_CARD_COMPLETED') {
      await invoiceService.createFromJobCard(trigger.referenceId, parameters.customData);
    }
  }

  // تحديث المخزون تلقائياً
  private async updateAutomatedInventory(parameters: any, trigger: WorkflowTriggerData): Promise<void> {
    // تنفيذ منطق تحديث المخزون
    console.log('Updating inventory automatically:', parameters, trigger);
  }

  // تعيين فني تلقائياً
  private async assignAutomatedTechnician(parameters: any, trigger: WorkflowTriggerData): Promise<void> {
    // تنفيذ منطق تعيين الفني
    console.log('Assigning technician automatically:', parameters, trigger);
  }

  // إرسال بريد إلكتروني تلقائي
  private async sendAutomatedEmail(parameters: any, trigger: WorkflowTriggerData): Promise<void> {
    console.log('Sending automated email:', parameters, trigger);
  }

  // إنشاء متابعة تلقائية
  private async createAutomatedFollowUp(parameters: any, trigger: WorkflowTriggerData): Promise<void> {
    await prisma.followUpTask.create({
      data: {
        customerId: parameters.customerId,
        title: parameters.title,
        description: parameters.description,
        dueDate: new Date(parameters.dueDate),
        priority: parameters.priority || 'MEDIUM',
        status: 'PENDING',
        createdAt: new Date(),
      },
    });
  }

  // دوال مساعدة أخرى
  private async notifyTechnician(technicianId: string, jobCard: any): Promise<void> {
    console.log(`Notifying technician ${technicianId} about job card ${jobCard.id}`);
  }

  private async reserveParts(booking: any): Promise<void> {
    console.log(`Reserving parts for booking ${booking.id}`);
  }

  private async updateInventoryFromJobCard(jobCard: any): Promise<void> {
    // تحديث المخزون بناءً على القطع المستخدمة
    for (const partUsed of jobCard.partsUsed) {
      await inventoryService.updateStock(
        partUsed.partId,
        -partUsed.quantity,
        'SALE',
        {
          referenceId: jobCard.id,
          referenceType: 'JOB_CARD',
          notes: `Parts used in job card ${jobCard.jobNumber}`,
        }
      );
    }
  }

  private async calculateTechnicianCommission(jobCard: any): Promise<void> {
    if (!jobCard.assignedTechnicianId) return;

    const technician = await prisma.technician.findUnique({
      where: { id: jobCard.assignedTechnicianId },
    });

    if (technician?.commissionRate) {
      const commission = (jobCard.actualCost || 0) * (technician.commissionRate / 100);
      
      await prisma.commissionRecord.create({
        data: {
          technicianId: jobCard.assignedTechnicianId,
          jobCardId: jobCard.id,
          commissionRate: technician.commissionRate,
          totalAmount: jobCard.actualCost || 0,
          commissionAmount: commission,
          status: 'PENDING',
          createdAt: new Date(),
        },
      });
    }
  }

  private async notifyVehicleReady(jobCard: any): Promise<void> {
    const message = `
      سيارتكم جاهزة للاستلام!
      
      رقم العمل: ${jobCard.jobNumber}
      التكلفة الإجمالية: ${jobCard.actualCost} ريال
      
      Garage Go
    `;

    if (jobCard.booking?.customer?.email) {
      console.log(`Email to ${jobCard.booking.customer.email}: ${message}`);
    }
  }

  private async updatePerformanceStats(jobCard: any): Promise<void> {
    // تحديث إحصائيات أداء الفني والورشة
    console.log(`Updating performance stats for job card ${jobCard.id}`);
  }

  private async createFollowUpTask(jobCard: any): Promise<void> {
    if (jobCard.followUpDate) {
      await prisma.followUpTask.create({
        data: {
          customerId: jobCard.booking?.customerId,
          jobCardId: jobCard.id,
          title: `متابعة للعمل ${jobCard.jobNumber}`,
          description: jobCard.internalNotes || 'متابعة دورية بعد الصيانة',
          dueDate: jobCard.followUpDate,
          priority: 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date(),
        },
      });
    }
  }

  private async handleFullyPaidInvoice(invoiceId: string): Promise<void> {
    // معالجة الفاتورة المدفوعة بالكامل
    console.log(`Handling fully paid invoice ${invoiceId}`);
  }

  private async sendPaymentConfirmation(payment: any): Promise<void> {
    const message = `
      تم استلام دفعتكم بنجاح!
      
      رقم الفاتورة: ${payment.invoice.invoiceNumber}
      المبلغ: ${payment.amount} ريال
      تاريخ الدفع: ${payment.paymentDate.toLocaleDateString('ar-SA')}
      
      شكراً لثقتكم ب Garage Go
    `;

    if (payment.invoice.customer?.email) {
      console.log(`Email to ${payment.invoice.customer.email}: ${message}`);
    }
  }

  private async updateSalesStats(payment: any): Promise<void> {
    // تحديث إحصائيات المبيعات
    console.log(`Updating sales stats for payment ${payment.id}`);
  }

  private async createInventoryAlert(parts: any[], garageId: string): Promise<void> {
    await prisma.inventoryAlert.create({
      data: {
        garageId,
        type: 'LOW_STOCK',
        title: 'نقص في المخزون',
        message: `القطع التالية تحتاج إعادة طلب: ${parts.map(p => p.part).join(', ')}`,
        details: parts,
        status: 'PENDING',
        createdAt: new Date(),
      },
    });
  }
}

export const integrationService = new IntegrationService();
