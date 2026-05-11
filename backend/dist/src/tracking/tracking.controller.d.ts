import { TrackingService } from './tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    trackVehicle(vehicleId: string, token?: string): Promise<{
        customer: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            secondaryPhone: string | null;
        };
        bookings: ({
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
        } & {
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
        })[];
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
    approveService(vehicleId: string, token: string, body: {
        serviceId: string;
        approve: boolean;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
