import { SetMetadata } from '@nestjs/common';

export type EmployeeRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'MECHANIC' | 'CASHIER';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EmployeeRole[]) => SetMetadata(ROLES_KEY, roles);
