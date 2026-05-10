import { PrismaService } from '../prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        isRead: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        isRead: boolean;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        isRead: boolean;
    }>;
}
