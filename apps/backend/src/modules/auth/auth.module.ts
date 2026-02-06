import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1d'),
          issuer: 'rent-app',
          audience: 'rent-app-users',
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Only provide GoogleStrategy if credentials are configured
    {
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService, authService: AuthService) => {
        const clientID = configService.get<string>('google.clientID');
        if (clientID) {
          return new GoogleStrategy(configService, authService);
        }
        return null; // Skip Google OAuth if not configured
      },
      inject: [ConfigService, AuthService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
