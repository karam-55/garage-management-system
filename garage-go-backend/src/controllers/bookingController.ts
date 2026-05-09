import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse, BookingStatus } from '@/types';

const prisma = new PrismaClient() as any;

class BookingController {
  // Helper function to log status changes
  private async logStatusChange(bookingId: string, oldStatus: string, newStatus: string, changedBy: string, notes?: string) {
    try {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          oldStatus,
          newStatus,
          changedBy,
          notes,
        },
      });
    } catch (error) {
      console.error('Failed to log status change:', error);
    }
  }

  createBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { garageId, customerId, vehicleId, serviceId, scheduledAt, notes } = req.body;

    // For ADMIN/OWNER, use customerId from body, otherwise use userId from token
    const bookingUserId = customerId || userId;

    // Verify garage exists and is active
    const garage = await prisma.garage.findUnique({
      where: { id: garageId, isActive: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found or inactive', 404);
    }

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    // For customers, verify vehicle belongs to them. For ADMIN/OWNER, skip this check
    if (!customerId && vehicle.userId !== userId) {
      throw new CustomError('Vehicle not found or does not belong to you', 404);
    }

    // Verify service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: serviceId, garageId, isActive: true },
    });

    if (!service) {
      throw new CustomError('Service not found or inactive', 404);
    }

    // Check for scheduling conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        garageId,
        vehicleId,
        scheduledAt: {
          gte: new Date(new Date(scheduledAt).getTime() - 60 * 60 * 1000), // 1 hour before
          lte: new Date(new Date(scheduledAt).getTime() + 60 * 60 * 1000), // 1 hour after
        },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (conflictingBooking) {
      throw new CustomError('Vehicle already has a booking at this time', 409);
    }

    const booking = await prisma.booking.create({
      data: {
        userId: bookingUserId,
        garageId,
        vehicleId,
        serviceId,
        scheduledAt: new Date(scheduledAt),
        notes,
        totalPrice: service.price,
        // Generate unique QR token
        qrToken: crypto.randomUUID(),
        // QR expires in 24 hours from scheduled time
        qrExpiresAt: new Date(new Date(scheduledAt).getTime() + 24 * 60 * 60 * 1000),
        // Estimate completion time based on service duration
        estimatedCompletionTime: service.duration 
          ? new Date(new Date(scheduledAt).getTime() + service.duration * 60 * 1000)
          : null,
      },
      include: {
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: booking,
      message: 'Booking created successfully',
    };

    res.status(201).json(response);
  });

  getAllBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, garageId, userId, status, startDate, endDate } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (garageId) where.garageId = garageId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          garage: {
            select: { id: true, name: true, address: true, phone: true },
          },
          vehicle: {
            select: { id: true, plate: true, make: true, model: true },
          },
          service: {
            select: { id: true, title: true, price: true, duration: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: bookings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getUserBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'desc' },
        include: {
          garage: {
            select: { id: true, name: true, address: true, phone: true },
          },
          vehicle: {
            select: { id: true, plate: true, make: true, model: true },
          },
          service: {
            select: { id: true, title: true, price: true, duration: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: bookings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getBookingById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
        invoices: true,
        maintenanceRecords: {
          include: {
            mechanic: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Check if user owns the booking or is admin/garage owner/mechanic
    if (booking.userId !== userId && userRole !== 'ADMIN') {
      // Check if user is garage owner or mechanic
      const hasGarageAccess = await prisma.garage.findFirst({
        where: {
          id: booking.garageId,
          OR: [
            { ownerId: userId },
            { mechanics: { some: { id: userId } } },
          ],
        },
      });

      if (!hasGarageAccess) {
        throw new CustomError('Access denied', 403);
      }
    }

    const response: ApiResponse = {
      success: true,
      data: booking,
    };

    res.status(200).json(response);
  });

  updateBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, scheduledAt, startedAt, completedAt, notes, totalPrice } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
        ...(startedAt !== undefined && { startedAt: new Date(startedAt) }),
        ...(completedAt !== undefined && { completedAt: new Date(completedAt) }),
        ...(notes !== undefined && { notes }),
        ...(totalPrice !== undefined && { totalPrice }),
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully',
    };

    res.status(200).json(response);
  });

  confirmBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    const oldStatus = booking.status;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
      },
    });

    // Log status change
    await this.logStatusChange(id, oldStatus, 'CONFIRMED', userId, 'تم تأكيد الحجز');

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'Booking confirmed successfully',
    };

    res.status(200).json(response);
  });

  startBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    const oldStatus = booking.status;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
      },
    });

    // Log status change
    await this.logStatusChange(id, oldStatus, 'IN_PROGRESS', userId, 'تم البدء بالعمل');

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'Booking started successfully',
    };

    res.status(200).json(response);
  });

  completeBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    const oldStatus = booking.status;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
      },
    });

    // Log status change
    await this.logStatusChange(id, oldStatus, 'COMPLETED', userId, 'تم الانتهاء من الصيانة');

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'Booking completed successfully',
    };

    res.status(200).json(response);
  });

  cancelBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    if (booking.userId !== userId) {
      throw new CustomError('Access denied. You can only cancel your own bookings.', 403);
    }

    if (booking.status === 'IN_PROGRESS') {
      throw new CustomError('Cannot cancel booking that is in progress', 400);
    }

    if (booking.status === 'COMPLETED') {
      throw new CustomError('Cannot cancel completed booking', 400);
    }

    const oldStatus = booking.status;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
      },
    });

    // Log status change
    await this.logStatusChange(id, oldStatus, 'CANCELLED', userId, 'تم إلغاء الحجز');

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'Booking cancelled successfully',
    };

    res.status(200).json(response);
  });

  markNoShow = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    const oldStatus = booking.status;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'NO_SHOW' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
      },
    });

    // Log status change
    await this.logStatusChange(id, oldStatus, 'NO_SHOW', userId, 'العميل لم يحضر');

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'Booking marked as no-show',
    };

    res.status(200).json(response);
  });

  getBookingStatusHistory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const history = await prisma.bookingStatusHistory.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        booking: {
          select: {
            id: true,
            vehicle: {
              select: { plate: true, make: true, model: true },
            },
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: history,
    };

    res.status(200).json(response);
  });

  deleteBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    if (booking.status === 'IN_PROGRESS') {
      throw new CustomError('Cannot delete booking that is in progress', 400);
    }

    await prisma.booking.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Booking deleted successfully',
    };

    res.status(200).json(response);
  });

  // === دوال جديدة لنظام الحجز المتكامل ===

  // فحص رمز QR
  getBookingByQR = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { qrToken } = req.params;

    // Find booking by QR token
    const booking = await prisma.booking.findFirst({
      where: { qrToken },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true, year: true },
        },
        service: {
          select: { id: true, title: true, price: true, duration: true },
        },
        bookingStatusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        additionalServices: {
          where: { status: 'APPROVED' },
          select: { id: true, serviceName: true, price: true },
        },
      },
    });

    if (!booking) {
      throw new CustomError('Invalid QR token', 404);
    }

    // Check if QR is expired
    if (booking.qrExpiresAt && booking.qrExpiresAt < new Date()) {
      throw new CustomError('QR token has expired. Please contact the garage.', 410);
    }

    // Log QR scan
    await prisma.qRScanLog.create({
      data: {
        bookingId: booking.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: booking,
    };

    res.status(200).json(response);
  });

  // إعادة توليد رمز QR
  regenerateQR = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true, garageId: true },
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Check if user has access to this booking
    // Admin can access everything
    if (req.user!.role === 'ADMIN') {
      // Allowed
    } 
    // Garage owner/manager/receptionist can access their garage bookings
    else if (['GARAGE_OWNER', 'GARAGE_MANAGER', 'RECEPTIONIST'].includes(req.user!.role)) {
      // Check if user owns this garage
      const garage = await prisma.garage.findFirst({
        where: {
          id: booking.garageId,
          ownerId: req.user!.id,
        },
      });

      if (!garage) {
        throw new CustomError('Access denied', 403);
      }
    }
    // Mechanics can only access their assigned garage
    else if (req.user!.role === 'MECHANIC') {
      const mechanic = await prisma.user.findFirst({
        where: {
          id: req.user!.id,
          mechanicGarageId: booking.garageId,
        },
      });

      if (!mechanic) {
        throw new CustomError('Access denied', 403);
      }
    }
    // Customers can only access their own bookings
    else if (req.user!.role === 'CUSTOMER') {
      const userBooking = await prisma.booking.findFirst({
        where: {
          id,
          userId: req.user!.id,
        },
      });

      if (!userBooking) {
        throw new CustomError('Access denied', 403);
      }
    }
    else {
      throw new CustomError('Access denied', 403);
    }

    // Generate new QR token and extend expiry
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        qrToken: crypto.randomUUID(),
        qrExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      select: {
        id: true,
        qrToken: true,
        qrExpiresAt: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'QR token regenerated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على المواعيد المتاحة
  getAvailableSlots = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, date, serviceTypeId, technicianId } = req.query;

    if (!garageId || !date) {
      throw new CustomError('Garage ID and date are required', 400);
    }

    const targetDate = new Date(date as string);
    const workingHours = await this.getGarageWorkingHours(garageId as string, targetDate);
    
    const availableSlots = [];
    
    for (const timeSlot of workingHours) {
      const isAvailable = await this.checkTimeSlotAvailability(
        garageId as string,
        targetDate,
        timeSlot,
        technicianId as string
      );
      
      availableSlots.push({
        time: timeSlot,
        available: isAvailable,
      });
    }

    const response: ApiResponse = {
      success: true,
      data: availableSlots,
    };

    res.status(200).json(response);
  });

  // الحصول على ساعات عمل الورشة
  private getGarageWorkingHours = async (garageId: string, date: Date): Promise<string[]> => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    const garageHours = await prisma.garageHour.findFirst({
      where: {
        garageId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!garageHours || !garageHours.isOpen) {
      return [];
    }

    const slots: string[] = [];
    const startHour = parseInt(garageHours.openTime.split(':')[0]);
    const endHour = parseInt(garageHours.closeTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    return slots;
  };

  // التحقق من توالف الفترة الزمنية
  private checkTimeSlotAvailability = async (
    garageId: string,
    date: Date,
    time: string,
    technicianId?: string
  ): Promise<boolean> => {
    const slotStart = new Date(`${date.toISOString().split('T')[0]}T${time}`);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour slot

    // Check technician availability
    if (technicianId) {
      const technicianBookings = await prisma.booking.findMany({
        where: {
          garageId,
          assignedTechnicianId: technicianId,
          scheduledAt: {
            gte: slotStart,
            lt: slotEnd,
          },
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        },
      });

      if (technicianBookings.length > 0) {
        return false;
      }
    }

    // Check bay availability
    const availableBays = await prisma.serviceBay.findMany({
      where: {
        garageId,
        isActive: true,
      },
    });

    for (const bay of availableBays) {
      const bayBookings = await prisma.booking.findMany({
        where: {
          garageId,
          assignedBayId: bay.id,
          scheduledAt: {
            gte: slotStart,
            lt: slotEnd,
          },
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        },
      });

      if (bayBookings.length === 0) {
        return true; // Found available bay
      }
    }

    return false; // No available bays
  };

  // إنشاء حجز مع خدمة التوصيل
  createBookingWithPickupDrop = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { 
      garageId, 
      vehicleId, 
      serviceId, 
      scheduledAt, 
      notes,
      pickupAddress,
      dropoffAddress,
      pickupTime,
      dropoffTime 
    } = req.body;

    // Verify garage exists and is active
    const garage = await prisma.garage.findUnique({
      where: { id: garageId, isActive: true },
    });

    if (!garage || !garage.offersPickupDrop) {
      throw new CustomError('Garage not found or does not offer pickup/drop service', 404);
    }

    // Create main booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        garageId,
        vehicleId,
        serviceId,
        scheduledAt: new Date(scheduledAt),
        notes,
        serviceType: 'PICKUP_DROP',
        totalPrice: 0, // Will be calculated
        status: 'PENDING',
      },
      include: {
        garage: true,
        vehicle: true,
        service: true,
      },
    });

    // Create pickup/drop details
    await prisma.pickupDropDetail.create({
      data: {
        bookingId: booking.id,
        pickupAddress,
        dropoffAddress,
        pickupTime: new Date(pickupTime),
        dropoffTime: new Date(dropoffTime),
        status: 'SCHEDULED',
      },
    });

    // Calculate total price including pickup/drop fees
    const pickupDropFee = garage.pickupDropFee || 0;
    const totalPrice = booking.service!.price + pickupDropFee;

    await prisma.booking.update({
      where: { id: booking.id },
      data: { totalPrice },
    });

    const response: ApiResponse = {
      success: true,
      data: { ...booking, totalPrice },
      message: 'Booking with pickup/drop created successfully',
    };

    res.status(201).json(response);
  });

  // إنشاء حجز للأساطيل
  createFleetBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { 
      garageId, 
      fleetId,
      vehicles, // Array of { vehicleId, serviceId, scheduledAt }
      notes 
    } = req.body;

    // Verify fleet belongs to user
    const fleet = await prisma.fleet.findFirst({
      where: { id: fleetId, ownerId: userId },
    });

    if (!fleet) {
      throw new CustomError('Fleet not found or access denied', 404);
    }

    const bookings = [];

    for (const vehicleData of vehicles) {
      const booking = await prisma.booking.create({
        data: {
          userId,
          garageId,
          vehicleId: vehicleData.vehicleId,
          serviceId: vehicleData.serviceId,
          scheduledAt: new Date(vehicleData.scheduledAt),
          notes,
          serviceType: 'FLEET',
          fleetId,
          status: 'PENDING',
        },
        include: {
          vehicle: true,
          service: true,
        },
      });

      bookings.push(booking);
    }

    const response: ApiResponse = {
      success: true,
      data: bookings,
      message: 'Fleet bookings created successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على إحصائيات الحجوزات
  getBookingStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, dateFrom, dateTo } = req.query;

    const where: any = {};
    if (garageId) where.garageId = garageId;
    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) where.scheduledAt.gte = new Date(dateFrom as string);
      if (dateTo) where.scheduledAt.lte = new Date(dateTo as string);
    }

    const [
      totalBookings,
      statusStats,
      serviceTypeStats,
      revenueStats
    ] = await Promise.all([
      prisma.booking.count({ where }),
      
      prisma.booking.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      
      prisma.booking.groupBy({
        by: ['serviceType'],
        where,
        _count: { serviceType: true },
      }),
      
      prisma.booking.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
    ]);

    const stats = {
      total: totalBookings,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
      byServiceType: serviceTypeStats.reduce((acc, stat) => {
        acc[stat.serviceType] = stat._count.serviceType;
        return acc;
      }, {}),
      totalRevenue: revenueStats._sum.totalPrice || 0,
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });

  // البحث المتقدم في الحجوزات
  searchBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { 
      query, 
      garageId, 
      status, 
      dateFrom, 
      dateTo, 
      serviceType,
      page = 1, 
      limit = 10 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (garageId) where.garageId = garageId;
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    
    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) where.scheduledAt.gte = new Date(dateFrom as string);
      if (dateTo) where.scheduledAt.lte = new Date(dateTo as string);
    }

    if (query) {
      where.OR = [
        { user: { fullName: { contains: query as string, mode: 'insensitive' } } },
        { user: { phone: { contains: query as string, mode: 'insensitive' } } },
        { vehicle: { plate: { contains: query as string, mode: 'insensitive' } } },
        { vehicle: { make: { contains: query as string, mode: 'insensitive' } } },
        { vehicle: { model: { contains: query as string, mode: 'insensitive' } } },
        { notes: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          garage: {
            select: { id: true, name: true, address: true, phone: true },
          },
          vehicle: {
            select: { id: true, plate: true, make: true, model: true },
          },
          service: {
            select: { id: true, title: true, price: true, duration: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: bookings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على حجوزات اليوم
  getTodayBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
      scheduledAt: {
        gte: today,
        lt: tomorrow,
      },
    };

    if (garageId) where.garageId = garageId;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
        vehicle: {
          select: { id: true, plate: true, make: true, model: true },
        },
        service: {
          select: { id: true, title: true, duration: true },
        },
        assignedTechnician: {
          select: { id: true, fullName: true },
        },
        assignedBay: {
          select: { id: true, name: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: bookings,
      count: bookings.length,
    };

    res.status(200).json(response);
  });
}

export const bookingController = new BookingController();
