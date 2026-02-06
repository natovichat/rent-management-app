/**
 * US5.4 - Search Owners - E2E Tests
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.4 - Search Owners (TDD)', () => {
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

  async function createTestOwner(data: any) {
    await fetch(`${BACKEND_URL}/owners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify(data),
    });
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanupTestData();
    await setTestAccountInStorage(page, 'test-account-1');
    
    await createTestOwner({
      name: 'יוחנן כהן',
      type: 'INDIVIDUAL',
      email: 'yohanan@example.com',
      phone: '050-1234567',
      idNumber: '123456789',
    });
  });

  test('TC-E2E-5.4-001-search-by-name', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find search input
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('יוחנן');
    
    // Wait for debounce
    await page.waitForTimeout(500);
    
    // Verify owner appears
    await page.waitForSelector('text=יוחנן כהן', { timeout: 5000 });
  });

  test('TC-E2E-5.4-002-search-by-email', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('yohanan@example.com');
    await page.waitForTimeout(500);
    
    await page.waitForSelector('text=יוחנן כהן', { timeout: 5000 });
  });

  test('TC-E2E-5.4-003-search-by-phone', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('1234567');
    await page.waitForTimeout(500);
    
    await page.waitForSelector('text=יוחנן כהן', { timeout: 5000 });
  });

  test('TC-E2E-5.4-004-search-case-insensitive', async () => {
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('YOHANAN');
    await page.waitForTimeout(500);
    
    await page.waitForSelector('text=יוחנן כהן', { timeout: 5000 });
  });
});
