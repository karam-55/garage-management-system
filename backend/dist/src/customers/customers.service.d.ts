import { PrismaService } from '../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
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
        vehicles: {
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
        }[];
        bookings: {
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
        }[];
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        secondaryPhone: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        vehicles: {
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
        }[];
        bookings: {
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
        }[];
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        secondaryPhone: string | null;
    }>;
    create(createCustomerDto: CreateCustomerDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        secondaryPhone: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        secondaryPhone: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        secondaryPhone: string | null;
    }>;
}
