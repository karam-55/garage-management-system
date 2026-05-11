import { PrismaService } from '../prisma.service';
import { LoginDto } from './auth.dto';
export declare class AuthService {
    private prisma;
    private readonly jwtSecret;
    constructor(prisma: PrismaService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        access_token: string;
        employee: {
            id: string;
            name: string;
            phone: string;
            role: import(".prisma/client").$Enums.EmployeeRole;
            isActive: true;
            createdAt: Date;
        };
    }>;
    getProfile(employeeId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
}
