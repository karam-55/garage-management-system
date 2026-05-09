import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { GaragesModule } from './modules/garages/garages.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ServicesModule } from './modules/services/services.module';
import { MechanicsModule } from './modules/mechanics/mechanics.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    GaragesModule,
    VehiclesModule,
    BookingsModule,
    ServicesModule,
    MechanicsModule,
    InvoicesModule,
    PaymentsModule,
    InventoryModule,
    NotificationsModule,
    SettingsModule,
    ReportsModule,
  ],
})
export class AppModule {}
