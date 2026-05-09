import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface JobCardData {
  bookingId: string;
  jobNumber: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  customerComplaint?: string;
  technicianNotes?: string;
  estimatedDuration: number;
  actualDuration?: number;
  estimatedCost: number;
  actualCost?: number;
  assignedTechnicianId?: string;
  assignedBayId?: string;
  startedAt?: Date;
  completedAt?: Date;
  images?: string[];
  videos?: string[];
  customerApproval?: {
    approved: boolean;
    approvedAt?: Date;
    approvedBy?: string;
    notes?: string;
  };
  internalNotes?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  warrantyInfo?: {
    warrantyPeriod: number;
    warrantyType: string;
    coveredItems: string[];
  };
}

export interface JobItemData {
  jobCardId: string;
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  estimatedTime: number;
  actualTime?: number;
  technicianId?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface PartUsedData {
  jobCardId: string;
  partId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  serialNumber?: string;
  warrantyPeriod?: number;
  notes?: string;
}

export interface TimeTrackingData {
  jobCardId: string;
  technicianId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activity: string;
  notes?: string;
}

export class JobCardService {
  // إنشاء بطاقة عمل جديدة (تلقائياً من الحجز)
  async createJobCardFromBooking(bookingId: string): Promise<any> {
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

      if (!booking) {
        throw new Error('Booking not found');
      }

      // إنشاء رقم بطاقة العمل فريد
      const jobNumber = await this.generateJobNumber(booking.garageId);

      const jobCard = await prisma.jobCard.create({
        data: {
          bookingId,
          jobNumber,
          status: 'OPEN',
          priority: this.determinePriority(booking),
          estimatedDuration: booking.service?.duration || 60,
          estimatedCost: booking.service?.price || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          booking: {
            include: {
              customer: true,
              vehicle: true,
              service: true,
            },
          },
          assignedTechnician: true,
          assignedBay: true,
          jobItems: true,
          partsUsed: true,
          timeTracking: true,
        },
      });

      // إنشاء عناصر العمل الأساسية بناءً على الخدمة
      await this.createInitialJobItems(jobCard.id, booking.serviceId);

      return jobCard;
    } catch (error) {
      console.error('Error creating job card from booking:', error);
      throw error;
    }
  }

  // إنشاء بطاقة عمل يدوية (لزيارات بدون حجز مسبق)
  async createManualJobCard(jobCardData: JobCardData): Promise<any> {
    try {
      const jobNumber = await this.generateJobNumber('default');

      const jobCard = await prisma.jobCard.create({
        data: {
          ...jobCardData,
          jobNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          booking: {
            include: {
              customer: true,
              vehicle: true,
              service: true,
            },
          },
          assignedTechnician: true,
          assignedBay: true,
          jobItems: true,
          partsUsed: true,
          timeTracking: true,
        },
      });

      return jobCard;
    } catch (error) {
      console.error('Error creating manual job card:', error);
      throw error;
    }
  }

  // الحصول على قائمة بطاقات العمل
  async getJobCards(filters?: {
    status?: string;
    technicianId?: string;
    bayId?: string;
    dateFrom?: Date;
    dateTo?: string;
    priority?: string;
  }): Promise<any[]> {
    try {
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.technicianId) {
        where.assignedTechnicianId = filters.technicianId;
      }

      if (filters?.bayId) {
        where.assignedBayId = filters.bayId;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = new Date(filters.dateTo);
        }
      }

      if (filters?.priority) {
        where.priority = filters.priority;
      }

      return await prisma.jobCard.findMany({
        where,
        include: {
          booking: {
            include: {
              customer: true,
              vehicle: true,
              service: true,
            },
          },
          assignedTechnician: true,
          assignedBay: true,
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
          timeTracking: {
            include: {
              technician: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error getting job cards:', error);
      return [];
    }
  }

  // الحصول على بطاقة عمل محددة
  async getJobCardById(id: string): Promise<any> {
    try {
      const jobCard = await prisma.jobCard.findUnique({
        where: { id },
        include: {
          booking: {
            include: {
              customer: true,
              vehicle: true,
              service: true,
            },
          },
          assignedTechnician: true,
          assignedBay: true,
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
          timeTracking: {
            include: {
              technician: true,
            },
            orderBy: {
              startTime: 'desc',
            },
          },
        },
      });

      if (!jobCard) {
        throw new Error('Job card not found');
      }

      return jobCard;
    } catch (error) {
      console.error('Error getting job card by ID:', error);
      throw error;
    }
  }

  // تحديث بطاقة العمل
  async updateJobCard(id: string, updateData: Partial<JobCardData>): Promise<any> {
    try {
      const jobCard = await prisma.jobCard.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          booking: {
            include: {
              customer: true,
              vehicle: true,
              service: true,
            },
          },
          assignedTechnician: true,
          assignedBay: true,
          jobItems: true,
          partsUsed: true,
          timeTracking: true,
        },
      });

      // تحديث حالة الحجز المرتبط
      if (updateData.status) {
        await this.updateBookingStatusFromJobCard(jobCard.bookingId, updateData.status);
      }

      return jobCard;
    } catch (error) {
      console.error('Error updating job card:', error);
      throw error;
    }
  }

  // إضافة عنصر عمل جديد
  async addJobItem(jobCardId: string, jobItemData: Omit<JobItemData, 'jobCardId'>): Promise<any> {
    try {
      const jobItem = await prisma.jobItem.create({
        data: {
          ...jobItemData,
          jobCardId,
        },
        include: {
          service: true,
        },
      });

      // تحديث التكلفة الإجمالية لبطاقة العمل
      await this.updateJobCardTotals(jobCardId);

      return jobItem;
    } catch (error) {
      console.error('Error adding job item:', error);
      throw error;
    }
  }

  // تحديث عنصر عمل
  async updateJobItem(jobItemId: string, updateData: Partial<JobItemData>): Promise<any> {
    try {
      const jobItem = await prisma.jobItem.update({
        where: { id: jobItemId },
        data: updateData,
        include: {
          service: true,
        },
      });

      // تحديث التكلفة الإجمالية لبطاقة العمل
      await this.updateJobCardTotals(jobItem.jobCardId);

      return jobItem;
    } catch (error) {
      console.error('Error updating job item:', error);
      throw error;
    }
  }

  // إضافة قطعة غيار مستخدمة
  async addPartUsed(jobCardId: string, partUsedData: Omit<PartUsedData, 'jobCardId'>): Promise<any> {
    try {
      // التحقق من توفر القطعة في المخزون
      const part = await prisma.part.findUnique({
        where: { id: partUsedData.partId },
      });

      if (!part) {
        throw new Error('Part not found');
      }

      if (part.currentStock < partUsedData.quantity) {
        throw new Error('Insufficient stock for this part');
      }

      // إضافة القطعة المستخدمة
      const partUsed = await prisma.partUsed.create({
        data: {
          ...partUsedData,
          jobCardId,
        },
        include: {
          part: true,
        },
      });

      // خصم الكمية من المخزون
      await prisma.part.update({
        where: { id: partUsedData.partId },
        data: {
          currentStock: {
            decrement: partUsedData.quantity,
          },
        },
      });

      // تحديث التكلفة الإجمالية لبطاقة العمل
      await this.updateJobCardTotals(jobCardId);

      return partUsed;
    } catch (error) {
      console.error('Error adding part used:', error);
      throw error;
    }
  }

  // بدء تتبع الوقت
  async startTimeTracking(jobCardId: string, technicianId: string, activity: string, notes?: string): Promise<any> {
    try {
      const timeTracking = await prisma.timeTracking.create({
        data: {
          jobCardId,
          technicianId,
          startTime: new Date(),
          activity,
          notes,
        },
        include: {
          technician: true,
        },
      });

      // تحديث حالة بطاقة العمل إذا كانت مفتوحة
      await prisma.jobCard.update({
        where: { id: jobCardId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return timeTracking;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      throw error;
    }
  }

  // إنهاء تتبع الوقت
  async endTimeTracking(timeTrackingId: string): Promise<any> {
    try {
      const endTime = new Date();
      
      const timeTracking = await prisma.timeTracking.update({
        where: { id: timeTrackingId },
        data: {
          endTime,
          duration: Math.floor((endTime.getTime() - new Date().getTime()) / 1000 / 60), // بالدقائق
        },
        include: {
          technician: true,
        },
      });

      // تحديث المدة الإجمالية لبطاقة العمل
      await this.updateJobCardDuration(timeTracking.jobCardId);

      return timeTracking;
    } catch (error) {
      console.error('Error ending time tracking:', error);
      throw error;
    }
  }

  // الحصول على عرض سعر (Estimate)
  async generateEstimate(jobCardId: string): Promise<any> {
    try {
      const jobCard = await this.getJobCardById(jobCardId);

      const laborCost = jobCard.jobItems.reduce((total, item) => total + item.totalPrice, 0);
      const partsCost = jobCard.partsUsed.reduce((total, part) => total + part.totalPrice, 0);
      const subtotal = laborCost + partsCost;
      const tax = subtotal * 0.16; // 16% ضريبة
      const total = subtotal + tax;

      const estimate = {
        jobCardId,
        jobNumber: jobCard.jobNumber,
        customer: jobCard.booking?.customer,
        vehicle: jobCard.booking?.vehicle,
        items: {
          labor: jobCard.jobItems,
          parts: jobCard.partsUsed,
        },
        costs: {
          laborCost,
          partsCost,
          subtotal,
          tax,
          total,
        },
        estimatedDuration: jobCard.estimatedDuration,
        notes: jobCard.technicianNotes,
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // صالح لمدة 7 أيام
      };

      return estimate;
    } catch (error) {
      console.error('Error generating estimate:', error);
      throw error;
    }
  }

  // موافقة العميل على العرض
  async approveEstimate(jobCardId: string, approvedBy: string, notes?: string): Promise<any> {
    try {
      const jobCard = await prisma.jobCard.update({
        where: { id: jobCardId },
        data: {
          customerApproval: {
            approved: true,
            approvedAt: new Date(),
            approvedBy,
            notes,
          },
          updatedAt: new Date(),
        },
        include: {
          booking: {
            include: {
              customer: true,
            },
          },
        },
      });

      // إرسال إشعار للموظفين المعنيين
      await this.notifyEstimateApproval(jobCard);

      return jobCard;
    } catch (error) {
      console.error('Error approving estimate:', error);
      throw error;
    }
  }

  // إغلاق بطاقة العمل
  async closeJobCard(jobCardId: string, finalNotes?: string): Promise<any> {
    try {
      const jobCard = await prisma.jobCard.update({
        where: { id: jobCardId },
        data: {
          status: 'CLOSED',
          completedAt: new Date(),
          internalNotes: finalNotes,
          updatedAt: new Date(),
        },
        include: {
          booking: true,
        },
      });

      // تحديث حالة الحجز إلى مكتمل
      await prisma.booking.update({
        where: { id: jobCard.bookingId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // إنشاء الفاتورة
      await this.createInvoiceFromJobCard(jobCardId);

      return jobCard;
    } catch (error) {
      console.error('Error closing job card:', error);
      throw error;
    }
  }

  // === دوال مساعدة ===

  // إنشاء رقم بطاقة عمل فريد
  private async generateJobNumber(garageId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const prefix = `JC-${year}${month}`;
    
    const lastJobCard = await prisma.jobCard.findFirst({
      where: {
        jobNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        jobNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastJobCard) {
      const lastSequence = parseInt(lastJobCard.jobNumber.split('-')[2]) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  // تحديد الأولوية بناءً على بيانات الحجز
  private determinePriority(booking: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    // يمكن تعديل هذا بناءً على منطق العمل
    if (booking.serviceType === 'FLEET') {
      return 'HIGH';
    }
    
    if (booking.service?.category === 'EMERGENCY') {
      return 'URGENT';
    }
    
    return 'MEDIUM';
  }

  // إنشاء عناصر العمل الأولية
  private async createInitialJobItems(jobCardId: string, serviceId: string): Promise<void> {
    try {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) return;

      await prisma.jobItem.create({
        data: {
          jobCardId,
          serviceId,
          description: service.title,
          quantity: 1,
          unitPrice: service.price,
          totalPrice: service.price,
          status: 'PENDING',
          estimatedTime: service.duration || 60,
        },
      });
    } catch (error) {
      console.error('Error creating initial job items:', error);
    }
  }

  // تحديث إجماليات بطاقة العمل
  private async updateJobCardTotals(jobCardId: string): Promise<void> {
    try {
      const jobCard = await prisma.jobCard.findUnique({
        where: { id: jobCardId },
        include: {
          jobItems: true,
          partsUsed: true,
        },
      });

      if (!jobCard) return;

      const laborCost = jobCard.jobItems.reduce((total, item) => total + item.totalPrice, 0);
      const partsCost = jobCard.partsUsed.reduce((total, part) => total + part.totalPrice, 0);
      const actualCost = laborCost + partsCost;

      await prisma.jobCard.update({
        where: { id: jobCardId },
        data: {
          actualCost,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating job card totals:', error);
    }
  }

  // تحديث مدة بطاقة العمل
  private async updateJobCardDuration(jobCardId: string): Promise<void> {
    try {
      const timeTracking = await prisma.timeTracking.findMany({
        where: { jobCardId },
      });

      const totalDuration = timeTracking.reduce((total, tracking) => {
        return total + (tracking.duration || 0);
      }, 0);

      await prisma.jobCard.update({
        where: { id: jobCardId },
        data: {
          actualDuration: totalDuration,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating job card duration:', error);
    }
  }

  // تحديث حالة الحجز من بطاقة العمل
  private async updateBookingStatusFromJobCard(bookingId: string, jobCardStatus: string): Promise<void> {
    try {
      let bookingStatus: string;
      
      switch (jobCardStatus) {
        case 'OPEN':
          bookingStatus = 'CONFIRMED';
          break;
        case 'IN_PROGRESS':
          bookingStatus = 'IN_PROGRESS';
          break;
        case 'COMPLETED':
          bookingStatus = 'COMPLETED';
          break;
        default:
          return;
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: bookingStatus,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating booking status from job card:', error);
    }
  }

  // إشعار موافقة العميل على العرض
  private async notifyEstimateApproval(jobCard: any): Promise<void> {
    // هنا يمكن إرسال إشعارات للموظفين المعنيين
    console.log(`Estimate approved for job card ${jobCard.jobNumber}`);
  }

  // إنشاء الفاتورة من بطاقة العمل
  private async createInvoiceFromJobCard(jobCardId: string): Promise<void> {
    // هنا يمكن إنشاء الفاتورة تلقائياً
    console.log(`Creating invoice for job card ${jobCardId}`);
  }
}

export const jobCardService = new JobCardService();
