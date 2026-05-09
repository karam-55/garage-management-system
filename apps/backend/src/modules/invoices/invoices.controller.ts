import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @UseGuards()
  @ApiBearerAuth()
  async findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @UseGuards()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @UseGuards()
  @ApiBearerAuth()
  async create(@Body() createInvoiceDto: any) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Post('from-booking')
  @UseGuards()
  @ApiBearerAuth()
  async createFromBooking(@Body() createFromBookingDto: any) {
    return this.invoicesService.createFromBooking(createFromBookingDto);
  }

  @Put(':id')
  @UseGuards()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateInvoiceDto: any) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @UseGuards()
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
