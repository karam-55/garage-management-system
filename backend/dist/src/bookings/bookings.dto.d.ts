export declare class CreateBookingDto {
    customerId: string;
    vehicleId: string;
    technicianId?: string;
    serviceType: string;
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
    status?: string;
    scheduledAt?: string;
    expectedFinishAt?: string;
    notes?: string;
}
