import { Router } from 'express';
import { userController } from '@/controllers/userController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, paginationSchema, updateProfileSchema } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User's own routes - must be before /:id to avoid being treated as id parameter
router.get('/me/vehicles', userController.getUserVehicles);
router.get('/me/bookings', userController.getUserBookings);
router.get('/me/invoices', userController.getUserInvoices);
router.get('/me/notifications', userController.getUserNotifications);
router.put('/me/notifications/read-all', userController.markAllNotificationsAsRead);

// Admin only routes
router.get('/', authorize('ADMIN'), validateQuery(paginationSchema), userController.getAllUsers);
router.get('/:id', authorize('ADMIN'), validateParams(uuidSchema), userController.getUserById);
router.put('/:id', authorize('ADMIN'), validateParams(uuidSchema), validate(updateProfileSchema), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), validateParams(uuidSchema), userController.deleteUser);
router.put('/:id/activate', authorize('ADMIN'), validateParams(uuidSchema), userController.activateUser);
router.put('/:id/deactivate', authorize('ADMIN'), validateParams(uuidSchema), userController.deactivateUser);

export { router as userRoutes };
