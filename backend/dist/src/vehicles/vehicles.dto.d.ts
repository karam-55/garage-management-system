export declare class CreateVehicleDto {
    customerId: string;
    plateNumber: string;
    model: string;
    year: number;
    color: string;
    fuelType: string;
    notes?: string;
}
export declare class UpdateVehicleDto {
    customerId?: string;
    plateNumber?: string;
    model?: string;
    year?: number;
    color?: string;
    fuelType?: string;
    notes?: string;
}
