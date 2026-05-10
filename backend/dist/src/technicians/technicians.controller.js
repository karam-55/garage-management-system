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
exports.TechniciansController = void 0;
const common_1 = require("@nestjs/common");
const technicians_service_1 = require("./technicians.service");
const technicians_dto_1 = require("./technicians.dto");
let TechniciansController = class TechniciansController {
    constructor(techniciansService) {
        this.techniciansService = techniciansService;
    }
    async findAll() {
        return this.techniciansService.findAll();
    }
    async findOne(id) {
        const technician = await this.techniciansService.findOne(id);
        if (!technician) {
            throw new common_1.HttpException('Technician not found', common_1.HttpStatus.NOT_FOUND);
        }
        return technician;
    }
    async create(createTechnicianDto) {
        return this.techniciansService.create(createTechnicianDto);
    }
    async update(id, updateTechnicianDto) {
        const technician = await this.techniciansService.update(id, updateTechnicianDto);
        if (!technician) {
            throw new common_1.HttpException('Technician not found', common_1.HttpStatus.NOT_FOUND);
        }
        return technician;
    }
    async delete(id) {
        const technician = await this.techniciansService.delete(id);
        if (!technician) {
            throw new common_1.HttpException('Technician not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { message: 'Technician deleted successfully' };
    }
};
exports.TechniciansController = TechniciansController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [technicians_dto_1.CreateTechnicianDto]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, technicians_dto_1.UpdateTechnicianDto]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TechniciansController.prototype, "delete", null);
exports.TechniciansController = TechniciansController = __decorate([
    (0, common_1.Controller)('technicians'),
    __metadata("design:paramtypes", [technicians_service_1.TechniciansService])
], TechniciansController);
//# sourceMappingURL=technicians.controller.js.map