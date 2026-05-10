import { TrackingService } from './tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    trackVehicle(vehicleId: string): Promise<{
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
}
