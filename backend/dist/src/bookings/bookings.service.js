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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma.service");
let BookingsService = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.booking.findMany({
            include: {
                customer: true,
                vehicle: true,
                technician: true,
                invoices: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.booking.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                technician: true,
                invoices: true,
            },
        });
    }
    async findByTechnician(technicianId) {
        return this.prisma.booking.findMany({
            where: { technicianId },
            include: {
                customer: true,
                vehicle: true,
                technician: true,
                invoices: true,
            },
            orderBy: { scheduledAt: 'desc' },
        });
    }
    async create(createBookingDto) {
        const qrToken = (0, crypto_1.randomUUID)();
        const frontendUrl = process.env.FRONTEND_URL || '';
        const qrUrl = frontendUrl
            ? `${frontendUrl}/track/${createBookingDto.vehicleId}?token=${qrToken}`
            : '';
        return this.prisma.booking.create({
            data: {
                ...createBookingDto,
                qrToken,
                qrUrl,
                services: createBookingDto.services ?? [],
                additionalServices: [],
            },
            include: {
                customer: true,
                vehicle: true,
            },
        });
    }
    async update(id, updateBookingDto) {
        return this.prisma.booking.update({
            where: { id },
            data: updateBookingDto,
            include: {
                customer: true,
                vehicle: true,
                technician: true,
                invoices: true,
            },
        });
    }
    async delete(id) {
        return this.prisma.booking.delete({
            where: { id },
        });
    }
    async addAdditionalService(bookingId, dto) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('الحجز غير موجود');
        const existing = booking.additionalServices ?? [];
        const newService = {
            id: (0, crypto_1.randomUUID)(),
            name: dto.name,
            estimatedPrice: dto.estimatedPrice ?? null,
            status: 'PENDING',
            addedAt: new Date().toISOString(),
        };
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: { additionalServices: [...existing, newService] },
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map