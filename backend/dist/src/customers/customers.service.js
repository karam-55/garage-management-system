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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let CustomersService = CustomersService_1 = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CustomersService_1.name);
    }
    async findAll() {
        return this.prisma.customer.findMany({
            include: {
                vehicles: true,
                bookings: true,
                invoices: true,
            },
        });
    }
    async findOne(id) {
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                vehicles: true,
                bookings: true,
                invoices: true,
            },
        });
    }
    async create(createCustomerDto) {
        this.logger.log(`Creating customer: ${createCustomerDto.phone}`);
        try {
            const customer = await this.prisma.customer.create({
                data: createCustomerDto,
            });
            this.logger.log(`Customer created: ${customer.id}`);
            return customer;
        }
        catch (error) {
            this.logger.error(`Failed to create customer: ${error.message} (code: ${error.code})`);
            if (error.code === 'P2002') {
                throw new common_1.ConflictException(`رقم الهاتف ${createCustomerDto.phone} مسجل مسبقاً`);
            }
            throw new common_1.InternalServerErrorException(`فشل إنشاء العميل: ${error.message}`);
        }
    }
    async update(id, updateCustomerDto) {
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }
    async delete(id) {
        return this.prisma.customer.delete({
            where: { id },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map