import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      // Log the error but don't crash the app - Prisma will retry on first query
      this.logger.warn(`Database connection failed at startup: ${error.message}`);
      this.logger.warn('Application will retry connection on first database query');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
