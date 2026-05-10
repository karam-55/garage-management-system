import { PrismaService } from '../prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto';
export declare class InvoicesService {
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
        booking: {
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
        };
    } & {
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
        booking: {
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
        };
    } & {
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
    }>;
    create(createInvoiceDto: CreateInvoiceDto): Promise<{
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
    }>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<{
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
    }>;
    delete(id: string): Promise<{
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
    }>;
}
