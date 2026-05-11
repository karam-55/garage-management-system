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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.jwtSecret = process.env.JWT_SECRET || 'garage_secret_key_2024';
    }
    async login(loginDto) {
        const employee = await this.prisma.employee.findUnique({
            where: { phone: loginDto.phone },
        });
        if (!employee || !employee.isActive) {
            throw new common_1.UnauthorizedException('رقم الهاتف أو كلمة السر غير صحيحة');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, employee.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('رقم الهاتف أو كلمة السر غير صحيحة');
        }
        const payload = {
            sub: employee.id,
            name: employee.name,
            phone: employee.phone,
            role: employee.role,
        };
        const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
        return {
            token,
            access_token: token,
            employee: {
                id: employee.id,
                name: employee.name,
                phone: employee.phone,
                role: employee.role,
                isActive: employee.isActive,
                createdAt: employee.createdAt,
            },
        };
    }
    async getProfile(employeeId) {
        return this.prisma.employee.findUnique({
            where: { id: employeeId },
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map