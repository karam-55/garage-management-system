import { Router } from 'express';
import { reportController } from '@/controllers/reportController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, dateRangeSchema } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Daily reports
router.get('/daily', validateQuery(dateRangeSchema), reportController.getDailyReports);
router.get('/daily/garage/:garageId', validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.getGarageDailyReports);

// Garage reports
router.get('/garage/:garageId', validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.getGarageReport);
router.get('/garage/:garageId/performance', validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.getGaragePerformanceReport);
router.get('/garage/:garageId/revenue', validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.getGarageRevenueReport);
router.get('/garage/:garageId/services', validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.getGarageServicesReport);

// Mechanic reports
router.get('/mechanic/:mechanicId', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.getMechanicReport);
router.get('/mechanic/:mechanicId/performance', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.getMechanicPerformanceReport);

// Admin reports
router.get('/admin/overview', authorize('ADMIN'), validateQuery(dateRangeSchema), reportController.getAdminOverviewReport);
router.get('/admin/users', authorize('ADMIN'), validateQuery(dateRangeSchema), reportController.getAdminUsersReport);
router.get('/admin/garages', authorize('ADMIN'), validateQuery(dateRangeSchema), reportController.getAdminGaragesReport);

// Export reports
router.get('/export/daily', validateQuery(dateRangeSchema), reportController.exportDailyReports);
router.get('/export/garage/:garageId', validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.exportGarageReport);
router.get('/export/mechanic/:mechanicId', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), validateQuery(dateRangeSchema), reportController.exportMechanicReport);

export { router as reportRoutes };
