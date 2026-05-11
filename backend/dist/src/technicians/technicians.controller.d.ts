import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './technicians.dto';
export declare class TechniciansController {
    private readonly techniciansService;
    private readonly logger;
    constructor(techniciansService: TechniciansService);
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
            services: import("@prisma/client/runtime/client").JsonValue | null;
            additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
            qrToken: string | null;
            qrUrl: string | null;
            status: import(".prisma/client").$Enums.BookingStatus;
            scheduledAt: Date;
            expectedFinishAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
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
            services: import("@prisma/client/runtime/client").JsonValue | null;
            additionalServices: import("@prisma/client/runtime/client").JsonValue | null;
            qrToken: string | null;
            qrUrl: string | null;
            status: import(".prisma/client").$Enums.BookingStatus;
            scheduledAt: Date;
            expectedFinishAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    }>;
    create(createTechnicianDto: CreateTechnicianDto): Promise<{
        id: string;
        name: string;
        phone: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    }>;
    update(id: string, updateTechnicianDto: UpdateTechnicianDto): Promise<{
        id: string;
        name: string;
        phone: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
