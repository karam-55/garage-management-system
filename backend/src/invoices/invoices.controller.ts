import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('invoices')
export class InvoicesController {
  private readonly logger = new Logger(InvoicesController.name);
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles('OWNER', 'MANAGER', 'CASHIER')
  async findAll() {
    try {
      return await this.invoicesService.findAll();
    } catch (error) {
      this.logger.error(`findAll failed: ${error.message}`);
      throw new HttpException('فشل في تحميل الفواتير', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'CASHIER')
  async findOne(@Param('id') id: string) {
    try {
      const invoice = await this.invoicesService.findOne(id);
      if (!invoice) {
        throw new HttpException('الفاتورة غير موجودة', HttpStatus.NOT_FOUND);
      }
      return invoice;
    } catch (error) {
      this.logger.error(`findOne failed: ${error.message}`);
      throw error;
    }
  }

  @Post()
  @Roles('OWNER', 'MANAGER', 'CASHIER')
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    this.logger.log(`Creating invoice: ${createInvoiceDto.invoiceNumber}`);
    try {
      return await this.invoicesService.create(createInvoiceDto);
    } catch (error) {
      this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
      if (error.code === 'P2002') {
        throw new HttpException('رقم الفاتورة مستخدم مسبقاً', HttpStatus.CONFLICT);
      }
      if (error.code === 'P2025') {
        throw new HttpException('الحجز المرتبط غير موجود', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(`فشل إنشاء الفاتورة: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER', 'CASHIER')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    try {
      const invoice = await this.invoicesService.update(id, updateInvoiceDto);
      if (!invoice) {
        throw new HttpException('الفاتورة غير موجودة', HttpStatus.NOT_FOUND);
      }
      return invoice;
    } catch (error) {
      this.logger.error(`update failed: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(@Param('id') id: string) {
    try {
      const invoice = await this.invoicesService.delete(id);
      if (!invoice) {
        throw new HttpException('الفاتورة غير موجودة', HttpStatus.NOT_FOUND);
      }
      return { message: 'تم حذف الفاتورة بنجاح' };
    } catch (error) {
      this.logger.error(`delete failed: ${error.message}`);
      throw error;
    }
  }
}
