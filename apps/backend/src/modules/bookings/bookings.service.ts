import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { customerId?: string; garageId?: string; status?: string; mechanicId?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.garageId) where.garageId = filters.garageId;
    if (filters?.status) where.status = filters.status;
    if (filters?.mechanicId) where.assignedMechanicId = filters.mechanicId;

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        garage: true,
        assignedMechanic: true,
        service: true,
        additionalServices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        garage: true,
        assignedMechanic: true,
        service: true,
        additionalServices: true,
        customerApprovals: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async create(createBookingDto: any, userId?: string) {
    const { serviceId, additionalServices, vehicleId, customerId, garageId, estimatedDurationMinutes, scheduledAt, notes, assignedMechanicId, pickupAddress, dropoffAddress } = createBookingDto;

    // Validate customer exists directly by customerId
    let finalCustomerId = customerId;
    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (customer) {
        finalCustomerId = customer.id;
      } else {
        throw new NotFoundException('Customer not found');
      }
    }

    // Validate vehicle if provided
    if (vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
    }

    // Validate service if provided
    if (serviceId) {
      const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        throw new NotFoundException('Service not found');
      }
    }

    // Validate garage if provided
    if (garageId) {
      const garage = await this.prisma.garage.findUnique({ where: { id: garageId } });
      if (!garage) {
        throw new NotFoundException('Garage not found');
      }
    }

    const booking = await this.prisma.booking.create({
      data: {
        customerId: finalCustomerId || userId,
        vehicleId: vehicleId || null,
        garageId: garageId || null,
        serviceId: serviceId || null,
        assignedMechanicId: assignedMechanicId || null,
        scheduledAt: scheduledAt || new Date(),
        estimatedDurationMinutes: estimatedDurationMinutes || 60,
        qrToken: uuidv4(),
        qrExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'PENDING' as any,
        notes,
      },
      include: {
        customer: true,
        vehicle: true,
        garage: true,
        service: true,
      },
    });

    // Create additional services if provided
    if (additionalServices && additionalServices.length > 0) {
      for (const as of additionalServices) {
        await this.prisma.additionalService.create({
          data: {
            booking: { connect: { id: booking.id } },
            serviceName: as.serviceName,
            price: as.price,
            status: 'PENDING' as any,
          },
        });
      }
    }

    // Create customer approval request
    await this.prisma.customerApproval.create({
      data: {
        booking: { connect: { id: booking.id } },
        customer: { connect: { id: booking.customerId } },
        status: 'PENDING' as any,
        approvalType: 'SERVICE_APPROVAL' as any,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return this.findOne(booking.id);
  }

  async update(id: string, updateBookingDto: any) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Prevent updates if booking is completed or cancelled
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update a completed or cancelled booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
    });
  }

  async remove(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async assignMechanic(bookingId: string, mechanicId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate mechanic
    const mechanic = await this.prisma.user.findUnique({
      where: { id: mechanicId, role: 'MECHANIC' },
    });
    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        assignedMechanicId: mechanicId,
        status: 'CONFIRMED' as any,
      },
    });
  }

  async regenerateQR(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        qrToken: uuidv4(),
        qrExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  }

  // Approval System
  async requestApproval(bookingId: string, approvalType: any, requestedBy: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.customerApproval.create({
      data: {
        booking: { connect: { id: bookingId } },
        customer: { connect: { id: booking.customerId } },
        status: 'PENDING' as any,
        approvalType: approvalType,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  async approveRequest(approvalId: string, approvedBy: string, notes?: string) {
    const approval = await this.prisma.customerApproval.findUnique({
      where: { id: approvalId },
      include: { booking: true },
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== 'PENDING') {
      throw new BadRequestException('Approval is not pending');
    }

    const updatedApproval = await this.prisma.customerApproval.update({
      where: { id: approvalId },
      data: {
        status: 'APPROVED' as any,
      },
    });

    // Update booking status based on approval
    await this.prisma.booking.update({
      where: { id: approval.bookingId },
      data: { status: 'CONFIRMED' as any },
    });

    return updatedApproval;
  }

  async rejectRequest(approvalId: string, rejectedBy: string, reason?: string) {
    const approval = await this.prisma.customerApproval.findUnique({ where: { id: approvalId } });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== 'PENDING') {
      throw new BadRequestException('Approval is not pending');
    }

    return this.prisma.customerApproval.update({
      where: { id: approvalId },
      data: {
        status: 'REJECTED' as any,
      },
    });
  }

  async getApprovals(bookingId?: string) {
    const where = bookingId ? { bookingId } : {};

    return this.prisma.customerApproval.findMany({
      where,
      include: {
        booking: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async requestAdditionalService(bookingId: string, serviceName: string, price: number, requestedBy: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Create additional service
    const additionalService = await this.prisma.additionalService.create({
      data: {
        booking: { connect: { id: bookingId } },
        serviceName,
        price,
        status: 'PENDING' as any,
      },
    });

    // Request customer approval
    await this.requestApproval(bookingId, 'ADDITIONAL_SERVICE_APPROVAL' as any, requestedBy);

    return additionalService;
  }

  async approveAdditionalService(additionalServiceId: string, approvedBy: string) {
    const additionalService = await this.prisma.additionalService.findUnique({
      where: { id: additionalServiceId },
    });

    if (!additionalService) {
      throw new NotFoundException('Additional service not found');
    }

    return this.prisma.additionalService.update({
      where: { id: additionalServiceId },
      data: {
        status: 'APPROVED' as any,
      },
    });
  }

  // Handover System (Mechanic to Mechanic)
  async initiateMechanicHandover(bookingId: string, fromMechanicId: string, toMechanicId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.mechanicHandover.create({
      data: {
        booking: { connect: { id: bookingId } },
        fromMechanic: { connect: { id: fromMechanicId } },
        toMechanic: { connect: { id: toMechanicId } },
        status: 'PENDING' as any,
      },
    });
  }

  async acknowledgeHandover(handoverId: string) {
    const handover = await this.prisma.mechanicHandover.findUnique({ where: { id: handoverId } });

    if (!handover) {
      throw new NotFoundException('Handover not found');
    }

    return this.prisma.mechanicHandover.update({
      where: { id: handoverId },
      data: {
        status: 'COMPLETED' as any,
      },
    });
  }

  async getMechanicHandovers(bookingId?: string) {
    const where = bookingId ? { bookingId } : {};

    return this.prisma.mechanicHandover.findMany({
      where,
      include: {
        booking: true,
        fromMechanic: true,
        toMechanic: true,
      },
      orderBy: { handedOverAt: 'desc' },
    });
  }

  // QR Session Management
  async createQRSession(bookingId: string, scannedBy: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate QR token
    if (booking.qrExpiresAt && new Date(booking.qrExpiresAt) < new Date()) {
      throw new BadRequestException('QR token has expired');
    }

    return this.prisma.qRSession.create({
      data: {
        bookingId,
        qrToken: uuidv4(),
        scannedBy,
      },
    });
  }

  async validateQR(qrToken: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { qrToken },
    });

    if (!booking) {
      throw new NotFoundException('Invalid QR token');
    }

    if (booking.qrExpiresAt && new Date(booking.qrExpiresAt) < new Date()) {
      throw new BadRequestException('QR token has expired');
    }

    return booking;
  }

  async updateStatus(bookingId: string, status: any) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  async getStatistics(garageId?: string) {
    const where = garageId ? { garageId } : {};

    const totalBookings = await this.prisma.booking.count({ where });
    const pendingBookings = await this.prisma.booking.count({ where: { ...where, status: 'PENDING' } });
    const confirmedBookings = await this.prisma.booking.count({ where: { ...where, status: 'CONFIRMED' } });
    const inProgressBookings = await this.prisma.booking.count({ where: { ...where, status: 'IN_PROGRESS' } });
    const completedBookings = await this.prisma.booking.count({ where: { ...where, status: 'COMPLETED' } });
    const cancelledBookings = await this.prisma.booking.count({ where: { ...where, status: 'CANCELLED' } });

    const pendingApprovals = await this.prisma.customerApproval.count({
      where: { ...where, status: 'PENDING' },
    });

    const pendingHandovers = await this.prisma.mechanicHandover.count({
      where: { ...where, status: 'PENDING' },
    });

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
      pendingApprovals,
      pendingHandovers,
    };
  }

  // Public QR Session Endpoint - Get booking data by QR token
  async getQRSessionByToken(qrToken: string, ipAddress?: string, userAgent?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { qrToken },
      include: {
        customer: true,
        vehicle: true,
        garage: true,
        assignedMechanic: true,
        service: true,
        additionalServices: true,
        customerApprovals: true,
        handovers: {
          include: {
            fromMechanic: true,
            toMechanic: true,
          },
          orderBy: { handedOverAt: 'desc' },
        },
        invoice: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Invalid QR token - booking not found');
    }

    if (booking.qrExpiresAt && new Date(booking.qrExpiresAt) < new Date()) {
      throw new BadRequestException('QR token has expired');
    }

    // Create QR session with scan details
    if (ipAddress || userAgent) {
      await this.prisma.qRSession.create({
        data: {
          bookingId: booking.id,
          qrToken,
          ipAddress,
          userAgent,
        },
      });
    }

    return booking;
  }

  // Approve additional service by customer (public)
  async approveAdditionalServiceByQR(qrToken: string, serviceId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { qrToken },
      include: { additionalServices: true },
    });

    if (!booking) {
      throw new NotFoundException('Invalid QR token');
    }

    const additionalService = booking.additionalServices.find(as => as.id === serviceId);
    if (!additionalService) {
      throw new NotFoundException('Additional service not found');
    }

    if (additionalService.status === 'APPROVED') {
      throw new BadRequestException('Additional service already approved');
    }

    await this.prisma.additionalService.update({
      where: { id: serviceId },
      data: { status: 'APPROVED' as any },
    });

    // Create customer approval record
    await this.prisma.customerApproval.create({
      data: {
        booking: { connect: { id: booking.id } },
        customer: { connect: { id: booking.customerId } },
        status: 'APPROVED',
        approvalType: 'SERVICE_ADDITION',
        details: { additionalServiceId: serviceId },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        respondedAt: new Date(),
      },
    });

    return { message: 'Additional service approved successfully' };
  }

  // Reject additional service by customer (public)
  async rejectAdditionalServiceByQR(qrToken: string, serviceId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { qrToken },
      include: { additionalServices: true },
    });

    if (!booking) {
      throw new NotFoundException('Invalid QR token');
    }

    const additionalService = booking.additionalServices.find(as => as.id === serviceId);
    if (!additionalService) {
      throw new NotFoundException('Additional service not found');
    }

    if (additionalService.status === 'APPROVED') {
      throw new BadRequestException('Additional service already approved');
    }

    await this.prisma.additionalService.update({
      where: { id: serviceId },
      data: { status: 'REJECTED' as any },
    });

    // Create customer approval record
    await this.prisma.customerApproval.create({
      data: {
        booking: { connect: { id: booking.id } },
        customer: { connect: { id: booking.customerId } },
        status: 'REJECTED',
        approvalType: 'SERVICE_ADDITION',
        details: { additionalServiceId: serviceId },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        respondedAt: new Date(),
      },
    });

    return { message: 'Additional service rejected successfully' };
  }
}
