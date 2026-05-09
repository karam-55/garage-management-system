import { Router } from 'express';
import { bookingController } from '@/controllers/bookingController';
import { authenticateToken, requireRole } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// === الحجوزات الأساسية ===

// إنشاء حجز جديد
router.post('/',
  authenticateToken,
  [
    body('garageId').notEmpty().withMessage('Garage ID is required'),
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('scheduledAt').isISO8601().withMessage('Valid scheduled date is required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  bookingController.createBooking
);

// الحصول على جميع الحجوزات (للمديرين وأصحاب الورش)
router.get('/',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('garageId').optional().isUUID(),
    query('userId').optional().isUUID(),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  bookingController.getAllBookings
);

// الحصول على حجوزات المستخدم الحالي
router.get('/my-bookings',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  ],
  validateRequest,
  bookingController.getUserBookings
);

// البحث المتقدم في الحجوزات
router.get('/search',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('query').optional().isString(),
    query('garageId').optional().isUUID(),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    query('serviceType').optional().isIn(['WORKSHOP', 'PICKUP_DROP', 'FLEET', 'PACKAGE']),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  bookingController.searchBookings
);

// الحصول على حجوزات اليوم
router.get('/today',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    query('garageId').optional().isUUID(),
  ],
  validateRequest,
  bookingController.getTodayBookings
);

// الحصول على إحصائيات الحجوزات
router.get('/stats',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER'),
  [
    query('garageId').optional().isUUID(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
  ],
  validateRequest,
  bookingController.getBookingStats
);

// الحصول على المواعيد المتاحة
router.get('/available-slots',
  authenticateToken,
  [
    query('garageId').notEmpty().withMessage('Garage ID is required'),
    query('date').isISO8601().withMessage('Valid date is required'),
    query('serviceTypeId').optional().isUUID(),
    query('technicianId').optional().isUUID(),
  ],
  validateRequest,
  bookingController.getAvailableSlots
);

// === حجز مع خدمة التوصيل ===

// إنشاء حجز مع خدمة التوصيل
router.post('/pickup-drop',
  authenticateToken,
  [
    body('garageId').notEmpty().withMessage('Garage ID is required'),
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('scheduledAt').isISO8601().withMessage('Valid scheduled date is required'),
    body('pickupAddress').isObject().withMessage('Pickup address is required'),
    body('pickupAddress.street').notEmpty().withMessage('Pickup street is required'),
    body('pickupAddress.city').notEmpty().withMessage('Pickup city is required'),
    body('pickupAddress.postalCode').notEmpty().withMessage('Pickup postal code is required'),
    body('dropoffAddress').isObject().withMessage('Dropoff address is required'),
    body('dropoffAddress.street').notEmpty().withMessage('Dropoff street is required'),
    body('dropoffAddress.city').notEmpty().withMessage('Dropoff city is required'),
    body('dropoffAddress.postalCode').notEmpty().withMessage('Dropoff postal code is required'),
    body('pickupTime').isISO8601().withMessage('Valid pickup time is required'),
    body('dropoffTime').isISO8601().withMessage('Valid dropoff time is required'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  bookingController.createBookingWithPickupDrop
);

// === حجز للأساطيل ===

// إنشاء حجز للأساطيل
router.post('/fleet',
  authenticateToken,
  [
    body('garageId').notEmpty().withMessage('Garage ID is required'),
    body('fleetId').notEmpty().withMessage('Fleet ID is required'),
    body('vehicles').isArray({ min: 1 }).withMessage('At least one vehicle is required'),
    body('vehicles.*.vehicleId').notEmpty().withMessage('Vehicle ID is required for each vehicle'),
    body('vehicles.*.serviceId').notEmpty().withMessage('Service ID is required for each vehicle'),
    body('vehicles.*.scheduledAt').isISO8601().withMessage('Valid scheduled date is required for each vehicle'),
    body('notes').optional().isString(),
  ],
  validateRequest,
  bookingController.createFleetBooking
);

// === إدارة الحجز الفردي ===

// الحصول على تفاصيل حجز محدد
router.get('/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  bookingController.getBookingById
);

// تحديث حجز
router.put('/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
    body('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    body('scheduledAt').optional().isISO8601(),
    body('startedAt').optional().isISO8601(),
    body('completedAt').optional().isISO8601(),
    body('notes').optional().isString(),
    body('totalPrice').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  bookingController.updateBooking
);

// تأكيد حجز
router.post('/:id/confirm',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  bookingController.confirmBooking
);

// بدء الحجز
router.post('/:id/start',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  bookingController.startBooking
);

// إنهاء الحجز
router.post('/:id/complete',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  bookingController.completeBooking
);

// إلغاء الحجز
router.post('/:id/cancel',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
    body('reason').optional().isString(),
  ],
  validateRequest,
  bookingController.cancelBooking
);

// تحديد عدم الحضور (No Show)
router.post('/:id/no-show',
  authenticateToken,
  requireRole('ADMIN', 'GARAGE_OWNER', 'MECHANIC'),
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  bookingController.markNoShow
);

// حذف حجز
router.delete('/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid booking ID is required'),
  ],
  validateRequest,
  bookingController.deleteBooking
);

export default router;
