import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindAllNotificationsDto } from './dto/find-all-notifications.dto';
import { NotificationStatus, NotificationType, LeaseStatus } from '@prisma/client';

/**
 * Service for managing notifications.
 * 
 * Handles:
 * - Notification generation for expiring leases
 * - Notification status management (PENDING → SENT/FAILED)
 * - Retry logic for failed notifications
 * - Account isolation
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate notifications for leases expiring within configured timeframe.
   * Default: 30 days before expiration.
   */
  async generateNotifications(accountId: string, daysBeforeExpiration: number[] = [30]): Promise<number> {
    console.log(`\n=== GENERATING NOTIFICATIONS FOR ACCOUNT ${accountId} ===`);
    console.log(`→ Checking leases expiring in: ${daysBeforeExpiration.join(', ')} days`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let createdCount = 0;

    for (const days of daysBeforeExpiration) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + days);
      targetDate.setHours(23, 59, 59, 999);

      console.log(`→ Checking leases expiring on ${targetDate.toISOString().split('T')[0]} (${days} days from now)`);

      // Find leases expiring on target date
      const leases = await this.prisma.lease.findMany({
        where: {
          accountId,
          status: {
            in: [LeaseStatus.ACTIVE, LeaseStatus.FUTURE],
          },
          endDate: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lte: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      console.log(`  → Found ${leases.length} lease(s) expiring in ${days} days`);

      for (const lease of leases) {
        // Check if notification already exists
        const existing = await this.prisma.notification.findUnique({
          where: {
            leaseId_daysBeforeExpiration: {
              leaseId: lease.id,
              daysBeforeExpiration: days,
            },
          },
        });

        if (existing) {
          console.log(`  → Notification already exists for lease ${lease.id} (${days} days)`);
          continue;
        }

        // Determine notification type
        const leaseEndDate = new Date(lease.endDate);
        leaseEndDate.setHours(0, 0, 0, 0);
        const notificationType = today >= leaseEndDate 
          ? NotificationType.LEASE_EXPIRED 
          : NotificationType.LEASE_EXPIRING;

        // Create notification
        await this.prisma.notification.create({
          data: {
            accountId,
            leaseId: lease.id,
            type: notificationType,
            daysBeforeExpiration: days,
            status: NotificationStatus.PENDING,
          },
        });

        createdCount++;
        console.log(`  ✓ Created ${notificationType} notification for lease ${lease.id} (${days} days)`);
      }
    }

    console.log(`✓ Generated ${createdCount} notification(s)\n`);
    return createdCount;
  }

  /**
   * Find all notifications for an account with optional filters.
   */
  async findAll(accountId: string, filters: FindAllNotificationsDto) {
    const where: any = {
      accountId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.leaseId) {
      where.leaseId = filters.leaseId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          lease: {
            include: {
              unit: {
                include: {
                  property: {
                    select: {
                      id: true,
                      address: true,
                    },
                  },
                },
              },
              tenant: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Find a single notification by ID.
   */
  async findOne(id: string, accountId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    id: true,
                    address: true,
                  },
                },
              },
            },
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  /**
   * Process pending notifications (send emails).
   * For now, this simulates email sending and updates status.
   */
  async processPendingNotifications(accountId: string): Promise<{ processed: number; sent: number; failed: number }> {
    console.log(`\n=== PROCESSING PENDING NOTIFICATIONS FOR ACCOUNT ${accountId} ===`);

    const pendingNotifications = await this.prisma.notification.findMany({
      where: {
        accountId,
        status: NotificationStatus.PENDING,
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenant: true,
          },
        },
      },
    });

    console.log(`→ Found ${pendingNotifications.length} pending notification(s)`);

    let sent = 0;
    let failed = 0;

    for (const notification of pendingNotifications) {
      try {
        // TODO: Integrate with actual email service
        // For now, simulate email sending
        console.log(`  → Sending notification ${notification.id}...`);
        
        // Simulate email sending (90% success rate for testing)
        const success = Math.random() > 0.1;

        if (success) {
          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: NotificationStatus.SENT,
              sentAt: new Date(),
              error: null,
            },
          });
          sent++;
          console.log(`  ✓ Notification ${notification.id} sent successfully`);
        } else {
          throw new Error('Email service unavailable');
        }
      } catch (error) {
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: NotificationStatus.FAILED,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
        failed++;
        console.log(`  ✗ Notification ${notification.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✓ Processed ${pendingNotifications.length} notification(s): ${sent} sent, ${failed} failed\n`);

    return {
      processed: pendingNotifications.length,
      sent,
      failed,
    };
  }

  /**
   * Retry sending a failed notification.
   */
  async retryNotification(id: string, accountId: string) {
    const notification = await this.findOne(id, accountId);

    if (notification.status !== NotificationStatus.FAILED) {
      throw new BadRequestException('Can only retry failed notifications');
    }

    // Reset to PENDING and attempt sending
    await this.prisma.notification.update({
      where: { id },
      data: {
        status: NotificationStatus.PENDING,
        error: null,
      },
    });

    // Process this notification
    const result = await this.processPendingNotifications(accountId);

    // Return updated notification
    return this.findOne(id, accountId);
  }

  /**
   * Bulk retry multiple failed notifications.
   */
  async retryBulk(ids: string[], accountId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        id: { in: ids },
        accountId,
        status: NotificationStatus.FAILED,
      },
    });

    if (notifications.length !== ids.length) {
      throw new BadRequestException('Some notifications not found or not in FAILED status');
    }

    // Reset all to PENDING
    await this.prisma.notification.updateMany({
      where: {
        id: { in: ids },
        accountId,
      },
      data: {
        status: NotificationStatus.PENDING,
        error: null,
      },
    });

    // Process all pending notifications
    const result = await this.processPendingNotifications(accountId);

    return {
      retried: ids.length,
      result,
    };
  }

  /**
   * Get upcoming notifications (PENDING status).
   */
  async getUpcoming(accountId: string) {
    return this.findAll(accountId, {
      status: NotificationStatus.PENDING,
      page: 1,
      pageSize: 10,
    });
  }

  /**
   * Delete all notifications for test account (E2E testing only).
   */
  async deleteAllForAccount(accountId: string): Promise<{ deletedCount: number }> {
    const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';
    if (accountId !== TEST_ACCOUNT_ID) {
      throw new BadRequestException('Can only delete data for test account. Safety measure.');
    }

    const result = await this.prisma.notification.deleteMany({
      where: { accountId },
    });

    return { deletedCount: result.count };
  }

  /**
   * Get notification settings for an account.
   * Creates default settings if none exist.
   */
  async getNotificationSettings(accountId: string) {
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { accountId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.notificationSettings.create({
        data: {
          accountId,
          daysBeforeExpiration: [30], // Default: 30 days
        },
      });
    }

    return settings;
  }

  /**
   * Update notification settings for an account.
   * Creates settings if none exist.
   */
  async updateNotificationSettings(accountId: string, daysBeforeExpiration: number[]) {
    // Sort and deduplicate days
    const sortedDays = [...new Set(daysBeforeExpiration)].sort((a, b) => a - b);

    const settings = await this.prisma.notificationSettings.upsert({
      where: { accountId },
      create: {
        accountId,
        daysBeforeExpiration: sortedDays,
      },
      update: {
        daysBeforeExpiration: sortedDays,
      },
    });

    return settings;
  }
}
