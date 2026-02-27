import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';

import { PrismaModule } from './database/prisma.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { PersonsModule } from './modules/persons/persons.module';
import { UtilityInfoModule } from './modules/utility-info/utility-info.module';
import { PlanningProcessStatesModule } from './modules/planning-process-states/planning-process-states.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { OwnershipsModule } from './modules/ownerships/ownerships.module';
import { MortgagesModule } from './modules/mortgages/mortgages.module';
import { RentalAgreementsModule } from './modules/rental-agreements/rental-agreements.module';
import { PropertyEventsModule } from './modules/property-events/property-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    BankAccountsModule,
    PersonsModule,
    UtilityInfoModule,
    PlanningProcessStatesModule,
    PropertiesModule,
    OwnershipsModule,
    MortgagesModule,
    RentalAgreementsModule,
    PropertyEventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
