export declare class CreateEmployeeDto {
    name: string;
    phone: string;
    password: string;
    role?: string;
    notes?: string;
}
export declare class UpdateEmployeeDto {
    name?: string;
    phone?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
    notes?: string;
}
