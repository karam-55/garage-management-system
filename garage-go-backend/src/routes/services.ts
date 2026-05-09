import { Router } from 'express';
import { serviceController } from '@/controllers/serviceController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, paginationSchema, createServiceSchema, updateServiceSchema } from '@/middleware/validation';

const router = Router();

// Public routes - anyone can view services
router.get('/', validateQuery(paginationSchema), serviceController.getAllServices);
// must be before /:id to avoid being treated as id parameter
router.get('/garage/:garageId', validateParams(uuidSchema), serviceController.getGarageServices);
router.get('/:id', validateParams(uuidSchema), serviceController.getServiceById);

// Protected routes - require authentication
router.use(authenticate);

// Garage owner and mechanic routes
router.post('/', authorize('OWNER', 'MECHANIC', 'ADMIN'), validate(createServiceSchema), serviceController.createService);
router.put('/:id', validateParams(uuidSchema), validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', validateParams(uuidSchema), serviceController.deleteService);
router.put('/:id/activate', validateParams(uuidSchema), serviceController.activateService);
router.put('/:id/deactivate', validateParams(uuidSchema), serviceController.deactivateService);

export { router as serviceRoutes };
