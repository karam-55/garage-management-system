import { Router } from 'express';
import { notificationController } from '@/controllers/notificationController';
import { authenticate, authorize } from '@/middleware/auth';
import { validateParams, validateQuery, validate } from '@/middleware/validation';
import { uuidSchema, paginationSchema } from '@/middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Maintenance notification schemas
const maintenanceNotificationSchema = Joi.object({
  bookingId: Joi.string().uuid().required(),
  type: Joi.string().valid('VEHICLE_ENTRY', 'WORK_STARTED', 'SERVICE_COMPLETED', 'NEW_ISSUE', 'MAINTENANCE_COMPLETED', 'INVOICE_SENT').required(),
  data: Joi.object().optional(),
});

// Maintenance notification routes
router.post('/maintenance', validate(maintenanceNotificationSchema), notificationController.sendMaintenanceNotification);

// User notification routes
router.get('/', validateQuery(paginationSchema), notificationController.getUserNotifications);
router.get('/unread', validateQuery(paginationSchema), notificationController.getUnreadNotifications);

// Bulk actions - must be before /:id to avoid being treated as id parameter
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/read-all', notificationController.deleteAllRead);

router.get('/:id', validateParams(uuidSchema), notificationController.getNotificationById);
router.put('/:id/read', validateParams(uuidSchema), notificationController.markAsRead);
router.put('/:id/unread', validateParams(uuidSchema), notificationController.markAsUnread);
router.delete('/:id', validateParams(uuidSchema), notificationController.deleteNotification);

// Admin routes
router.post('/', authorize('ADMIN'), notificationController.createNotification);
router.get('/admin/all', authorize('ADMIN'), validateQuery(paginationSchema), notificationController.getAllNotifications);
router.get('/admin/user/:userId', authorize('ADMIN'), validateParams(uuidSchema), validateQuery(paginationSchema), notificationController.getUserNotifications);

export { router as notificationRoutes };
