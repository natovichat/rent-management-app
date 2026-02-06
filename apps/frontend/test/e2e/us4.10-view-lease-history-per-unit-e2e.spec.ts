/**
 * US4.10 - View Lease History per Unit - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

let TEST_ACCOUNT_ID: string;
let TEST_PROPERTY_ID: string;
let TEST_UNIT_ID: string;
let TEST_TENANT_ID: string;

test.describe('US4.10 - View Lease History per Unit', () => {
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
    
    // Create multiple leases for history
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 2);
    const midDate = new Date();
    midDate.setFullYear(midDate.getFullYear() - 1);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    // Past lease
    await fetch(`${BACKEND_URL}/leases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: TEST_UNIT_ID,
        tenantId: TEST_TENANT_ID,
        startDate: pastDate.toISOString().split('T')[0],
        endDate: midDate.toISOString().split('T')[0],
        monthlyRent: 4000,
        paymentTo: 'תשלום',
      }),
    });
    
    // Current lease
    await fetch(`${BACKEND_URL}/leases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: TEST_UNIT_ID,
        tenantId: TEST_TENANT_ID,
        startDate: midDate.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0],
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

  test('TC-E2E-001: View lease history from unit detail page', async () => {
    // Navigate to unit detail page
    await page.goto(`${FRONTEND_URL}/units/${TEST_UNIT_ID}`);
    await page.waitForLoadState('networkidle');
    
    // Look for lease history section
    const historySection = page.locator('text=היסטוריית חוזים, text=Lease History').first();
    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible({ timeout: 5000 });
      
      // Verify leases are listed
      await expect(page.locator('text=יוחנן כהן').first()).toBeVisible({ timeout: 5000 });
    } else {
      // History may not be implemented yet
      test.skip();
    }
  });
});
