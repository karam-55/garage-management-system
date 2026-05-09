import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface InspectionReportData {
  jobCardId: string;
  reportNumber: string;
  vehicleId: string;
  technicianId: string;
  inspectionDate: Date;
  mileage: number;
  overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  summary: string;
  recommendations: string[];
  images?: string[];
  videos?: string[];
  customerNotes?: string;
  internalNotes?: string;
  requiresImmediateAttention: boolean;
  estimatedRepairCost?: number;
  nextInspectionDate?: Date;
}

export interface InspectionCategoryData {
  inspectionReportId: string;
  categoryName: string;
  categoryStatus: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  notes?: string;
  images?: string[];
  estimatedCost?: number;
}

export interface InspectionItemData {
  categoryId: string;
  itemName: string;
  itemStatus: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  condition: string;
  measurements?: Record<string, number>;
  notes?: string;
  images?: string[];
  estimatedCost?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  recommendedAction?: string;
  partsNeeded?: Array<{
    partName: string;
    quantity: number;
    estimatedCost: number;
  }>;
}

export class InspectionReportService {
  // إنشاء تقرير فحص جديد
  async createInspectionReport(reportData: InspectionReportData): Promise<any> {
    try {
      // إنشاء رقم تقرير فريد
      const reportNumber = await this.generateReportNumber();

      const report = await prisma.inspectionReport.create({
        data: {
          ...reportData,
          reportNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          jobCard: {
            include: {
              booking: {
                include: {
                  customer: true,
                  vehicle: true,
                },
              },
            },
          },
          technician: true,
          categories: {
            include: {
              items: true,
            },
          },
        },
      });

      return report;
    } catch (error) {
      console.error('Error creating inspection report:', error);
      throw error;
    }
  }

  // إنشاء تقرير فحص من بطاقة عمل
  async createFromJobCard(jobCardId: string, technicianId: string, initialData?: Partial<InspectionReportData>): Promise<any> {
    try {
      const jobCard = await prisma.jobCard.findUnique({
        where: { id: jobCardId },
        include: {
          booking: {
            include: {
              vehicle: true,
            },
          },
        },
      });

      if (!jobCard) {
        throw new Error('Job card not found');
      }

      const reportData: InspectionReportData = {
        jobCardId,
        reportNumber: '', // سيتم إنشاؤه تلقائياً
        vehicleId: jobCard.booking.vehicleId,
        technicianId,
        inspectionDate: new Date(),
        mileage: jobCard.booking.vehicle.mileage || 0,
        overallCondition: 'GOOD',
        summary: '',
        recommendations: [],
        requiresImmediateAttention: false,
        ...initialData,
      };

      const report = await this.createInspectionReport(reportData);

      // إنشاء الفئات الأساسية
      await this.createDefaultCategories(report.id);

      return report;
    } catch (error) {
      console.error('Error creating inspection report from job card:', error);
      throw error;
    }
  }

  // الحصول على قائمة تقارير الفحص
  async getInspectionReports(filters?: {
    vehicleId?: string;
    technicianId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: string;
    requiresAttention?: boolean;
  }): Promise<any[]> {
    try {
      const where: any = {};

      if (filters?.vehicleId) {
        where.vehicleId = filters.vehicleId;
      }

      if (filters?.technicianId) {
        where.technicianId = filters.technicianId;
      }

      if (filters?.requiresAttention !== undefined) {
        where.requiresImmediateAttention = filters.requiresAttention;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.inspectionDate = {};
        if (filters.dateFrom) {
          where.inspectionDate.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.inspectionDate.lte = new Date(filters.dateTo);
        }
      }

      return await prisma.inspectionReport.findMany({
        where,
        include: {
          jobCard: {
            include: {
              booking: {
                include: {
                  customer: true,
                },
              },
            },
          },
          vehicle: true,
          technician: true,
          categories: {
            include: {
              items: true,
            },
          },
        },
        orderBy: {
          inspectionDate: 'desc',
        },
      });
    } catch (error) {
      console.error('Error getting inspection reports:', error);
      return [];
    }
  }

  // الحصول على تقرير فحص محدد
  async getInspectionReportById(id: string): Promise<any> {
    try {
      const report = await prisma.inspectionReport.findUnique({
        where: { id },
        include: {
          jobCard: {
            include: {
              booking: {
                include: {
                  customer: true,
                },
              },
            },
          },
          vehicle: true,
          technician: true,
          categories: {
            include: {
              items: true,
            },
            orderBy: {
              categoryName: 'asc',
            },
          },
        },
      });

      if (!report) {
        throw new Error('Inspection report not found');
      }

      return report;
    } catch (error) {
      console.error('Error getting inspection report by ID:', error);
      throw error;
    }
  }

  // تحديث تقرير الفحص
  async updateInspectionReport(id: string, updateData: Partial<InspectionReportData>): Promise<any> {
    try {
      const report = await prisma.inspectionReport.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          jobCard: {
            include: {
              booking: {
                include: {
                  customer: true,
                  vehicle: true,
                },
              },
            },
          },
          technician: true,
          categories: {
            include: {
              items: true,
            },
          },
        },
      });

      // إعادة حساب الحالة الإجمالية
      if (updateData.categories || updateData.overallCondition) {
        await this.recalculateOverallCondition(id);
      }

      return report;
    } catch (error) {
      console.error('Error updating inspection report:', error);
      throw error;
    }
  }

  // إضافة فئة فحص جديدة
  async addCategory(reportId: string, categoryData: Omit<InspectionCategoryData, 'inspectionReportId'>): Promise<any> {
    try {
      const category = await prisma.inspectionCategory.create({
        data: {
          ...categoryData,
          inspectionReportId: reportId,
        },
        include: {
          items: true,
        },
      });

      // إعادة حساب الحالة الإجمالية
      await this.recalculateOverallCondition(reportId);

      return category;
    } catch (error) {
      console.error('Error adding inspection category:', error);
      throw error;
    }
  }

  // إضافة عنصر فحص جديد
  async addInspectionItem(categoryId: string, itemData: Omit<InspectionItemData, 'categoryId'>): Promise<any> {
    try {
      const item = await prisma.inspectionItem.create({
        data: {
          ...itemData,
          categoryId,
        },
      });

      // إعادة حساب حالة الفئة
      await this.recalculateCategoryStatus(categoryId);

      return item;
    } catch (error) {
      console.error('Error adding inspection item:', error);
      throw error;
    }
  }

  // تحديث عنصر الفحص
  async updateInspectionItem(itemId: string, updateData: Partial<InspectionItemData>): Promise<any> {
    try {
      const item = await prisma.inspectionItem.update({
        where: { id: itemId },
        data: updateData,
      });

      // إعادة حساب حالة الفئة
      await this.recalculateCategoryStatus(item.categoryId);

      return item;
    } catch (error) {
      console.error('Error updating inspection item:', error);
      throw error;
    }
  }

  // الحصول على تقرير فحص للعميل
  async getCustomerReport(reportId: string): Promise<any> {
    try {
      const report = await this.getInspectionReportById(reportId);

      // تجهيز النسخة الخاصة بالعميل (بدون الملاحظات الداخلية)
      const customerReport = {
        reportNumber: report.reportNumber,
        inspectionDate: report.inspectionDate,
        vehicle: {
          make: report.vehicle.make,
          model: report.vehicle.model,
          year: report.vehicle.year,
          mileage: report.mileage,
        },
        overallCondition: report.overallCondition,
        summary: report.summary,
        recommendations: report.recommendations,
        categories: report.categories.map(category => ({
          categoryName: category.categoryName,
          categoryStatus: category.categoryStatus,
          notes: category.notes,
          estimatedCost: category.estimatedCost,
          items: category.items.map(item => ({
            itemName: item.itemName,
            itemStatus: item.itemStatus,
            condition: item.condition,
            notes: item.notes,
            estimatedCost: item.estimatedCost,
            recommendedAction: item.recommendedAction,
          })),
        })),
        estimatedRepairCost: report.estimatedRepairCost,
        nextInspectionDate: report.nextInspectionDate,
        images: report.images,
      };

      return customerReport;
    } catch (error) {
      console.error('Error getting customer report:', error);
      throw error;
    }
  }

  // الحصول على تقرير فحص للفني
  async getTechnicianReport(reportId: string): Promise<any> {
    try {
      const report = await this.getInspectionReportById(reportId);

      // تجهيز النسخة الخاصة بالفني (مع جميع التفاصيل)
      const technicianReport = {
        ...report,
        customerNotes: report.customerNotes,
        internalNotes: report.internalNotes,
        detailedItems: report.categories.map(category => ({
          ...category,
          items: category.items.map(item => ({
            ...item,
            measurements: item.measurements,
            partsNeeded: item.partsNeeded,
            priority: item.priority,
          })),
        })),
      };

      return technicianReport;
    } catch (error) {
      console.error('Error getting technician report:', error);
      throw error;
    }
  }

  // إنشاء تقرير PDF
  async generatePDFReport(reportId: string, type: 'CUSTOMER' | 'TECHNICIAN' | 'FULL'): Promise<string> {
    try {
      const report = type === 'CUSTOMER' 
        ? await this.getCustomerReport(reportId)
        : type === 'TECHNICIAN'
        ? await this.getTechnicianReport(reportId)
        : await this.getInspectionReportById(reportId);

      // هنا يمكن استخدام مكتبة مثل PDFKit أو Puppeteer لإنشاء PDF
      const pdfPath = `/reports/inspection_${report.reportNumber}_${type.toLowerCase()}.pdf`;
      
      // محاكاة إنشاء PDF
      console.log(`Generating PDF report: ${pdfPath}`);
      
      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  // إرسال التقرير للعميل
  async sendReportToCustomer(reportId: string, method: 'EMAIL' | 'WHATSAPP' | 'SMS'): Promise<void> {
    try {
      const report = await this.getInspectionReportById(reportId);
      const customer = report.jobCard?.booking?.customer;

      if (!customer) {
        throw new Error('Customer not found');
      }

      const customerReport = await this.getCustomerReport(reportId);

      let message = `
        تقرير فحص سيارتك - ${report.reportNumber}
        
        التاريخ: ${report.inspectionDate.toLocaleDateString('ar-SA')}
        السيارة: ${report.vehicle.make} ${report.vehicle.model}
        الحالة العامة: ${this.translateCondition(report.overallCondition)}
        
        ${report.summary}
        
        التوصيات:
        ${report.recommendations.join('\n')}
        
        Garage Go
      `;

      switch (method) {
        case 'EMAIL':
          if (customer.email) {
            await this.sendEmail(customer.email, `تقرير الفحص - ${report.reportNumber}`, message);
          }
          break;
        case 'WHATSAPP':
          await this.sendWhatsAppMessage(customer.phone, message);
          break;
        case 'SMS':
          await this.sendSMSMessage(customer.phone, message);
          break;
      }
    } catch (error) {
      console.error('Error sending report to customer:', error);
      throw error;
    }
  }

  // الحصول على تاريخ فحص السيارة
  async getVehicleInspectionHistory(vehicleId: string): Promise<any[]> {
    try {
      const reports = await prisma.inspectionReport.findMany({
        where: { vehicleId },
        include: {
          technician: true,
          categories: {
            include: {
              items: true,
            },
          },
        },
        orderBy: {
          inspectionDate: 'desc',
        },
      });

      return reports.map(report => ({
        id: report.id,
        reportNumber: report.reportNumber,
        inspectionDate: report.inspectionDate,
        mileage: report.mileage,
        overallCondition: report.overallCondition,
        technician: report.technician.fullName,
        requiresImmediateAttention: report.requiresImmediateAttention,
        estimatedRepairCost: report.estimatedRepairCost,
        summary: report.summary,
      }));
    } catch (error) {
      console.error('Error getting vehicle inspection history:', error);
      return [];
    }
  }

  // === دوال مساعدة ===

  // إنشاء رقم تقرير فريد
  private async generateReportNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const prefix = `IR-${year}${month}`;
    
    const lastReport = await prisma.inspectionReport.findFirst({
      where: {
        reportNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        reportNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastReport) {
      const lastSequence = parseInt(lastReport.reportNumber.split('-')[2]) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  // إنشاء الفئات الافتراضية
  private async createDefaultCategories(reportId: string): Promise<void> {
    const defaultCategories = [
      { categoryName: 'المحرك ونظام الوقود', categoryStatus: 'GOOD' as const },
      { categoryName: 'نظام الفرامل', categoryStatus: 'GOOD' as const },
      { categoryName: 'الإطارات والعجلات', categoryStatus: 'GOOD' as const },
      { categoryName: 'نظام التعليق', categoryStatus: 'GOOD' as const },
      { categoryName: 'نظام الكهرباء', categoryStatus: 'GOOD' as const },
      { categoryName: 'نظام التبريد', categoryStatus: 'GOOD' as const },
      { categoryName: 'نظام العادم', categoryStatus: 'GOOD' as const },
      { categoryName: 'الهيكل والطلاء', categoryStatus: 'GOOD' as const },
      { categoryName: 'النظام الداخلي', categoryStatus: 'GOOD' as const },
      { categoryName: 'الأضواء والإشارات', categoryStatus: 'GOOD' as const },
    ];

    for (const category of defaultCategories) {
      await prisma.inspectionCategory.create({
        data: {
          ...category,
          inspectionReportId: reportId,
        },
      });
    }
  }

  // إعادة حساب الحالة الإجمالية
  private async recalculateOverallCondition(reportId: string): Promise<void> {
    try {
      const report = await prisma.inspectionReport.findUnique({
        where: { id: reportId },
        include: {
          categories: true,
        },
      });

      if (!report) return;

      const criticalCount = report.categories.filter(c => c.categoryStatus === 'CRITICAL').length;
      const attentionCount = report.categories.filter(c => c.categoryStatus === 'ATTENTION').length;

      let overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
      
      if (criticalCount > 0) {
        overallCondition = 'CRITICAL';
      } else if (attentionCount > 3) {
        overallCondition = 'POOR';
      } else if (attentionCount > 1) {
        overallCondition = 'FAIR';
      } else if (attentionCount > 0) {
        overallCondition = 'GOOD';
      } else {
        overallCondition = 'EXCELLENT';
      }

      const requiresImmediateAttention = criticalCount > 0 || attentionCount > 2;

      await prisma.inspectionReport.update({
        where: { id: reportId },
        data: {
          overallCondition,
          requiresImmediateAttention,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error recalculating overall condition:', error);
    }
  }

  // إعادة حساب حالة الفئة
  private async recalculateCategoryStatus(categoryId: string): Promise<void> {
    try {
      const category = await prisma.inspectionCategory.findUnique({
        where: { id: categoryId },
        include: {
          items: true,
        },
      });

      if (!category) return;

      const criticalCount = category.items.filter(i => i.itemStatus === 'CRITICAL').length;
      const attentionCount = category.items.filter(i => i.itemStatus === 'ATTENTION').length;

      let categoryStatus: 'GOOD' | 'ATTENTION' | 'CRITICAL';
      
      if (criticalCount > 0) {
        categoryStatus = 'CRITICAL';
      } else if (attentionCount > 0) {
        categoryStatus = 'ATTENTION';
      } else {
        categoryStatus = 'GOOD';
      }

      await prisma.inspectionCategory.update({
        where: { id: categoryId },
        data: {
          categoryStatus,
        },
      });

      // إعادة حساب الحالة الإجمالية للتقرير
      await this.recalculateOverallCondition(category.inspectionReportId);
    } catch (error) {
      console.error('Error recalculating category status:', error);
    }
  }

  // ترجمة الحالة
  private translateCondition(condition: string): string {
    const translations = {
      'EXCELLENT': 'ممتاز',
      'GOOD': 'جيد',
      'FAIR': 'متوسط',
      'POOR': 'ضعيف',
      'CRITICAL': 'حرج',
    };
    return translations[condition] || condition;
  }

  // دوال الإرسال (يجب تنفيذها حسب مزود الخدمة)
  private async sendEmail(email: string, subject: string, message: string): Promise<void> {
    console.log('Email to', email, ':', subject, '-', message);
  }

  private async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    console.log('WhatsApp message to', phone, ':', message);
  }

  private async sendSMSMessage(phone: string, message: string): Promise<void> {
    console.log('SMS message to', phone, ':', message);
  }
}

export const inspectionReportService = new InspectionReportService();
