import { IsString, IsNotEmpty, IsOptional, IsEnum, IsIn, IsBoolean } from 'class-validator';

export class CreateMechanicDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

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

  @IsString()
  @IsOptional()
  specializations?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
