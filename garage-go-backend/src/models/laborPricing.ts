import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TechnicianData {
  userId: string;
  employeeId: string;
  specialization: string[];
  hourlyRate: number;
  skillLevel: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'MASTER';
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber: string;
  }>;
  experience: number; // بالسنوات
  availability: {
    monday: { available: boolean; startTime?: string; endTime?: string };
    tuesday: { available: boolean; startTime?: string; endTime?: string };
    wednesday: { available: boolean; startTime?: string; endTime?: string };
    thursday: { available: boolean; startTime?: string; endTime?: string };
    friday: { available: boolean; startTime?: string; endTime?: string };
    saturday: { available: boolean; startTime?: string; endTime?: string };
    sunday: { available: boolean; startTime?: string; endTime?: string };
  };
  maxConcurrentJobs: number;
  commissionRate?: number; // نسبة العمولة
  isActive: boolean;
  notes?: string;
}

export interface ServicePricingData {
  serviceId: string;
  basePrice: number;
  estimatedTime: number; // بالدقائق
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  requiredSkills: string[];
  partsRequired?: Array<{
    partId: string;
    quantity: number;
    estimatedCost: number;
  }>;
  laborCost: number;
  totalCost: number;
  profitMargin: number; // كنسبة مئوية
  isActive: boolean;
  seasonalPricing?: Array<{
    season: 'SUMMER' | 'WINTER' | 'SPRING' | 'FALL';
    priceMultiplier: number;
    startDate: Date;
    endDate: Date;
  }>;
  vehicleTypePricing?: Array<{
    vehicleType: 'SEDAN' | 'SUV' | 'TRUCK' | 'VAN' | 'MOTORCYCLE' | 'ELECTRIC';
    priceMultiplier: number;
    additionalTime: number;
  }>;
}

export interface LaborRateData {
  rateName: string;
  description: string;
  baseHourlyRate: number;
  skillMultiplier: {
    JUNIOR: number;
    INTERMEDIATE: number;
    SENIOR: number;
    MASTER: number;
  };
  complexityMultiplier: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
    EXPERT: number;
  };
  urgencyMultiplier: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  timeMultiplier?: {
    STANDARD: number;
    OVERTIME: number;
    WEEKEND: number;
    HOLIDAY: number;
  };
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface TimeSheetData {
  technicianId: string;
  jobCardId: string;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  breakTime?: number; // بالدقائق
  totalHours?: number;
  hourlyRate: number;
  totalEarnings: number;
  activities: Array<{
    startTime: Date;
    endTime?: Date;
    activity: string;
    jobCardId?: string;
    notes?: string;
  }>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export class LaborPricingService {
  // إضافة فني جديد
  async addTechnician(technicianData: TechnicianData): Promise<any> {
    try {
      const technician = await prisma.technician.create({
        data: {
          ...technicianData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return technician;
    } catch (error) {
      console.error('Error adding technician:', error);
      throw error;
    }
  }

  // تحديث بيانات الفني
  async updateTechnician(technicianId: string, updateData: Partial<TechnicianData>): Promise<any> {
    try {
      const technician = await prisma.technician.update({
        where: { id: technicianId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          user: true,
        },
      });

      return technician;
    } catch (error) {
      console.error('Error updating technician:', error);
      throw error;
    }
  }

  // الحصول على قائمة الفنيين
  async getTechnicians(filters?: {
    skillLevel?: string;
    specialization?: string;
    available?: boolean;
    garageId?: string;
  }): Promise<any[]> {
    try {
      const where: any = { isActive: true };

      if (filters?.skillLevel) {
        where.skillLevel = filters.skillLevel;
      }

      if (filters?.specialization) {
        where.specialization = {
          has: filters.specialization,
        };
      }

      if (filters?.garageId) {
        where.garageId = filters.garageId;
      }

      let technicians = await prisma.technician.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          currentJobs: {
            where: {
              status: 'IN_PROGRESS',
            },
            select: {
              id: true,
              jobNumber: true,
            },
          },
        },
      });

      // فلترة التوفر إذا تم طلبه
      if (filters?.available) {
        technicians = technicians.filter(technician => {
          const currentJobs = technician.currentJobs?.length || 0;
          return currentJobs < technician.maxConcurrentJobs;
        });
      }

      return technicians;
    } catch (error) {
      console.error('Error getting technicians:', error);
      throw error;
    }
  }

  // حساب تكلفة العمالة لخدمة محددة
  async calculateLaborCost(
    serviceId: string,
    technicianId: string,
    complexity: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' = 'MEDIUM',
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
    vehicleType?: string,
    isOvertime?: boolean,
    isWeekend?: boolean,
    isHoliday?: boolean
  ): Promise<any> {
    try {
      // الحصول على بيانات الخدمة
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw new Error('Service not found');
      }

      // الحصول على بيانات الفني
      const technician = await prisma.technician.findUnique({
        where: { id: technicianId },
      });

      if (!technician) {
        throw new Error('Technician not found');
      }

      // الحصول on أسعار العمالة الحالية
      const laborRate = await this.getCurrentLaborRate();

      // حساب الساعة الأساسية
      let baseHourlyRate = laborRate.baseHourlyRate;
      
      // تطبيق مضاعف المهارة
      const skillMultiplier = laborRate.skillMultiplier[technician.skillLevel];
      baseHourlyRate *= skillMultiplier;

      // تطبيق مضاعف التعقيد
      const complexityMultiplier = laborRate.complexityMultiplier[complexity];
      baseHourlyRate *= complexityMultiplier;

      // تطبيق مضاعف الاستعجال
      const urgencyMultiplier = laborRate.urgencyMultiplier[urgency];
      baseHourlyRate *= urgencyMultiplier;

      // تطبيق مضاعف الوقت
      if (isOvertime && laborRate.timeMultiplier?.OVERTIME) {
        baseHourlyRate *= laborRate.timeMultiplier.OVERTIME;
      } else if (isWeekend && laborRate.timeMultiplier?.WEEKEND) {
        baseHourlyRate *= laborRate.timeMultiplier.WEEKEND;
      } else if (isHoliday && laborRate.timeMultiplier?.HOLIDAY) {
        baseHourlyRate *= laborRate.timeMultiplier.HOLIDAY;
      }

      // حساب الوقت المقدر
      let estimatedTime = service.duration || 60; // بالدقائق

      // تطبيق تعديل الوقت حسب نوع السيارة
      if (vehicleType && service.vehicleTypePricing) {
        const vehiclePricing = service.vehicleTypePricing.find(vp => vp.vehicleType === vehicleType);
        if (vehiclePricing) {
          estimatedTime += vehiclePricing.additionalTime;
        }
      }

      // حساب التكلفة الإجمالية
      const laborCost = (baseHourlyRate * estimatedTime) / 60; // التحويل من دقائق إلى ساعات

      return {
        baseHourlyRate: laborRate.baseHourlyRate,
        skillMultiplier,
        complexityMultiplier,
        urgencyMultiplier,
        timeMultiplier: isOvertime ? laborRate.timeMultiplier?.OVERTIME : 1,
        finalHourlyRate: baseHourlyRate,
        estimatedTime,
        laborCost,
        breakdown: {
          service: service.title,
          technician: technician.user.fullName,
          skillLevel: technician.skillLevel,
          complexity,
          urgency,
          vehicleType,
        },
      };
    } catch (error) {
      console.error('Error calculating labor cost:', error);
      throw error;
    }
  }

  // الحصول على أسعار العمالة الحالية
  private async getCurrentLaborRate(): Promise<LaborRateData> {
    const laborRate = await prisma.laborRate.findFirst({
      where: {
        isActive: true,
        effectiveDate: {
          lte: new Date(),
        },
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: new Date() } },
        ],
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });

    if (!laborRate) {
      throw new Error('No active labor rate found');
    }

    return laborRate as LaborRateData;
  }

  // إنشاء بطاقة وقت
  async createTimeSheet(timeSheetData: TimeSheetData): Promise<any> {
    try {
      // حساب الساعات الإجمالية إذا لم يتم تحديدها
      if (!timeSheetData.totalHours && timeSheetData.clockOut) {
        const totalMinutes = Math.floor(
          (timeSheetData.clockOut.getTime() - timeSheetData.clockIn.getTime()) / 60000
        );
        timeSheetData.totalHours = (totalMinutes - (timeSheetData.breakTime || 0)) / 60;
      }

      // حساب الأرباح الإجمالية
      if (timeSheetData.totalHours && timeSheetData.hourlyRate) {
        timeSheetData.totalEarnings = timeSheetData.totalHours * timeSheetData.hourlyRate;
      }

      const timeSheet = await prisma.timeSheet.create({
        data: {
          ...timeSheetData,
          date: new Date(timeSheetData.date),
          clockIn: new Date(timeSheetData.clockIn),
          clockOut: timeSheetData.clockOut ? new Date(timeSheetData.clockOut) : undefined,
          createdAt: new Date(),
        },
        include: {
          technician: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          jobCard: {
            select: {
              jobNumber: true,
            },
          },
        },
      });

      return timeSheet;
    } catch (error) {
      console.error('Error creating time sheet:', error);
      throw error;
    }
  }

  // الحصول على جداول الوقت للفني
  async getTechnicianTimeSheets(
    technicianId: string,
    filters?: {
      dateFrom?: Date;
      dateTo?: string;
      status?: string;
    }
  ): Promise<any[]> {
    try {
      const where: any = { technicianId };

      if (filters?.dateFrom || filters?.dateTo) {
        where.date = {};
        if (filters.dateFrom) where.date.gte = filters.dateFrom;
        if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      const timeSheets = await prisma.timeSheet.findMany({
        where,
        include: {
          jobCard: {
            select: {
              jobNumber: true,
              status: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      return timeSheets;
    } catch (error) {
      console.error('Error getting technician time sheets:', error);
      throw error;
    }
  }

  // حساب الرواتب والإنتاجية
  async calculatePayroll(
    technicianId: string,
    period: 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const timeSheets = await this.getTechnicianTimeSheets(technicianId, {
        dateFrom: startDate,
        dateTo: endDate.toISOString(),
        status: 'APPROVED',
      });

      const totalHours = timeSheets.reduce((sum, ts) => sum + (ts.totalHours || 0), 0);
      const totalEarnings = timeSheets.reduce((sum, ts) => sum + (ts.totalEarnings || 0), 0);
      const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;

      // حساب العمولات
      const technician = await prisma.technician.findUnique({
        where: { id: technicianId },
        include: {
          completedJobs: {
            where: {
              completedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      });

      const totalJobRevenue = technician?.completedJobs?.reduce((sum, job) => sum + (job.actualCost || 0), 0) || 0;
      const commission = technician?.commissionRate 
        ? totalJobRevenue * (technician.commissionRate / 100) 
        : 0;

      // حساب الإنتاجية
      const completedJobs = technician?.completedJobs?.length || 0;
      const averageJobTime = completedJobs > 0 ? totalHours / completedJobs : 0;
      const revenuePerHour = totalHours > 0 ? totalJobRevenue / totalHours : 0;

      return {
        period,
        startDate,
        endDate,
        summary: {
          totalHours,
          totalEarnings,
          commission,
          totalCompensation: totalEarnings + commission,
          averageHourlyRate,
          completedJobs,
          averageJobTime,
          totalJobRevenue,
          revenuePerHour,
        },
        timeSheets: timeSheets.map(ts => ({
          id: ts.id,
          date: ts.date,
          totalHours: ts.totalHours,
          totalEarnings: ts.totalEarnings,
          status: ts.status,
          jobCard: ts.jobCard,
        })),
      };
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw error;
    }
  }

  // الحصول على الفنيين المتاحرين لخدمة محددة
  async getAvailableTechnicians(
    serviceId: string,
    requiredDate: Date,
    requiredTime: string,
    duration: number
  ): Promise<any[]> {
    try {
      // الحصول على متطلبات الخدمة
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw new Error('Service not found');
      }

      // الحصول على جميع الفنيين النشطين
      const allTechnicians = await prisma.technician.findMany({
        where: {
          isActive: true,
          specialization: {
            hasSome: service.requiredSkills || [],
          },
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
          currentJobs: {
            where: {
              status: 'IN_PROGRESS',
            },
            include: {
              booking: {
                select: {
                  scheduledAt: true,
                  service: {
                    select: {
                      duration: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // فلترة الفنيين المتاحرين
      const availableTechnicians = allTechnicians.filter(technician => {
        // التحقق من الحد الأقصى للوظائف المتزامنة
        const currentJobs = technician.currentJobs?.length || 0;
        if (currentJobs >= technician.maxConcurrentJobs) {
          return false;
        }

        // التحقق من توافق الوقت
        const requestedDateTime = new Date(`${requiredDate.toISOString().split('T')[0]}T${requiredTime}`);
        const endDateTime = new Date(requestedDateTime.getTime() + duration * 60000);

        // التحقق من عدم وجود تعارض مع الوظائف الحالية
        const hasConflict = technician.currentJobs?.some(job => {
          const jobStart = new Date(job.booking.scheduledAt);
          const jobEnd = new Date(jobStart.getTime() + (job.booking.service?.duration || 60) * 60000);

          return (
            (requestedDateTime >= jobStart && requestedDateTime < jobEnd) ||
            (endDateTime > jobStart && endDateTime <= jobEnd) ||
            (requestedDateTime <= jobStart && endDateTime >= jobEnd)
          );
        });

        return !hasConflict;
      });

      // إضافة معلومات التكلفة لكل فني
      const techniciansWithPricing = await Promise.all(
        availableTechnicians.map(async (technician) => {
          const laborCost = await this.calculateLaborCost(
            serviceId,
            technician.id,
            service.difficultyLevel as any
          );

          return {
            ...technician,
            estimatedCost: laborCost.laborCost,
            hourlyRate: laborCost.finalHourlyRate,
            estimatedTime: laborCost.estimatedTime,
          };
        })
      );

      return techniciansWithPricing;
    } catch (error) {
      console.error('Error getting available technicians:', error);
      throw error;
    }
  }

  // تحديث أسعار الخدمات
  async updateServicePricing(serviceId: string, pricingData: Partial<ServicePricingData>): Promise<any> {
    try {
      const service = await prisma.service.update({
        where: { id: serviceId },
        data: {
          ...pricingData,
          updatedAt: new Date(),
        },
      });

      return service;
    } catch (error) {
      console.error('Error updating service pricing:', error);
      throw error;
    }
  }

  // الحصول على تقارير الإنتاجية
  async getTechnicianPerformanceReport(
    technicianId?: string,
    dateFrom?: Date,
    dateTo?: string
  ): Promise<any> {
    try {
      const where: any = {};
      
      if (technicianId) {
        where.technicianId = technicianId;
      }

      if (dateFrom || dateTo) {
        where.completedAt = {};
        if (dateFrom) where.completedAt.gte = dateFrom;
        if (dateTo) where.completedAt.lte = new Date(dateTo);
      }

      const jobCards = await prisma.jobCard.findMany({
        where: {
          ...where,
          status: 'COMPLETED',
        },
        include: {
          technician: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          booking: {
            include: {
              service: {
                select: {
                  title: true,
                  duration: true,
                },
              },
            },
          },
          timeTracking: true,
        },
      });

      // حساب مقاييس الأداء
      const performanceData = jobCards.reduce((acc, jobCard) => {
        const techId = jobCard.technicianId;
        const techName = jobCard.technician.user.fullName;

        if (!acc[techId]) {
          acc[techId] = {
            technicianId: techId,
            technicianName: techName,
            totalJobs: 0,
            totalRevenue: 0,
            totalHours: 0,
            averageJobTime: 0,
            revenuePerHour: 0,
            onTimeCompletion: 0,
            customerSatisfaction: 0,
          };
        }

        const tech = acc[techId];
        tech.totalJobs++;
        tech.totalRevenue += jobCard.actualCost || 0;
        
        const jobHours = (jobCard.actualDuration || 0) / 60;
        tech.totalHours += jobHours;

        return acc;
      }, {});

      // حساب المتوسطات
      Object.values(performanceData).forEach((tech: any) => {
        tech.averageJobTime = tech.totalJobs > 0 ? tech.totalHours / tech.totalJobs : 0;
        tech.revenuePerHour = tech.totalHours > 0 ? tech.totalRevenue / tech.totalHours : 0;
      });

      return {
        period: {
          from: dateFrom,
          to: dateTo,
        },
        technicians: Object.values(performanceData),
        summary: {
          totalTechnicians: Object.keys(performanceData).length,
          totalJobs: jobCards.length,
          totalRevenue: jobCards.reduce((sum, job) => sum + (job.actualCost || 0), 0),
          totalHours: Object.values(performanceData).reduce((sum: number, tech: any) => sum + tech.totalHours, 0),
        },
      };
    } catch (error) {
      console.error('Error getting technician performance report:', error);
      throw error;
    }
  }
}

export const laborPricingService = new LaborPricingService();
