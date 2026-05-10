import { IsString, IsOptional, IsNotEmpty, IsInt, IsNumber } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @IsNumber()
  @IsNotEmpty()
  salePrice: number;

  @IsInt()
  @IsOptional()
  minAlertQuantity?: number;

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
  code?: string;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsInt()
  @IsOptional()
  minAlertQuantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
