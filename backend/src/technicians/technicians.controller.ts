import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './technicians.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('technicians')
export class TechniciansController {
  private readonly logger = new Logger(TechniciansController.name);
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  @Roles('OWNER', 'MANAGER')
  async findAll() {
    try {
      return await this.techniciansService.findAll();
    } catch (error) {
      this.logger.error(`findAll failed: ${error.message}`);
      throw new HttpException('فشل في تحميل الفنيين', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  async findOne(@Param('id') id: string) {
    try {
      const technician = await this.techniciansService.findOne(id);
      if (!technician) {
        throw new HttpException('الفني غير موجود', HttpStatus.NOT_FOUND);
      }
      return technician;
    } catch (error) {
      this.logger.error(`findOne failed: ${error.message}`);
      throw error;
    }
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  async create(@Body() createTechnicianDto: CreateTechnicianDto) {
    try {
      return await this.techniciansService.create(createTechnicianDto);
    } catch (error) {
      this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
      if (error.code === 'P2002') {
        throw new HttpException('رقم الهاتف مستخدم مسبقاً', HttpStatus.CONFLICT);
      }
      throw new HttpException(`فشل إنشاء الفني: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  async update(@Param('id') id: string, @Body() updateTechnicianDto: UpdateTechnicianDto) {
    try {
      const technician = await this.techniciansService.update(id, updateTechnicianDto);
      if (!technician) {
        throw new HttpException('الفني غير موجود', HttpStatus.NOT_FOUND);
      }
      return technician;
    } catch (error) {
      this.logger.error(`update failed: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(@Param('id') id: string) {
    try {
      const technician = await this.techniciansService.delete(id);
      if (!technician) {
        throw new HttpException('الفني غير موجود', HttpStatus.NOT_FOUND);
      }
      return { message: 'تم حذف الفني بنجاح' };
    } catch (error) {
      this.logger.error(`delete failed: ${error.message}`);
      throw error;
    }
  }
}
