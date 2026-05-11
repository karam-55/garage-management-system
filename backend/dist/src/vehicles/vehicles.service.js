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
var VehiclesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let VehiclesService = VehiclesService_1 = class VehiclesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(VehiclesService_1.name);
    }
    async findAll() {
        return this.prisma.vehicle.findMany({
            include: {
                customer: true,
                bookings: true,
                invoices: true,
                vehicleTracking: true,
            },
        });
    }
    async findOne(id) {
        return this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                customer: true,
                bookings: true,
                invoices: true,
                vehicleTracking: true,
            },
        });
    }
    async create(createVehicleDto) {
        this.logger.log(`Creating vehicle: ${createVehicleDto.plateNumber}`);
        try {
            const data = { ...createVehicleDto };
            if (!data.customerId || data.customerId === '')
                delete data.customerId;
            const vehicle = await this.prisma.vehicle.create({ data });
            this.logger.log(`Vehicle created: ${vehicle.id}`);
            return vehicle;
        }
        catch (error) {
            this.logger.error(`Failed to create vehicle: ${error.message} (code: ${error.code})`);
            if (error.code === 'P2002') {
                throw new common_1.ConflictException(`رقم اللوحة ${createVehicleDto.plateNumber} مسجل مسبقاً`);
            }
            throw new common_1.InternalServerErrorException(`فشل إنشاء السيارة: ${error.message}`);
        }
    }
    async update(id, updateVehicleDto) {
        const data = { ...updateVehicleDto };
        if (data.customerId === '') {
            data.customerId = null;
        }
        return this.prisma.vehicle.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.vehicle.delete({
            where: { id },
        });
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = VehiclesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map