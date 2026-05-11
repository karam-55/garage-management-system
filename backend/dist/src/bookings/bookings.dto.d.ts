export declare class CreateBookingDto {
    customerId: string;
    vehicleId: string;
    technicianId?: string;
    serviceType: string;
    services?: {
        name: string;
        price: number;
    }[];
    status?: string;
    scheduledAt: string;
    expectedFinishAt?: string;
    notes?: string;
}
export declare class UpdateBookingDto {
    customerId?: string;
    vehicleId?: string;
    technicianId?: string;
    serviceType?: string;
    services?: {
        name: string;
        price: number;
    }[];
    additionalServices?: any[];
    status?: string;
    scheduledAt?: string;
    expectedFinishAt?: string;
    notes?: string;
}
export declare class AddAdditionalServiceDto {
    name: string;
    estimatedPrice?: number;
}
