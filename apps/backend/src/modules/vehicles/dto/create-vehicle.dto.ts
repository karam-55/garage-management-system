import { IsString, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsUUID()
  customerId: string;

  @IsString()
  @IsOptional()
  plate?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  mileage?: string;

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

  @IsString()
  @IsOptional()
  year?: string;

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
