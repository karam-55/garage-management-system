import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PartData {
  partNumber: string;
  name: string;
  description?: string;
  categoryId: string;
  supplierId?: string;
  brand?: string;
  unitPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  location?: string;
  binLocation?: string;
  barcode?: string;
  qrCode?: string;
  images?: string[];
  specifications?: Record<string, any>;
  compatibility?: Array<{
    make: string;
    model: string;
    year?: string;
    notes?: string;
  }>;
  warrantyPeriod?: number; // بالأشهر
  isActive: boolean;
  isHazardous?: boolean;
  storageRequirements?: string;
  notes?: string;
}

export interface StockTransactionData {
  partId: string;
  transactionType: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER' | 'DAMAGE' | 'EXPIRED';
  quantity: number;
  unitCost?: number;
  referenceId?: string; // قد يكون purchase order ID أو job card ID
  referenceType?: 'PURCHASE_ORDER' | 'JOB_CARD' | 'ADJUSTMENT' | 'TRANSFER';
  notes?: string;
  performedBy: string;
  fromLocation?: string;
  toLocation?: string;
}

export interface PurchaseOrderData {
  supplierId: string;
  orderNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'PARTIAL_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  items: Array<{
    partId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
  createdBy: string;
}

export interface StockAdjustmentData {
  adjustmentNumber: string;
  adjustmentDate: Date;
  adjustmentType: 'PHYSICAL_COUNT' | 'DAMAGE' | 'THEFT' | 'EXPIRED' | 'CORRECTION';
  reason: string;
  items: Array<{
    partId: string;
    systemQuantity: number;
    actualQuantity: number;
    difference: number;
    unitCost: number;
    totalValue: number;
    notes?: string;
  }>;
  totalAdjustment: number;
  performedBy: string;
  approvedBy?: string;
  notes?: string;
}

export class InventoryService {
  // إضافة قطعة غيار جديدة
  async addPart(partData: PartData): Promise<any> {
    try {
      // التحقق من عدم وجود رقم القطعة مسبقاً
      const existingPart = await prisma.part.findFirst({
        where: {
          OR: [
            { partNumber: partData.partNumber },
            { barcode: partData.barcode },
          ],
        },
      });

      if (existingPart) {
        throw new Error('Part with this part number or barcode already exists');
      }

      const part = await prisma.part.create({
        data: {
          ...partData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      // تسجيل المعاملة الأولية
      if (part.currentStock > 0) {
        await this.createStockTransaction({
          partId: part.id,
          transactionType: 'ADJUSTMENT',
          quantity: part.currentStock,
          unitCost: part.unitPrice,
          referenceType: 'ADJUSTMENT',
          notes: 'Initial stock',
          performedBy: 'system',
        });
      }

      return part;
    } catch (error) {
      console.error('Error adding part:', error);
      throw error;
    }
  }

  // تحديث قطعة غيار
  async updatePart(partId: string, updateData: Partial<PartData>): Promise<any> {
    try {
      const part = await prisma.part.update({
        where: { id: partId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      return part;
    } catch (error) {
      console.error('Error updating part:', error);
      throw error;
    }
  }

  // الحصول على قائمة قطع الغيار
  async getParts(filters?: {
    categoryId?: string;
    supplierId?: string;
    brand?: string;
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const where: any = { isActive: true };

      if (filters?.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters?.supplierId) {
        where.supplierId = filters.supplierId;
      }

      if (filters?.brand) {
        where.brand = filters.brand;
      }

      if (filters?.lowStock) {
        where.currentStock = {
          lte: prisma.part.fields.minStockLevel,
        };
      }

      if (filters?.search) {
        const searchTerm = filters.search;
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { partNumber: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { brand: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const parts = await prisma.part.findMany({
        where,
        include: {
          category: true,
          supplier: true,
        },
        orderBy: [
          { name: 'asc' },
        ],
      });

      // تطبيق الصفحة إذا تم تحديدها
      if (filters?.page && filters?.limit) {
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit;
        return {
          data: parts.slice(startIndex, endIndex),
          total: parts.length,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(parts.length / filters.limit),
        };
      }

      return {
        data: parts,
        total: parts.length,
      };
    } catch (error) {
      console.error('Error getting parts:', error);
      throw error;
    }
  }

  // الحصول على قطعة غيار محددة
  async getPartById(partId: string): Promise<any> {
    try {
      const part = await prisma.part.findUnique({
        where: { id: partId },
        include: {
          category: true,
          supplier: true,
          stockTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!part) {
        throw new Error('Part not found');
      }

      return part;
    } catch (error) {
      console.error('Error getting part by ID:', error);
      throw error;
    }
  }

  // تحديث المخزون (إضافة أو خصم)
  async updateStock(partId: string, quantity: number, transactionType: StockTransactionData['transactionType'], options?: {
    referenceId?: string;
    referenceType?: StockTransactionData['referenceType'];
    notes?: string;
    performedBy?: string;
    unitCost?: number;
  }): Promise<any> {
    try {
      const part = await prisma.part.findUnique({
        where: { id: partId },
      });

      if (!part) {
        throw new Error('Part not found');
      }

      const newStock = part.currentStock + quantity;

      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      // تحديث كمية المخزون
      const updatedPart = await prisma.part.update({
        where: { id: partId },
        data: {
          currentStock: newStock,
          updatedAt: new Date(),
        },
      });

      // تسجيل المعاملة
      await this.createStockTransaction({
        partId,
        transactionType,
        quantity,
        unitCost: options?.unitCost || part.unitPrice,
        referenceId: options?.referenceId,
        referenceType: options?.referenceType,
        notes: options?.notes,
        performedBy: options?.performedBy || 'system',
      });

      // التحقق من مستوى إعادة الطلب
      if (newStock <= part.reorderPoint) {
        await this.checkReorderPoint(partId);
      }

      return updatedPart;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // إنشاء معاملة مخزون
  private async createStockTransaction(transactionData: StockTransactionData): Promise<void> {
    try {
      await prisma.stockTransaction.create({
        data: {
          ...transactionData,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error creating stock transaction:', error);
    }
  }

  // التحقق من نقطة إعادة الطلب
  private async checkReorderPoint(partId: string): Promise<void> {
    try {
      const part = await prisma.part.findUnique({
        where: { id: partId },
        include: {
          supplier: true,
        },
      });

      if (!part || !part.supplierId) return;

      // إنشاء تنبيه إعادة طلب تلقائي
      await prisma.reorderAlert.create({
        data: {
          partId,
          supplierId: part.supplierId,
          suggestedQuantity: part.reorderQuantity,
          urgency: part.currentStock <= part.minStockLevel ? 'HIGH' : 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date(),
        },
      });

      console.log(`Reorder alert created for part: ${part.partNumber}`);
    } catch (error) {
      console.error('Error checking reorder point:', error);
    }
  }

  // إنشاء أمر شراء
  async createPurchaseOrder(orderData: PurchaseOrderData): Promise<any> {
    try {
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          ...orderData,
          orderDate: new Date(orderData.orderDate),
          expectedDeliveryDate: orderData.expectedDeliveryDate ? new Date(orderData.expectedDeliveryDate) : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          supplier: true,
          items: {
            include: {
              part: true,
            },
          },
        },
      });

      return purchaseOrder;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  // استلام أمر شراء
  async receivePurchaseOrder(orderId: string, receivedItems: Array<{ itemId: string; receivedQuantity: number; notes?: string }>): Promise<any> {
    try {
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              part: true,
            },
          },
        },
      });

      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      // تحديث الكميات المستلمة
      for (const receivedItem of receivedItems) {
        const orderItem = purchaseOrder.items.find(item => item.id === receivedItem.itemId);
        if (!orderItem) continue;

        // تحديث كمية العنصر
        await prisma.purchaseOrderItem.update({
          where: { id: receivedItem.itemId },
          data: {
            receivedQuantity: (orderItem.receivedQuantity || 0) + receivedItem.receivedQuantity,
            notes: receivedItem.notes,
          },
        });

        // إضافة الكمية للمخزون
        await this.updateStock(
          orderItem.partId,
          receivedItem.receivedQuantity,
          'PURCHASE',
          {
            referenceId: orderId,
            referenceType: 'PURCHASE_ORDER',
            unitCost: orderItem.unitPrice,
            notes: `Purchase order receipt - ${receivedItem.notes || ''}`,
          }
        );
      }

      // تحديث حالة أمر الشراء
      const allItemsReceived = purchaseOrder.items.every(item => 
        item.receivedQuantity >= item.quantity
      );

      const someItemsReceived = purchaseOrder.items.some(item => 
        (item.receivedQuantity || 0) > 0
      );

      let newStatus: string;
      if (allItemsReceived) {
        newStatus = 'RECEIVED';
      } else if (someItemsReceived) {
        newStatus = 'PARTIAL_RECEIVED';
      } else {
        newStatus = purchaseOrder.status;
      }

      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
          supplier: true,
          items: {
            include: {
              part: true,
            },
          },
        },
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      throw error;
    }
  }

  // إنشاء تسوية مخزون
  async createStockAdjustment(adjustmentData: StockAdjustmentData): Promise<any> {
    try {
      const adjustment = await prisma.stockAdjustment.create({
        data: {
          ...adjustmentData,
          adjustmentDate: new Date(adjustmentData.adjustmentDate),
          createdAt: new Date(),
        },
        include: {
          items: {
            include: {
              part: true,
            },
          },
        },
      });

      // تطبيق التسويات على المخزون
      for (const item of adjustmentData.items) {
        const difference = item.actualQuantity - item.systemQuantity;
        
        if (difference !== 0) {
          await this.updateStock(
            item.partId,
            difference,
            'ADJUSTMENT',
            {
              referenceId: adjustment.id,
              referenceType: 'ADJUSTMENT',
              notes: `Stock adjustment - ${adjustmentData.reason}`,
              unitCost: item.unitCost,
            }
          );
        }
      }

      return adjustment;
    } catch (error) {
      console.error('Error creating stock adjustment:', error);
      throw error;
    }
  }

  // الحصول على تقارير المخزون
  async getInventoryReports(filters?: {
    categoryId?: string;
    dateFrom?: Date;
    dateTo?: string;
    reportType?: 'STOCK_VALUE' | 'LOW_STOCK' | 'MOVEMENT' | 'SUPPLIER_PERFORMANCE';
  }): Promise<any> {
    try {
      const where: any = { isActive: true };
      if (filters?.categoryId) {
        where.categoryId = filters.categoryId;
      }

      switch (filters?.reportType) {
        case 'STOCK_VALUE':
          return await this.getStockValueReport(where);
        case 'LOW_STOCK':
          return await this.getLowStockReport(where);
        case 'MOVEMENT':
          return await this.getStockMovementReport(filters);
        case 'SUPPLIER_PERFORMANCE':
          return await this.getSupplierPerformanceReport(filters);
        default:
          return await this.getGeneralInventoryReport(where);
      }
    } catch (error) {
      console.error('Error getting inventory reports:', error);
      throw error;
    }
  }

  // تقرير قيمة المخزون
  private async getStockValueReport(where: any): Promise<any> {
    const parts = await prisma.part.findMany({
      where,
      include: {
        category: true,
      },
    });

    const totalValue = parts.reduce((sum, part) => sum + (part.currentStock * part.unitPrice), 0);
    const totalSellingValue = parts.reduce((sum, part) => sum + (part.currentStock * part.sellingPrice), 0);

    const categoryBreakdown = parts.reduce((acc, part) => {
      const categoryName = part.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          count: 0,
          totalValue: 0,
          totalSellingValue: 0,
        };
      }
      acc[categoryName].count++;
      acc[categoryName].totalValue += part.currentStock * part.unitPrice;
      acc[categoryName].totalSellingValue += part.currentStock * part.sellingPrice;
      return acc;
    }, {});

    return {
      reportType: 'STOCK_VALUE',
      summary: {
        totalParts: parts.length,
        totalValue,
        totalSellingValue,
        potentialProfit: totalSellingValue - totalValue,
      },
      categoryBreakdown,
      lowStockItems: parts.filter(part => part.currentStock <= part.reorderPoint),
    };
  }

  // تقرير المخزون المنخفض
  private async getLowStockReport(where: any): Promise<any> {
    where.currentStock = {
      lte: prisma.part.fields.reorderPoint,
    };

    const lowStockParts = await prisma.part.findMany({
      where,
      include: {
        category: true,
        supplier: true,
      },
      orderBy: [
        { currentStock: 'asc' },
      ],
    });

    return {
      reportType: 'LOW_STOCK',
      summary: {
        totalLowStockItems: lowStockParts.length,
        criticalItems: lowStockParts.filter(part => part.currentStock <= part.minStockLevel).length,
        totalReorderCost: lowStockParts.reduce((sum, part) => sum + (part.reorderQuantity * part.unitPrice), 0),
      },
      items: lowStockParts,
    };
  }

  // تقرير حركة المخزون
  private async getStockMovementReport(filters?: any): Promise<any> {
    const transactionWhere: any = {};
    
    if (filters?.dateFrom || filters?.dateTo) {
      transactionWhere.createdAt = {};
      if (filters.dateFrom) transactionWhere.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) transactionWhere.createdAt.lte = new Date(filters.dateTo);
    }

    const transactions = await prisma.stockTransaction.findMany({
      where: transactionWhere,
      include: {
        part: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const movementByType = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.transactionType]) {
        acc[transaction.transactionType] = {
          count: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }
      acc[transaction.transactionType].count++;
      acc[transaction.transactionType].totalQuantity += transaction.quantity;
      acc[transaction.transactionType].totalValue += transaction.quantity * (transaction.unitCost || 0);
      return acc;
    }, {});

    return {
      reportType: 'MOVEMENT',
      summary: {
        totalTransactions: transactions.length,
        movementByType,
      },
      transactions: transactions.slice(0, 100), // آخر 100 معاملة
    };
  }

  // تقرير أداء الموردين
  private async getSupplierPerformanceReport(filters?: any): Promise<any> {
    const suppliers = await prisma.supplier.findMany({
      include: {
        parts: true,
        purchaseOrders: {
          where: filters?.dateFrom || filters?.dateTo ? {
            orderDate: {
              gte: filters?.dateFrom,
              lte: filters?.dateTo ? new Date(filters.dateTo) : undefined,
            },
          } : undefined,
        },
      },
    });

    const supplierPerformance = suppliers.map(supplier => {
      const totalOrders = supplier.purchaseOrders.length;
      const completedOrders = supplier.purchaseOrders.filter(po => po.status === 'RECEIVED').length;
      const totalValue = supplier.purchaseOrders.reduce((sum, po) => sum + po.total, 0);
      const partsCount = supplier.parts.length;

      return {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          contactEmail: supplier.contactEmail,
        },
        performance: {
          totalOrders,
          completedOrders,
          completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
          totalValue,
          partsCount,
        },
      };
    });

    return {
      reportType: 'SUPPLIER_PERFORMANCE',
      suppliers: supplierPerformance.sort((a, b) => b.performance.totalValue - a.performance.totalValue),
    };
  }

  // تقرير المخزون العام
  private async getGeneralInventoryReport(where: any): Promise<any> {
    const parts = await prisma.part.findMany({
      where,
      include: {
        category: true,
        supplier: true,
      },
    });

    const summary = {
      totalParts: parts.length,
      totalStockValue: parts.reduce((sum, part) => sum + (part.currentStock * part.unitPrice), 0),
      totalItems: parts.reduce((sum, part) => sum + part.currentStock, 0),
      lowStockItems: parts.filter(part => part.currentStock <= part.reorderPoint).length,
      outOfStockItems: parts.filter(part => part.currentStock === 0).length,
      categories: [...new Set(parts.map(part => part.category?.name).filter(Boolean))].length,
      suppliers: [...new Set(parts.map(part => part.supplier?.name).filter(Boolean))].length,
    };

    return {
      reportType: 'GENERAL',
      summary,
      parts: parts.slice(0, 50), // أول 50 قطعة
    };
  }

  // البحث عن قطع غيار متوافقة
  async findCompatibleParts(make: string, model: string, year?: string): Promise<any[]> {
    try {
      const parts = await prisma.part.findMany({
        where: {
          isActive: true,
          compatibility: {
            some: {
              make: { contains: make, mode: 'insensitive' },
              model: { contains: model, mode: 'insensitive' },
              ...(year && { year: { contains: year, mode: 'insensitive' } }),
            },
          },
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      return parts;
    } catch (error) {
      console.error('Error finding compatible parts:', error);
      throw error;
    }
  }

  // الحصول على تنبيهات إعادة الطلب
  async getReorderAlerts(filters?: {
    status?: 'PENDING' | 'ORDERED' | 'COMPLETED';
    urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  }): Promise<any[]> {
    try {
      const where: any = {};
      if (filters?.status) where.status = filters.status;
      if (filters?.urgency) where.urgency = filters.urgency;

      const alerts = await prisma.reorderAlert.findMany({
        where,
        include: {
          part: {
            include: {
              category: true,
              supplier: true,
            },
          },
          supplier: true,
        },
        orderBy: [
          { urgency: 'desc' },
          { createdAt: 'asc' },
        ],
      });

      return alerts;
    } catch (error) {
      console.error('Error getting reorder alerts:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
