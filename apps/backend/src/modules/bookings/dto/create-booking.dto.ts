import { IsUUID, IsDateString, IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  @IsOptional()
  garageId?: string;

  @IsUUID()
  vehicleId: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsUUID()
  @IsOptional()
  assignedMechanicId?: string;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  estimatedDurationMinutes?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  pickupAddress?: string;

  @IsString()
  @IsOptional()
  dropoffAddress?: string;
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsUUID()
  @IsOptional()
  assignedMechanicId?: string;

  @IsDateString()
  @IsOptional()
  estimatedCompletionAt?: string;

  @IsDateString()
  @IsOptional()
  actualCompletionAt?: string;

  @IsString()
  @IsOptional()
  delayReason?: string;

  @IsDateString()
  @IsOptional()
  expectedPartsArrivalAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AssignMechanicDto {
  @IsUUID()
  mechanicId: string;
}
