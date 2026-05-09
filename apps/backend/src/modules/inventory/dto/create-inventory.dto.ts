import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, IsInt, IsIn } from 'class-validator';

export class CreateInventoryItemDto {
  @IsUUID()
  garageId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsNotEmpty()
  partNumber: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  minStockLevel: number;

  @IsNumber()
  @Min(0)
  maxStockLevel: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInventoryItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsOptional()
  partNumber?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateStockDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsIn(['ADD', 'REMOVE'])
  operation: 'ADD' | 'REMOVE';

  @IsString()
  @IsOptional()
  reason?: string;
}
