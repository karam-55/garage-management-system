import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './technicians.dto';
export declare class TechniciansController {
    private readonly techniciansService;
    constructor(techniciansService: TechniciansService);
    findAll(): Promise<({
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
        name: string;
        phone: string;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        name: string;
        phone: string;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    }>;
    create(createTechnicianDto: CreateTechnicianDto): Promise<{
        name: string;
        phone: string;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    }>;
    update(id: string, updateTechnicianDto: UpdateTechnicianDto): Promise<{
        name: string;
        phone: string;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
