import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventoryItem.findMany();
  }

  async findOne(id: string) {
    return this.prisma.inventoryItem.findUnique({
      where: { id },
    });
  }

  async create(createInventoryItemDto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: createInventoryItemDto as any,
    });
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: updateInventoryItemDto as any,
    });
  }

  async delete(id: string) {
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }
}
