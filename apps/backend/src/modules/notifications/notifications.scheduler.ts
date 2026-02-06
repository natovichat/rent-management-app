import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * Scheduler for automatic notification generation.
 * 
 * Runs daily to check for leases requiring notifications.
 */
@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Daily cron job to generate notifications for expiring leases.
   * Runs at 9:00 AM every day.
   * 
   * Default notification timing: 30 days before expiration.
   * Can be extended to support configurable timing per account.
   */
  @Cron('0 9 * * *', {
    name: 'generate-lease-expiration-notifications',
    timeZone: 'Asia/Jerusalem',
  })
  async handleNotificationGeneration() {
    this.logger.log('Starting daily notification generation job...');

    try {
      // Get all active accounts
      const accounts = await this.prisma.account.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      this.logger.log(`Processing ${accounts.length} account(s)`);

      let totalGenerated = 0;

      for (const account of accounts) {
        try {
          // Default: 30 days before expiration
          // TODO: Support configurable timing per account (US12.2)
          const daysBeforeExpiration = [30];
          
          const count = await this.notificationsService.generateNotifications(
            account.id,
            daysBeforeExpiration
          );
          
          totalGenerated += count;
          this.logger.log(`Account ${account.id}: Generated ${count} notification(s)`);
        } catch (error) {
          this.logger.error(`Error generating notifications for account ${account.id}:`, error);
        }
      }

      this.logger.log(`Notification generation completed: ${totalGenerated} total notification(s) generated`);

      // Process pending notifications (send emails)
      this.logger.log('Processing pending notifications...');
      for (const account of accounts) {
        try {
          const result = await this.notificationsService.processPendingNotifications(account.id);
          this.logger.log(`Account ${account.id}: Processed ${result.processed} notification(s) (${result.sent} sent, ${result.failed} failed)`);
        } catch (error) {
          this.logger.error(`Error processing notifications for account ${account.id}:`, error);
        }
      }

      this.logger.log('Daily notification job completed successfully');
    } catch (error) {
      this.logger.error('Error in notification generation job:', error);
    }
  }

  /**
   * Manual trigger for testing (can be called via API endpoint).
   */
  async triggerManually(accountId?: string) {
    this.logger.log('Manual notification generation triggered');
    
    if (accountId) {
      // Generate for specific account
      const count = await this.notificationsService.generateNotifications(accountId, [30]);
      await this.notificationsService.processPendingNotifications(accountId);
      return { accountId, generated: count };
    } else {
      // Generate for all accounts
      const accounts = await this.prisma.account.findMany({
        where: { status: 'ACTIVE' },
      });
      
      const results = [];
      for (const account of accounts) {
        const count = await this.notificationsService.generateNotifications(account.id, [30]);
        await this.notificationsService.processPendingNotifications(account.id);
        results.push({ accountId: account.id, generated: count });
      }
      
      return results;
    }
  }
}
