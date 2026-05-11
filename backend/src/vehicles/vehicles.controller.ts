import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicles.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('vehicles')
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER')
  async findAll() {
    try {
      return await this.vehiclesService.findAll();
    } catch (error) {
      this.logger.error(`findAll failed: ${error.message}`);
      throw new HttpException('فشل في تحميل السيارات', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER')
  async findOne(@Param('id') id: string) {
    try {
      const vehicle = await this.vehiclesService.findOne(id);
      if (!vehicle) {
        throw new HttpException('السيارة غير موجودة', HttpStatus.NOT_FOUND);
      }
      return vehicle;
    } catch (error) {
      this.logger.error(`findOne failed: ${error.message}`);
      throw error;
    }
  }

  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    try {
      return await this.vehiclesService.create(createVehicleDto);
    } catch (error) {
      this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
      throw error;
    }
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    try {
      const vehicle = await this.vehiclesService.update(id, updateVehicleDto);
      if (!vehicle) {
        throw new HttpException('السيارة غير موجودة', HttpStatus.NOT_FOUND);
      }
      return vehicle;
    } catch (error) {
      this.logger.error(`update failed: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(@Param('id') id: string) {
    try {
      const vehicle = await this.vehiclesService.delete(id);
      if (!vehicle) {
        throw new HttpException('السيارة غير موجودة', HttpStatus.NOT_FOUND);
      }
      return { message: 'تم حذف السيارة بنجاح' };
    } catch (error) {
      this.logger.error(`delete failed: ${error.message}`);
      throw error;
    }
  }
}
