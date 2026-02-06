/**
 * US5.6 - Delete Owner - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.6 - Delete Owner (TDD)', () => {
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
        name: 'בעלים למחיקה',
        type: 'INDIVIDUAL',
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

  test('TC-E2E-5.6-001-delete-button-shows-confirmation', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find delete button
    const deleteButton = page.locator('button[aria-label*="מחיקה"], button:has-text("מחיקה")').first();
    await deleteButton.click();
    
    // Verify confirmation dialog
    await page.waitForSelector('text=מחיקה, text=אישור, text=ביטול', { timeout: 5000 });
  });

  test('TC-E2E-5.6-002-delete-owner-successfully', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const deleteButton = page.locator('button[aria-label*="מחיקה"], button:has-text("מחיקה")').first();
    await deleteButton.click();
    
    // Confirm deletion
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.click('button:has-text("אישור"), button:has-text("מחק")');
    
    // Verify success
    await page.waitForSelector('text=בעלים נמחק בהצלחה', { timeout: 10000 });
    
    // Verify owner removed from list
    await page.waitForTimeout(1000);
    const ownerInList = page.locator('text=בעלים למחיקה');
    await expect(ownerInList).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-E2E-5.6-003-cancel-deletion', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const deleteButton = page.locator('button[aria-label*="מחיקה"], button:has-text("מחיקה")').first();
    await deleteButton.click();
    
    // Cancel deletion
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.click('button:has-text("ביטול")');
    
    // Verify owner still in list
    await page.waitForTimeout(1000);
    await page.waitForSelector('text=בעלים למחיקה', { timeout: 5000 });
  });

  test('TC-E2E-5.6-004-delete-fails-with-ownership-records', async () => {
    // Create property and ownership first
    const propertyResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        address: 'רחוב בדיקה',
        fileNumber: 'TEST-DELETE',
        type: 'APARTMENT',
        status: 'ACTIVE',
      }),
    });
    const property = await propertyResponse.json();
    
    await fetch(`${BACKEND_URL}/properties/${property.id}/ownerships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        ownerId: testOwnerId,
        ownershipPercentage: 100,
        ownershipType: 'FULL',
        startDate: new Date().toISOString(),
      }),
    });
    
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const deleteButton = page.locator('button[aria-label*="מחיקה"], button:has-text("מחיקה")').first();
    await deleteButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.click('button:has-text("אישור"), button:has-text("מחק")');
    
    // Should show error
    await page.waitForSelector('text=בעלות, text=בעלים, text=שגיאה', { timeout: 10000 });
  });
});
