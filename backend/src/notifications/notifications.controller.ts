import { Controller, Get, Delete, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER')
  async findAll() {
    try {
      return await this.notificationsService.findAll();
    } catch (error) {
      this.logger.error(`findAll failed: ${error.message}`);
      throw new HttpException('فشل في تحميل الإشعارات', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER')
  async findOne(@Param('id') id: string) {
    try {
      const notification = await this.notificationsService.findOne(id);
      if (!notification) {
        throw new HttpException('الإشعار غير موجود', HttpStatus.NOT_FOUND);
      }
      return notification;
    } catch (error) {
      this.logger.error(`findOne failed: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(@Param('id') id: string) {
    try {
      const notification = await this.notificationsService.delete(id);
      if (!notification) {
        throw new HttpException('الإشعار غير موجود', HttpStatus.NOT_FOUND);
      }
      return { message: 'تم حذف الإشعار بنجاح' };
    } catch (error) {
      this.logger.error(`delete failed: ${error.message}`);
      throw error;
    }
  }
}
