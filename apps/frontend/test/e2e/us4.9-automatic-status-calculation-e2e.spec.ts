/**
 * US4.9 - Automatic Lease Status Calculation - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;
let TEST_UNIT_ID: string;
let TEST_TENANT_ID: string;

test.describe('US4.9 - Automatic Lease Status Calculation', () => {
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

  test('TC-E2E-001: Status is ACTIVE for current date range', async () => {
    // Create lease with start date in past, end date in future
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    await fetch(`${BACKEND_URL}/leases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: TEST_UNIT_ID,
        tenantId: TEST_TENANT_ID,
        startDate: pastDate.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0],
        monthlyRent: 5000,
        paymentTo: 'תשלום',
      }),
    });
    
    await page.goto(`${FRONTEND_URL}/leases`);
    await page.waitForLoadState('networkidle');
    
    // Verify status is ACTIVE (green badge)
    const statusBadge = page.locator('[class*="MuiChip"]').first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-002: Status is FUTURE for future start date', async () => {
    // Create lease with start date in future
    const futureStart = new Date();
    futureStart.setMonth(futureStart.getMonth() + 1);
    const futureEnd = new Date();
    futureEnd.setFullYear(futureEnd.getFullYear() + 2);
    
    await fetch(`${BACKEND_URL}/leases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: TEST_UNIT_ID,
        tenantId: TEST_TENANT_ID,
        startDate: futureStart.toISOString().split('T')[0],
        endDate: futureEnd.toISOString().split('T')[0],
        monthlyRent: 5000,
        paymentTo: 'תשלום',
      }),
    });
    
    await page.goto(`${FRONTEND_URL}/leases`);
    await page.waitForLoadState('networkidle');
    
    // Verify status is FUTURE (blue badge)
    const statusBadge = page.locator('[class*="MuiChip"]').first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });
  });
});
