import { PrismaService } from '../prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './bookings.dto';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        customer: {
            name: string;
            id: string;
            phone: string;
            secondaryPhone: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        vehicle: {
            model: string;
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            plateNumber: string;
            year: number;
            color: string;
            fuelType: string;
        };
        invoices: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string;
            bookingId: string | null;
            invoiceNumber: string;
            date: Date;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
        }[];
        technician: {
            name: string;
            id: string;
            phone: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            specialty: string | null;
        };
    } & {
        id: string;
        notes: string | null;
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
            id: string;
            phone: string;
            secondaryPhone: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        vehicle: {
            model: string;
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            plateNumber: string;
            year: number;
            color: string;
            fuelType: string;
        };
        invoices: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string;
            bookingId: string | null;
            invoiceNumber: string;
            date: Date;
            totalAmount: number;
            discount: number;
            netAmount: number;
            paymentMethod: string;
        }[];
        technician: {
            name: string;
            id: string;
            phone: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            specialty: string | null;
        };
    } & {
        id: string;
        notes: string | null;
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
        id: string;
        notes: string | null;
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
        id: string;
        notes: string | null;
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
        id: string;
        notes: string | null;
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
