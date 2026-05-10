import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createBookingDto: any) {
    return this.bookingsService.create(createBookingDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateBookingDto: any) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

  // Public QR Session Endpoint - No authentication required
  @Get('qr/:qrToken')
  async getQRSession(@Param('qrToken') qrToken: string, @Req() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.bookingsService.getQRSessionByToken(qrToken, ipAddress, userAgent);
  }

  // Public endpoint for customer to approve additional services
  @Post('qr/:qrToken/approve')
  async approveAdditionalService(@Param('qrToken') qrToken: string, @Body() body: { serviceId: string }) {
    return this.bookingsService.approveAdditionalServiceByQR(qrToken, body.serviceId);
  }

  // Public endpoint for customer to reject additional services
  @Post('qr/:qrToken/reject')
  async rejectAdditionalService(@Param('qrToken') qrToken: string, @Body() body: { serviceId: string }) {
    return this.bookingsService.rejectAdditionalServiceByQR(qrToken, body.serviceId);
  }
}
