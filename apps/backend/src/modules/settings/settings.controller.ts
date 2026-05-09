import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards()
  @ApiBearerAuth()
  async findAll() {
    return this.settingsService.findAll();
  }

  @Put()
  @UseGuards()
  @ApiBearerAuth()
  async update(@Body() updateSettingsDto: any) {
    return this.settingsService.update(updateSettingsDto);
  }
}
