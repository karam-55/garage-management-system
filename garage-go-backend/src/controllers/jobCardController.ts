import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';
import { jobCardService } from '@/models/jobCard';

const prisma = new PrismaClient() as any;

class JobCardController {
  // إنشاء بطاقة عمل من حجز موجود
  createFromBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId } = req.body;

    if (!bookingId) {
      throw new CustomError('Booking ID is required', 400);
    }

    const jobCard = await jobCardService.createJobCardFromBooking(bookingId);

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Job card created successfully from booking',
    };

    res.status(201).json(response);
  });

  // إنشاء بطاقة عمل يدوية
  createManual = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const jobCardData = {
      ...req.body,
      estimatedDuration: req.body.estimatedDuration || 60,
      estimatedCost: req.body.estimatedCost || 0,
    };

    const jobCard = await jobCardService.createManualJobCard(jobCardData);

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Manual job card created successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على جميع بطاقات العمل
  getAllJobCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      technicianId, 
      bayId, 
      dateFrom, 
      dateTo, 
      priority 
    } = req.query as any;

    const filters = {
      status,
      technicianId,
      bayId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo,
      priority,
    };

    const jobCards = await jobCardService.getJobCards(filters);

    // تطبيق الصفحة يدوياً (لأن الخدمة لا تدعم الصفحة مباشرة)
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedJobCards = jobCards.slice(startIndex, endIndex);

    const response: PaginatedResponse = {
      success: true,
      data: paginatedJobCards,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: jobCards.length,
        totalPages: Math.ceil(jobCards.length / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على بطاقة عمل محددة
  getJobCardById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const jobCard = await jobCardService.getJobCardById(id);

    const response: ApiResponse = {
      success: true,
      data: jobCard,
    };

    res.status(200).json(response);
  });

  // تحديث بطاقة العمل
  updateJobCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const jobCard = await jobCardService.updateJobCard(id, updateData);

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Job card updated successfully',
    };

    res.status(200).json(response);
  });

  // إضافة عنصر عمل جديد
  addJobItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const jobItemData = req.body;

    const jobItem = await jobCardService.addJobItem(id, jobItemData);

    const response: ApiResponse = {
      success: true,
      data: jobItem,
      message: 'Job item added successfully',
    };

    res.status(201).json(response);
  });

  // تحديث عنصر عمل
  updateJobItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { jobItemId } = req.params;
    const updateData = req.body;

    const jobItem = await jobCardService.updateJobItem(jobItemId, updateData);

    const response: ApiResponse = {
      success: true,
      data: jobItem,
      message: 'Job item updated successfully',
    };

    res.status(200).json(response);
  });

  // إضافة قطعة غيار مستخدمة
  addPartUsed = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const partUsedData = req.body;

    const partUsed = await jobCardService.addPartUsed(id, partUsedData);

    const response: ApiResponse = {
      success: true,
      data: partUsed,
      message: 'Part used added successfully',
    };

    res.status(201).json(response);
  });

  // بدء تتبع الوقت
  startTimeTracking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { activity, notes } = req.body;
    const technicianId = req.user!.id;

    const timeTracking = await jobCardService.startTimeTracking(id, technicianId, activity, notes);

    const response: ApiResponse = {
      success: true,
      data: timeTracking,
      message: 'Time tracking started successfully',
    };

    res.status(201).json(response);
  });

  // إنهاء تتبع الوقت
  endTimeTracking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { timeTrackingId } = req.params;

    const timeTracking = await jobCardService.endTimeTracking(timeTrackingId);

    const response: ApiResponse = {
      success: true,
      data: timeTracking,
      message: 'Time tracking ended successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على عرض السعر
  getEstimate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const estimate = await jobCardService.generateEstimate(id);

    const response: ApiResponse = {
      success: true,
      data: estimate,
    };

    res.status(200).json(response);
  });

  // موافقة العميل على العرض
  approveEstimate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { notes } = req.body;
    const approvedBy = req.user!.id;

    const jobCard = await jobCardService.approveEstimate(id, approvedBy, notes);

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Estimate approved successfully',
    };

    res.status(200).json(response);
  });

  // إغلاق بطاقة العمل
  closeJobCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { finalNotes } = req.body;

    const jobCard = await jobCardService.closeJobCard(id, finalNotes);

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Job card closed successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على بطاقات العمل النشطة
  getActiveJobCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, technicianId } = req.query;

    const filters = {
      status: 'IN_PROGRESS',
      technicianId: technicianId as string,
    };

    const jobCards = await jobCardService.getJobCards(filters);

    const response: ApiResponse = {
      success: true,
      data: jobCards,
      count: jobCards.length,
    };

    res.status(200).json(response);
  });

  // الحصول على بطاقات العمل المعلقة
  getOnHoldJobCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.query;

    const filters = {
      status: 'ON_HOLD',
    };

    const jobCards = await jobCardService.getJobCards(filters);

    const response: ApiResponse = {
      success: true,
      data: jobCards,
      count: jobCards.length,
    };

    res.status(200).json(response);
  });

  // البحث في بطاقات العمل
  searchJobCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { 
      query, 
      status, 
      technicianId, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 10 
    } = req.query as any;

    // البحث في جميع بطاقات العمل ثم تطبيق الفلتر
    const allJobCards = await jobCardService.getJobCards();
    
    let filteredJobCards = allJobCards;
    
    if (query) {
      const searchQuery = (query as string).toLowerCase();
      filteredJobCards = filteredJobCards.filter(jobCard => 
        jobCard.jobNumber.toLowerCase().includes(searchQuery) ||
        jobCard.booking?.customer?.name?.toLowerCase().includes(searchQuery) ||
        jobCard.booking?.vehicle?.plate?.toLowerCase().includes(searchQuery) ||
        jobCard.booking?.vehicle?.make?.toLowerCase().includes(searchQuery) ||
        jobCard.booking?.vehicle?.model?.toLowerCase().includes(searchQuery) ||
        jobCard.customerComplaint?.toLowerCase().includes(searchQuery) ||
        jobCard.technicianNotes?.toLowerCase().includes(searchQuery)
      );
    }
    
    if (status) {
      filteredJobCards = filteredJobCards.filter(jc => jc.status === status);
    }
    
    if (technicianId) {
      filteredJobCards = filteredJobCards.filter(jc => jc.assignedTechnicianId === technicianId);
    }
    
    if (dateFrom || dateTo) {
      filteredJobCards = filteredJobCards.filter(jc => {
        const createdDate = new Date(jc.createdAt);
        if (dateFrom && createdDate < new Date(dateFrom)) return false;
        if (dateTo && createdDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // تطبيق الصفحة
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedJobCards = filteredJobCards.slice(startIndex, endIndex);

    const response: PaginatedResponse = {
      success: true,
      data: paginatedJobCards,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: filteredJobCards.length,
        totalPages: Math.ceil(filteredJobCards.length / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على إحصائيات بطاقات العمل
  getJobCardStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, dateFrom, dateTo } = req.query;

    const filters = {
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo as string,
    };

    const allJobCards = await jobCardService.getJobCards(filters);

    const stats = {
      total: allJobCards.length,
      byStatus: {
        OPEN: allJobCards.filter(jc => jc.status === 'OPEN').length,
        IN_PROGRESS: allJobCards.filter(jc => jc.status === 'IN_PROGRESS').length,
        ON_HOLD: allJobCards.filter(jc => jc.status === 'ON_HOLD').length,
        COMPLETED: allJobCards.filter(jc => jc.status === 'COMPLETED').length,
        CLOSED: allJobCards.filter(jc => jc.status === 'CLOSED').length,
      },
      byPriority: {
        LOW: allJobCards.filter(jc => jc.priority === 'LOW').length,
        MEDIUM: allJobCards.filter(jc => jc.priority === 'MEDIUM').length,
        HIGH: allJobCards.filter(jc => jc.priority === 'HIGH').length,
        URGENT: allJobCards.filter(jc => jc.priority === 'URGENT').length,
      },
      averageDuration: allJobCards.reduce((sum, jc) => sum + (jc.actualDuration || 0), 0) / allJobCards.length || 0,
      totalRevenue: allJobCards.reduce((sum, jc) => sum + (jc.actualCost || 0), 0),
      estimatedRevenue: allJobCards.reduce((sum, jc) => sum + (jc.estimatedCost || 0), 0),
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });

  // تعيين فني لبطاقة العمل
  assignTechnician = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { technicianId } = req.body;

    const jobCard = await jobCardService.updateJobCard(id, {
      assignedTechnicianId: technicianId,
    });

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Technician assigned successfully',
    };

    res.status(200).json(response);
  });

  // تعيين مكان عمل (Bay) لبطاقة العمل
  assignBay = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { bayId } = req.body;

    const jobCard = await jobCardService.updateJobCard(id, {
      assignedBayId: bayId,
    });

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Bay assigned successfully',
    };

    res.status(200).json(response);
  });

  // إضافة ملاحظات داخلية
  addInternalNotes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { notes } = req.body;

    const jobCard = await jobCardService.updateJobCard(id, {
      internalNotes: notes,
    });

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Internal notes added successfully',
    };

    res.status(200).json(response);
  });

  // تحديث شكوى العميل
  updateCustomerComplaint = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { complaint } = req.body;

    const jobCard = await jobCardService.updateJobCard(id, {
      customerComplaint: complaint,
    });

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Customer complaint updated successfully',
    };

    res.status(200).json(response);
  });

  // تحديث ملاحظات الفني
  updateTechnicianNotes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { notes } = req.body;

    const jobCard = await jobCardService.updateJobCard(id, {
      technicianNotes: notes,
    });

    const response: ApiResponse = {
      success: true,
      data: jobCard,
      message: 'Technician notes updated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على تاريخ بطاقة عمل كامل
  getJobCardHistory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const jobCard = await jobCardService.getJobCardById(id);

    const history = {
      jobCard,
      timeTracking: jobCard.timeTracking,
      statusChanges: [], // يمكن إضافة هذا من جدول التغييرات
      images: jobCard.images || [],
      videos: jobCard.videos || [],
      customerApproval: jobCard.customerApproval,
    };

    const response: ApiResponse = {
      success: true,
      data: history,
    };

    res.status(200).json(response);
  });
}

export const jobCardController = new JobCardController();
