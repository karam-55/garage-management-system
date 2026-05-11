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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let VehiclesService = class VehiclesService {
    constructor(prisma) {
        this.prisma = prisma;
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
        const data = { ...createVehicleDto };
        if (!data.customerId || data.customerId === '') {
            delete data.customerId;
        }
        return this.prisma.vehicle.create({ data });
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
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map