"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const bookings_dto_1 = require("./bookings.dto");
let BookingsController = BookingsController_1 = class BookingsController {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
        this.logger = new common_1.Logger(BookingsController_1.name);
    }
    async findAll() {
        return this.bookingsService.findAll();
    }
    async findByTechnician(technicianId) {
        return this.bookingsService.findByTechnician(technicianId);
    }
    async findOne(id) {
        const booking = await this.bookingsService.findOne(id);
        if (!booking) {
            throw new common_1.HttpException('Booking not found', common_1.HttpStatus.NOT_FOUND);
        }
        return booking;
    }
    async create(createBookingDto) {
        this.logger.log(`POST /bookings - body: ${JSON.stringify(createBookingDto)}`);
        try {
            const result = await this.bookingsService.create(createBookingDto);
            return result;
        }
        catch (error) {
            this.logger.error(`POST /bookings failed: ${error.message}`);
            this.logger.error(`Full error: ${JSON.stringify(error?.response ?? error.message)}`);
            throw error;
        }
    }
    async update(id, updateBookingDto) {
        const booking = await this.bookingsService.update(id, updateBookingDto);
        if (!booking) {
            throw new common_1.HttpException('Booking not found', common_1.HttpStatus.NOT_FOUND);
        }
        return booking;
    }
    async addAdditionalService(id, dto) {
        return this.bookingsService.addAdditionalService(id, dto);
    }
    async delete(id) {
        const booking = await this.bookingsService.delete(id);
        if (!booking) {
            throw new common_1.HttpException('Booking not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { message: 'Booking deleted successfully' };
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('technician/:technicianId'),
    __param(0, (0, common_1.Param)('technicianId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findByTechnician", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bookings_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bookings_dto_1.UpdateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/additional-service'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bookings_dto_1.AddAdditionalServiceDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "addAdditionalService", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "delete", null);
exports.BookingsController = BookingsController = BookingsController_1 = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map