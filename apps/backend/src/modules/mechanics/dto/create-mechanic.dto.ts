import { IsString, IsNotEmpty, IsOptional, IsEnum, IsIn, IsEmail, IsBoolean } from 'class-validator';

export class CreateMechanicDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  specializations?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateMechanicDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  specializations?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
