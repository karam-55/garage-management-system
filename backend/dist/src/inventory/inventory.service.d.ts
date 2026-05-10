import { PrismaService } from '../prisma.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        notes: string | null;
        id: string;
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
        notes: string | null;
        id: string;
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
        notes: string | null;
        id: string;
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
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
    delete(id: string): Promise<{
        name: string;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        minAlertQuantity: number;
    }>;
}
