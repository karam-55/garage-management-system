import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(): Promise<{
        name: string;
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
    create(createInventoryItemDto: CreateInventoryItemDto): Promise<{
        name: string;
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
    update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<{
        name: string;
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
