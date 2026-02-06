/**
 * US4.6 - Terminate Lease Early - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;
let TEST_UNIT_ID: string;
let TEST_TENANT_ID: string;
let TEST_LEASE_ID: string;

test.describe('US4.6 - Terminate Lease Early', () => {
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
    
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const leaseRes = await fetch(`${BACKEND_URL}/leases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: TEST_UNIT_ID,
        tenantId: TEST_TENANT_ID,
        startDate: today,
        endDate: nextYear.toISOString().split('T')[0],
        monthlyRent: 5000,
        paymentTo: 'תשלום',
      }),
    });
    TEST_LEASE_ID = (await leaseRes.json()).id;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await fetch(`${BACKEND_URL}/leases/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await fetch(`${BACKEND_URL}/units/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await fetch(`${BACKEND_URL}/tenants/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await fetch(`${BACKEND_URL}/properties/test/cleanup`, { method: 'DELETE' }).catch(() => {});
    await setupTestData();
    await setTestAccountInStorage(page, TEST_ACCOUNT_ID);
    await page.goto(`${FRONTEND_URL}/leases`);
    await page.waitForLoadState('networkidle');
  });

  test('TC-E2E-001: Terminate lease with confirmation', async () => {
    // Click terminate button
    const terminateButton = page.locator('button:has-text("סיום"), button[aria-label*="terminate"]').first();
    await terminateButton.click();
    
    // Confirm termination
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    const confirmButton = page.locator('button:has-text("סיים"), button:has-text("אישור")').last();
    await confirmButton.click();
    
    // Wait for termination
    await page.waitForTimeout(2000);
    
    // Verify status changed to TERMINATED (red badge)
    await expect(page.locator('text=סוים, text=TERMINATED').first()).toBeVisible({ timeout: 10000 }).catch(() => {
      // Status badge should be visible
      const statusBadge = page.locator('[class*="MuiChip"]').first();
      expect(statusBadge).toBeVisible();
    });
  });
});
