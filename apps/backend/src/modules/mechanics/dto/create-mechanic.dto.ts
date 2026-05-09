import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsDateString, IsIn } from 'class-validator';

export class CreateMechanicDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  garageId: string;

  @IsIn(['BEGINNER', 'INTERMEDIATE', 'EXPERT', 'MASTER'])
  @IsOptional()
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'MASTER';

  @IsIn(['AVAILABLE', 'BUSY', 'ON_LEAVE', 'UNAVAILABLE'])
  @IsOptional()
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE' | 'UNAVAILABLE';

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class UpdateMechanicDto {
  @IsIn(['BEGINNER', 'INTERMEDIATE', 'EXPERT', 'MASTER'])
  @IsOptional()
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'MASTER';

  @IsIn(['AVAILABLE', 'BUSY', 'ON_LEAVE', 'UNAVAILABLE'])
  @IsOptional()
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE' | 'UNAVAILABLE';

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class CreateMechanicSpecializationDto {
  @IsUUID()
  mechanicId: string;

  @IsUUID()
  serviceId: string;

  @IsIn(['BEGINNER', 'INTERMEDIATE', 'EXPERT', 'MASTER'])
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'MASTER';

  @IsString()
  @IsOptional()
  certificateUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
