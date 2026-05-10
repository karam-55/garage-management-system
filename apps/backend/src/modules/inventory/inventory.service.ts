import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { garageId?: string; category?: string; isActive?: boolean }) {
    const where: any = {};
    if (filters?.garageId) where.garageId = filters.garageId;
    if (filters?.category) where.category = filters.category;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.partsInventory.findMany({
      where,
      include: {
        garage: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findLowStock(garageId?: string) {
    const where: any = {
      isActive: true,
    };

    if (garageId) {
      where.garageId = garageId;
    }

    const items = await this.prisma.partsInventory.findMany({
      where,
      select: {
        id: true,
        partNumber: true,
        name: true,
        quantity: true,
        minStockLevel: true,
        maxStockLevel: true,
        reorderPoint: true,
        garageId: true,
        supplier: true,
        supplierPhone: true,
        leadTimeDays: true,
      },
    });

    // Filter items where quantity is at or below reorder point
    return items.filter(item => Number(item.quantity) <= Number(item.reorderPoint));
  }

  async findOutOfStock(garageId?: string) {
    const where: any = {
      quantity: 0,
      isActive: true,
    };

    if (garageId) {
      where.garageId = garageId;
    }

    return this.prisma.partsInventory.findMany({
      where,
      include: {
        garage: true,
      },
    });
  }

  async getMovements(filters?: { partId?: string; movementType?: string; garageId?: string }) {
    const where: any = {};
    if (filters?.partId) where.inventoryId = filters.partId;
    if (filters?.movementType) where.type = filters.movementType;
    if (filters?.garageId) where.garageId = filters.garageId;

    return this.prisma.stockMovement.findMany({
      where,
      include: {
        part: true,
        garage: true,
        performedByUser: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const part = await this.prisma.partsInventory.findUnique({
      where: { id },
      include: {
        garage: true,
      },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    // Get stock movements for this part
    const movements = await this.prisma.stockMovement.findMany({
      where: { inventoryId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      ...part,
      recentMovements: movements,
    };
  }

  async create(createInventoryDto: any) {
    const { sku, minQuantity, unitPrice, garageId, ...rest } = createInventoryDto;

    // Map DTO fields to Prisma schema fields
    const partNumber = sku || rest.partNumber;
    const minStockLevel = minQuantity !== undefined ? minQuantity : rest.minStockLevel;
    const sellingPrice = unitPrice !== undefined ? unitPrice : rest.sellingPrice;

    // Check if part number already exists
    if (partNumber) {
      const existingPart = await this.prisma.partsInventory.findUnique({
        where: { partNumber },
      });
      if (existingPart) {
        throw new BadRequestException('Part number already exists');
      }
    }

    const part = await this.prisma.partsInventory.create({
      data: {
        partNumber,
        garageId,
        minStockLevel,
        sellingPrice,
        ...rest,
      },
    });

    // Log initial stock movement
    if (rest.quantity > 0) {
      await this.prisma.stockMovement.create({
        data: {
          inventoryId: part.id,
          type: 'IN',
          quantity: rest.quantity,
          quantityBefore: 0,
          quantityAfter: rest.quantity,
          referenceType: 'INITIAL_STOCK',
                  },
      });
    }

    return part;
  }

  async update(id: string, updateInventoryDto: any, userId?: string) {
    const oldPart = await this.prisma.partsInventory.findUnique({
      where: { id },
    });

    if (!oldPart) {
      throw new NotFoundException('Part not found');
    }

    const { quantity, ...rest } = updateInventoryDto;
    const data: any = { ...rest };

    let updatedPart;

    if (quantity !== undefined && quantity !== oldPart.quantity) {
      const quantityChange = Number(quantity) - Number(oldPart.quantity);
      const movementType = quantityChange > 0 ? 'IN' : 'OUT';

      updatedPart = await this.prisma.partsInventory.update({
        where: { id },
        data: {
          ...data,
          quantity,
        },
      });

      // Log stock movement
      await this.prisma.stockMovement.create({
        data: {
          inventoryId: id,
          type: movementType as any,
          quantity: Math.abs(quantityChange),
          quantityBefore: oldPart.quantity,
          quantityAfter: quantity,
          referenceType: 'MANUAL_UPDATE',
          performedBy: userId,
          notes: 'Manual stock update',
        },
      });

      // Check if stock is now low and send alert
      if (Number(quantity) <= Number(updatedPart.reorderPoint)) {
        await this.sendLowStockAlert(updatedPart);
      }
    } else {
      updatedPart = await this.prisma.partsInventory.update({
        where: { id },
        data,
      });
    }

    return updatedPart;
  }

  async remove(id: string) {
    return this.prisma.partsInventory.delete({
      where: { id },
    });
  }

  // Stock Movement Operations
  async addStock(id: string, quantity: number, reason: string, userId?: string, referenceType?: string, referenceId?: string) {
    const part = await this.prisma.partsInventory.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    const newQuantity = Number(part.quantity) + quantity;
    const updatedPart = await this.prisma.partsInventory.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    await this.prisma.stockMovement.create({
      data: {
        inventoryId: id,
        type: 'IN',
        quantity,
        quantityBefore: part.quantity,
        quantityAfter: newQuantity,
        referenceType: referenceType || 'STOCK_ADD',
        referenceId,
        performedBy: userId,
        notes: reason,
      },
    });

    return updatedPart;
  }

  async removeStock(id: string, quantity: number, reason: string, userId?: string, referenceType?: string, referenceId?: string) {
    const part = await this.prisma.partsInventory.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (Number(part.quantity) < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const newQuantity = Number(part.quantity) - quantity;
    const updatedPart = await this.prisma.partsInventory.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    await this.prisma.stockMovement.create({
      data: {
        inventoryId: id,
        type: 'OUT',
        quantity,
        quantityBefore: part.quantity,
        quantityAfter: newQuantity,
        referenceType: referenceType || 'STOCK_REMOVE',
        referenceId,
        performedBy: userId,
        notes: reason,
      },
    });

    // Check if stock is now low and send alert
    if (newQuantity <= Number(part.reorderPoint)) {
      await this.sendLowStockAlert(updatedPart);
    }

    return updatedPart;
  }

  async transferStock(id: string, fromGarageId: string, toGarageId: string, quantity: number, userId?: string) {
    const part = await this.prisma.partsInventory.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (Number(part.quantity) < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Remove stock from source garage
    await this.removeStock(id, quantity, `Transfer to garage ${toGarageId}`, userId, 'TRANSFER', fromGarageId);

    // Add stock to destination garage (create or update)
    const destinationPart = await this.prisma.partsInventory.findFirst({
      where: {
        garageId: toGarageId,
        partNumber: part.partNumber,
      },
    });

    if (destinationPart) {
      await this.addStock(destinationPart.id, quantity, `Transfer from garage ${fromGarageId}`, userId, 'TRANSFER', toGarageId);
    } else {
      // Create new part in destination garage
      await this.prisma.partsInventory.create({
        data: {
          garageId: toGarageId,
          partNumber: part.partNumber,
          name: part.name,
          description: part.description,
          category: part.category,
          brand: part.brand,
          quantity,
          costPrice: part.costPrice,
          sellingPrice: part.sellingPrice,
          supplier: part.supplier,
          supplierPhone: part.supplierPhone,
          minStockLevel: part.minStockLevel,
          maxStockLevel: part.maxStockLevel,
          reorderPoint: part.reorderPoint,
          leadTimeDays: part.leadTimeDays,
        },
      });

      // Log movement
      await this.prisma.stockMovement.create({
        data: {
          inventoryId: id,
          type: 'TRANSFER',
          quantity,
          quantityBefore: part.quantity,
          quantityAfter: Number(part.quantity) - quantity,
          referenceType: 'TRANSFER',
          referenceId: toGarageId,
          performedBy: userId,
          notes: `Transfer to garage ${toGarageId}`,
        },
      });
    }

    return { success: true, message: 'Stock transferred successfully' };
  }

  async adjustStock(id: string, quantity: number, reason: string, userId?: string) {
    const part = await this.prisma.partsInventory.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    const quantityChange = quantity - Number(part.quantity);
    const movementType = quantityChange > 0 ? 'IN' : 'OUT';

    const updatedPart = await this.prisma.partsInventory.update({
      where: { id },
      data: { quantity },
    });

    await this.prisma.stockMovement.create({
      data: {
        inventoryId: id,
        type: movementType,
        quantity: Math.abs(quantityChange),
        quantityBefore: part.quantity,
        quantityAfter: quantity,
        referenceType: 'ADJUSTMENT',
        performedBy: userId,
        notes: reason,
      },
    });

    // Check if stock is now low and send alert
    if (quantity <= Number(part.reorderPoint)) {
      await this.sendLowStockAlert(updatedPart);
    }

    return updatedPart;
  }

  // Parts Request Operations
  async requestPart(requestDto: any, userId: string) {
    const { partId, partName, partNumber, quantity, bookingId, urgency, garageId } = requestDto;

    return this.prisma.partsRequest.create({
      data: {
        inventoryId: partId,
        partName,
        partNumber,
        quantity,
        bookingId,
        urgency: urgency || 'NORMAL',
        requestedBy: userId,
        garageId,
        status: 'PENDING' as any,
      },
    });
  }

  async approveRequest(requestId: string, userId: string) {
    const request = await this.prisma.partsRequest.findUnique({
      where: { id: requestId },
      include: { part: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    const updatedRequest = await this.prisma.partsRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED' as any,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    // If part exists and has stock, reserve it
    if (request.part && Number(request.part.quantity) >= Number(request.quantity)) {
      await this.removeStock(request.part.id, Number(request.quantity), `Reserved for request ${requestId}`, userId, 'PARTS_REQUEST', requestId);
    }

    return updatedRequest;
  }

  async rejectRequest(requestId: string, userId: string, reason?: string) {
    const request = await this.prisma.partsRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    return this.prisma.partsRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED' as any,
        approvedBy: userId,
        approvedAt: new Date(),
        notes: reason,
      },
    });
  }

  async markAsOrdered(requestId: string, userId: string) {
    const request = await this.prisma.partsRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== 'APPROVED') {
      throw new BadRequestException('Request must be approved first');
    }

    return this.prisma.partsRequest.update({
      where: { id: requestId },
      data: {
        status: 'ORDERED' as any,
        orderedAt: new Date(),
      },
    });
  }

  async markAsReceived(requestId: string, userId: string, receivedQuantity?: number) {
    const request = await this.prisma.partsRequest.findUnique({
      where: { id: requestId },
      include: { part: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== 'ORDERED') {
      throw new BadRequestException('Request must be ordered first');
    }

    const updatedRequest = await this.prisma.partsRequest.update({
      where: { id: requestId },
      data: {
        status: 'RECEIVED' as any,
        receivedAt: new Date(),
      },
    });

    // Add stock if part exists
    if (request.part) {
      const qty = receivedQuantity || Number(request.quantity);
      await this.addStock(request.part.id, qty, `Received for request ${requestId}`, userId, 'PARTS_REQUEST', requestId);
    }

    return updatedRequest;
  }

  async getRequests(filters?: { garageId?: string; status?: string; urgency?: string }) {
    const where: any = {};
    if (filters?.garageId) where.garageId = filters.garageId;
    if (filters?.status) where.status = filters.status;
    if (filters?.urgency) where.urgency = filters.urgency;

    return this.prisma.partsRequest.findMany({
      where,
      include: {
        part: true,
        garage: true,
        requestedByUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Low Stock Alerts
  async sendLowStockAlert(part: any) {
    // TODO: Send notification via notification service
    console.log(`Low stock alert for part: ${part.name} (${part.partNumber}), Quantity: ${part.quantity}`);
  }

  async checkLowStockAndAlert(garageId?: string) {
    const lowStockItems = await this.findLowStock(garageId);

    for (const item of lowStockItems) {
      await this.sendLowStockAlert(item);
    }

    return lowStockItems;
  }

  // Reorder Logic
  async generateReorderList(garageId?: string) {
    const lowStockItems = await this.findLowStock(garageId);

    const reorderList = [];

    for (const item of lowStockItems) {
      const recommendedOrderQuantity = Number(item.maxStockLevel) - Number(item.quantity);

      reorderList.push({
        partId: item.id,
        partNumber: item.partNumber,
        name: item.name,
        currentQuantity: Number(item.quantity),
        minStockLevel: Number(item.minStockLevel),
        reorderPoint: Number(item.reorderPoint),
        maxStockLevel: Number(item.maxStockLevel),
        recommendedOrderQuantity,
        supplier: item.supplier,
        supplierPhone: item.supplierPhone,
        leadTimeDays: item.leadTimeDays,
      });
    }

    return reorderList;
  }

  // Inventory Statistics
  async getStatistics(garageId?: string) {
    const where = garageId ? { garageId } : {};

    const totalItems = await this.prisma.partsInventory.count({ where: { ...where, isActive: true } });
    
    // Get all items to count low stock manually
    const allItems = await this.prisma.partsInventory.findMany({
      where: { ...where, isActive: true },
      select: { quantity: true, reorderPoint: true, sellingPrice: true },
    });

    const lowStockItems = allItems.filter(item => Number(item.quantity) <= Number(item.reorderPoint)).length;
    const outOfStockItems = allItems.filter(item => Number(item.quantity) === 0).length;
    
    const pendingRequests = await this.prisma.partsRequest.count({
      where: { ...where, status: 'PENDING' },
    });

    // Calculate total value
    const totalValue = allItems.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.sellingPrice);
    }, 0);

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      pendingRequests,
      totalValue,
    };
  }

  // Barcode Operations
  async findByBarcode(barcode: string) {
    const part = await this.prisma.partsInventory.findUnique({
      where: { barcode },
      include: {
        garage: true,
      },
    });

    if (!part) {
      throw new NotFoundException('Part not found with this barcode');
    }

    return part;
  }

  async findByPartNumber(partNumber: string) {
    const parts = await this.prisma.partsInventory.findMany({
      where: { partNumber },
      include: {
        garage: true,
      },
    });

    if (!parts || parts.length === 0) {
      throw new NotFoundException('Part not found with this part number');
    }

    return parts;
  }
}
