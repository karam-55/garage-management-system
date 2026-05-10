import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(@Request() req) {
    return this.invoicesService.findAll({ garageId: req.user?.garageId });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create({ ...createInvoiceDto, garageId: createInvoiceDto.garageId || req.user?.garageId });
  }

  @Post('from-booking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createFromBooking(@Body() createFromBookingDto: any) {
    return this.invoicesService.createFromBooking(createFromBookingDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateInvoiceDto: any) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
