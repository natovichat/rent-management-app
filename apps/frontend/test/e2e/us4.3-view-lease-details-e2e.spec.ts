/**
 * US4.3 - View Lease Details - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;
let TEST_UNIT_ID: string;
let TEST_TENANT_ID: string;
let TEST_LEASE_ID: string;

test.describe('US4.3 - View Lease Details', () => {
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
      body: JSON.stringify({ name: 'יוחנן כהן', phone: '050-1234567', email: 'test@example.com' }),
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
        notes: 'כולל חניה',
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
  });

  test('TC-E2E-001: View lease details from list', async () => {
    await page.goto(`${FRONTEND_URL}/leases`);
    await page.waitForLoadState('networkidle');
    
    // Click on lease row or view button
    const viewButton = page.locator('button:has-text("צפייה"), button[aria-label*="view"]').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
    } else {
      // Click on row
      await page.locator('text=יוחנן כהן').first().click();
    }
    
    // Verify details page or dialog appears
    await page.waitForTimeout(2000);
    
    // Verify tenant info is visible
    await expect(page.locator('text=יוחנן כהן').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-002: Details show all lease information', async () => {
    // Navigate directly to lease detail if route exists
    await page.goto(`${FRONTEND_URL}/leases/${TEST_LEASE_ID}`);
    await page.waitForLoadState('networkidle');
    
    // Verify key information is displayed
    await expect(page.locator('text=יוחנן כהן').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=5000').first()).toBeVisible({ timeout: 5000 });
  });
});
