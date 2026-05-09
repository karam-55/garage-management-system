import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GaragesService } from './garages.service';

@ApiTags('Garages')
@Controller('garages')
export class GaragesController {
  constructor(private readonly garagesService: GaragesService) {}

  @Get()
  @UseGuards()
  @ApiBearerAuth()
  async findAll() {
    return this.garagesService.findAll();
  }

  @Get(':id')
  @UseGuards()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.garagesService.findOne(id);
  }

  @Post()
  @UseGuards()
  @ApiBearerAuth()
  async create(@Body() createGarageDto: any) {
    return this.garagesService.create(createGarageDto);
  }

  @Put(':id')
  @UseGuards()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateGarageDto: any) {
    return this.garagesService.update(id, updateGarageDto);
  }

  @Delete(':id')
  @UseGuards()
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.garagesService.remove(id);
  }
}
