import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';

import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
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
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second window
        limit: 10,   // max 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute window
        limit: 100,  // max 100 requests per minute
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
