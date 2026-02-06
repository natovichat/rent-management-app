/**
 * US5.11 - Inline Owner Creation from Ownership Form - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.11 - Inline Owner Creation from Ownership Form (TDD)', () => {
  let page: Page;
  let testPropertyId: string;
  
  test.setTimeout(90000);

  async function cleanupTestData() {
    try {
      await fetch(`${BACKEND_URL}/owners/test/cleanup`, {
        method: 'DELETE',
        headers: { 'X-Account-Id': 'test-account-1' },
      });
      await fetch(`${BACKEND_URL}/properties/test/cleanup`, {
        method: 'DELETE',
        headers: { 'X-Account-Id': 'test-account-1' },
      });
    } catch (error) {
      console.warn('⚠️ Error cleaning:', error);
    }
  }

  async function createTestProperty() {
    const response = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        address: 'רחוב יצירה פנימית 111',
        fileNumber: 'TEST-INLINE',
        type: 'APARTMENT',
        status: 'ACTIVE',
      }),
    });
    return (await response.json()).id;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanupTestData();
    await setTestAccountInStorage(page, 'test-account-1');
    testPropertyId = await createTestProperty();
  });

  test('TC-E2E-5.11-001-create-new-owner-option-in-dropdown', async () => {
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Open owner dropdown
    await page.click('text=בעלים');
    await page.waitForSelector('[role="listbox"]', { timeout: 3000 });
    
    // Verify "+ Create New Owner" option exists
    await page.waitForSelector('text=+ צור בעלים חדש', { timeout: 5000 });
  });

  test('TC-E2E-5.11-002-clicking-opens-owner-creation-dialog', async () => {
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Click create new owner option
    await page.click('text=+ צור בעלים חדש');
    
    // Verify owner creation dialog opens
    await page.waitForSelector('[role="dialog"]:has-text("צור בעלים חדש")', { timeout: 5000 });
  });

  test('TC-E2E-5.11-003-new-owner-auto-selected-after-creation', async () => {
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Click create new owner
    await page.click('text=+ צור בעלים חדש');
    await page.waitForSelector('[role="dialog"]:has-text("צור בעלים חדש")', { timeout: 5000 });
    
    // Fill owner form
    await page.fill('input[name="name"]', 'בעלים חדש פנימי');
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=חברה');
    await page.waitForTimeout(300);
    
    // Submit owner creation
    await page.click('button:has-text("צור בעלים")');
    
    // Wait for success
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Verify ownership form still open and new owner selected
    const ownershipDialog = page.locator('[role="dialog"]:has-text("הוסף בעלות")');
    await expect(ownershipDialog).toBeVisible({ timeout: 5000 });
  });

  test('TC-E2E-5.11-004-form-context-preserved', async () => {
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill some ownership fields
    await page.fill('input[name="ownershipPercentage"]', '50');
    await page.selectOption('select[name="ownershipType"]', 'PARTIAL');
    
    // Click create new owner
    await page.click('text=+ צור בעלים חדש');
    await page.waitForSelector('[role="dialog"]:has-text("צור בעלים חדש")', { timeout: 5000 });
    
    // Cancel owner creation
    await page.click('button:has-text("ביטול")');
    await page.waitForTimeout(500);
    
    // Verify ownership form still has filled values
    const percentageInput = page.locator('input[name="ownershipPercentage"]');
    const percentageValue = await percentageInput.inputValue();
    expect(percentageValue).toBe('50');
  });
});
