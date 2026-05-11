import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.EmployeeRole;
        isActive: boolean;
    }>;
}
