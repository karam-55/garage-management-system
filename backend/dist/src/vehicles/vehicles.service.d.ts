import { PrismaService } from '../prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicles.dto';
export declare class VehiclesService {
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
        vehicleTracking: {
            id: string;
            vehicleId: string;
            currentStatus: string;
            lastUpdateAt: Date;
            trackingData: import("@prisma/client/runtime/client").JsonValue | null;
        };
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
        vehicleTracking: {
            id: string;
            vehicleId: string;
            currentStatus: string;
            lastUpdateAt: Date;
            trackingData: import("@prisma/client/runtime/client").JsonValue | null;
        };
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
    }>;
    create(createVehicleDto: CreateVehicleDto): Promise<{
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
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
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
    }>;
    delete(id: string): Promise<{
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
    }>;
}
