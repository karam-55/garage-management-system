import { PrismaService } from '../prisma.service';
export declare class TrackingService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
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
            customerId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            scheduledAt: Date;
            vehicleId: string;
            technicianId: string | null;
            serviceType: string;
            services: import("@prisma/client/runtime/client").JsonValue | null;
            additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
            qrToken: string | null;
            qrUrl: string | null;
            status: import(".prisma/client").$Enums.BookingStatus;
            expectedFinishAt: Date | null;
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
        plateNumber: string;
        customerId: string | null;
        model: string;
        year: number;
        color: string;
        fuelType: string;
        chassisNumber: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approveAdditionalService(vehicleId: string, token: string, serviceId: string, approve: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
}
