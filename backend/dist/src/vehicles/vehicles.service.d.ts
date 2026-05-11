import { PrismaService } from '../prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicles.dto';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
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
        vehicleTracking: {
            id: string;
            vehicleId: string;
            currentStatus: string;
            lastUpdateAt: Date;
            trackingData: import("@prisma/client/runtime/client").JsonValue | null;
        };
    } & {
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
        vehicleTracking: {
            id: string;
            vehicleId: string;
            currentStatus: string;
            lastUpdateAt: Date;
            trackingData: import("@prisma/client/runtime/client").JsonValue | null;
        };
    } & {
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
    }>;
    create(createVehicleDto: CreateVehicleDto): Promise<{
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
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
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
    }>;
    delete(id: string): Promise<{
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
    }>;
}
