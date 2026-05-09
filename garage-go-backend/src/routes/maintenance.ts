import { Router } from 'express';
import { maintenanceController } from '@/controllers/maintenanceController';
import { authenticate, authorize } from '@/middleware/auth';
import { validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, paginationSchema, dateRangeSchema } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes - view their vehicle maintenance records
router.get('/vehicle/:vehicleId', validateParams(uuidSchema), maintenanceController.getVehicleMaintenanceRecords);
router.get('/booking/:bookingId', validateParams(uuidSchema), maintenanceController.getBookingMaintenanceRecords);

// Garage owner and mechanic routes
router.post('/', authorize('OWNER', 'MECHANIC', 'ADMIN'), maintenanceController.createMaintenanceRecord);
router.get('/', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateQuery(paginationSchema), maintenanceController.getAllMaintenanceRecords);
router.get('/:id', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), maintenanceController.getMaintenanceRecordById);
router.put('/:id', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), maintenanceController.updateMaintenanceRecord);
router.delete('/:id', authorize('ADMIN'), validateParams(uuidSchema), maintenanceController.deleteMaintenanceRecord);

// Get maintenance records by garage
router.get('/garage/:garageId', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), validateQuery(dateRangeSchema), maintenanceController.getGarageMaintenanceRecords);

// Get maintenance records by mechanic
router.get('/mechanic/:mechanicId', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), validateQuery(dateRangeSchema), maintenanceController.getMechanicMaintenanceRecords);

export { router as maintenanceRoutes };
