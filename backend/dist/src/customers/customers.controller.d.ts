import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(): Promise<({
        bookings: {
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
        }[];
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
        vehicles: {
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
        }[];
    } & {
        name: string;
        id: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        bookings: {
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
        }[];
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
        vehicles: {
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
        }[];
    } & {
        name: string;
        id: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createCustomerDto: CreateCustomerDto): Promise<{
        name: string;
        id: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        name: string;
        id: string;
        phone: string;
        secondaryPhone: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
