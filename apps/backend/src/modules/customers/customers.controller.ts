import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @UseGuards()
  @ApiBearerAuth()
  async findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @UseGuards()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @UseGuards()
  @ApiBearerAuth()
  async create(@Body() createCustomerDto: any) {
    return this.customersService.create(createCustomerDto);
  }

  @Put(':id')
  @UseGuards()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @UseGuards()
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
