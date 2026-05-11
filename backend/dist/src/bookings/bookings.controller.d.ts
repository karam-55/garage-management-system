import { BookingsService } from './bookings.service';
import { AddAdditionalServiceDto, CreateBookingDto, UpdateBookingDto } from './bookings.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    findAll(): Promise<({
        customer: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            secondaryPhone: string | null;
        };
        vehicle: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            model: string;
            year: number;
            color: string;
            fuelType: string;
            chassisNumber: string | null;
        };
        technician: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            specialty: string | null;
        };
        invoices: {
            id: string;
            customerId: string;
            vehicleId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string | null;
            invoiceNumber: string;
            date: Date;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
        }[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        services: import("@prisma/client/runtime/client").JsonValue | null;
        additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
        qrToken: string | null;
        qrUrl: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findByTechnician(technicianId: string): Promise<({
        customer: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            secondaryPhone: string | null;
        };
        vehicle: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            model: string;
            year: number;
            color: string;
            fuelType: string;
            chassisNumber: string | null;
        };
        technician: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            specialty: string | null;
        };
        invoices: {
            id: string;
            customerId: string;
            vehicleId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string | null;
            invoiceNumber: string;
            date: Date;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
        }[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        services: import("@prisma/client/runtime/client").JsonValue | null;
        additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
        qrToken: string | null;
        qrUrl: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        customer: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            secondaryPhone: string | null;
        };
        vehicle: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            model: string;
            year: number;
            color: string;
            fuelType: string;
            chassisNumber: string | null;
        };
        technician: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            specialty: string | null;
        };
        invoices: {
            id: string;
            customerId: string;
            vehicleId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string | null;
            invoiceNumber: string;
            date: Date;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
        }[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        services: import("@prisma/client/runtime/client").JsonValue | null;
        additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
        qrToken: string | null;
        qrUrl: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createBookingDto: CreateBookingDto): Promise<{
        customer: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            secondaryPhone: string | null;
        };
        vehicle: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            model: string;
            year: number;
            color: string;
            fuelType: string;
            chassisNumber: string | null;
        };
    } & {
        id: string;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        services: import("@prisma/client/runtime/client").JsonValue | null;
        additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
        qrToken: string | null;
        qrUrl: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<{
        customer: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            secondaryPhone: string | null;
        };
        vehicle: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            model: string;
            year: number;
            color: string;
            fuelType: string;
            chassisNumber: string | null;
        };
        technician: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            specialty: string | null;
        };
        invoices: {
            id: string;
            customerId: string;
            vehicleId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string | null;
            invoiceNumber: string;
            date: Date;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
        }[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        services: import("@prisma/client/runtime/client").JsonValue | null;
        additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
        qrToken: string | null;
        qrUrl: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addAdditionalService(id: string, dto: AddAdditionalServiceDto): Promise<{
        id: string;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        services: import("@prisma/client/runtime/client").JsonValue | null;
        additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
        qrToken: string | null;
        qrUrl: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
