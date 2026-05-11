import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(): Promise<({
        booking: {
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
        };
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
    })[]>;
    findOne(id: string): Promise<{
        booking: {
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
        };
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
    }>;
    create(createInvoiceDto: CreateInvoiceDto): Promise<{
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
    }>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<{
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
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
