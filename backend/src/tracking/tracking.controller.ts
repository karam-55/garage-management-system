import { Controller, Get, Post, Param, Query, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Public } from '../auth/public.decorator';

@Controller('track')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Get(':vehicleId')
  async trackVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query('token') token?: string,
  ) {
    this.logger.log(`GET /track/${vehicleId}?token=${token ? '***' : 'missing'}`);
    const trackingData = await this.trackingService.trackVehicle(vehicleId, token);
    if (!trackingData) {
      this.logger.warn(`Track request failed for vehicle ${vehicleId}: not found or invalid token`);
      throw new HttpException('السيارة غير موجودة أو رمز QR غير صالح', HttpStatus.NOT_FOUND);
    }
    this.logger.log(`Track request succeeded for vehicle ${vehicleId}`);
    return trackingData;
  }

  @Public()
  @Post(':vehicleId/approve-service')
  async approveService(
    @Param('vehicleId') vehicleId: string,
    @Query('token') token: string,
    @Body() body: { serviceId: string; approve: boolean },
  ) {
    this.logger.log(`POST /track/${vehicleId}/approve-service`);
    if (!token) throw new HttpException('رمز QR مطلوب', HttpStatus.BAD_REQUEST);
    return this.trackingService.approveAdditionalService(
      vehicleId,
      token,
      body.serviceId,
      body.approve,
    );
  }
}
