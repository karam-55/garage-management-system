import { PrismaService } from '../prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto';
export declare class InvoicesService {
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
        booking: {
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
        };
    } & {
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
        booking: {
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
        };
    } & {
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
    }>;
    create(createInvoiceDto: CreateInvoiceDto): Promise<{
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
    }>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<{
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
    }>;
    delete(id: string): Promise<{
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
    }>;
}
