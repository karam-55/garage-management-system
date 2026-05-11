import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles('OWNER', 'MANAGER')
  async findAll() {
    try {
      return await this.inventoryService.findAll();
    } catch (error) {
      this.logger.error(`findAll failed: ${error.message}`);
      throw new HttpException('فشل في تحميل المخزون', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  async findOne(@Param('id') id: string) {
    try {
      const item = await this.inventoryService.findOne(id);
      if (!item) {
        throw new HttpException('العنصر غير موجود', HttpStatus.NOT_FOUND);
      }
      return item;
    } catch (error) {
      this.logger.error(`findOne failed: ${error.message}`);
      throw error;
    }
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  async create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    try {
      return await this.inventoryService.create(createInventoryItemDto);
    } catch (error) {
      this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
      if (error.code === 'P2002') {
        throw new HttpException('الكود مستخدم مسبقاً', HttpStatus.CONFLICT);
      }
      throw new HttpException(`فشل إنشاء العنصر: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  async update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    try {
      const item = await this.inventoryService.update(id, updateInventoryItemDto);
      if (!item) {
        throw new HttpException('العنصر غير موجود', HttpStatus.NOT_FOUND);
      }
      return item;
    } catch (error) {
      this.logger.error(`update failed: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(@Param('id') id: string) {
    try {
      const item = await this.inventoryService.delete(id);
      if (!item) {
        throw new HttpException('العنصر غير موجود', HttpStatus.NOT_FOUND);
      }
      return { message: 'تم حذف العنصر بنجاح' };
    } catch (error) {
      this.logger.error(`delete failed: ${error.message}`);
      throw error;
    }
  }
}
