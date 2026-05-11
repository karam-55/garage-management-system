import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employees.dto';
export declare class EmployeesService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<{
        id: string;
        notes: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        notes: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
    create(dto: CreateEmployeeDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateEmployeeDto): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        phone: string;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
