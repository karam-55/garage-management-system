"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const customers_module_1 = require("./customers/customers.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const technicians_module_1 = require("./technicians/technicians.module");
const bookings_module_1 = require("./bookings/bookings.module");
const invoices_module_1 = require("./invoices/invoices.module");
const inventory_module_1 = require("./inventory/inventory.module");
const notifications_module_1 = require("./notifications/notifications.module");
const tracking_module_1 = require("./tracking/tracking.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            customers_module_1.CustomersModule,
            vehicles_module_1.VehiclesModule,
            technicians_module_1.TechniciansModule,
            bookings_module_1.BookingsModule,
            invoices_module_1.InvoicesModule,
            inventory_module_1.InventoryModule,
            notifications_module_1.NotificationsModule,
            tracking_module_1.TrackingModule,
            whatsapp_module_1.WhatsAppModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map