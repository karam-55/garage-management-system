import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BookingData {
  customerId: string;
  vehicleId: string;
  serviceType: 'WORKSHOP' | 'PICKUP_DROP' | 'FLEET' | 'PACKAGE';
  serviceId?: string;
  scheduledDate: Date;
  scheduledTime: string;
  estimatedDuration: number;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  source: 'WEBSITE' | 'PHONE' | 'WALK_IN' | 'MOBILE_APP';
  assignedTechnicianId?: string;
  assignedBayId?: string;
  packageId?: string;
  fleetId?: string;
  pickupAddress?: {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };
  dropoffAddress?: {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };
  contactPreferences: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    phone: boolean;
  };
  reminderSettings: {
    dayBefore: boolean;
    hourBefore: boolean;
    customTime?: number; // minutes before appointment
  };
}

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };
  preferredContact: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PHONE';
  notes?: string;
  isFleetCustomer?: boolean;
  fleetId?: string;
  loyaltyPoints?: number;
  membershipTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface VehicleData {
  customerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  fuelType?: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'LPG';
  transmission?: 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'DCT';
  engineSize?: string;
  bodyType?: 'SEDAN' | 'SUV' | 'HATCHBACK' | 'COUPE' | 'CONVERTIBLE' | 'TRUCK' | 'VAN';
  notes?: string;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  serviceHistory?: Array<{
    date: Date;
    type: string;
    mileage: number;
    cost: number;
    notes?: string;
  }>;
  customFields?: Record<string, any>;
}

export class BookingService {
  // إنشاء حجز جديد
  async createBooking(bookingData: BookingData): Promise<any> {
    try {
      // التحقق من توفر الموعد
      const isAvailable = await this.checkAvailability(
        bookingData.scheduledDate,
        bookingData.scheduledTime,
        bookingData.estimatedDuration,
        bookingData.assignedTechnicianId,
        bookingData.assignedBayId
      );

      if (!isAvailable) {
        throw new Error('الوقت المطلوب غير متاح');
      }

      // إنشاء الحجز
      const booking = await prisma.booking.create({
        data: {
          ...bookingData,
          scheduledDate: new Date(bookingData.scheduledDate),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          customer: true,
          vehicle: true,
          service: true,
          technician: true,
          bay: true,
        },
      });

      // إرسال تأكيد الحجز
      await this.sendBookingConfirmation(booking);

      // جدولة التذكيرات
      await this.scheduleReminders(booking);

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // التحقق من توفر الموعد
  async checkAvailability(
    date: Date,
    time: string,
    duration: number,
    technicianId?: string,
    bayId?: string
  ): Promise<boolean> {
    try {
      const startTime = new Date(`${date.toISOString().split('T')[0]}T${time}`);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      // التحقق من توالف الفني
      if (technicianId) {
        const technicianBookings = await prisma.booking.findMany({
          where: {
            assignedTechnicianId: technicianId,
            scheduledDate: {
              gte: startTime,
              lt: endTime,
            },
            status: {
              in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
            },
          },
        });

        if (technicianBookings.length > 0) {
          return false;
        }
      }

      // التحقق من توفر مكان العمل (Bay)
      if (bayId) {
        const bayBookings = await prisma.booking.findMany({
          where: {
            assignedBayId: bayId,
            scheduledDate: {
              gte: startTime,
              lt: endTime,
            },
            status: {
              in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
            },
          },
        });

        if (bayBookings.length > 0) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // الحصول على المواعيد المتاحة
  async getAvailableSlots(
    date: Date,
    serviceTypeId?: string,
    technicianId?: string
  ): Promise<Array<{ time: string; available: boolean }>> {
    try {
      const workingHours = await this.getWorkingHours(date);
      const slots: Array<{ time: string; available: boolean }> = [];

      for (const hour of workingHours) {
        const isAvailable = await this.checkAvailability(
          date,
          hour,
          60, // ساعة واحدة كافتراضي
          technicianId
        );

        slots.push({
          time: hour,
          available: isAvailable,
        });
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  // الحصول على ساعات العمل
  private async getWorkingHours(date: Date): Promise<string[]> {
    // يمكن تعديل هذا ليعتمد على إعدادات الورشة
    const dayOfWeek = date.getDay();
    
    // أيام الأسبوع (0 = الأحد، 6 = السبت)
    const workingHours = {
      0: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], // الأحد
      1: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], // الإثنين
      2: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], // الثلاثاء
      3: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], // الأربعاء
      4: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], // الخميس
      5: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], // الجمعة
      6: [], // السبت (مغلق)
    };

    return workingHours[dayOfWeek] || [];
  }

  // إرسال تأكيد الحجز
  private async sendBookingConfirmation(booking: any): Promise<void> {
    try {
      const { customer, vehicle, service } = booking;

      const message = `
        تأكيد حجزك في Garage Go
        
        التاريخ: ${booking.scheduledDate.toLocaleDateString('ar-SA')}
        الوقت: ${booking.scheduledTime}
        الخدمة: ${service?.name || 'عام'}
        السيارة: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})
        
        للتعديل أو الإلغاء: [رابط التعديل]
        
        شكراً لاختيارك Garage Go!
      `;

      // إرسال عبر القنوات المفضلة للعميل
      if (customer.preferredContact === 'WHATSAPP' && booking.contactPreferences.whatsapp) {
        await this.sendWhatsAppMessage(customer.phone, message);
      }

      if (booking.contactPreferences.sms) {
        await this.sendSMSMessage(customer.phone, message);
      }

      if (booking.contactPreferences.email && customer.email) {
        await this.sendEmail(customer.email, 'تأكيد حجز - Garage Go', message);
      }

    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  }

  // جدولة التذكيرات
  private async scheduleReminders(booking: any): Promise<void> {
    try {
      const { scheduledDate, reminderSettings, customer } = booking;

      if (reminderSettings.dayBefore) {
        const dayBeforeDate = new Date(scheduledDate);
        dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);
        dayBeforeDate.setHours(9, 0, 0, 0);

        // جدولة تذكير اليوم السابق
        await this.scheduleReminder(booking.id, dayBeforeDate, 'DAY_BEFORE');
      }

      if (reminderSettings.hourBefore) {
        const hourBeforeDate = new Date(scheduledDate);
        hourBeforeDate.setHours(hourBeforeDate.getHours() - 1);

        // جدولة تذكير الساعة السابقة
        await this.scheduleReminder(booking.id, hourBeforeDate, 'HOUR_BEFORE');
      }

      if (reminderSettings.customTime) {
        const customDate = new Date(scheduledDate);
        customDate.setMinutes(customDate.getMinutes() - reminderSettings.customTime);

        await this.scheduleReminder(booking.id, customDate, 'CUSTOM');
      }
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  // جدولة تذكير محدد
  private async scheduleReminder(
    bookingId: string,
    reminderDate: Date,
    type: string
  ): Promise<void> {
    // هنا يمكن استخدام نظام مثل Bull Queue أو Agenda.js
    // للتبسيط، سنحفظ في قاعدة البيانات
    await prisma.reminder.create({
      data: {
        bookingId,
        scheduledDate: reminderDate,
        type,
        status: 'SCHEDULED',
        createdAt: new Date(),
      },
    });
  }

  // الحصول على قائمة الحجوزات
  async getBookings(filters?: {
    customerId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    technicianId?: string;
  }): Promise<any[]> {
    try {
      const where: any = {};

      if (filters?.customerId) {
        where.customerId = filters.customerId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.scheduledDate = {};
        if (filters.dateFrom) {
          where.scheduledDate.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.scheduledDate.lte = filters.dateTo;
        }
      }

      if (filters?.technicianId) {
        where.assignedTechnicianId = filters.technicianId;
      }

      return await prisma.booking.findMany({
        where,
        include: {
          customer: true,
          vehicle: true,
          service: true,
          technician: true,
          bay: true,
        },
        orderBy: {
          scheduledDate: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  // تحديث حالة الحجز
  async updateBookingStatus(
    bookingId: string,
    status: string,
    notes?: string
  ): Promise<any> {
    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status,
          notes,
          updatedAt: new Date(),
        },
        include: {
          customer: true,
          vehicle: true,
          service: true,
        },
      });

      // إرسال إشعار تحديث الحالة
      await this.sendStatusUpdate(booking, status);

      return booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // إرسال تحديث الحالة
  private async sendStatusUpdate(booking: any, status: string): Promise<void> {
    try {
      const { customer, vehicle, service } = booking;

      const statusMessages = {
        CONFIRMED: 'تم تأكيد حجزك',
        IN_PROGRESS: 'سيارتك قيد الصيانة الآن',
        COMPLETED: 'تم الانتهاء من صيانة سيارتك',
        CANCELLED: 'تم إلغاء حجزك',
      };

      const message = `
        ${statusMessages[status] || 'تحديث حالة حجزك'}
        
        التاريخ: ${booking.scheduledDate.toLocaleDateString('ar-SA')}
        الوقت: ${booking.scheduledTime}
        الخدمة: ${service?.name || 'عام'}
        السيارة: ${vehicle.make} ${vehicle.model}
        
        Garage Go
      `;

      // إرسال عبر القنوات المناسبة
      if (customer.preferredContact === 'WHATSAPP') {
        await this.sendWhatsAppMessage(customer.phone, message);
      }

      if (booking.contactPreferences.sms) {
        await this.sendSMSMessage(customer.phone, message);
      }
    } catch (error) {
      console.error('Error sending status update:', error);
    }
  }

  // دوال مساعدة للإرسال (يجب تنفيذها حسب مزود الخدمة)
  private async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    // تنفيذ إرسال واتساب (Twilio, WhatsApp Business API, etc.)
    console.log('WhatsApp message to', phone, ':', message);
  }

  private async sendSMSMessage(phone: string, message: string): Promise<void> {
    // تنفيذ إرسال رسائل نصية (Twilio, etc.)
    console.log('SMS message to', phone, ':', message);
  }

  private async sendEmail(email: string, subject: string, message: string): Promise<void> {
    // تنفيذ إرسال بريد إلكتروني (Nodemailer, SendGrid, etc.)
    console.log('Email to', email, ':', subject, '-', message);
  }
}

export const bookingService = new BookingService();
