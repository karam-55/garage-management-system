import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { bookingController } from '@/controllers/bookingController';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createBookingSchema = Joi.object({
  garageId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  serviceId: Joi.string().required(),
  scheduledAt: Joi.date().iso().required(),
  notes: Joi.string().optional(),
  customerId: Joi.string().optional(),
});

const updateBookingSchema = Joi.object({
  scheduledAt: Joi.date().iso().optional(),
  notes: Joi.string().optional(),
  status: Joi.string().optional(),
});

// All routes require authentication
router.use(authenticate);

// Booking CRUD routes
router.post('/', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'RECEPTIONIST'), validateRequest(createBookingSchema), bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', validateRequest(updateBookingSchema), bookingController.updateBooking);
router.delete('/:id', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER'), bookingController.deleteBooking);

// Booking status routes
router.post('/:id/confirm', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'RECEPTIONIST'), bookingController.confirmBooking);
router.post('/:id/start', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC'), bookingController.startBooking);
router.post('/:id/complete', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC'), bookingController.completeBooking);
router.post('/:id/cancel', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'RECEPTIONIST', 'CUSTOMER'), bookingController.cancelBooking);
router.post('/:id/no-show', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'RECEPTIONIST'), bookingController.markNoShow);

// Booking history
router.get('/:id/history', bookingController.getBookingStatusHistory);

// QR routes
router.get('/qr/:qrToken', bookingController.getBookingByQR);
router.post('/:id/regenerate-qr', requireRole('ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'RECEPTIONIST', 'MECHANIC'), bookingController.regenerateQR);

// Available slots
router.get('/slots/available', bookingController.getAvailableSlots);

export default router;
