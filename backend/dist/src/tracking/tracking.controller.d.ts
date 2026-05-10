import { TrackingService } from './tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    trackVehicle(vehicleId: string): Promise<{
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
}
