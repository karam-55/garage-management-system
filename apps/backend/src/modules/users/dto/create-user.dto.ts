import { IsString, IsNotEmpty, IsOptional, IsUUID, IsPhoneNumber, IsIn, IsDateString, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsIn(['ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC', 'RECEPTIONIST', 'CASHIER', 'CUSTOMER', 'INVENTORY_MANAGER'])
  role: 'ADMIN' | 'GARAGE_OWNER' | 'GARAGE_MANAGER' | 'MECHANIC' | 'RECEPTIONIST' | 'CASHIER' | 'CUSTOMER' | 'INVENTORY_MANAGER';

  @IsUUID()
  @IsOptional()
  garageId?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsPhoneNumber('SA')
  @IsOptional()
  phone?: string;

  @IsIn(['ADMIN', 'GARAGE_OWNER', 'GARAGE_MANAGER', 'MECHANIC', 'RECEPTIONIST', 'CASHIER', 'CUSTOMER', 'INVENTORY_MANAGER'])
  @IsOptional()
  role?: 'ADMIN' | 'GARAGE_OWNER' | 'GARAGE_MANAGER' | 'MECHANIC' | 'RECEPTIONIST' | 'CASHIER' | 'CUSTOMER' | 'INVENTORY_MANAGER';

  @IsUUID()
  @IsOptional()
  garageId?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsPhoneNumber('SA')
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
