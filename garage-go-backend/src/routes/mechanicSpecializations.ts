import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { mechanicSpecializationController } from '@/controllers/mechanicSpecializationController';
import Joi from 'joi';

const router = Router();

// Validation schemas
const addSpecializationSchema = Joi.object({
  mechanicId: Joi.string().required(),
  serviceId: Joi.string().required(),
  skillLevel: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'EXPERT').optional(),
});

const updateSpecializationSchema = Joi.object({
  skillLevel: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'EXPERT').required(),
});

// All routes require authentication
router.use(authenticate);

// Specialization routes
router.post('/', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER'), validateRequest(addSpecializationSchema), mechanicSpecializationController.addSpecialization);
router.get('/mechanic/:mechanicId', mechanicSpecializationController.getMechanicSpecializations);
router.get('/service/:serviceId', mechanicSpecializationController.getMechanicsByService);
router.put('/:id', validateRequest(updateSpecializationSchema), mechanicSpecializationController.updateSpecialization);
router.delete('/:id', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER'), mechanicSpecializationController.deleteSpecialization);

export default router;
