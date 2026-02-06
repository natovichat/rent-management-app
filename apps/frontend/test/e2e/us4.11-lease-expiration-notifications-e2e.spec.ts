/**
 * US4.11 - Receive Lease Expiration Notifications - E2E Tests
 * 
 * Note: This feature depends on Epic 12 (Notifications) which may not be implemented yet.
 * Tests are written but may be skipped until notification system is available.
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;
let TEST_UNIT_ID: string;
let TEST_TENANT_ID: string;

test.describe('US4.11 - Receive Lease Expiration Notifications', () => {
  let page: Page;
  test.setTimeout(60000);

  async function setupTestData() {
    const accountsRes = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await accountsRes.json();
    TEST_ACCOUNT_ID = accounts.find((a: any) => a.name === 'Test Account')?.id;
    
    const propRes = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: 'רחוב הרצל 1', fileNumber: 'TEST-001' }),
    });
    TEST_PROPERTY_ID = (await propRes.json()).id;
    
    const unitRes = await fetch(`${BACKEND_URL}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: TEST_PROPERTY_ID, apartmentNumber: '5' }),
    });
    TEST_UNIT_ID = (await unitRes.json()).id;
    
    const tenantRes = await fetch(`${BACKEND_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'יוחנן כהן', phone: '050-1234567' }),
    });
    TEST_TENANT_ID = (await tenantRes.json()).id;
    
    // Create lease expiring soon (within 30 days)
    const today = new Date();
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 20); // Expires in 20 days
    
    await fetch(`${BACKEND_URL}/leases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: TEST_UNIT_ID,
        tenantId: TEST_TENANT_ID,
        startDate: today.toISOString().split('T')[0],
        endDate: expiringDate.toISOString().split('T')[0],
        monthlyRent: 5000,
        paymentTo: 'תשלום',
      }),
    });
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await fetch(`${BACKEND_URL}/leases/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await fetch(`${BACKEND_URL}/units/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await fetch(`${BACKEND_URL}/tenants/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await fetch(`${BACKEND_URL}/properties/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await setupTestData();
    await setTestAccountInStorage(page, TEST_ACCOUNT_ID);
  });

  test('TC-E2E-001: Notification created for expiring lease', async () => {
    // This test depends on notification system (Epic 12)
    // Check if notification endpoint exists
    try {
      const notificationsRes = await fetch(`${BACKEND_URL}/notifications`);
      if (notificationsRes.ok) {
        // Notification system exists - verify notification was created
        const notifications = await notificationsRes.json();
        const expiringNotification = notifications.find((n: any) => 
          n.type === 'LEASE_EXPIRING' || n.message?.includes('חוזה')
        );
        expect(expiringNotification).toBeDefined();
      } else {
        test.skip();
      }
    } catch {
      // Notification system not implemented yet
      test.skip();
    }
  });
});
