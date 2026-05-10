import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './technicians.dto';

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  async findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const technician = await this.techniciansService.findOne(id);
    if (!technician) {
      throw new HttpException('Technician not found', HttpStatus.NOT_FOUND);
    }
    return technician;
  }

  @Post()
  async create(@Body() createTechnicianDto: CreateTechnicianDto) {
    return this.techniciansService.create(createTechnicianDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTechnicianDto: UpdateTechnicianDto) {
    const technician = await this.techniciansService.update(id, updateTechnicianDto);
    if (!technician) {
      throw new HttpException('Technician not found', HttpStatus.NOT_FOUND);
    }
    return technician;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const technician = await this.techniciansService.delete(id);
    if (!technician) {
      throw new HttpException('Technician not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Technician deleted successfully' };
  }
}
