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
var VehiclesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const vehicles_service_1 = require("./vehicles.service");
const vehicles_dto_1 = require("./vehicles.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
let VehiclesController = VehiclesController_1 = class VehiclesController {
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
        this.logger = new common_1.Logger(VehiclesController_1.name);
    }
    async findAll() {
        try {
            return await this.vehiclesService.findAll();
        }
        catch (error) {
            this.logger.error(`findAll failed: ${error.message}`);
            throw new common_1.HttpException('فشل في تحميل السيارات', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const vehicle = await this.vehiclesService.findOne(id);
            if (!vehicle) {
                throw new common_1.HttpException('السيارة غير موجودة', common_1.HttpStatus.NOT_FOUND);
            }
            return vehicle;
        }
        catch (error) {
            this.logger.error(`findOne failed: ${error.message}`);
            throw error;
        }
    }
    async create(createVehicleDto) {
        try {
            return await this.vehiclesService.create(createVehicleDto);
        }
        catch (error) {
            this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
            throw error;
        }
    }
    async update(id, updateVehicleDto) {
        try {
            const vehicle = await this.vehiclesService.update(id, updateVehicleDto);
            if (!vehicle) {
                throw new common_1.HttpException('السيارة غير موجودة', common_1.HttpStatus.NOT_FOUND);
            }
            return vehicle;
        }
        catch (error) {
            this.logger.error(`update failed: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            const vehicle = await this.vehiclesService.delete(id);
            if (!vehicle) {
                throw new common_1.HttpException('السيارة غير موجودة', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'تم حذف السيارة بنجاح' };
        }
        catch (error) {
            this.logger.error(`delete failed: ${error.message}`);
            throw error;
        }
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicles_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicles_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "delete", null);
exports.VehiclesController = VehiclesController = VehiclesController_1 = __decorate([
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map