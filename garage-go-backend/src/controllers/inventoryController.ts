import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';
const inventoryService: any = {};

const prisma = new PrismaClient() as any;

class InventoryController {
  createInventoryItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId, sku, name, description, quantity, unitPrice, minStock, supplier, metadata } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if user owns the garage or is admin
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { ownerId: true },
    });

    if (!garage) {
      throw new CustomError('Garage not found', 404);
    }

    if (garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only create inventory for your own garage.', 403);
    }

    // Check if SKU already exists for this garage (if provided)
    if (sku) {
      const existingItem = await prisma.partsInventory.findFirst({
        where: { garageId, sku },
      });

      if (existingItem) {
        throw new CustomError('Item with this SKU already exists for this garage', 409);
      }
    }

    const inventoryItem = await prisma.partsInventory.create({
      data: {
        garageId,
        sku,
        name,
        description,
        quantity,
        unitPrice,
        minStock,
        supplier,
        metadata,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: inventoryItem,
      message: 'Inventory item created successfully',
    };

    res.status(201).json(response);
  });

  getAllInventoryItems = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, garageId, search, lowStock } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (garageId) where.garageId = garageId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    if (lowStock === 'true') {
      where.quantity = { lte: prisma.partsInventory.fields.minStock };
    }

    const [items, total] = await Promise.all([
      prisma.partsInventory.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
        include: {
          garage: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.partsInventory.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  getInventoryItemById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const item = await prisma.partsInventory.findUnique({
      where: { id },
      include: {
        garage: {
          select: { id: true, name: true, address: true, phone: true },
        },
      },
    });

    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: item,
    };

    res.status(200).json(response);
  });

  updateInventoryItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { sku, name, description, quantity, unitPrice, minStock, supplier, metadata } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if item exists and user has access
    const item = await prisma.partsInventory.findUnique({
      where: { id },
      include: { garage: { select: { ownerId: true } } },
    });

    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    if (item.garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only update inventory for your own garage.', 403);
    }

    // Check if new SKU conflicts with existing items (if changing)
    if (sku && sku !== item.sku) {
      const skuConflict = await prisma.partsInventory.findFirst({
        where: { garageId: item.garageId, sku, id: { not: id } },
      });

      if (skuConflict) {
        throw new CustomError('Item with this SKU already exists for this garage', 409);
      }
    }

    const updatedItem = await prisma.partsInventory.update({
      where: { id },
      data: {
        ...(sku !== undefined && { sku }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(quantity !== undefined && { quantity }),
        ...(unitPrice !== undefined && { unitPrice }),
        ...(minStock !== undefined && { minStock }),
        ...(supplier !== undefined && { supplier }),
        ...(metadata !== undefined && { metadata }),
      },
      include: {
        garage: {
          select: { id: true, name: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedItem,
      message: 'Inventory item updated successfully',
    };

    res.status(200).json(response);
  });

  deleteInventoryItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if item exists and user has access
    const item = await prisma.partsInventory.findUnique({
      where: { id },
      include: { garage: { select: { ownerId: true } } },
    });

    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    if (item.garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only delete inventory for your own garage.', 403);
    }

    await prisma.partsInventory.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Inventory item deleted successfully',
    };

    res.status(200).json(response);
  });

  getGarageInventory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { page = 1, limit = 10, lowStock } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { garageId };
    if (lowStock === 'true') {
      where.quantity = { lte: prisma.partsInventory.fields.minStock };
    }

    const [items, total] = await Promise.all([
      prisma.partsInventory.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.partsInventory.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  addStock = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!quantity || quantity <= 0) {
      throw new CustomError('Quantity must be a positive number', 400);
    }

    // Check if item exists and user has access
    const item = await prisma.partsInventory.findUnique({
      where: { id },
      include: { garage: { select: { ownerId: true } } },
    });

    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    if (item.garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only update inventory for your own garage.', 403);
    }

    const updatedItem = await prisma.partsInventory.update({
      where: { id },
      data: {
        quantity: { increment: quantity },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedItem,
      message: `Added ${quantity} units to inventory`,
    };

    res.status(200).json(response);
  });

  removeStock = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!quantity || quantity <= 0) {
      throw new CustomError('Quantity must be a positive number', 400);
    }

    // Check if item exists and user has access
    const item = await prisma.partsInventory.findUnique({
      where: { id },
      include: { garage: { select: { ownerId: true } } },
    });

    if (!item) {
      throw new CustomError('Inventory item not found', 404);
    }

    if (item.garage.ownerId !== userId && userRole !== 'ADMIN') {
      throw new CustomError('Access denied. You can only update inventory for your own garage.', 403);
    }

    if (item.quantity < quantity) {
      throw new CustomError('Insufficient stock', 400);
    }

    const updatedItem = await prisma.partsInventory.update({
      where: { id },
      data: {
        quantity: { decrement: quantity },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedItem,
      message: `Removed ${quantity} units from inventory`,
    };

    res.status(200).json(response);
  });

  getLowStockItems = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { garageId } = req.params;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      garageId,
      quantity: { lte: prisma.partsInventory.fields.minStock },
    };

    const [items, total] = await Promise.all([
      prisma.partsInventory.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.partsInventory.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json(response);
  });

  // === دوال جديدة لنظام المخزون المتكامل ===

  // إضافة قطعة غيار جديدة
  addPart = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const partData = {
      ...req.body,
      isActive: req.body.isActive !== false,
      currentStock: req.body.currentStock || 0,
      minStockLevel: req.body.minStockLevel || 1,
      maxStockLevel: req.body.maxStockLevel || 100,
      reorderPoint: req.body.reorderPoint || 5,
      reorderQuantity: req.body.reorderQuantity || 10,
    };

    const part = await inventoryService.addPart(partData);

    const response: ApiResponse = {
      success: true,
      data: part,
      message: 'Part added successfully',
    };

    res.status(201).json(response);
  });

  // الحصول على قائمة قطع الغيار
  getParts = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      categoryId,
      supplierId,
      brand,
      lowStock,
      search,
      page = 1,
      limit = 20,
    } = req.query as any;

    const filters = {
      categoryId,
      supplierId,
      brand,
      lowStock: lowStock === 'true',
      search,
      page: Number(page),
      limit: Number(limit),
    };

    const result = await inventoryService.getParts(filters);

    const response: PaginatedResponse = {
      success: true,
      data: result.data,
      meta: {
        page: result.page || 1,
        limit: result.limit || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (result.limit || 20)),
      },
    };

    res.status(200).json(response);
  });

  // الحصول على قطعة غيار محددة
  getPartById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const part = await inventoryService.getPartById(id);

    const response: ApiResponse = {
      success: true,
      data: part,
    };

    res.status(200).json(response);
  });

  // تحديث المخزون
  updateStock = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { quantity, transactionType, notes, unitCost } = req.body;

    if (!quantity || !transactionType) {
      throw new CustomError('Quantity and transaction type are required', 400);
    }

    const part = await inventoryService.updateStock(id, quantity, transactionType, {
      notes,
      unitCost,
      performedBy: req.user!.id,
    });

    const response: ApiResponse = {
      success: true,
      data: part,
      message: 'Stock updated successfully',
    };

    res.status(200).json(response);
  });

  // الحصول على تقارير المخزون
  getInventoryReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      categoryId,
      dateFrom,
      dateTo,
      reportType,
    } = req.query as any;

    const filters = {
      categoryId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo,
      reportType,
    };

    const report = await inventoryService.getInventoryReports(filters);

    const response: ApiResponse = {
      success: true,
      data: report,
    };

    res.status(200).json(response);
  });

  // الحصول على إحصائيات المخزون
  getInventoryStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { categoryId } = req.query as any;

    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    const [
      totalParts,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      prisma.part.count({ where }),
      prisma.part.count({
        where: {
          ...where,
          currentStock: {
            lte: prisma.part.fields.reorderPoint,
          },
        },
      }),
      prisma.part.count({
        where: {
          ...where,
          currentStock: 0,
        },
      }),
    ]);

    const parts = await prisma.part.findMany({ where });
    const totalValue = parts.reduce((sum, part) => sum + (part.currentStock * part.unitPrice), 0);

    const stats = {
      overview: {
        totalParts,
        totalValue,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        stockHealth: totalParts > 0 ? ((totalParts - lowStockCount - outOfStockCount) / totalParts) * 100 : 0,
      },
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });
}

export const inventoryController = new InventoryController();
