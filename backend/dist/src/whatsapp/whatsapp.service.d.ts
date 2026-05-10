export declare class WhatsAppService {
    sendMessage(phone: string, message: string): Promise<void>;
    sendVehicleStatus(phone: string, vehicleInfo: any, status: string): Promise<void>;
    sendInvoice(phone: string, invoiceDetails: any): Promise<void>;
    sendNotification(phone: string, notification: any): Promise<void>;
}
