import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { FindAllNotificationsDto } from './dto/find-all-notifications.dto';
import { NotificationSettingsDto } from './dto/notification-settings.dto';

// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

/**
 * Controller for notification management.
 * 
 * Authentication removed - using hardcoded test account.
 */
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate notifications for expiring leases' })
  @ApiResponse({ status: 201, description: 'Notifications generated successfully' })
  async generateNotifications(@Request() req: any, @Body() body?: { daysBeforeExpiration?: number[] }) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    // Use provided timing or default to 30 days
    const daysBeforeExpiration = body?.daysBeforeExpiration || [30];
    
    const createdCount = await this.notificationsService.generateNotifications(
      effectiveAccountId,
      daysBeforeExpiration
    );
    
    return {
      message: `Generated ${createdCount} notification(s)`,
      createdCount,
    };
  }

  @Post('process')
  @ApiOperation({ summary: 'Process pending notifications (send emails)' })
  @ApiResponse({ status: 200, description: 'Notifications processed' })
  async processNotifications(@Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.processPendingNotifications(effectiveAccountId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'SENT', 'FAILED'] })
  @ApiQuery({ name: 'type', required: false, enum: ['LEASE_EXPIRING', 'LEASE_EXPIRED'] })
  @ApiQuery({ name: 'leaseId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(@Request() req: any, @Query() filters: FindAllNotificationsDto) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.findAll(effectiveAccountId, filters);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming notifications (PENDING status)' })
  @ApiResponse({ status: 200, description: 'Upcoming notifications' })
  async getUpcoming(@Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.getUpcoming(effectiveAccountId);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings for account' })
  @ApiResponse({ status: 200, description: 'Notification settings' })
  async getSettings(@Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.getNotificationSettings(effectiveAccountId);
  }

  @Post('settings')
  @ApiOperation({ summary: 'Update notification settings for account' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Request() req: any, @Body() dto: NotificationSettingsDto) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.updateNotificationSettings(
      effectiveAccountId,
      dto.daysBeforeExpiration
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification found' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.findOne(id, effectiveAccountId);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry sending a failed notification' })
  @ApiResponse({ status: 200, description: 'Notification retried' })
  @ApiResponse({ status: 400, description: 'Can only retry failed notifications' })
  async retryNotification(@Request() req: any, @Param('id') id: string) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.retryNotification(id, effectiveAccountId);
  }

  @Post('retry-bulk')
  @ApiOperation({ summary: 'Bulk retry multiple failed notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retried' })
  async retryBulk(@Request() req: any, @Body() body: { ids: string[] }) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.notificationsService.retryBulk(body.ids, effectiveAccountId);
  }

  @Delete('test/cleanup')
  @ApiOperation({ 
    summary: 'מחיקת כל נתוני הטסט (TEST ONLY)',
    description: 'מוחק את כל ההתראות של חשבון הטסט. ⚠️ משמש רק לטסטי E2E!'
  })
  async deleteTestData(@Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    const result = await this.notificationsService.deleteAllForAccount(effectiveAccountId);
    return {
      ...result,
      message: `Deleted ${result.deletedCount} notifications for test account`,
    };
  }
}
