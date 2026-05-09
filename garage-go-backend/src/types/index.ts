import { Request } from 'express';
import { User, Garage, Vehicle, Service, Booking, Invoice, MaintenanceRecord, PartsInventory, Notification } from '@prisma/client';

export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MECHANIC: 'MECHANIC',
  RECEPTIONIST: 'RECEPTIONIST',
  CASHIER: 'CASHIER',
  CUSTOMER: 'CUSTOMER',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;
export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

export const NotificationType = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_UPDATED: 'BOOKING_UPDATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  INVOICE_ISSUED: 'INVOICE_ISSUED',
  MAINTENANCE_DUE: 'MAINTENANCE_DUE',
  GARAGE_UPDATE: 'GARAGE_UPDATE',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// Export Prisma types for convenience
export {
  User,
  Garage,
  Vehicle,
  Service,
  Booking,
  Invoice,
  MaintenanceRecord,
  PartsInventory,
  Notification,
};

// Extended interfaces with relations
export interface UserWithRelations extends User {
  ownedGarages?: Garage[];
  mechanicGarage?: Garage | null;
  vehicles?: Vehicle[];
  bookings?: Booking[];
  invoices?: Invoice[];
  maintenanceRecords?: MaintenanceRecord[];
}

export interface GarageWithRelations extends Garage {
  owner?: User;
  mechanics?: User[];
  services?: Service[];
  inventory?: PartsInventory[];
  bookings?: Booking[];
  invoices?: Invoice[];
  maintenanceRecords?: MaintenanceRecord[];
}

export interface VehicleWithRelations extends Vehicle {
  user?: User;
  bookings?: Booking[];
  maintenanceRecords?: MaintenanceRecord[];
}

export interface ServiceWithRelations extends Service {
  garage?: Garage;
  bookings?: Booking[];
}

export interface BookingWithRelations extends Booking {
  user?: User;
  garage?: Garage;
  vehicle?: Vehicle;
  service?: Service;
  invoices?: Invoice[];
  maintenanceRecords?: MaintenanceRecord[];
}

export interface InvoiceWithRelations extends Invoice {
  booking?: Booking;
  garage?: Garage;
  user?: User;
}

export interface MaintenanceRecordWithRelations extends MaintenanceRecord {
  vehicle?: Vehicle;
  booking?: Booking;
  mechanic?: User;
  garage?: Garage;
}

// Request interfaces
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// API Response interfaces
export interface ApiResponse<T = any> {
  [key: string]: any;
  success: boolean;
  data?: T | any;
  message?: string;
  error?: {
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[] | any> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: any;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User interfaces
export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

// Garage interfaces
export interface CreateGarageData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ownerId: string;
}

export interface UpdateGarageData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
}

// Vehicle interfaces
export interface CreateVehicleData {
  userId: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  color?: string;
  mileage?: number;
}

export interface UpdateVehicleData {
  plate?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  color?: string;
  mileage?: number;
}

// Service interfaces
export interface CreateServiceData {
  garageId: string;
  code?: string;
  title: string;
  description?: string;
  price: number;
  duration?: number;
  metadata?: any;
}

export interface UpdateServiceData {
  code?: string;
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
  metadata?: any;
}

// Booking interfaces
export interface CreateBookingData {
  userId: string;
  garageId: string;
  vehicleId: string;
  serviceId: string;
  scheduledAt: Date;
  notes?: string;
  totalPrice?: number;
  metadata?: any;
}

export interface UpdateBookingData {
  status?: BookingStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  totalPrice?: number;
  metadata?: any;
}

export interface BookingQuery {
  garageId?: string;
  userId?: string;
  vehicleId?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Invoice interfaces
export interface CreateInvoiceData {
  bookingId: string;
  amount: number;
  tax: number;
  totalAmount: number;
  currency?: string;
  dueDate?: Date;
  notes?: string;
  metadata?: any;
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  paidAt?: Date;
  notes?: string;
  metadata?: any;
}

// Inventory interfaces
export interface CreateInventoryData {
  garageId: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  minStock?: number;
  supplier?: string;
  metadata?: any;
}

export interface UpdateInventoryData {
  sku?: string;
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  minStock?: number;
  supplier?: string;
  metadata?: any;
}

// Maintenance Record interfaces
export interface CreateMaintenanceRecordData {
  vehicleId: string;
  bookingId: string;
  mechanicId: string;
  garageId: string;
  notes?: string;
  partsUsed?: any;
  laborHours?: number;
  laborRate?: number;
  totalCost?: number;
  odometer?: number;
  nextServiceDate?: Date;
  metadata?: any;
}

export interface UpdateMaintenanceRecordData {
  notes?: string;
  partsUsed?: any;
  laborHours?: number;
  laborRate?: number;
  totalCost?: number;
  odometer?: number;
  nextServiceDate?: Date;
  metadata?: any;
}

// Notification interfaces
export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

export interface UpdateNotificationData {
  isRead?: boolean;
}

// Report interfaces
export interface DailyReportData {
  date: Date;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  newCustomers: number;
}

export interface GarageReportData {
  garageId: string;
  garageName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  topServices: Array<{
    serviceId: string;
    serviceTitle: string;
    count: number;
    revenue: number;
  }>;
  mechanicPerformance: Array<{
    mechanicId: string;
    mechanicName: string;
    completedBookings: number;
    averageDuration: number;
    revenue: number;
  }>;
}

// Socket.IO interfaces
export interface SocketEvents {
  'join-garage': (garageId: string) => void;
  'leave-garage': (garageId: string) => void;
  'booking-created': (data: BookingWithRelations) => void;
  'booking-updated': (data: BookingWithRelations) => void;
  'booking-cancelled': (data: BookingWithRelations) => void;
  'garage-update': (data: Garage) => void;
  'notification': (data: Notification) => void;
}

// Query interfaces
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeQuery {
  startDate?: Date;
  endDate?: Date;
}

// Utility interfaces
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

// Error interfaces
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
}

// Cache interfaces
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

// Search interfaces
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationQuery;
  sort?: Record<string, 'asc' | 'desc'>;
}

// Export all types for easy importing
export type {
  // Prisma types are already exported above
};
