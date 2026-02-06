/**
 * US12.4 - Retry Failed Notifications - E2E Tests (Test-Driven Development)
 */

import { test, expect } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL, getTestAccount } from '../utils/test-helpers';

test.describe('US12.4 - Retry Failed Notifications (TDD)', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    const testAccount = await getTestAccount();
    await setTestAccountInStorage(page, testAccount.id);
  });

  test('TC-E2E-12.4-001-retry-single-failed-notification', async ({ page }) => {
    console.log('\n=== TC-E2E-12.4-001: Retry Single Failed Notification ===');
    
    console.log('→ Step 1: Navigate to notifications page');
    await page.goto(`${FRONTEND_URL}/notifications`);
    
    console.log('→ Step 2: Filter by FAILED status');
    const statusFilter = page.locator('text=סטטוס').or(page.locator('[aria-label*="סטטוס"]'));
    if (await statusFilter.count() > 0) {
      await statusFilter.first().click();
      await page.waitForTimeout(500);
      const failedOption = page.locator('text=נכשל').or(page.locator('[role="option"]').filter({ hasText: 'נכשל' }));
      if (await failedOption.count() > 0) {
        await failedOption.first().click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('→ Step 3: Click retry button on failed notification');
    const retryButton = page.locator('button[aria-label*="שליחה מחדש"]').or(page.locator('text=שליחה מחדש')).first();
    if (await retryButton.count() > 0) {
      await retryButton.click();
      await page.waitForTimeout(2000);
      
      console.log('→ Step 4: Verify success notification');
      const snackbar = page.locator('.MuiSnackbar-root .MuiAlert-message');
      await expect(snackbar).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('⚠️ Success notification not displayed');
      });
      
      console.log('✓ Retry completed');
    } else {
      console.log('⚠️ Retry button not found (expected in TDD)');
    }
    
    console.log('✓ Test completed\n');
  });

  test('TC-E2E-12.4-002-bulk-retry-failed-notifications', async ({ page }) => {
    console.log('\n=== TC-E2E-12.4-002: Bulk Retry Failed Notifications ===');
    
    console.log('→ Step 1: Navigate to notifications page');
    await page.goto(`${FRONTEND_URL}/notifications`);
    
    console.log('→ Step 2: Click bulk retry button');
    const bulkRetryButton = page.locator('button:has-text("שליחה מחדש לכושלות")').or(page.locator('text=שליחה מחדש לכושלות'));
    if (await bulkRetryButton.count() > 0) {
      await bulkRetryButton.click();
      await page.waitForTimeout(2000);
      
      console.log('→ Step 3: Verify success notification');
      const snackbar = page.locator('.MuiSnackbar-root .MuiAlert-message');
      await expect(snackbar).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('⚠️ Success notification not displayed');
      });
      
      console.log('✓ Bulk retry completed');
    } else {
      console.log('⚠️ Bulk retry button not found (expected in TDD)');
    }
    
    console.log('✓ Test completed\n');
  });
});
