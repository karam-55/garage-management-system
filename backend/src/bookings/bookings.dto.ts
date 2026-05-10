import { IsString, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsDateString()
  @IsOptional()
  expectedFinishAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBookingDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsDateString()
  @IsOptional()
  expectedFinishAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
