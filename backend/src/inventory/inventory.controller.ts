import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.inventoryService.findOne(id);
    if (!item) {
      throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }

  @Post()
  async create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    const item = await this.inventoryService.update(id, updateInventoryItemDto);
    if (!item) {
      throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const item = await this.inventoryService.delete(id);
    if (!item) {
      throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Inventory item deleted successfully' };
  }
}
