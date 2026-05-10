import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMechanicDto } from './dto/create-mechanic.dto';

@ApiTags('Mechanics')
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(@Request() req) {
    return this.mechanicsService.findAll(req.user?.garageId);
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAvailable(@Request() req) {
    return this.mechanicsService.findAvailable(req.user?.garageId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createMechanicDto: CreateMechanicDto) {
    return this.mechanicsService.create(createMechanicDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateMechanicDto: any) {
    return this.mechanicsService.update(id, updateMechanicDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.mechanicsService.remove(id);
  }
}
