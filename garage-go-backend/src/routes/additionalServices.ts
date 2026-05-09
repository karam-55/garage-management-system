import { Router } from 'express';
import { additionalServiceController } from '@/controllers/additionalServiceController';
import { authenticate } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, paginationSchema } from '@/middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Additional Service schemas
const createAdditionalServiceSchema = Joi.object({
  bookingId: Joi.string().uuid().required(),
  serviceName: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().required(),
});

// Routes
router.post('/', validate(createAdditionalServiceSchema), additionalServiceController.createAdditionalService);
router.get('/booking/:bookingId', validateParams(uuidSchema), validateQuery(paginationSchema), additionalServiceController.getBookingAdditionalServices);
router.put('/:id/approve', validateParams(uuidSchema), additionalServiceController.approveAdditionalService);
router.put('/:id/reject', validateParams(uuidSchema), additionalServiceController.rejectAdditionalService);
router.delete('/:id', validateParams(uuidSchema), additionalServiceController.deleteAdditionalService);

export { router as additionalServiceRoutes };
