/**
 * US5.8 - Set Ownership Percentage and Type - E2E Tests
 * 
 * Test Coverage:
 * - TC-E2E-5.8-001-percentage-accepts-decimal-values
 * - TC-E2E-5.8-002-percentage-validation-range
 * - TC-E2E-5.8-003-ownership-type-dropdown-shows-all-options
 * - TC-E2E-5.8-004-ownership-type-required
 * - TC-E2E-5.8-005-values-saved-correctly
 * - TC-E2E-5.8-006-decimal-precision-maintained
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.8 - Set Ownership Percentage and Type (TDD)', () => {
  let page: Page;
  let testPropertyId: string;
  let testOwnerId: string;
  
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

  async function createTestProperty(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        address: 'רחוב בדיקה 456',
        fileNumber: 'TEST-002',
        type: 'APARTMENT',
        status: 'ACTIVE',
      }),
    });
    const property = await response.json();
    return property.id;
  }

  async function createTestOwner(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/owners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        name: 'בעלים לבדיקת אחוזים',
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
    testPropertyId = await createTestProperty();
    testOwnerId = await createTestOwner();
  });

  test('TC-E2E-5.8-001-percentage-accepts-decimal-values', async () => {
    console.log('\n=== TC-E2E-5.8-001: Percentage Accepts Decimal Values ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill with decimal percentage
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '50.75');
    await page.selectOption('select[name="ownershipType"]', 'PARTIAL');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    await page.click('button:has-text("שמירה")');
    
    await page.waitForSelector('text=בעלות נוספה בהצלחה', { timeout: 10000 });
    
    // Verify decimal value was saved
    const response = await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
      headers: { 'X-Account-Id': 'test-account-1' },
    });
    const data = await response.json();
    const ownership = data.find((o: any) => o.ownerId === testOwnerId);
    
    expect(ownership).toBeTruthy();
    expect(ownership.ownershipPercentage).toBeCloseTo(50.75, 2);
    
    console.log('✅ Decimal percentage values work');
  });

  test('TC-E2E-5.8-002-percentage-validation-range', async () => {
    console.log('\n=== TC-E2E-5.8-002: Percentage Validation Range ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    
    // Try negative value
    await page.fill('input[name="ownershipPercentage"]', '-10');
    await page.selectOption('select[name="ownershipType"]', 'FULL');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    await page.click('button:has-text("שמירה")');
    
    // Should show validation error
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    console.log('✅ Percentage range validation works');
  });

  test('TC-E2E-5.8-003-ownership-type-dropdown-shows-all-options', async () => {
    console.log('\n=== TC-E2E-5.8-003: Ownership Type Dropdown Shows All Options ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Open ownership type dropdown
    await page.click('text=סוג בעלות');
    await page.waitForSelector('[role="listbox"]', { timeout: 3000 });
    
    // Verify all options exist
    const options = page.locator('[role="option"]');
    const optionTexts = await options.allTextContents();
    
    expect(optionTexts).toContain('בעלות מלאה'); // FULL
    expect(optionTexts).toContain('בעלות חלקית'); // PARTIAL
    expect(optionTexts).toContain('שותפות'); // PARTNERSHIP
    expect(optionTexts).toContain('חברה'); // COMPANY
    
    console.log('✅ All ownership type options displayed');
  });

  test('TC-E2E-5.8-004-ownership-type-required', async () => {
    console.log('\n=== TC-E2E-5.8-004: Ownership Type Required ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '100');
    
    // Don't select ownership type
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    await page.click('button:has-text("שמירה")');
    
    // Should show validation error
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    console.log('✅ Ownership type required validation works');
  });

  test('TC-E2E-5.8-005-values-saved-correctly', async () => {
    console.log('\n=== TC-E2E-5.8-005: Values Saved Correctly ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '75.50');
    await page.selectOption('select[name="ownershipType"]', 'PARTNERSHIP');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    await page.click('button:has-text("שמירה")');
    
    await page.waitForSelector('text=בעלות נוספה בהצלחה', { timeout: 10000 });
    
    // Verify values saved correctly via API
    const response = await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
      headers: { 'X-Account-Id': 'test-account-1' },
    });
    const data = await response.json();
    const ownership = data.find((o: any) => o.ownerId === testOwnerId);
    
    expect(ownership).toBeTruthy();
    expect(ownership.ownershipPercentage).toBeCloseTo(75.50, 2);
    expect(ownership.ownershipType).toBe('PARTNERSHIP');
    
    console.log('✅ Values saved correctly');
  });

  test('TC-E2E-5.8-006-decimal-precision-maintained', async () => {
    console.log('\n=== TC-E2E-5.8-006: Decimal Precision Maintained ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Use precise decimal value
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '33.33');
    await page.selectOption('select[name="ownershipType"]', 'PARTIAL');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    await page.click('button:has-text("שמירה")');
    
    await page.waitForSelector('text=בעלות נוספה בהצלחה', { timeout: 10000 });
    
    // Verify precision maintained (2 decimal places)
    const response = await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
      headers: { 'X-Account-Id': 'test-account-1' },
    });
    const data = await response.json();
    const ownership = data.find((o: any) => o.ownerId === testOwnerId);
    
    expect(ownership).toBeTruthy();
    const percentage = typeof ownership.ownershipPercentage === 'string' 
      ? parseFloat(ownership.ownershipPercentage)
      : ownership.ownershipPercentage;
    expect(percentage).toBeCloseTo(33.33, 2);
    
    console.log('✅ Decimal precision maintained');
  });
});
