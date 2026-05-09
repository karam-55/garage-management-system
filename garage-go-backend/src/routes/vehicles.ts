import { Router } from 'express';
import { vehicleController } from '@/controllers/vehicleController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, paginationSchema, createVehicleSchema, updateVehicleSchema } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', validate(createVehicleSchema), vehicleController.createVehicle);
router.get('/', validateQuery(paginationSchema), vehicleController.getUserVehicles);

// Admin routes - must be before /:id to avoid being treated as id parameter
router.get('/admin/all', authorize('ADMIN'), validateQuery(paginationSchema), vehicleController.getAllVehicles);
router.get('/admin/:id', authorize('ADMIN'), validateParams(uuidSchema), vehicleController.getVehicleById);

router.get('/:id', validateParams(uuidSchema), vehicleController.getVehicleById);
router.put('/:id', validateParams(uuidSchema), validate(updateVehicleSchema), vehicleController.updateVehicle);
router.delete('/:id', validateParams(uuidSchema), vehicleController.deleteVehicle);

// Get vehicle's bookings and maintenance records
router.get('/:id/bookings', validateParams(uuidSchema), vehicleController.getVehicleBookings);
router.get('/:id/maintenance', validateParams(uuidSchema), vehicleController.getVehicleMaintenanceRecords);

export { router as vehicleRoutes };
