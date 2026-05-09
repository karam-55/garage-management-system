import { IsEmail, IsNotEmpty, IsString, IsOptional, IsUUID, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber('SA')
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

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

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsPhoneNumber('SA')
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
