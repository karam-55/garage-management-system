import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';
import { inspectionReportService } from '@/models/inspectionReport';

const prisma = new PrismaClient() as any;

class InspectionReportController {
  // إنشاء تقرير فحص جديد
  createReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reportData = {
      ...req.body,
      inspectionDate: new Date(req.body.inspectionDate),
      technicianId: req.user!.id,
    };

    const report = await inspectionReportService.createInspectionReport(reportData);

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Inspection report created successfully',
    };

    res.status(201).json(response);
  });

  // إنشاء تقرير فحص من بطاقة عمل
  createFromJobCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { jobCardId } = req.body;
    const technicianId = req.user!.id;
    const initialData = req.body.initialData || {};

    const report = await inspectionReportService.createFromJobCard(jobCardId, technicianId, initialData);

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Inspection report created from job card successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على جميع تقارير الفحص
  getAllReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { 
      page = 1, 
      limit = 10, 
      vehicleId, 
      technicianId, 
      status, 
      dateFrom, 
      dateTo, 
      requiresAttention 
    } = req.query as any;

    const filters = {
      vehicleId,
      technicianId,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo,
      requiresAttention: requiresAttention === 'true' ? true : requiresAttention === 'false' ? false : undefined,
    };

    const reports = await inspectionReportService.getInspectionReports(filters);

    // تطبيق الصفحة يدوياً
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedReports = reports.slice(startIndex, endIndex);

    const response: PaginatedResponse = {
      success: true,
      data: paginatedReports,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: reports.length,
        totalPages: Math.ceil(reports.length / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على تقرير فحص محدد
  getReportById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const report = await inspectionReportService.getInspectionReportById(id);

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // تحديث تقرير الفحص
  updateReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.inspectionDate) {
      updateData.inspectionDate = new Date(updateData.inspectionDate);
    }

    if (updateData.nextInspectionDate) {
      updateData.nextInspectionDate = new Date(updateData.nextInspectionDate);
    }

    const report = await inspectionReportService.updateInspectionReport(id, updateData);

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Inspection report updated successfully',
    };

    res.status(200).json(response);
  });

  // إضافة فئة فحص جديدة
  addCategory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const categoryData = req.body;

    const category = await inspectionReportService.addCategory(id, categoryData);

    const response: ApiResponse = {
      success: true,
      data: category,
      message: 'Inspection category added successfully',
    };

    res.status(201).json(response);
  });

  // إضافة عنصر فحص جديد
  addInspectionItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const itemData = req.body;

    const item = await inspectionReportService.addInspectionItem(categoryId, itemData);

    const response: ApiResponse = {
      success: true,
      data: item,
      message: 'Inspection item added successfully',
    };

    res.status(201).json(response);
  });

  // تحديث عنصر الفحص
  updateInspectionItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const updateData = req.body;

    const item = await inspectionReportService.updateInspectionItem(itemId, updateData);

    const response: ApiResponse = {
      success: true,
      data: item,
      message: 'Inspection item updated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على تقرير الفحص للعميل
  getCustomerReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const report = await inspectionReportService.getCustomerReport(id);

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // الحصول على تقرير الفحص للفني
  getTechnicianReport = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const report = await inspectionReportService.getTechnicianReport(id);

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // إنشاء تقرير PDF
  generatePDF = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { type = 'CUSTOMER' } = req.query;

    const pdfPath = await inspectionReportService.generatePDFReport(id, type as 'CUSTOMER' | 'TECHNICIAN' | 'FULL');

    const response: ApiResponse = {
      success: true,
      data: { pdfPath },
      message: 'PDF report generated successfully',
    };

    res.status(200).json(response);
  });

  // إرسال التقرير للعميل
  sendToCustomer = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { method = 'EMAIL' } = req.body;

    await inspectionReportService.sendReportToCustomer(id, method);

    const response: ApiResponse = {
      success: true,
      message: `Report sent to customer via ${method}`,
    };

    res.status(200).json(response);
  });

  // الحصول على تاريخ فحص السيارة
  getVehicleHistory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;

    const history = await inspectionReportService.getVehicleInspectionHistory(vehicleId);

    const response: ApiResponse = {
      success: true,
      data: history,
      count: history.length,
    };

    res.status(200).json(response);
  });

  // البحث في تقارير الفحص
  searchReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { 
      query, 
      vehicleId, 
      technicianId, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 10 
    } = req.query as any;

    // البحث في جميع التقارير ثم تطبيق الفلتر
    const allReports = await inspectionReportService.getInspectionReports();
    
    let filteredReports = allReports;
    
    if (query) {
      const searchQuery = (query as string).toLowerCase();
      filteredReports = filteredReports.filter(report => 
        report.reportNumber.toLowerCase().includes(searchQuery) ||
        report.vehicle.make.toLowerCase().includes(searchQuery) ||
        report.vehicle.model.toLowerCase().includes(searchQuery) ||
        report.vehicle.licensePlate?.toLowerCase().includes(searchQuery) ||
        report.summary.toLowerCase().includes(searchQuery) ||
        report.recommendations.some(rec => rec.toLowerCase().includes(searchQuery))
      );
    }
    
    if (vehicleId) {
      filteredReports = filteredReports.filter(r => r.vehicleId === vehicleId);
    }
    
    if (technicianId) {
      filteredReports = filteredReports.filter(r => r.technicianId === technicianId);
    }
    
    if (dateFrom || dateTo) {
      filteredReports = filteredReports.filter(r => {
        const inspectionDate = new Date(r.inspectionDate);
        if (dateFrom && inspectionDate < new Date(dateFrom)) return false;
        if (dateTo && inspectionDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // تطبيق الصفحة
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    const response: PaginatedResponse = {
      success: true,
      data: paginatedReports,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: filteredReports.length,
        totalPages: Math.ceil(filteredReports.length / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على التقارير التي تتطلب انتباهاً فورياً
  getUrgentReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.query;

    const reports = await inspectionReportService.getInspectionReports({
      requiresAttention: true,
    });

    const response: ApiResponse = {
      success: true,
      data: reports,
      count: reports.length,
    };

    res.status(200).json(response);
  });

  // الحصول على إحصائيات تقارير الفحص
  getReportStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, dateFrom, dateTo } = req.query;

    const filters = {
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo as string,
    };

    const allReports = await inspectionReportService.getInspectionReports(filters);

    const stats = {
      total: allReports.length,
      byCondition: {
        EXCELLENT: allReports.filter(r => r.overallCondition === 'EXCELLENT').length,
        GOOD: allReports.filter(r => r.overallCondition === 'GOOD').length,
        FAIR: allReports.filter(r => r.overallCondition === 'FAIR').length,
        POOR: allReports.filter(r => r.overallCondition === 'POOR').length,
        CRITICAL: allReports.filter(r => r.overallCondition === 'CRITICAL').length,
      },
      requiresAttention: allReports.filter(r => r.requiresImmediateAttention).length,
      totalEstimatedCost: allReports.reduce((sum, r) => sum + (r.estimatedRepairCost || 0), 0),
      averageEstimatedCost: allReports.length > 0 
        ? allReports.reduce((sum, r) => sum + (r.estimatedRepairCost || 0), 0) / allReports.length 
        : 0,
      inspectionsThisMonth: allReports.filter(r => {
        const reportDate = new Date(r.inspectionDate);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && 
               reportDate.getFullYear() === now.getFullYear();
      }).length,
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });

  // تحديث الصور والفيديوهات
  updateMedia = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { images, videos } = req.body;

    const updateData: any = {};
    if (images !== undefined) updateData.images = images;
    if (videos !== undefined) updateData.videos = videos;

    const report = await inspectionReportService.updateInspectionReport(id, updateData);

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Media updated successfully',
    };

    res.status(200).json(response);
  });

  // إضافة توصية جديدة
  addRecommendation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { recommendation } = req.body;

    const report = await inspectionReportService.getInspectionReportById(id);
    
    const updatedRecommendations = [...(report.recommendations || []), recommendation];

    const updatedReport = await inspectionReportService.updateInspectionReport(id, {
      recommendations: updatedRecommendations,
    });

    const response: ApiResponse = {
      success: true,
      data: updatedReport,
      message: 'Recommendation added successfully',
    };

    res.status(200).json(response);
  });

  // تحديث الملخص
  updateSummary = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { summary } = req.body;

    const report = await inspectionReportService.updateInspectionReport(id, {
      summary,
    });

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Summary updated successfully',
    };

    res.status(200).json(response);
  });

  // تحديث الملاحظات الداخلية
  updateInternalNotes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { notes } = req.body;

    const report = await inspectionReportService.updateInspectionReport(id, {
      internalNotes: notes,
    });

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Internal notes updated successfully',
    };

    res.status(200).json(response);
  });

  // تحديث ملاحظات العميل
  updateCustomerNotes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { notes } = req.body;

    const report = await inspectionReportService.updateInspectionReport(id, {
      customerNotes: notes,
    });

    const response: ApiResponse = {
      success: true,
      data: report,
      message: 'Customer notes updated successfully',
    };

    res.status(200).json(response);
  });

  // حذف عنصر فحص
  deleteInspectionItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;

    // حذف العنصر من قاعدة البيانات
    await prisma.inspectionItem.delete({
      where: { id: itemId },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Inspection item deleted successfully',
    };

    res.status(200).json(response);
  });

  // حذف فئة فحص
  deleteCategory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    // حذف الفئة وجميع عناصرها
    await prisma.inspectionCategory.delete({
      where: { id: categoryId },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Inspection category deleted successfully',
    };

    res.status(200).json(response);
  });
}

export const inspectionReportController = new InspectionReportController();
