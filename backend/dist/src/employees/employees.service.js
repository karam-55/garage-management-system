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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcryptjs");
let EmployeesService = class EmployeesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const count = await this.prisma.employee.count();
        if (count === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await this.prisma.employee.create({
                data: {
                    name: 'المدير العام',
                    phone: '0500000000',
                    password: hashedPassword,
                    role: 'OWNER',
                },
            });
            console.log('✅ Default owner account created: phone=0500000000, password=admin123');
        }
    }
    async findAll() {
        return this.prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const emp = await this.prisma.employee.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!emp)
            throw new common_1.NotFoundException('الموظف غير موجود');
        return emp;
    }
    async create(dto) {
        const existing = await this.prisma.employee.findUnique({
            where: { phone: dto.phone },
        });
        if (existing)
            throw new common_1.ConflictException('رقم الهاتف مستخدم بالفعل');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        return this.prisma.employee.create({
            data: {
                name: dto.name,
                phone: dto.phone,
                password: hashedPassword,
                role: dto.role || 'RECEPTIONIST',
                notes: dto.notes,
            },
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = {};
        if (dto.name)
            data.name = dto.name;
        if (dto.phone)
            data.phone = dto.phone;
        if (dto.password)
            data.password = await bcrypt.hash(dto.password, 10);
        if (dto.role)
            data.role = dto.role;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        return this.prisma.employee.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.employee.delete({ where: { id } });
        return { message: 'تم حذف الموظف بنجاح' };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map