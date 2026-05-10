import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicles.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
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
        vehicleTracking: {
            id: string;
            vehicleId: string;
            currentStatus: string;
            lastUpdateAt: Date;
            trackingData: import("@prisma/client/runtime/client").JsonValue | null;
        };
    } & {
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
        vehicleTracking: {
            id: string;
            vehicleId: string;
            currentStatus: string;
            lastUpdateAt: Date;
            trackingData: import("@prisma/client/runtime/client").JsonValue | null;
        };
    } & {
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
    }>;
    create(createVehicleDto: CreateVehicleDto): Promise<{
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
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
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
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
