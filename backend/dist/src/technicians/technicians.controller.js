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
var TechniciansController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechniciansController = void 0;
const common_1 = require("@nestjs/common");
const technicians_service_1 = require("./technicians.service");
const technicians_dto_1 = require("./technicians.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
let TechniciansController = TechniciansController_1 = class TechniciansController {
    constructor(techniciansService) {
        this.techniciansService = techniciansService;
        this.logger = new common_1.Logger(TechniciansController_1.name);
    }
    async findAll() {
        try {
            return await this.techniciansService.findAll();
        }
        catch (error) {
            this.logger.error(`findAll failed: ${error.message}`);
            throw new common_1.HttpException('فشل في تحميل الفنيين', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const technician = await this.techniciansService.findOne(id);
            if (!technician) {
                throw new common_1.HttpException('الفني غير موجود', common_1.HttpStatus.NOT_FOUND);
            }
            return technician;
        }
        catch (error) {
            this.logger.error(`findOne failed: ${error.message}`);
            throw error;
        }
    }
    async create(createTechnicianDto) {
        try {
            return await this.techniciansService.create(createTechnicianDto);
        }
        catch (error) {
            this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
            if (error.code === 'P2002') {
                throw new common_1.HttpException('رقم الهاتف مستخدم مسبقاً', common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException(`فشل إنشاء الفني: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateTechnicianDto) {
        try {
            const technician = await this.techniciansService.update(id, updateTechnicianDto);
            if (!technician) {
                throw new common_1.HttpException('الفني غير موجود', common_1.HttpStatus.NOT_FOUND);
            }
            return technician;
        }
        catch (error) {
            this.logger.error(`update failed: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            const technician = await this.techniciansService.delete(id);
            if (!technician) {
                throw new common_1.HttpException('الفني غير موجود', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'تم حذف الفني بنجاح' };
        }
        catch (error) {
            this.logger.error(`delete failed: ${error.message}`);
            throw error;
        }
    }
};
exports.TechniciansController = TechniciansController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [technicians_dto_1.CreateTechnicianDto]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, technicians_dto_1.UpdateTechnicianDto]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "delete", null);
exports.TechniciansController = TechniciansController = TechniciansController_1 = __decorate([
    (0, common_1.Controller)('technicians'),
    __metadata("design:paramtypes", [technicians_service_1.TechniciansService])
], TechniciansController);
//# sourceMappingURL=technicians.controller.js.map