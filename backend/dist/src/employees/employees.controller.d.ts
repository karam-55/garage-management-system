import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employees.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    findAll(): Promise<{
        id: string;
        name: string;
        phone: string;
        notes: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        notes: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
    create(dto: CreateEmployeeDto): Promise<{
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateEmployeeDto): Promise<{
        id: string;
        name: string;
        phone: string;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
