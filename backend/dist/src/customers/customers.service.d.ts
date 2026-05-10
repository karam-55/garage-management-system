import { PrismaService } from '../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        vehicles: {
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
        }[];
        bookings: {
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
        }[];
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
        name: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        vehicles: {
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
        }[];
        bookings: {
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
        }[];
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
        name: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createCustomerDto: CreateCustomerDto): Promise<{
        name: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        name: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        name: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
