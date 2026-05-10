export declare class CreateInvoiceDto {
    customerId: string;
    vehicleId: string;
    bookingId?: string;
    invoiceNumber: string;
    totalAmount: number;
    discount?: number;
    netAmount: number;
    paymentMethod: string;
    notes?: string;
}
export declare class UpdateInvoiceDto {
    customerId?: string;
    vehicleId?: string;
    bookingId?: string;
    invoiceNumber?: string;
    totalAmount?: number;
    discount?: number;
    netAmount?: number;
    paymentMethod?: string;
    notes?: string;
}
