import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, IsEnum, IsDateString, IsIn } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  garageId: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsNumber()
  @Min(0)
  discountAmount: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
  @IsOptional()
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  @IsOptional()
  discountId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInvoiceDto {
  @IsIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
  @IsOptional()
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateInvoiceItemDto {
  @IsUUID()
  invoiceId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  discount: number;

  @IsNumber()
  @Min(0)
  taxRateValue: number;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsUUID()
  @IsOptional()
  partId?: string;
}
