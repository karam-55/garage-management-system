import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @UseGuards()
  @ApiBearerAuth()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @UseGuards()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('invoice/:invoiceId')
  @UseGuards()
  @ApiBearerAuth()
  async findByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findByInvoice(invoiceId);
  }

  @Post()
  @UseGuards()
  @ApiBearerAuth()
  async create(@Body() createPaymentDto: any) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Put(':id')
  @UseGuards()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updatePaymentDto: any) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards()
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
