import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service';

@ApiTags('Mechanics')
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  @UseGuards()
  @ApiBearerAuth()
  async findAll() {
    return this.mechanicsService.findAll();
  }

  @Get('available')
  @UseGuards()
  @ApiBearerAuth()
  async findAvailable() {
    return this.mechanicsService.findAvailable();
  }

  @Get(':id')
  @UseGuards()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Post()
  @UseGuards()
  @ApiBearerAuth()
  async create(@Body() createMechanicDto: any) {
    return this.mechanicsService.create(createMechanicDto);
  }

  @Put(':id')
  @UseGuards()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateMechanicDto: any) {
    return this.mechanicsService.update(id, updateMechanicDto);
  }

  @Delete(':id')
  @UseGuards()
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.mechanicsService.remove(id);
  }
}
