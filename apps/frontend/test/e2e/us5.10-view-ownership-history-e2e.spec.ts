/**
 * US5.10 - View Ownership History Per Property - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.10 - View Ownership History Per Property (TDD)', () => {
  let page: Page;
  let testPropertyId: string;
  let testOwner1Id: string;
  let testOwner2Id: string;
  
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
        address: 'רחוב היסטוריה 999',
        fileNumber: 'TEST-HISTORY',
        type: 'APARTMENT',
        status: 'ACTIVE',
      }),
    });
    return (await response.json()).id;
  }

  async function createTestOwner(name: string) {
    const response = await fetch(`${BACKEND_URL}/owners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({ name, type: 'INDIVIDUAL' }),
    });
    return (await response.json()).id;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanupTestData();
    await setTestAccountInStorage(page, 'test-account-1');
    testPropertyId = await createTestProperty();
    testOwner1Id = await createTestOwner('בעלים היסטורי 1');
    testOwner2Id = await createTestOwner('בעלים היסטורי 2');
  });

  test('TC-E2E-5.10-001-ownership-history-section-visible', async () => {
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to ownership tab
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    // Verify ownership history section exists
    const historySection = page.locator('text=בעלות, text=היסטוריה');
    await expect(historySection.first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-E2E-5.10-002-displays-all-ownership-records', async () => {
    // Create multiple ownerships
    await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        ownerId: testOwner1Id,
        ownershipPercentage: 100,
        ownershipType: 'FULL',
        startDate: new Date().toISOString(),
      }),
    });
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    // Verify ownership appears
    await page.waitForSelector('text=בעלים היסטורי 1', { timeout: 5000 });
  });

  test('TC-E2E-5.10-003-shows-active-and-historical', async () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    
    // Create historical ownership (with end date)
    await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        ownerId: testOwner1Id,
        ownershipPercentage: 100,
        ownershipType: 'FULL',
        startDate: pastDate.toISOString(),
        endDate: new Date().toISOString(),
      }),
    });
    
    // Create active ownership
    await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        ownerId: testOwner2Id,
        ownershipPercentage: 100,
        ownershipType: 'FULL',
        startDate: new Date().toISOString(),
      }),
    });
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    // Verify both appear
    await page.waitForSelector('text=בעלים היסטורי 1', { timeout: 5000 });
    await page.waitForSelector('text=בעלים היסטורי 2', { timeout: 5000 });
  });

  test('TC-E2E-5.10-004-shows-total-percentage', async () => {
    await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        ownerId: testOwner1Id,
        ownershipPercentage: 100,
        ownershipType: 'FULL',
        startDate: new Date().toISOString(),
      }),
    });
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    // Verify total percentage displayed
    await page.waitForSelector('text=100%', { timeout: 5000 });
  });
});
