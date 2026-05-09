import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min, IsDateString } from 'class-validator';

export class CreateVehicleDto {
  @IsUUID()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  plate: string;

  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  year?: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  mileage?: number;

  @IsString()
  @IsOptional()
  fuelType?: string;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsString()
  @IsOptional()
  engineSize?: string;

  @IsString()
  @IsOptional()
  bodyType?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  plate?: string;

  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  year?: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  mileage?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
