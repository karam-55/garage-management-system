import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, IsDateString, IsIn, IsInt } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  garageId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CHECK', 'MOBILE_PAYMENT'])
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CHECK' | 'MOBILE_PAYMENT';

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  paymentDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  receivedBy?: string;
}

export class UpdatePaymentDto {
  @IsIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  @IsOptional()
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateRefundDto {
  @IsUUID()
  paymentId: string;

  @IsNumber()
  @Min(0)
  refundAmount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsDateString()
  @IsOptional()
  refundDate?: string;

  @IsString()
  @IsOptional()
  processedBy?: string;
}

export class CreatePaymentLimitDto {
  @IsUUID()
  garageId: string;

  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'])
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @IsNumber()
  @Min(0)
  maxAmount: number;

  @IsInt()
  @Min(1)
  maxTransactions: number;
}
