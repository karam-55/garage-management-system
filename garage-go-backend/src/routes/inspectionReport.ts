import { Router } from 'express';
import { inspectionReportController } from '@/controllers/inspectionReportController';
import { authenticateToken, requireRole } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// === إنشاء تقارير الفحص ===

// إنشاء تقرير فحص جديد
router.post('/',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    body('jobCardId').notEmpty().withMessage('Job card ID is required'),
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('mileage').isInt({ min: 0 }).withMessage('Valid mileage is required'),
    body('overallCondition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL']).withMessage('Valid overall condition is required'),
    body('summary').optional().isString(),
    body('recommendations').optional().isArray(),
    body('images').optional().isArray(),
    body('videos').optional().isArray(),
    body('customerNotes').optional().isString(),
    body('internalNotes').optional().isString(),
    body('requiresImmediateAttention').optional().isBoolean(),
    body('estimatedRepairCost').optional().isFloat({ min: 0 }),
    body('nextInspectionDate').optional().isISO8601(),
  ],
  validateRequest,
  inspectionReportController.createReport
);

// إنشاء تقرير فحص من بطاقة عمل
router.post('/from-job-card',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    body('jobCardId').notEmpty().withMessage('Job card ID is required'),
    body('initialData').optional().isObject(),
  ],
  validateRequest,
  inspectionReportController.createFromJobCard
);

// === عرض وبحث تقارير الفحص ===

// الحصول على جميع تقارير الفحص
router.get('/',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('vehicleId').optional().isUUID(),
    query('technicianId').optional().isUUID(),
    query('status').optional().isString(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('requiresAttention').optional().isBoolean(),
  ],
  validateRequest,
  inspectionReportController.getAllReports
);

// البحث في تقارير الفحص
router.get('/search',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('query').optional().isString(),
    query('vehicleId').optional().isUUID(),
    query('technicianId').optional().isUUID(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  inspectionReportController.searchReports
);

// الحصول على التقارير التي تتطلب انتباهاً فورياً
router.get('/urgent',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('garageId').optional().isUUID(),
  ],
  validateRequest,
  inspectionReportController.getUrgentReports
);

// الحصول على إحصائيات تقارير الفحص
router.get('/stats',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    query('garageId').optional().isUUID(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
  ],
  validateRequest,
  inspectionReportController.getReportStats
);

// === إدارة تقرير الفحص الفردي ===

// الحصول على تقرير فحص محدد
router.get('/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
  ],
  validateRequest,
  inspectionReportController.getReportById
);

// تحديث تقرير الفحص
router.put('/:id',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('mileage').optional().isInt({ min: 0 }),
    body('overallCondition').optional().isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL']),
    body('summary').optional().isString(),
    body('recommendations').optional().isArray(),
    body('images').optional().isArray(),
    body('videos').optional().isArray(),
    body('customerNotes').optional().isString(),
    body('internalNotes').optional().isString(),
    body('requiresImmediateAttention').optional().isBoolean(),
    body('estimatedRepairCost').optional().isFloat({ min: 0 }),
    body('nextInspectionDate').optional().isISO8601(),
  ],
  validateRequest,
  inspectionReportController.updateReport
);

// تحديث الصور والفيديوهات
router.put('/:id/media',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('images').optional().isArray(),
    body('videos').optional().isArray(),
  ],
  validateRequest,
  inspectionReportController.updateMedia
);

// تحديث الملخص
router.put('/:id/summary',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('summary').notEmpty().withMessage('Summary is required'),
  ],
  validateRequest,
  inspectionReportController.updateSummary
);

// تحديث الملاحظات الداخلية
router.put('/:id/internal-notes',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  inspectionReportController.updateInternalNotes
);

// تحديث ملاحظات العميل
router.put('/:id/customer-notes',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  inspectionReportController.updateCustomerNotes
);

// إضافة توصية جديدة
router.post('/:id/recommendations',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('recommendation').notEmpty().withMessage('Recommendation is required'),
  ],
  validateRequest,
  inspectionReportController.addRecommendation
);

// === فئات وعناصر الفحص ===

// إضافة فئة فحص جديدة
router.post('/:id/categories',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('categoryName').notEmpty().withMessage('Category name is required'),
    body('categoryStatus').isIn(['GOOD', 'ATTENTION', 'CRITICAL']).withMessage('Valid category status is required'),
    body('notes').optional().isString(),
    body('images').optional().isArray(),
    body('estimatedCost').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  inspectionReportController.addCategory
);

// حذف فئة فحص
router.delete('/categories/:categoryId',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    param('categoryId').isUUID().withMessage('Valid category ID is required'),
  ],
  validateRequest,
  inspectionReportController.deleteCategory
);

// إضافة عنصر فحص جديد
router.post('/categories/:categoryId/items',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('categoryId').isUUID().withMessage('Valid category ID is required'),
    body('itemName').notEmpty().withMessage('Item name is required'),
    body('itemStatus').isIn(['GOOD', 'ATTENTION', 'CRITICAL']).withMessage('Valid item status is required'),
    body('condition').notEmpty().withMessage('Condition is required'),
    body('measurements').optional().isObject(),
    body('notes').optional().isString(),
    body('images').optional().isArray(),
    body('estimatedCost').optional().isFloat({ min: 0 }),
    body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Valid priority is required'),
    body('recommendedAction').optional().isString(),
    body('partsNeeded').optional().isArray(),
  ],
  validateRequest,
  inspectionReportController.addInspectionItem
);

// تحديث عنصر الفحص
router.put('/items/:itemId',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('itemId').isUUID().withMessage('Valid item ID is required'),
    body('itemName').optional().isString(),
    body('itemStatus').optional().isIn(['GOOD', 'ATTENTION', 'CRITICAL']),
    body('condition').optional().isString(),
    body('measurements').optional().isObject(),
    body('notes').optional().isString(),
    body('images').optional().isArray(),
    body('estimatedCost').optional().isFloat({ min: 0 }),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    body('recommendedAction').optional().isString(),
    body('partsNeeded').optional().isArray(),
  ],
  validateRequest,
  inspectionReportController.updateInspectionItem
);

// حذف عنصر فحص
router.delete('/items/:itemId',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    param('itemId').isUUID().withMessage('Valid item ID is required'),
  ],
  validateRequest,
  inspectionReportController.deleteInspectionItem
);

// === التقارير الخاصة ===

// الحصول على تقرير الفحص للعميل
router.get('/:id/customer',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
  ],
  validateRequest,
  inspectionReportController.getCustomerReport
);

// الحصول على تقرير الفحص للفني
router.get('/:id/technician',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
  ],
  validateRequest,
  inspectionReportController.getTechnicianReport
);

// === إنشاء وتصدير التقارير ===

// إنشاء تقرير PDF
router.get('/:id/pdf',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    query('type').optional().isIn(['CUSTOMER', 'TECHNICIAN', 'FULL']),
  ],
  validateRequest,
  inspectionReportController.generatePDF
);

// إرسال التقرير للعميل
router.post('/:id/send',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid report ID is required'),
    body('method').isIn(['EMAIL', 'WHATSAPP', 'SMS']).withMessage('Valid send method is required'),
  ],
  validateRequest,
  inspectionReportController.sendToCustomer
);

// === تقارير السيارة ===

// الحصول على تاريخ فحص السيارة
router.get('/vehicle/:vehicleId/history',
  authenticateToken,
  [
    param('vehicleId').isUUID().withMessage('Valid vehicle ID is required'),
  ],
  validateRequest,
  inspectionReportController.getVehicleHistory
);

export default router;
