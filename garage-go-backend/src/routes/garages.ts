import { Router } from 'express';
import { garageController } from '@/controllers/garageController';
import { authenticate, authorize, optionalAuth } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, paginationSchema, createGarageSchema, updateGarageSchema } from '@/middleware/validation';

const router = Router();

// Public routes
router.get('/', optionalAuth, validateQuery(paginationSchema), garageController.getAllGarages);
router.get('/:id', optionalAuth, validateParams(uuidSchema), garageController.getGarageById);
router.get('/:id/services', optionalAuth, validateParams(uuidSchema), garageController.getGarageServices);
router.get('/:id/mechanics', optionalAuth, validateParams(uuidSchema), garageController.getGarageMechanics);

// Protected routes - require authentication
router.use(authenticate);

// Owner and Admin routes
router.post('/', authorize('OWNER', 'ADMIN'), validate(createGarageSchema), garageController.createGarage);
router.put('/:id', validateParams(uuidSchema), validate(updateGarageSchema), garageController.updateGarage);
router.delete('/:id', validateParams(uuidSchema), garageController.deleteGarage);

// Garage owner and mechanic routes
router.get('/:id/bookings', validateParams(uuidSchema), garageController.getGarageBookings);
router.get('/:id/inventory', validateParams(uuidSchema), garageController.getGarageInventory);
router.get('/:id/invoices', validateParams(uuidSchema), garageController.getGarageInvoices);
router.get('/:id/reports', validateParams(uuidSchema), garageController.getGarageReports);

// Garage management routes (owner only)
router.put('/:id/mechanics/:mechanicId', validateParams(uuidSchema), garageController.addMechanic);
router.delete('/:id/mechanics/:mechanicId', validateParams(uuidSchema), garageController.removeMechanic);
router.put('/:id/activate', validateParams(uuidSchema), garageController.activateGarage);
router.put('/:id/deactivate', validateParams(uuidSchema), garageController.deactivateGarage);

export { router as garageRoutes };
