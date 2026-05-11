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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const tracking_service_1 = require("./tracking.service");
const public_decorator_1 = require("../auth/public.decorator");
let TrackingController = class TrackingController {
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    async trackVehicle(vehicleId, token) {
        const trackingData = await this.trackingService.trackVehicle(vehicleId, token);
        if (!trackingData) {
            throw new common_1.HttpException('السيارة غير موجودة أو رمز QR غير صالح', common_1.HttpStatus.NOT_FOUND);
        }
        return trackingData;
    }
    async approveService(vehicleId, token, body) {
        if (!token)
            throw new common_1.HttpException('رمز QR مطلوب', common_1.HttpStatus.BAD_REQUEST);
        return this.trackingService.approveAdditionalService(vehicleId, token, body.serviceId, body.approve);
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "trackVehicle", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':vehicleId/approve-service'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "approveService", null);
exports.TrackingController = TrackingController = __decorate([
    (0, common_1.Controller)('track'),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map