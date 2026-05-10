import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    constructor();
    get client(): PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, import(".prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/client").DefaultArgs>;
    get customer(): import(".prisma/client").Prisma.CustomerDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get vehicle(): import(".prisma/client").Prisma.VehicleDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get technician(): import(".prisma/client").Prisma.TechnicianDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get booking(): import(".prisma/client").Prisma.BookingDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get invoice(): import(".prisma/client").Prisma.InvoiceDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get inventoryItem(): import(".prisma/client").Prisma.InventoryItemDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get notification(): import(".prisma/client").Prisma.NotificationDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get vehicleTracking(): import(".prisma/client").Prisma.VehicleTrackingDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
