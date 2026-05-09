import { Router } from 'express';
import { jobCardController } from '@/controllers/jobCardController';
import { authenticateToken, requireRole } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// === إنشاء بطاقات العمل ===

// إنشاء بطاقة عمل من حجز موجود
router.post('/from-booking',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
  ],
  validateRequest,
  jobCardController.createFromBooking
);

// إنشاء بطاقة عمل يدوية (لزيارات بدون حجز)
router.post('/manual',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    body('customerId').notEmpty().withMessage('Customer ID is required'),
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('customerComplaint').optional().isString(),
    body('estimatedDuration').optional().isInt({ min: 1 }),
    body('estimatedCost').optional().isFloat({ min: 0 }),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  ],
  validateRequest,
  jobCardController.createManual
);

// === عرض وبحث بطاقات العمل ===

// الحصول على جميع بطاقات العمل
router.get('/',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED']),
    query('technicianId').optional().isUUID(),
    query('bayId').optional().isUUID(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  ],
  validateRequest,
  jobCardController.getAllJobCards
);

// البحث في بطاقات العمل
router.get('/search',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('query').optional().isString(),
    query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED']),
    query('technicianId').optional().isUUID(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  jobCardController.searchJobCards
);

// الحصول على بطاقات العمل النشطة
router.get('/active',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('garageId').optional().isUUID(),
    query('technicianId').optional().isUUID(),
  ],
  validateRequest,
  jobCardController.getActiveJobCards
);

// الحصول على بطاقات العمل المعلقة
router.get('/on-hold',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('garageId').optional().isUUID(),
  ],
  validateRequest,
  jobCardController.getOnHoldJobCards
);

// الحصول على إحصائيات بطاقات العمل
router.get('/stats',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    query('garageId').optional().isUUID(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
  ],
  validateRequest,
  jobCardController.getJobCardStats
);

// === إدارة بطاقة العمل الفردية ===

// الحصول على بطاقة عمل محددة
router.get('/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
  ],
  validateRequest,
  jobCardController.getJobCardById
);

// تحديث بطاقة العمل
router.put('/:id',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    body('customerComplaint').optional().isString(),
    body('technicianNotes').optional().isString(),
    body('estimatedDuration').optional().isInt({ min: 1 }),
    body('actualDuration').optional().isInt({ min: 0 }),
    body('estimatedCost').optional().isFloat({ min: 0 }),
    body('actualCost').optional().isFloat({ min: 0 }),
    body('assignedTechnicianId').optional().isUUID(),
    body('assignedBayId').optional().isUUID(),
    body('images').optional().isArray(),
    body('videos').optional().isArray(),
    body('followUpRequired').optional().isBoolean(),
    body('followUpDate').optional().isISO8601(),
  ],
  validateRequest,
  jobCardController.updateJobCard
);

// تعيين فني لبطاقة العمل
router.post('/:id/assign-technician',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('technicianId').notEmpty().withMessage('Technician ID is required'),
  ],
  validateRequest,
  jobCardController.assignTechnician
);

// تعيين مكان عمل (Bay) لبطاقة العمل
router.post('/:id/assign-bay',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('bayId').notEmpty().withMessage('Bay ID is required'),
  ],
  validateRequest,
  jobCardController.assignBay
);

// إضافة ملاحظات داخلية
router.post('/:id/internal-notes',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('notes').notEmpty().withMessage('Notes are required'),
  ],
  validateRequest,
  jobCardController.addInternalNotes
);

// تحديث شكوى العميل
router.put('/:id/customer-complaint',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('complaint').notEmpty().withMessage('Complaint is required'),
  ],
  validateRequest,
  jobCardController.updateCustomerComplaint
);

// تحديث ملاحظات الفني
router.put('/:id/technician-notes',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  jobCardController.updateTechnicianNotes
);

// === عناصر العمل ===

// إضافة عنصر عمل جديد
router.post('/:id/job-items',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
    body('estimatedTime').optional().isInt({ min: 1 }),
    body('notes').optional().isString(),
  ],
  validateRequest,
  jobCardController.addJobItem
);

// تحديث عنصر عمل
router.put('/job-items/:jobItemId',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('jobItemId').isUUID().withMessage('Valid job item ID is required'),
    body('description').optional().isString(),
    body('quantity').optional().isInt({ min: 1 }),
    body('unitPrice').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    body('notes').optional().isString(),
    body('estimatedTime').optional().isInt({ min: 1 }),
    body('actualTime').optional().isInt({ min: 0 }),
    body('technicianId').optional().isUUID(),
  ],
  validateRequest,
  jobCardController.updateJobItem
);

// === قطع الغيار المستخدمة ===

// إضافة قطعة غيار مستخدمة
router.post('/:id/parts-used',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('partId').notEmpty().withMessage('Part ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
    body('batchNumber').optional().isString(),
    body('serialNumber').optional().isString(),
    body('warrantyPeriod').optional().isInt({ min: 0 }),
    body('notes').optional().isString(),
  ],
  validateRequest,
  jobCardController.addPartUsed
);

// === تتبع الوقت ===

// بدء تتبع الوقت
router.post('/:id/time-tracking/start',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('activity').notEmpty().withMessage('Activity is required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  jobCardController.startTimeTracking
);

// إنهاء تتبع الوقت
router.post('/time-tracking/:timeTrackingId/end',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('timeTrackingId').isUUID().withMessage('Valid time tracking ID is required'),
  ],
  validateRequest,
  jobCardController.endTimeTracking
);

// === العروض والموافقات ===

// الحصول على عرض السعر
router.get('/:id/estimate',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
  ],
  validateRequest,
  jobCardController.getEstimate
);

// موافقة العميل على العرض
router.post('/:id/approve-estimate',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  jobCardController.approveEstimate
);

// === إغلاق وإتمام ===

// إغلاق بطاقة العمل
router.post('/:id/close',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
    body('finalNotes').optional().isString(),
  ],
  validateRequest,
  jobCardController.closeJobCard
);

// الحصول على تاريخ بطاقة عمل كامل
router.get('/:id/history',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid job card ID is required'),
  ],
  validateRequest,
  jobCardController.getJobCardHistory
);

export default router;
