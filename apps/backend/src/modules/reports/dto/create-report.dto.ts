import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsIn, IsNumber, Min } from 'class-validator';

export class GenerateDailyRevenueReportDto {
  @IsUUID()
  garageId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'])
  groupBy?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export class GenerateMechanicPerformanceReportDto {
  @IsUUID()
  garageId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsUUID()
  @IsOptional()
  mechanicId?: string;
}

export class GenerateLowStockReportDto {
  @IsUUID()
  garageId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  threshold?: number;
}

export class GenerateOverdueInvoicesReportDto {
  @IsUUID()
  garageId: string;

  @IsDateString()
  @IsOptional()
  asOfDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  overdueDays?: number;
}

export class GenerateCustomerReportDto {
  @IsUUID()
  garageId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsIn(['ALL', 'ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
}
