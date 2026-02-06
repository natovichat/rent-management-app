/**
 * US5.5 - Edit Owner Information - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.5 - Edit Owner Information (TDD)', () => {
  let page: Page;
  let testOwnerId: string;
  
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

  async function createTestOwner() {
    const response = await fetch(`${BACKEND_URL}/owners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        name: 'בעלים לעריכה',
        type: 'INDIVIDUAL',
        email: 'original@example.com',
        phone: '050-1111111',
      }),
    });
    const owner = await response.json();
    return owner.id;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanupTestData();
    await setTestAccountInStorage(page, 'test-account-1');
    testOwnerId = await createTestOwner();
  });

  test('TC-E2E-5.5-001-edit-button-opens-form', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find edit button (in actions column)
    const editButton = page.locator('button[aria-label*="עריכה"], button:has-text("עריכה")').first();
    await editButton.click();
    
    // Verify edit dialog/form opens
    await page.waitForSelector('[role="dialog"], form', { timeout: 5000 });
  });

  test('TC-E2E-5.5-002-edit-form-pre-populates', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const editButton = page.locator('button[aria-label*="עריכה"], button:has-text("עריכה")').first();
    await editButton.click();
    
    await page.waitForSelector('[role="dialog"], form', { timeout: 5000 });
    
    // Verify form is pre-populated
    const nameInput = page.locator('input[name="name"]');
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toContain('בעלים לעריכה');
  });

  test('TC-E2E-5.5-003-update-owner-successfully', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const editButton = page.locator('button[aria-label*="עריכה"], button:has-text("עריכה")').first();
    await editButton.click();
    
    await page.waitForSelector('[role="dialog"], form', { timeout: 5000 });
    
    // Update fields
    await page.fill('input[name="name"]', 'בעלים מעודכן');
    await page.fill('input[name="email"]', 'updated@example.com');
    
    // Submit
    await page.click('button:has-text("עדכן"), button:has-text("שמירה")');
    
    // Verify success
    await page.waitForSelector('text=בעלים עודכן בהצלחה, text=בעלים מעודכן', { timeout: 10000 });
  });
});
