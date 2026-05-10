import { PrismaService } from '../prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './bookings.dto';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        customer: {
            name: string;
            phone: string;
            secondaryPhone: string | null;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        vehicle: {
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            plateNumber: string;
            model: string;
            year: number;
            color: string;
            fuelType: string;
        };
        technician: {
            name: string;
            phone: string;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            specialty: string | null;
        };
        invoices: {
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string;
            bookingId: string | null;
            invoiceNumber: string;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
            date: Date;
        }[];
    } & {
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        customer: {
            name: string;
            phone: string;
            secondaryPhone: string | null;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        vehicle: {
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            plateNumber: string;
            model: string;
            year: number;
            color: string;
            fuelType: string;
        };
        technician: {
            name: string;
            phone: string;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            specialty: string | null;
        };
        invoices: {
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string;
            bookingId: string | null;
            invoiceNumber: string;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
            date: Date;
        }[];
    } & {
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
    }>;
    create(createBookingDto: CreateBookingDto): Promise<{
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
    }>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<{
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
    }>;
    delete(id: string): Promise<{
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string;
        technicianId: string | null;
        serviceType: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        scheduledAt: Date;
        expectedFinishAt: Date | null;
    }>;
}
