import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { UnitsModule } from './modules/units/units.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { LeasesModule } from './modules/leases/leases.module';
import { MortgagesModule } from './modules/mortgages/mortgages.module';
import { OwnersModule } from './modules/owners/owners.module';
import { OwnershipsModule } from './modules/ownerships/ownerships.module';
import { ValuationsModule } from './modules/valuations/valuations.module';
import { FinancialsModule } from './modules/financials/financials.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { PlotInfoModule } from './modules/plot-info/plot-info.module';
import { InvestmentCompaniesModule } from './modules/investment-companies/investment-companies.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ImportModule } from './modules/import/import.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PropertiesModule,
    UnitsModule,
    TenantsModule,
    LeasesModule,
    MortgagesModule,
    OwnersModule,
    OwnershipsModule,
    ValuationsModule,
    FinancialsModule,
    BankAccountsModule,
    AccountsModule,
    PlotInfoModule,
    InvestmentCompaniesModule,
    DashboardModule,
    NotificationsModule,
    ImportModule,
    ExportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
