import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('track')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':vehicleId')
  async trackVehicle(@Param('vehicleId') vehicleId: string) {
    const trackingData = await this.trackingService.trackVehicle(vehicleId);
    if (!trackingData) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return trackingData;
  }
}
