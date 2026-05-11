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
var InvoicesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("./invoices.service");
const invoices_dto_1 = require("./invoices.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
let InvoicesController = InvoicesController_1 = class InvoicesController {
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
        this.logger = new common_1.Logger(InvoicesController_1.name);
    }
    async findAll() {
        try {
            return await this.invoicesService.findAll();
        }
        catch (error) {
            this.logger.error(`findAll failed: ${error.message}`);
            throw new common_1.HttpException('فشل في تحميل الفواتير', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const invoice = await this.invoicesService.findOne(id);
            if (!invoice) {
                throw new common_1.HttpException('الفاتورة غير موجودة', common_1.HttpStatus.NOT_FOUND);
            }
            return invoice;
        }
        catch (error) {
            this.logger.error(`findOne failed: ${error.message}`);
            throw error;
        }
    }
    async create(createInvoiceDto) {
        this.logger.log(`Creating invoice: ${createInvoiceDto.invoiceNumber}`);
        try {
            return await this.invoicesService.create(createInvoiceDto);
        }
        catch (error) {
            this.logger.error(`create failed: ${error.message} (code: ${error.code})`);
            if (error.code === 'P2002') {
                throw new common_1.HttpException('رقم الفاتورة مستخدم مسبقاً', common_1.HttpStatus.CONFLICT);
            }
            if (error.code === 'P2025') {
                throw new common_1.HttpException('الحجز المرتبط غير موجود', common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException(`فشل إنشاء الفاتورة: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateInvoiceDto) {
        try {
            const invoice = await this.invoicesService.update(id, updateInvoiceDto);
            if (!invoice) {
                throw new common_1.HttpException('الفاتورة غير موجودة', common_1.HttpStatus.NOT_FOUND);
            }
            return invoice;
        }
        catch (error) {
            this.logger.error(`update failed: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            const invoice = await this.invoicesService.delete(id);
            if (!invoice) {
                throw new common_1.HttpException('الفاتورة غير موجودة', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'تم حذف الفاتورة بنجاح' };
        }
        catch (error) {
            this.logger.error(`delete failed: ${error.message}`);
            throw error;
        }
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CASHIER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoices_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invoices_dto_1.UpdateInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "delete", null);
exports.InvoicesController = InvoicesController = InvoicesController_1 = __decorate([
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map