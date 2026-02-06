/**
 * US5.3 - View Owners List - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.3 - View Owners List (TDD)', () => {
  let page: Page;
  
  test.setTimeout(60000);

  async function cleanupTestData() {
    try {
      await fetch(`${BACKEND_URL}/owners/test/cleanup`, {
        method: 'DELETE',
        headers: { 'X-Account-Id': 'test-account-1' },
      });
    } catch (error) {
      console.warn('⚠️ Error cleaning:', error);
    }
  }

  async function createTestOwners(count: number) {
    for (let i = 0; i < count; i++) {
      await fetch(`${BACKEND_URL}/owners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': 'test-account-1',
        },
        body: JSON.stringify({
          name: `בעלים ${i + 1}`,
          type: 'INDIVIDUAL',
          email: `owner${i + 1}@example.com`,
          phone: `050-${1000000 + i}`,
        }),
      });
    }
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanupTestData();
    await setTestAccountInStorage(page, 'test-account-1');
  });

  test('TC-E2E-5.3-001-owners-list-displays-in-datagrid', async () => {
    await createTestOwners(3);
    
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify DataGrid exists
    const datagrid = page.locator('.MuiDataGrid-root');
    await expect(datagrid).toBeVisible({ timeout: 5000 });
    
    // Verify owners appear
    await page.waitForSelector('text=בעלים 1', { timeout: 5000 });
  });

  test('TC-E2E-5.3-002-list-shows-key-information', async () => {
    await createTestOwners(2);
    
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify columns exist
    await expect(page.locator('text=שם')).toBeVisible();
    await expect(page.locator('text=סוג')).toBeVisible();
    await expect(page.locator('text=אימייל')).toBeVisible();
    await expect(page.locator('text=טלפון')).toBeVisible();
  });

  test('TC-E2E-5.3-003-pagination-works', async () => {
    await createTestOwners(15); // More than default page size (10)
    
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify pagination controls exist
    const pagination = page.locator('.MuiDataGrid-footerContainer');
    await expect(pagination).toBeVisible();
  });
});
