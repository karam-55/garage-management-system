import Joi from 'joi';

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  vin: /^[A-HJ-NPR-Z0-9]{17}$/,
};

// Custom validation functions
export const validators = {
  isValidEmail: (email: string): boolean => patterns.email.test(email),
  isValidPhone: (phone: string): boolean => patterns.phone.test(phone),
  isValidPassword: (password: string): boolean => patterns.password.test(password),
  isValidUUID: (uuid: string): boolean => patterns.uuid.test(uuid),
  isValidVIN: (vin: string): boolean => patterns.vin.test(vin),
  
  isStrongPassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  isFutureDate: (date: Date): boolean => {
    return date > new Date();
  },
  
  isPastDate: (date: Date): boolean => {
    return date < new Date();
  },
  
  isValidYear: (year: number): boolean => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 1;
  },
  
  isValidMileage: (mileage: number): boolean => {
    return mileage >= 0 && mileage <= 1000000;
  },
  
  isValidPrice: (price: number): boolean => {
    return price > 0 && price <= 10000;
  },
  
  isValidDuration: (duration: number): boolean => {
    return duration > 0 && duration <= 480; // Max 8 hours
  },
  
  isValidRating: (rating: number): boolean => {
    return rating >= 1 && rating <= 5;
  },
};

// Sanitization functions
export const sanitizers = {
  sanitizeString: (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
  },
  
  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim();
  },
  
  sanitizePhone: (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  },
  
  sanitizePlate: (plate: string): string => {
    return plate.toUpperCase().trim().replace(/\s+/g, '');
  },
  
  sanitizeVIN: (vin: string): string => {
    return vin.toUpperCase().trim().replace(/\s+/g, '');
  },
};

// Validation error formatter
export const formatValidationError = (error: Joi.ValidationError): string => {
  return error.details
    .map((detail) => detail.message.replace(/"/g, ''))
    .join(', ');
};

// Common validation schemas
export const commonSchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
  
  dateRange: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().min(Joi.ref('startDate')),
  }),
  
  uuid: Joi.string().uuid().required(),
  
  optionalUuid: Joi.string().uuid().optional(),
  
  search: Joi.string().max(100).optional(),
};

// Business validation functions
export const businessValidators = {
  // Booking validations
  canBookAtTime: (scheduledAt: Date, existingBookings: Date[]): boolean => {
    const bookingWindow = 60 * 60 * 1000; // 1 hour window
    return !existingBookings.some(booking => 
      Math.abs(booking.getTime() - scheduledAt.getTime()) < bookingWindow
    );
  },
  
  canCancelBooking: (status: string, scheduledAt: Date): boolean => {
    const hoursUntilBooking = (scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
    return status !== 'COMPLETED' && status !== 'IN_PROGRESS' && hoursUntilBooking > 2;
  },
  
  // Vehicle validations
  isVehicleOwner: (vehicleUserId: string, currentUserId: string): boolean => {
    return vehicleUserId === currentUserId;
  },
  
  // Garage validations
  canManageGarage: (garageOwnerId: string, currentUserId: string, userRole: string): boolean => {
    return garageOwnerId === currentUserId || userRole === 'ADMIN';
  },
  
  // Service validations
  canDeleteService: (bookingCount: number): boolean => {
    return bookingCount === 0;
  },
  
  // Inventory validations
  hasSufficientStock: (currentStock: number, requestedQuantity: number): boolean => {
    return currentStock >= requestedQuantity;
  },
  
  isLowStock: (currentStock: number, minStock: number): boolean => {
    return currentStock <= minStock;
  },
};

// Input validation middleware helper
export const validateInput = (schema: Joi.ObjectSchema) => {
  return (data: any) => {
    const { error, value } = schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const formattedError = formatValidationError(error);
      throw new Error(formattedError);
    }
    
    return value;
  };
};

// File validation utilities
export const fileValidators = {
  isValidImageType: (mimetype: string): boolean => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimetype);
  },
  
  isValidFileSize: (size: number, maxSize: number = 5 * 1024 * 1024): boolean => {
    return size <= maxSize;
  },
  
  isValidDocumentType: (mimetype: string): boolean => {
    return ['application/pdf', 'image/jpeg', 'image/png'].includes(mimetype);
  },
};

// API validation utilities
export const apiValidators = {
  isValidApiKey: (apiKey: string): boolean => {
    return apiKey.length >= 32 && /^[a-zA-Z0-9]+$/.test(apiKey);
  },
  
  isValidWebhookUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  },
};

export default {
  patterns,
  validators,
  sanitizers,
  formatValidationError,
  commonSchemas,
  businessValidators,
  validateInput,
  fileValidators,
  apiValidators,
};
