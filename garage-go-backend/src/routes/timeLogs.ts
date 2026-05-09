import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { timeLogController } from '@/controllers/timeLogController';
import Joi from 'joi';

const router = Router();

// Validation schemas
const startTimeLogSchema = Joi.object({
  bookingId: Joi.string().required(),
  description: Joi.string().optional(),
});

const updateTimeLogSchema = Joi.object({
  description: Joi.string().required(),
});

// All routes require authentication
router.use(authenticate);

// Time log routes
router.post('/', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC'), validateRequest(startTimeLogSchema), timeLogController.startTimeLog);
router.post('/:id/stop', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC'), timeLogController.stopTimeLog);
router.get('/mechanic/:mechanicId', timeLogController.getMechanicTimeLogs);
router.get('/booking/:bookingId', timeLogController.getBookingTimeLogs);
router.get('/summary', timeLogController.getTimeSummary);
router.put('/:id', validateRequest(updateTimeLogSchema), timeLogController.updateTimeLog);
router.delete('/:id', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC'), timeLogController.deleteTimeLog);

export default router;
