import { Controller, Get, Post, Param, Query, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Public } from '../auth/public.decorator';

@Controller('track')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Get(':vehicleId')
  async trackVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query('token') token?: string,
  ) {
    const trackingData = await this.trackingService.trackVehicle(vehicleId, token);
    if (!trackingData) {
      throw new HttpException('السيارة غير موجودة أو رمز QR غير صالح', HttpStatus.NOT_FOUND);
    }
    return trackingData;
  }

  @Public()
  @Post(':vehicleId/approve-service')
  async approveService(
    @Param('vehicleId') vehicleId: string,
    @Query('token') token: string,
    @Body() body: { serviceId: string; approve: boolean },
  ) {
    if (!token) throw new HttpException('رمز QR مطلوب', HttpStatus.BAD_REQUEST);
    return this.trackingService.approveAdditionalService(
      vehicleId,
      token,
      body.serviceId,
      body.approve,
    );
  }
}
