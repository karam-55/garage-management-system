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
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let TrackingService = class TrackingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async trackVehicle(vehicleId, token) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: {
                customer: true,
                vehicleTracking: true,
                bookings: {
                    where: token
                        ? { qrToken: token }
                        : { status: { not: 'CANCELED' } },
                    orderBy: { scheduledAt: 'desc' },
                    take: 1,
                    include: { invoices: true },
                },
            },
        });
        if (!vehicle)
            return null;
        if (token && vehicle.bookings.length === 0) {
            return null;
        }
        return vehicle;
    }
    async approveAdditionalService(vehicleId, token, serviceId, approve) {
        const booking = await this.prisma.booking.findFirst({
            where: { vehicleId, qrToken: token },
        });
        if (!booking)
            throw new common_1.UnauthorizedException('رمز QR غير صالح');
        const services = booking.additionalServices ?? [];
        const updated = services.map((s) => s.id === serviceId ? { ...s, status: approve ? 'APPROVED' : 'REJECTED' } : s);
        await this.prisma.booking.update({
            where: { id: booking.id },
            data: { additionalServices: updated },
        });
        return { success: true, message: approve ? 'تمت الموافقة' : 'تم الرفض' };
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map