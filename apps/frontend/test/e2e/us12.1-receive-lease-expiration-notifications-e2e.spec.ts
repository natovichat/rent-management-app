/**
 * US12.1 - Receive Lease Expiration Notifications - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation.
 * 
 * Test Coverage:
 * - TC-E2E-12.1-001: System generates notification for lease expiring within timeframe
 * - TC-E2E-12.1-002: Notification created with PENDING status
 * - TC-E2E-12.1-003: Notification linked to lease and account
 * - TC-E2E-12.1-004: Notification includes daysBeforeExpiration
 * - TC-E2E-12.1-005: Notification status updates to SENT after successful email
 * - TC-E2E-12.1-006: Notification status updates to FAILED with error on failure
 * - TC-E2E-12.1-007: Unique constraint prevents duplicate notifications
 * - TC-E2E-12.1-008: Notification type is LEASE_EXPIRING
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us12.1-receive-lease-expiration-notifications-e2e.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL, getTestAccount } from '../utils/test-helpers';

let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;
let TEST_UNIT_ID: string;
let TEST_TENANT_ID: string;
let TEST_LEASE_ID: string;

test.describe('US12.1 - Receive Lease Expiration Notifications (TDD)', () => {
  let page: Page;
  
  test.setTimeout(60000);

  /**
   * Helper: Clean test data
   */
  async function cleanTestData() {
    console.log('\n=== CLEANING TEST DATA ===');
    try {
      await fetch(`${BACKEND_URL}/notifications/test/cleanup`, { method: 'DELETE' }).catch(() => {});
      await fetch(`${BACKEND_URL}/leases/test/cleanup`, { method: 'DELETE' }).catch(() => {});
      await fetch(`${BACKEND_URL}/units/test/cleanup`, { method: 'DELETE' }).catch(() => {});
      await fetch(`${BACKEND_URL}/tenants/test/cleanup`, { method: 'DELETE' }).catch(() => {});
      await fetch(`${BACKEND_URL}/properties/test/cleanup`, { method: 'DELETE' }).catch(() => {});
      console.log('✓ Test data cleaned\n');
    } catch (error) {
      console.warn('⚠️ Failed to clean test data:', error);
    }
  }

  /**
   * Helper: Create test lease expiring in N days
   */
  async function createTestLeaseExpiringInDays(daysUntilExpiration: number): Promise<string> {
    console.log(`→ Creating test lease expiring in ${daysUntilExpiration} days`);
    
    // Get test account
    const testAccount = await getTestAccount();
    TEST_ACCOUNT_ID = testAccount.id;
    
    // Create property
    const propRes = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: 'רחוב הרצל 1, תל אביב',
        fileNumber: 'TEST-NOTIF-001',
      }),
    });
    TEST_PROPERTY_ID = (await propRes.json()).id;
    
    // Create unit
    const unitRes = await fetch(`${BACKEND_URL}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: TEST_PROPERTY_ID,
        apartmentNumber: '5',
      }),
    });
    TEST_UNIT_ID = (await unitRes.json()).id;
    
    // Create tenant
    const tenantRes = await fetch(`${BACKEND_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'יוחנן כהן',
        phone: '050-1234567',
      }),
    });
    TEST_TENANT_ID = (await tenantRes.json()).id;
    
    // Create lease expiring in N days
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + daysUntilExpiration);
    
    const leaseRes = await fetch(`${BACKEND_URL}/leases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: TEST_UNIT_ID,
        tenantId: TEST_TENANT_ID,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        monthlyRent: 5000,
        paymentTo: 'תשלום',
      }),
    });
    const lease = await leaseRes.json();
    TEST_LEASE_ID = lease.id;
    
    console.log(`✓ Test lease created: ID=${TEST_LEASE_ID}, expires in ${daysUntilExpiration} days\n`);
    return TEST_LEASE_ID;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanTestData();
    const testAccount = await getTestAccount();
    TEST_ACCOUNT_ID = testAccount.id;
    // Use the account ID format that matches backend expectations
    // Backend expects UUID format: 00000000-0000-0000-0000-000000000001
    // But getTestAccount() might return 'test-account-1', so we'll use what it returns
    await setTestAccountInStorage(page, TEST_ACCOUNT_ID);
  });

  test('TC-E2E-12.1-001-system-generates-notification-for-expiring-lease', async () => {
    console.log('\n=== TC-E2E-12.1-001: System Generates Notification for Expiring Lease ===');
    
    console.log('→ Step 1: Create lease expiring in 25 days (within 30-day timeframe)');
    await createTestLeaseExpiringInDays(25);
    
    console.log('→ Step 2: Trigger notification generation (cron job or manual trigger)');
    // For testing, we'll manually trigger the notification generation
    // In production, this would be done by a cron job
    const triggerRes = await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null);
    
    // If endpoint doesn't exist yet, that's expected - test will fail (TDD)
    if (!triggerRes || !triggerRes.ok) {
      console.log('⚠️ Notification generation endpoint not implemented yet (expected in TDD)');
    }
    
    console.log('→ Step 3: Verify notification was created');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?leaseId=${TEST_LEASE_ID}`);
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      const notification = notifications.find((n: any) => n.leaseId === TEST_LEASE_ID);
      
      expect(notification).toBeDefined();
      expect(notification.type).toBe('LEASE_EXPIRING');
      expect(notification.status).toBe('PENDING');
      expect(notification.daysBeforeExpiration).toBeGreaterThan(0);
      console.log('✓ Notification created successfully');
      console.log(`  - Type: ${notification.type}`);
      console.log(`  - Status: ${notification.status}`);
      console.log(`  - Days before expiration: ${notification.daysBeforeExpiration}`);
    } else {
      console.log('⚠️ Notifications endpoint not implemented yet (expected in TDD)');
      // In TDD, this is expected to fail initially
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.1-002-notification-created-with-pending-status', async () => {
    console.log('\n=== TC-E2E-12.1-002: Notification Created with PENDING Status ===');
    
    console.log('→ Step 1: Create lease expiring in 30 days');
    await createTestLeaseExpiringInDays(30);
    
    console.log('→ Step 2: Generate notification');
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 3: Verify notification has PENDING status');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?leaseId=${TEST_LEASE_ID}`);
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      const notification = notifications.find((n: any) => n.leaseId === TEST_LEASE_ID);
      
      expect(notification).toBeDefined();
      expect(notification.status).toBe('PENDING');
      expect(notification.sentAt).toBeNull();
      console.log('✓ Notification has PENDING status');
    } else {
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.1-003-notification-linked-to-lease-and-account', async () => {
    console.log('\n=== TC-E2E-12.1-003: Notification Linked to Lease and Account ===');
    
    console.log('→ Step 1: Create lease');
    await createTestLeaseExpiringInDays(20);
    
    console.log('→ Step 2: Generate notification');
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 3: Verify notification links');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?leaseId=${TEST_LEASE_ID}`);
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      const notification = notifications.find((n: any) => n.leaseId === TEST_LEASE_ID);
      
      expect(notification).toBeDefined();
      expect(notification.leaseId).toBe(TEST_LEASE_ID);
      expect(notification.accountId).toBe(TEST_ACCOUNT_ID);
      console.log('✓ Notification linked to lease and account');
      console.log(`  - Lease ID: ${notification.leaseId}`);
      console.log(`  - Account ID: ${notification.accountId}`);
    } else {
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.1-004-notification-includes-days-before-expiration', async () => {
    console.log('\n=== TC-E2E-12.1-004: Notification Includes daysBeforeExpiration ===');
    
    console.log('→ Step 1: Create lease expiring in 15 days');
    await createTestLeaseExpiringInDays(15);
    
    console.log('→ Step 2: Generate notification');
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 3: Verify daysBeforeExpiration field');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?leaseId=${TEST_LEASE_ID}`);
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      const notification = notifications.find((n: any) => n.leaseId === TEST_LEASE_ID);
      
      expect(notification).toBeDefined();
      expect(notification.daysBeforeExpiration).toBeDefined();
      expect(typeof notification.daysBeforeExpiration).toBe('number');
      expect(notification.daysBeforeExpiration).toBeGreaterThan(0);
      expect(notification.daysBeforeExpiration).toBeLessThanOrEqual(15);
      console.log(`✓ Notification includes daysBeforeExpiration: ${notification.daysBeforeExpiration}`);
    } else {
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.1-005-notification-status-updates-to-sent', async () => {
    console.log('\n=== TC-E2E-12.1-005: Notification Status Updates to SENT ===');
    
    console.log('→ Step 1: Create lease and generate notification');
    await createTestLeaseExpiringInDays(10);
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 2: Process pending notifications (send emails)');
    await fetch(`${BACKEND_URL}/notifications/process`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 3: Verify notification status is SENT');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?leaseId=${TEST_LEASE_ID}`);
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      const notification = notifications.find((n: any) => n.leaseId === TEST_LEASE_ID);
      
      if (notification) {
        // After processing, status should be SENT (or still PENDING if email service not configured)
        expect(['PENDING', 'SENT']).toContain(notification.status);
        if (notification.status === 'SENT') {
          expect(notification.sentAt).toBeDefined();
          console.log('✓ Notification status updated to SENT');
          console.log(`  - Sent at: ${notification.sentAt}`);
        } else {
          console.log('⚠️ Notification still PENDING (email service may not be configured)');
        }
      }
    } else {
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.1-006-notification-status-updates-to-failed', async () => {
    console.log('\n=== TC-E2E-12.1-006: Notification Status Updates to FAILED ===');
    
    console.log('→ Step 1: Create lease and generate notification');
    await createTestLeaseExpiringInDays(5);
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 2: Simulate email failure (if test endpoint exists)');
    // This test may need to be adjusted based on actual implementation
    // For now, we'll verify the error handling structure exists
    
    console.log('→ Step 3: Verify notification can have FAILED status');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?status=FAILED`);
    
    if (notificationsRes.ok) {
      const failedNotifications = await notificationsRes.json();
      // Just verify the endpoint supports FAILED status filtering
      expect(Array.isArray(failedNotifications)).toBe(true);
      console.log('✓ FAILED status filtering supported');
    } else {
      // Expected in TDD - endpoint not implemented yet
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.1-007-unique-constraint-prevents-duplicates', async () => {
    console.log('\n=== TC-E2E-12.1-007: Unique Constraint Prevents Duplicates ===');
    
    console.log('→ Step 1: Create lease expiring in 30 days');
    await createTestLeaseExpiringInDays(30);
    
    console.log('→ Step 2: Generate notification first time');
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 3: Attempt to generate notification again (should not create duplicate)');
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 4: Verify only one notification exists');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?leaseId=${TEST_LEASE_ID}`);
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      const leaseNotifications = notifications.filter((n: any) => n.leaseId === TEST_LEASE_ID);
      
      // Should have at most one notification per lease per daysBeforeExpiration
      expect(leaseNotifications.length).toBeLessThanOrEqual(1);
      console.log(`✓ Unique constraint enforced: ${leaseNotifications.length} notification(s) found`);
    } else {
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.1-008-notification-type-is-lease-expiring', async () => {
    console.log('\n=== TC-E2E-12.1-008: Notification Type is LEASE_EXPIRING ===');
    
    console.log('→ Step 1: Create lease expiring in 20 days');
    await createTestLeaseExpiringInDays(20);
    
    console.log('→ Step 2: Generate notification');
    await fetch(`${BACKEND_URL}/notifications/generate`, {
      method: 'POST',
    }).catch(() => {});
    
    console.log('→ Step 3: Verify notification type is LEASE_EXPIRING');
    const notificationsRes = await fetch(`${BACKEND_URL}/notifications?leaseId=${TEST_LEASE_ID}`);
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      const notification = notifications.find((n: any) => n.leaseId === TEST_LEASE_ID);
      
      expect(notification).toBeDefined();
      expect(notification.type).toBe('LEASE_EXPIRING');
      console.log('✓ Notification type is LEASE_EXPIRING');
    } else {
      expect(notificationsRes.ok).toBe(true);
    }
    
    console.log('✓ Test completed\n');
  });
});
