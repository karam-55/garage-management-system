import { PrismaService } from '../prisma.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './technicians.dto';
export declare class TechniciansService {
    private prisma;
    constructor(prisma: PrismaService);
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
        id: string;
        name: string;
        phone: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
    }>;
}
