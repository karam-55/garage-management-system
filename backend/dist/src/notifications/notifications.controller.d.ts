import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
        message: string;
    }>;
}
