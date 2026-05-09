import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly phoneNumberId: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // WhatsApp Business API Configuration
    this.apiKey = this.configService.get('WHATSAPP_API_KEY') || '';
    this.apiUrl = this.configService.get('WHATSAPP_API_URL') || 'https://graph.facebook.com/v18.0';
    this.phoneNumberId = this.configService.get('WHATSAPP_PHONE_NUMBER_ID') || '';
  }

  /**
   * Send WhatsApp message
   * @param to Recipient phone number (with country code, e.g., +966501234567)
   * @param message Message content
   * @param template Optional template name
   * @param templateVariables Variables for template
   */
  async sendMessage(
    to: string,
    message: string,
    template?: string,
    templateVariables?: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Remove any non-digit characters except + at the start
      const cleanedPhone = to.replace(/[^\d+]/g, '');

      if (!cleanedPhone || cleanedPhone.length < 10) {
        throw new Error('Invalid phone number');
      }

      let payload: any;
      let endpoint = `/${this.phoneNumberId}/messages`;

      if (template) {
        // Send template message
        payload = {
          messaging_product: 'whatsapp',
          to: cleanedPhone,
          type: 'template',
          template: {
            name: template,
            language: { code: 'ar' },
            components: templateVariables
              ? [
                  {
                    type: 'body',
                    parameters: Object.entries(templateVariables).map(([key, value]) => ({
                      type: 'text',
                      text: value,
                    })),
                  },
                ]
              : [],
          },
        };
      } else {
        // Send text message
        payload = {
          messaging_product: 'whatsapp',
          to: cleanedPhone,
          type: 'text',
          text: {
            body: message,
          },
        };
      }

      // Send to WhatsApp Business API
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send WhatsApp message');
      }

      const messageId = data.messages?.[0]?.id;

      // Log successful send
      await this.prisma.whatsAppLog.create({
        data: {
          phoneNumber: cleanedPhone,
          message: template ? `Template: ${template}` : message,
          status: 'SENT',
          messageId,
          sentAt: new Date(),
          templateUsed: template,
          templateVariables: templateVariables ? JSON.stringify(templateVariables) : null,
        },
      });

      this.logger.log(`WhatsApp message sent successfully to ${cleanedPhone}`);
      return { success: true, messageId };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);

      // Log failed send
      await this.prisma.whatsAppLog.create({
        data: {
          phoneNumber: to,
          message: template ? `Template: ${template}` : message,
          status: 'FAILED',
          errorMessage: error.message,
          sentAt: new Date(),
          templateUsed: template,
          templateVariables: templateVariables ? JSON.stringify(templateVariables) : null,
        },
      }).catch((err) => {
        this.logger.error(`Failed to log WhatsApp error: ${err.message}`);
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking confirmation via WhatsApp
   */
  async sendBookingConfirmation(
    phoneNumber: string,
    customerName: string,
    bookingNumber: string,
    scheduledDate: Date,
    garageName: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `
🚗 تأكيد حجز جديد

مرحباً ${customerName}،

تم تأكيد حجزك بنجاح:
📋 رقم الحجز: ${bookingNumber}
📅 التاريخ: ${scheduledDate.toLocaleDateString('ar-SA')}
🏢 الكراج: ${garageName}

نحن بانتظارك في الموعد المحدد.

شكراً لاختيارك خدماتنا.
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Send booking reminder via WhatsApp
   */
  async sendBookingReminder(
    phoneNumber: string,
    customerName: string,
    bookingNumber: string,
    scheduledDate: Date,
    garageName: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `
⏰ تذكير بموعد الحجز

مرحباً ${customerName}،

هذا تذكير بموعد حجزك القادم:
📋 رقم الحجز: ${bookingNumber}
📅 التاريخ: ${scheduledDate.toLocaleDateString('ar-SA')}
🏢 الكراج: ${garageName}

يرجى الحضور في الموعد المحدد.

شكراً لك.
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Send service completion notification via WhatsApp
   */
  async sendServiceCompletion(
    phoneNumber: string,
    customerName: string,
    bookingNumber: string,
    serviceName: string,
    totalAmount: number,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `
✅ اكتمال الخدمة

مرحباً ${customerName}،

تم إكمال خدمة سيارتك بنجاح:
📋 رقم الحجز: ${bookingNumber}
🔧 الخدمة: ${serviceName}
💰 المبلغ الإجمالي: ${totalAmount.toLocaleString('ar-SA')} ر.س

سيارتك جاهزة للاستلام.

شكراً لك.
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Send invoice notification via WhatsApp
   */
  async sendInvoiceNotification(
    phoneNumber: string,
    customerName: string,
    invoiceNumber: string,
    totalAmount: number,
    dueDate: Date,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `
📄 فاتورة جديدة

مرحباً ${customerName}،

تم إصدار فاتورة جديدة:
📋 رقم الفاتورة: ${invoiceNumber}
💰 المبلغ: ${totalAmount.toLocaleString('ar-SA')} ر.س
📅 تاريخ الاستحقاق: ${dueDate.toLocaleDateString('ar-SA')}

يرجى تسديد المبلغ في الموعد المحدد.

شكراً لك.
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Send additional service approval request via WhatsApp
   */
  async sendAdditionalServiceRequest(
    phoneNumber: string,
    customerName: string,
    bookingNumber: string,
    serviceName: string,
    price: number,
    approvalDeadline: Date,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `
🔔 طلب موافقة على خدمة إضافية

مرحباً ${customerName}،

تم اكتشاف حاجة لخدمة إضافية:
📋 رقم الحجز: ${bookingNumber}
🔧 الخدمة: ${serviceName}
💰 السعر: ${price.toLocaleString('ar-SA')} ر.س
⏰ الموعد النهائي للموافقة: ${approvalDeadline.toLocaleDateString('ar-SA')}

يرجى الموافقة أو الرفض من خلال رابط QR Code.

شكراً لك.
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Check WhatsApp message status
   */
  async checkMessageStatus(messageId: string): Promise<{ status: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/${messageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to check message status');
      }

      return { status: data.messaging_product || 'unknown' };
    } catch (error) {
      this.logger.error(`Failed to check WhatsApp message status: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Get message history for a phone number
   */
  async getMessageHistory(phoneNumber: string, limit = 50) {
    try {
      const cleanedPhone = phoneNumber.replace(/[^\d+]/g, '');

      const logs = await this.prisma.whatsAppLog.findMany({
        where: { phoneNumber: cleanedPhone },
        orderBy: { sentAt: 'desc' },
        take: limit,
      });

      return logs;
    } catch (error) {
      this.logger.error(`Failed to get WhatsApp message history: ${error.message}`);
      return [];
    }
  }

  /**
   * Get WhatsApp statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    try {
      const where: any = {};
      if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) where.sentAt.gte = startDate;
        if (endDate) where.sentAt.lte = endDate;
      }

      const totalSent = await this.prisma.whatsAppLog.count({ where: { ...where, status: 'SENT' } });
      const totalFailed = await this.prisma.whatsAppLog.count({ where: { ...where, status: 'FAILED' } });
      const successRate = totalSent + totalFailed > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0;

      return {
        totalSent,
        totalFailed,
        successRate: successRate.toFixed(2),
        period: { startDate, endDate },
      };
    } catch (error) {
      this.logger.error(`Failed to get WhatsApp statistics: ${error.message}`);
      return {
        totalSent: 0,
        totalFailed: 0,
        successRate: '0',
        period: { startDate, endDate },
      };
    }
  }
}
