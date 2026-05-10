export declare class CreateInventoryItemDto {
    name: string;
    code?: string;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
    minAlertQuantity?: number;
    notes?: string;
}
export declare class UpdateInventoryItemDto {
    name?: string;
    code?: string;
    quantity?: number;
    purchasePrice?: number;
    salePrice?: number;
    minAlertQuantity?: number;
    notes?: string;
}
