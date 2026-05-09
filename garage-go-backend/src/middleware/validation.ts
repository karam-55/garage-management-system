import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationResult } from 'express-validator';
import { CustomError } from './errorHandler';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new CustomError(message, 400));
  }
  next();
};

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new CustomError(errorMessage, 400));
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new CustomError(errorMessage, 400));
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new CustomError(errorMessage, 400));
    }

    next();
  };
};

// Common validation schemas
export const uuidSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional().min(Joi.ref('startDate')),
});

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    }),
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().optional().allow(''),
  role: Joi.string().valid('CUSTOMER').default('CUSTOMER'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional().allow(''),
  avatar: Joi.string().uri().optional(),
});

// Garage validation schemas
export const createGarageSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  address: Joi.string().max(200).optional(),
  phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional(),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
});

export const updateGarageSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  address: Joi.string().max(200).optional().allow(''),
  phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  website: Joi.string().uri().optional().allow(''),
  logo: Joi.string().uri().optional(),
});

// Vehicle validation schemas
export const createVehicleSchema = Joi.object({
  plate: Joi.string().min(3).max(20).required(),
  make: Joi.string().min(2).max(50).required(),
  model: Joi.string().min(2).max(50).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  vin: Joi.string().pattern(new RegExp('^[A-HJ-NPR-Z0-9]{17}$')).optional(),
  color: Joi.string().max(30).optional(),
  mileage: Joi.number().integer().min(0).optional(),
});

export const updateVehicleSchema = Joi.object({
  plate: Joi.string().min(3).max(20).optional(),
  make: Joi.string().min(2).max(50).optional(),
  model: Joi.string().min(2).max(50).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  vin: Joi.string().pattern(new RegExp('^[A-HJ-NPR-Z0-9]{17}$')).optional(),
  color: Joi.string().max(30).optional().allow(''),
  mileage: Joi.number().integer().min(0).optional(),
});

// Service validation schemas
export const createServiceSchema = Joi.object({
  code: Joi.string().max(20).optional(),
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().positive().precision(2).required(),
  duration: Joi.number().integer().min(1).max(480).optional(), // Max 8 hours
  metadata: Joi.object().optional(),
});

export const updateServiceSchema = Joi.object({
  code: Joi.string().max(20).optional(),
  title: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  price: Joi.number().positive().precision(2).optional(),
  duration: Joi.number().integer().min(1).max(480).optional(),
  isActive: Joi.boolean().optional(),
  metadata: Joi.object().optional(),
});

// Booking validation schemas
export const createBookingSchema = Joi.object({
  garageId: Joi.string().uuid().required(),
  customerId: Joi.string().uuid().optional(),
  vehicleId: Joi.string().uuid().required(),
  serviceId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().iso().min('now').required(),
  issues: Joi.string().max(2000).optional(),
  notes: Joi.string().max(1000).optional(),
});

export const updateBookingSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
  scheduledAt: Joi.date().iso().optional(),
  startedAt: Joi.date().iso().optional(),
  completedAt: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).optional().allow(''),
  totalPrice: Joi.number().positive().precision(2).optional(),
});

export const bookingQuerySchema = Joi.object({
  garageId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  vehicleId: Joi.string().uuid().optional(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().min(Joi.ref('startDate')),
  ...paginationSchema.describe().keys,
});

// Inventory validation schemas
export const createInventorySchema = Joi.object({
  sku: Joi.string().max(50).optional(),
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  quantity: Joi.number().integer().min(0).required(),
  unitPrice: Joi.number().positive().precision(2).required(),
  minStock: Joi.number().integer().min(0).default(5),
  supplier: Joi.string().max(100).optional(),
  metadata: Joi.object().optional(),
});

export const updateInventorySchema = Joi.object({
  sku: Joi.string().max(50).optional(),
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  quantity: Joi.number().integer().min(0).optional(),
  unitPrice: Joi.number().positive().precision(2).optional(),
  minStock: Joi.number().integer().min(0).optional(),
  supplier: Joi.string().max(100).optional().allow(''),
  metadata: Joi.object().optional(),
});
