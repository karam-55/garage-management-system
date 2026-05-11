import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER')
  async findAll() {
    try {
      return await this.customersService.findAll();
    } catch (error) {
      this.logger.error(`findAll failed: ${error.message}`);
      throw new HttpException('فشل في تحميل العملاء', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER')
  async findOne(@Param('id') id: string) {
    try {
      const customer = await this.customersService.findOne(id);
      if (!customer) {
        throw new HttpException('العميل غير موجود', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      this.logger.error(`findOne failed: ${error.message}`);
      throw error;
    }
  }

  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      return await this.customersService.create(createCustomerDto);
    } catch (error) {
      this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
      throw error;
    }
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = await this.customersService.update(id, updateCustomerDto);
      if (!customer) {
        throw new HttpException('العميل غير موجود', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      this.logger.error(`update failed: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(@Param('id') id: string) {
    try {
      const customer = await this.customersService.delete(id);
      if (!customer) {
        throw new HttpException('العميل غير موجود', HttpStatus.NOT_FOUND);
      }
      return { message: 'تم حذف العميل بنجاح' };
    } catch (error) {
      this.logger.error(`delete failed: ${error.message}`);
      throw error;
    }
  }
}
