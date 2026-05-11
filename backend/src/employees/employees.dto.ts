import { IsString, IsOptional, IsNotEmpty, IsBoolean, MinLength, IsIn } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['OWNER', 'MANAGER', 'RECEPTIONIST', 'MECHANIC', 'CASHIER'])
  role?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  password?: string;

  @IsString()
  @IsOptional()
  @IsIn(['OWNER', 'MANAGER', 'RECEPTIONIST', 'MECHANIC', 'CASHIER'])
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
