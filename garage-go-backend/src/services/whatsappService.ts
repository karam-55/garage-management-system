declare const process: any;

export interface WhatsAppMessage {
  to: string; // Phone number
  message: string;
  template?: string;
  variables?: Record<string, string>;
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  private apiKey: string;
  private apiUrl: string;
  private enabled: boolean;

  private constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1';
    this.enabled = !!this.apiKey && process.env.WHATSAPP_ENABLED === 'true';
  }

  private log(message: string, data?: any) {
    console.log(`[WhatsAppService] ${message}`, data || '');
  }

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.enabled) {
      this.log('WhatsApp service is disabled. Message would be:', message);
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: message.to,
          message: message.message,
          template: message.template,
          variables: message.variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      this.log('WhatsApp message sent successfully', { to: message.to });
      return true;
    } catch (error) {
      this.log('Failed to send WhatsApp message', error);
      return false;
    }
  }

  // إرسال إشعار عند دخول السيارة للصيانة
  async sendVehicleEntryNotification(booking: any): Promise<boolean> {
    const message = `🚗 تم استلام سيارتك في ${booking.garage?.name}\n\nرقم الحجز: ${booking.id.slice(0, 8)}\nالسيارة: ${booking.vehicle?.make} ${booking.vehicle?.model} - ${booking.vehicle?.plate}\n\nسنقوم بالبدء في العمل قريباً. يمكنك متابعة حالة سيارتك عبر مسح رمز QR في الورقة.`;

    return this.sendMessage({
      to: booking.customer?.phone,
      message,
    });
  }

  // إرسال إشعار عند بدء الميكانيكي العمل
  async sendWorkStartedNotification(booking: any, mechanic: any): Promise<boolean> {
    const message = `🔧 تم البدء بالعمل على سيارتك\n\nرقم الحجز: ${booking.id.slice(0, 8)}\nالفني: ${mechanic?.fullName}\nالسيارة: ${booking.vehicle?.make} ${booking.vehicle?.model} - ${booking.vehicle?.plate}\n\nسنقوم بإعلامك عند الانتهاء من كل خدمة.`;

    return this.sendMessage({
      to: booking.customer?.phone,
      message,
    });
  }

  // إرسال إشعار عند الانتهاء من خدمة
  async sendServiceCompletedNotification(booking: any, serviceName: string): Promise<boolean> {
    const message = `✅ تم الانتهاء من الخدمة: ${serviceName}\n\nرقم الحجز: ${booking.id.slice(0, 8)}\nالسيارة: ${booking.vehicle?.make} ${booking.vehicle?.model} - ${booking.vehicle?.plate}\n\nمتابعة العمل على السيارة...`;

    return this.sendMessage({
      to: booking.customer?.phone,
      message,
    });
  }

  // إرسال إشعار عند اكتشاف عطل جديد
  async sendNewIssueNotification(booking: any, issue: string, options: string[]): Promise<boolean> {
    const message = `⚠️ تم اكتشاف عطل جديد\n\nرقم الحجز: ${booking.id.slice(0, 8)}\nالسيارة: ${booking.vehicle?.make} ${booking.vehicle?.model} - ${booking.vehicle?.plate}\n\nالعطل: ${issue}\n\nالخيارات المتاحة:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nيرجى الرد برقم الخيار المطلوب.`;

    return this.sendMessage({
      to: booking.customer?.phone,
      message,
    });
  }

  // إرسال إشعار عند انتهاء الصيانة
  async sendMaintenanceCompletedNotification(booking: any, totalCost: number): Promise<boolean> {
    const message = `🎉 تم الانتهاء من صيانة سيارتك\n\nرقم الحجز: ${booking.id.slice(0, 8)}\nالسيارة: ${booking.vehicle?.make} ${booking.vehicle?.model} - ${booking.vehicle?.plate}\n\nالتكلفة الإجمالية: ${totalCost} ر.س\n\nسيارتك جاهزة للاستلام من ${booking.garage?.name}\n📍 ${booking.garage?.address}\n📞 ${booking.garage?.phone}`;

    return this.sendMessage({
      to: booking.customer?.phone,
      message,
    });
  }

  // إرسال الفاتورة
  async sendInvoiceNotification(booking: any, invoice: any): Promise<boolean> {
    const message = `🧾 فاتورة صيانة سيارتك\n\nرقم الحجز: ${booking.id.slice(0, 8)}\nرقم الفاتورة: ${invoice.id.slice(0, 8)}\nالسيارة: ${booking.vehicle?.make} ${booking.vehicle?.model} - ${booking.vehicle?.plate}\n\nالتكلفة الإجمالية: ${invoice.total} ر.س\n\nيمكنك الدفع عند الاستلام من ${booking.garage?.name}`;

    return this.sendMessage({
      to: booking.customer?.phone,
      message,
    });
  }

  // إرسال تذكير بالحجز
  async sendBookingReminder(booking: any): Promise<boolean> {
    const message = `📅 تذكير بموعد الحجز\n\nرقم الحجز: ${booking.id.slice(0, 8)}\nالتاريخ: ${new Date(booking.scheduledAt).toLocaleDateString('ar-SA')}\nالوقت: ${new Date(booking.scheduledAt).toLocaleTimeString('ar-SA')}\nالكراج: ${booking.garage?.name}\n📍 ${booking.garage?.address}\n\nننتظرك في الموعد المحدد.`;

    return this.sendMessage({
      to: booking.customer?.phone,
      message,
    });
  }
}

export default WhatsAppService;
