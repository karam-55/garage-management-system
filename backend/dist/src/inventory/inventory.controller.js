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
var InventoryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const inventory_dto_1 = require("./inventory.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
let InventoryController = InventoryController_1 = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
        this.logger = new common_1.Logger(InventoryController_1.name);
    }
    async findAll() {
        try {
            return await this.inventoryService.findAll();
        }
        catch (error) {
            this.logger.error(`findAll failed: ${error.message}`);
            throw new common_1.HttpException('فشل في تحميل المخزون', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const item = await this.inventoryService.findOne(id);
            if (!item) {
                throw new common_1.HttpException('العنصر غير موجود', common_1.HttpStatus.NOT_FOUND);
            }
            return item;
        }
        catch (error) {
            this.logger.error(`findOne failed: ${error.message}`);
            throw error;
        }
    }
    async create(createInventoryItemDto) {
        try {
            return await this.inventoryService.create(createInventoryItemDto);
        }
        catch (error) {
            this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
            if (error.code === 'P2002') {
                throw new common_1.HttpException('الكود مستخدم مسبقاً', common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException(`فشل إنشاء العنصر: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateInventoryItemDto) {
        try {
            const item = await this.inventoryService.update(id, updateInventoryItemDto);
            if (!item) {
                throw new common_1.HttpException('العنصر غير موجود', common_1.HttpStatus.NOT_FOUND);
            }
            return item;
        }
        catch (error) {
            this.logger.error(`update failed: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            const item = await this.inventoryService.delete(id);
            if (!item) {
                throw new common_1.HttpException('العنصر غير موجود', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'تم حذف العنصر بنجاح' };
        }
        catch (error) {
            this.logger.error(`delete failed: ${error.message}`);
            throw error;
        }
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryItemDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateInventoryItemDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "delete", null);
exports.InventoryController = InventoryController = InventoryController_1 = __decorate([
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map