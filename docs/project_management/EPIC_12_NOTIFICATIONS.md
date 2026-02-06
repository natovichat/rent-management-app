# Epic 12: Notifications & Alerts

## Overview

This epic implements an automated notification system for lease expirations and important property management events. The system will proactively alert property owners about upcoming lease expirations, allowing them to take timely action such as renewing leases, finding new tenants, or planning property transitions. The notification system supports configurable timing (days before expiration), multiple notification types, and comprehensive tracking of notification status and history.

**Key Features:**
- Automated lease expiration notifications
- Configurable notification timing (days before expiration)
- Notification status tracking (PENDING, SENT, FAILED)
- Notification history and audit trail
- Retry mechanism for failed notifications
- Support for multiple notification types (LEASE_EXPIRING, LEASE_EXPIRED)

---

## User Stories

### US12.1: Receive Lease Expiration Notifications

**As a** property owner  
**I want to** receive automated notifications when my leases are about to expire  
**So that** I can proactively plan for lease renewals or tenant transitions

**Acceptance Criteria:**
- System automatically generates notifications for leases expiring within configured timeframe
- Notifications are created with status `PENDING` before being sent
- Each notification is linked to a specific lease and account
- Notifications include the number of days before expiration (`daysBeforeExpiration`)
- Notifications are sent via email (initial implementation)
- After successful sending, notification status is updated to `SENT` with `sentAt` timestamp
- If sending fails, notification status is updated to `FAILED` with error details stored in `error` field

**Technical Requirements:**
- Notification records created in `notifications` table
- Unique constraint on `[leaseId, daysBeforeExpiration]` prevents duplicate notifications
- Notification type set to `LEASE_EXPIRING` for upcoming expirations
- Cron job runs daily to check for leases requiring notifications

---

### US12.2: Configure Notification Timing

**As a** property owner  
**I want to** configure how many days before lease expiration I receive notifications  
**So that** I have sufficient time to prepare for lease transitions

**Acceptance Criteria:**
- User can configure notification timing (e.g., 30, 60, 90 days before expiration)
- Multiple notifications can be scheduled for the same lease (e.g., 90 days, 30 days, 7 days before)
- System creates separate notification records for each configured `daysBeforeExpiration` value
- Default notification timing is 30 days before expiration
- User can add/remove notification timing configurations
- Changes to notification timing affect only future notifications, not already-sent notifications

**Technical Requirements:**
- `daysBeforeExpiration` field stores the configured timing
- Unique constraint ensures one notification per lease per `daysBeforeExpiration` value
- Notification generation logic checks all configured timing values
- Settings stored per account (future enhancement) or globally configurable

---

### US12.3: View Notification History and Status

**As a** property owner  
**I want to** view the history and status of all notifications  
**So that** I can track which notifications were sent, when they were sent, and identify any failures

**Acceptance Criteria:**
- User can view all notifications for their account
- Notifications are displayed with:
  - Associated lease information (property address, unit, tenant name)
  - Notification type (`LEASE_EXPIRING` or `LEASE_EXPIRED`)
  - Days before expiration (`daysBeforeExpiration`)
  - Status (`PENDING`, `SENT`, `FAILED`)
  - Sent timestamp (`sentAt`) if status is `SENT`
  - Error message (`error`) if status is `FAILED`
  - Creation and update timestamps
- Notifications can be filtered by:
  - Status (PENDING, SENT, FAILED)
  - Notification type
  - Lease
  - Date range
- Notifications are sorted by creation date (newest first) or by lease expiration date
- Failed notifications are clearly highlighted in the UI

**Technical Requirements:**
- API endpoint: `GET /api/notifications`
- Query parameters for filtering: `status`, `type`, `leaseId`, `startDate`, `endDate`
- Response includes lease details via relation
- Pagination support for large notification lists

---

### US12.4: Retry Failed Notifications

**As a** property owner  
**I want to** retry sending failed notifications  
**So that** I don't miss important lease expiration alerts due to temporary system issues

**Acceptance Criteria:**
- User can view all notifications with status `FAILED`
- User can manually trigger retry for individual failed notifications
- User can bulk retry multiple failed notifications
- On retry:
  - Notification status changes from `FAILED` to `PENDING`
  - Error field is cleared
  - System attempts to send notification again
  - If retry succeeds, status updates to `SENT` with new `sentAt` timestamp
  - If retry fails, status updates to `FAILED` with new error message
- Retry attempts are logged (future: retry count tracking)
- User receives feedback on retry success/failure

**Technical Requirements:**
- API endpoint: `POST /api/notifications/:id/retry`
- Bulk retry endpoint: `POST /api/notifications/retry-bulk`
- Retry logic resets notification status and attempts sending
- Error handling captures and stores new error messages
- Notification service handles email sending with proper error handling

---

### US12.5: Automatic Notification Generation

**As a** system administrator  
**I want** the system to automatically generate notifications for upcoming lease expirations  
**So that** property owners receive timely alerts without manual intervention

**Acceptance Criteria:**
- Cron job runs daily (or configurable schedule) to check for leases requiring notifications
- System identifies leases with `endDate` matching configured `daysBeforeExpiration` values
- For each matching lease:
  - System checks if notification already exists for this `leaseId` and `daysBeforeExpiration` combination
  - If notification doesn't exist, creates new notification with:
    - `type`: `LEASE_EXPIRING` (if before expiration) or `LEASE_EXPIRED` (if after expiration)
    - `status`: `PENDING`
    - `daysBeforeExpiration`: configured value
    - `leaseId`: reference to the lease
    - `accountId`: reference to the account
- System processes notifications in batches to avoid performance issues
- Cron job logs execution results (number of notifications created, errors encountered)
- System handles edge cases:
  - Leases that have already expired (create `LEASE_EXPIRED` notifications)
  - Leases with multiple configured notification timings
  - Leases that are already terminated or cancelled

**Technical Requirements:**
- Scheduled job (cron) runs daily at configurable time
- Job queries leases with `endDate` within notification windows
- Uses Prisma to create notification records
- Respects unique constraint `[leaseId, daysBeforeExpiration]`
- Handles timezone considerations for accurate date calculations
- Job is idempotent (can run multiple times without creating duplicates)

---

## Implementation Notes

### Database Schema

The notification system uses the following Prisma schema:

```prisma
model Notification {
  id          String            @id @default(uuid())
  accountId   String            @map("account_id")
  leaseId     String            @map("lease_id")
  type        NotificationType
  daysBeforeExpiration Int      @map("days_before_expiration")
  sentAt      DateTime?         @map("sent_at")
  status      NotificationStatus @default(PENDING)
  error       String?
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  
  // Relations
  account     Account           @relation(fields: [accountId], references: [id], onDelete: Cascade)
  lease       Lease             @relation(fields: [leaseId], references: [id], onDelete: Cascade)
  
  @@index([accountId])
  @@index([leaseId])
  @@index([status])
  @@index([sentAt])
  @@unique([leaseId, daysBeforeExpiration])
  @@map("notifications")
}

enum NotificationType {
  LEASE_EXPIRING
  LEASE_EXPIRED
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
}
```

**Key Schema Features:**
- **Unique Constraint**: `[leaseId, daysBeforeExpiration]` ensures one notification per lease per timing configuration
- **Status Tracking**: `status` field tracks notification lifecycle (PENDING → SENT/FAILED)
- **Error Handling**: `error` field stores failure details for debugging and retry logic
- **Relations**: Links to `Account` and `Lease` for data integrity and easy querying
- **Indexes**: Optimized for common queries (by account, lease, status, sentAt)

### Notification Types

**LEASE_EXPIRING:**
- Generated when a lease is approaching expiration
- Created based on `daysBeforeExpiration` configuration
- Example: Notification created 30 days before lease end date

**LEASE_EXPIRED:**
- Generated when a lease has already expired
- Created for leases past their `endDate`
- Helps identify leases that need attention

### Notification Status Flow

```
PENDING → SENT (success)
       → FAILED (error)
       
FAILED → PENDING (retry) → SENT (success)
                              → FAILED (error)
```

### Cron Job Implementation

**Purpose:** Automatically generate notifications for leases requiring alerts

**Schedule:** Daily execution (configurable, e.g., 9:00 AM)

**Process:**
1. Query all active leases (`status: ACTIVE` or `FUTURE`)
2. For each lease, calculate days until expiration
3. Check configured notification timings (e.g., 90, 30, 7 days)
4. For each matching timing:
   - Check if notification already exists (`[leaseId, daysBeforeExpiration]`)
   - If not exists, create notification with `status: PENDING`
5. Process notifications in batches (send pending notifications)
6. Log execution results

**Implementation Location:** `apps/backend/src/jobs/notification-generator.ts`

### Email Service Integration

**Current Status:** Database schema implemented, email service pending

**Required Integration:**
- Email service to send notification emails
- Email templates for different notification types
- Support for HTML and plain text emails
- Email delivery tracking and error handling

**Email Content Should Include:**
- Lease details (property address, unit, tenant name)
- Lease expiration date
- Days until expiration
- Action items (renew lease, contact tenant, etc.)
- Link to lease details in application

**Future Enhancements:**
- SMS notifications (requires SMS service integration)
- Push notifications (requires mobile app)
- In-app notifications (requires notification center UI)

### API Endpoints

**Required Endpoints:**

1. `GET /api/notifications`
   - List all notifications for authenticated user's account
   - Query parameters: `status`, `type`, `leaseId`, `startDate`, `endDate`
   - Returns paginated results with lease details

2. `GET /api/notifications/:id`
   - Get single notification details
   - Includes full lease and account information

3. `POST /api/notifications/:id/retry`
   - Retry sending a failed notification
   - Returns updated notification status

4. `POST /api/notifications/retry-bulk`
   - Bulk retry multiple failed notifications
   - Accepts array of notification IDs

5. `GET /api/notifications/upcoming`
   - Get upcoming notifications (PENDING status)
   - Useful for dashboard widgets

### Frontend Components

**Required UI Components:**

1. **Notification List Page** (`/notifications`)
   - Table/grid view of all notifications
   - Filters for status, type, date range
   - Retry button for failed notifications
   - Link to lease details

2. **Notification Settings** (`/settings/notifications`)
   - Configure notification timing (days before expiration)
   - Enable/disable notification types
   - Email preferences (future)

3. **Dashboard Widget**
   - Upcoming notifications count
   - Failed notifications alert
   - Quick link to notification list

4. **Lease Detail Integration**
   - Show related notifications on lease detail page
   - Display notification history for the lease

### Testing Requirements

**Unit Tests:**
- Notification creation logic
- Notification status transitions
- Unique constraint validation
- Date calculation logic

**Integration Tests:**
- Cron job execution
- Email sending (with mock email service)
- API endpoints
- Database operations

**E2E Tests:**
- Complete notification flow (generation → sending → status update)
- Retry failed notification flow
- Notification list filtering

### Security Considerations

- Notifications are account-scoped (users can only see their account's notifications)
- API endpoints require authentication
- Email addresses validated before sending
- Rate limiting on notification sending to prevent abuse

### Performance Considerations

- Batch processing for notification generation
- Indexed database queries for efficient lookups
- Async email sending to avoid blocking
- Pagination for notification lists
- Caching of lease expiration calculations (if needed)

### Future Enhancements

1. **Notification Channels:**
   - SMS notifications
   - Push notifications (mobile app)
   - In-app notification center

2. **Notification Preferences:**
   - Per-user notification settings
   - Per-property notification settings
   - Notification frequency controls

3. **Advanced Notification Types:**
   - Payment reminders
   - Maintenance reminders
   - Document expiration alerts
   - Mortgage payment reminders

4. **Notification Templates:**
   - Customizable email templates
   - Multi-language support
   - Branding customization

5. **Analytics:**
   - Notification open rates
   - Click-through rates
   - Delivery success rates
   - User engagement metrics

---

## Dependencies

- **Database:** Prisma schema implemented ✅
- **Email Service:** Pending implementation ⏳
- **Cron Job System:** Pending implementation ⏳
- **Frontend Components:** Pending implementation ⏳
- **API Endpoints:** Pending implementation ⏳

## Estimated Effort

- **Backend Development:** 3-5 days
  - Notification service implementation
  - Cron job setup
  - API endpoints
  - Email integration

- **Frontend Development:** 2-3 days
  - Notification list page
  - Notification settings
  - Dashboard integration

- **Testing:** 1-2 days
  - Unit tests
  - Integration tests
  - E2E tests

**Total Estimated Effort:** 6-10 days

---

## Related Epics

- **Epic 6: Leases Management** - Foundation for lease data
- **Epic 3: Properties & Units** - Property context for notifications
- **Epic 4: Tenants Management** - Tenant information in notifications

---

## Notes

- Database schema is complete and ready for implementation
- Email service integration is the primary pending dependency
- Cron job can be implemented using node-cron or similar library
- Consider using a job queue (e.g., Bull/BullMQ) for scalable notification processing
- Notification templates should be stored in a separate configuration or database table for easy updates
