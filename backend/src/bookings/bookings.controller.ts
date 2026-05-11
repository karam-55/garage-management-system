import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AddAdditionalServiceDto, CreateBookingDto, UpdateBookingDto } from './bookings.dto';

@Controller('bookings')
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name);
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('technician/:technicianId')
  async findByTechnician(@Param('technicianId') technicianId: string) {
    return this.bookingsService.findByTechnician(technicianId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    return booking;
  }

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    this.logger.log(`POST /bookings - body: ${JSON.stringify(createBookingDto)}`);
    try {
      const result = await this.bookingsService.create(createBookingDto);
      return result;
    } catch (error) {
      this.logger.error(`POST /bookings failed: ${error.message}`);
      this.logger.error(`Full error: ${JSON.stringify(error?.response ?? error.message)}`);
      throw error;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingsService.update(id, updateBookingDto);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    return booking;
  }

  @Post(':id/additional-service')
  async addAdditionalService(
    @Param('id') id: string,
    @Body() dto: AddAdditionalServiceDto,
  ) {
    return this.bookingsService.addAdditionalService(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const booking = await this.bookingsService.delete(id);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Booking deleted successfully' };
  }
}
