import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsNumber, IsIn } from 'class-validator';

export class CreateSettingDto {
  @IsUUID()
  @IsOptional()
  garageId?: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
  @IsOptional()
  type?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class CreateGarageSettingsDto {
  @IsUUID()
  garageId: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessNameAr?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsBoolean()
  @IsOptional()
  autoGenerateInvoices?: boolean;

  @IsBoolean()
  @IsOptional()
  sendNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  requireApprovalForAdditionalServices?: boolean;

  @IsString()
  @IsOptional()
  workingHours?: string;

  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @IsString()
  @IsOptional()
  termsAndConditionsAr?: string;
}
