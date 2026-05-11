import { PrismaService } from '../prisma.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
    create(createInventoryItemDto: CreateInventoryItemDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
    update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
    delete(id: string): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
}
