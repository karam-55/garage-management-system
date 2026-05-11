import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicles.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findAll(): Promise<({
        customer: {
            id: string;
            name: string;
            phone: string;
            secondaryPhone: string | null;
            notes: string | null;
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
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
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
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
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
            name: string;
            phone: string;
            secondaryPhone: string | null;
            notes: string | null;
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
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
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
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        plateNumber: string;
        model: string;
        year: number;
        color: string;
        fuelType: string;
        chassisNumber: string | null;
    }>;
    create(createVehicleDto: CreateVehicleDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        plateNumber: string;
        model: string;
        year: number;
        color: string;
        fuelType: string;
        chassisNumber: string | null;
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        plateNumber: string;
        model: string;
        year: number;
        color: string;
        fuelType: string;
        chassisNumber: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
