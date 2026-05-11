export type EmployeeRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'MECHANIC' | 'CASHIER';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: EmployeeRole[]) => import("@nestjs/common").CustomDecorator<string>;
