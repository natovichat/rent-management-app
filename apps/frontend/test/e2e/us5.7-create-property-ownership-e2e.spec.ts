/**
 * US5.7 - Create Property Ownership Record - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite for creating property ownership records.
 * 
 * Test Coverage:
 * - TC-E2E-5.7-001-create-ownership-with-all-fields
 * - TC-E2E-5.7-002-create-ownership-with-required-fields-only
 * - TC-E2E-5.7-003-validation-owner-required
 * - TC-E2E-5.7-004-validation-percentage-range
 * - TC-E2E-5.7-005-validation-start-date-required
 * - TC-E2E-5.7-006-validation-end-date-after-start-date
 * - TC-E2E-5.7-007-ownership-appears-in-history
 * - TC-E2E-5.7-008-inline-owner-creation-works
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us5.7-create-property-ownership-e2e.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.7 - Create Property Ownership Record (TDD)', () => {
  let page: Page;
  let testPropertyId: string;
  let testOwnerId: string;
  
  test.setTimeout(90000);

  /**
   * Helper: Clean test data
   */
  async function cleanupTestData() {
    console.log('\n=== CLEANING TEST DATA ===');
    try {
      // Clean owners
      await fetch(`${BACKEND_URL}/owners/test/cleanup`, {
        method: 'DELETE',
        headers: { 'X-Account-Id': 'test-account-1' },
      });
      
      // Clean properties
      await fetch(`${BACKEND_URL}/properties/test/cleanup`, {
        method: 'DELETE',
        headers: { 'X-Account-Id': 'test-account-1' },
      });
    } catch (error) {
      console.warn('⚠️ Error cleaning test data:', error);
    }
  }

  /**
   * Helper: Create test property
   */
  async function createTestProperty(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        address: 'רחוב בדיקה 123',
        fileNumber: 'TEST-001',
        type: 'APARTMENT',
        status: 'ACTIVE',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create test property: ${response.statusText}`);
    }
    
    const property = await response.json();
    return property.id;
  }

  /**
   * Helper: Create test owner
   */
  async function createTestOwner(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/owners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': 'test-account-1',
      },
      body: JSON.stringify({
        name: 'בעלים בדיקה',
        type: 'INDIVIDUAL',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create test owner: ${response.statusText}`);
    }
    
    const owner = await response.json();
    return owner.id;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanupTestData();
    await setTestAccountInStorage(page, 'test-account-1');
    
    // Create test property and owner
    testPropertyId = await createTestProperty();
    testOwnerId = await createTestOwner();
    
    console.log(`✓ Test property ID: ${testPropertyId}`);
    console.log(`✓ Test owner ID: ${testOwnerId}`);
  });

  // ============================================================================
  // TC-E2E-5.7-001: Create ownership with all fields
  // ============================================================================
  test('TC-E2E-5.7-001-create-ownership-with-all-fields', async () => {
    console.log('\n=== TC-E2E-5.7-001: Create Ownership with All Fields ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to ownership tab
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    // Click add ownership button
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill all fields
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '50.5');
    await page.selectOption('select[name="ownershipType"]', 'PARTIAL');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await page.fill('input[name="endDate"]', futureDate.toISOString().split('T')[0]);
    
    await page.fill('textarea[name="notes"]', 'הערות על הבעלות');
    
    // Submit
    await page.click('button:has-text("שמירה")');
    
    // Wait for success
    await page.waitForSelector('text=בעלות נוספה בהצלחה', { timeout: 10000 });
    
    // Verify ownership appears in history
    await page.waitForSelector('text=בעלים בדיקה', { timeout: 5000 });
    
    console.log('✅ Ownership created with all fields');
  });

  // ============================================================================
  // TC-E2E-5.7-002: Create ownership with required fields only
  // ============================================================================
  test('TC-E2E-5.7-002-create-ownership-with-required-fields-only', async () => {
    console.log('\n=== TC-E2E-5.7-002: Create Ownership with Required Fields Only ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill only required fields
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '100');
    await page.selectOption('select[name="ownershipType"]', 'FULL');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    // Submit
    await page.click('button:has-text("שמירה")');
    
    await page.waitForSelector('text=בעלות נוספה בהצלחה', { timeout: 10000 });
    await page.waitForSelector('text=בעלים בדיקה', { timeout: 5000 });
    
    console.log('✅ Ownership created with required fields only');
  });

  // ============================================================================
  // TC-E2E-5.7-003: Validation - owner required
  // ============================================================================
  test('TC-E2E-5.7-003-validation-owner-required', async () => {
    console.log('\n=== TC-E2E-5.7-003: Validation - Owner Required ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Try to submit without selecting owner
    await page.fill('input[name="ownershipPercentage"]', '100');
    await page.selectOption('select[name="ownershipType"]', 'FULL');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    // Submit - should show validation error
    await page.click('button:has-text("שמירה")');
    
    // Wait for validation error (form should not submit)
    await page.waitForTimeout(2000);
    
    // Dialog should still be open (validation prevented submission)
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    console.log('✅ Owner validation works');
  });

  // ============================================================================
  // TC-E2E-5.7-004: Validation - percentage range (0-100)
  // ============================================================================
  test('TC-E2E-5.7-004-validation-percentage-range', async () => {
    console.log('\n=== TC-E2E-5.7-004: Validation - Percentage Range ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    
    // Try invalid percentage (> 100)
    await page.fill('input[name="ownershipPercentage"]', '150');
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

  // ============================================================================
  // TC-E2E-5.7-005: Validation - start date required
  // ============================================================================
  test('TC-E2E-5.7-005-validation-start-date-required', async () => {
    console.log('\n=== TC-E2E-5.7-005: Validation - Start Date Required ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '100');
    await page.selectOption('select[name="ownershipType"]', 'FULL');
    
    // Don't fill start date
    
    await page.click('button:has-text("שמירה")');
    
    // Should show validation error
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    console.log('✅ Start date validation works');
  });

  // ============================================================================
  // TC-E2E-5.7-006: Validation - end date after start date
  // ============================================================================
  test('TC-E2E-5.7-006-validation-end-date-after-start-date', async () => {
    console.log('\n=== TC-E2E-5.7-006: Validation - End Date After Start Date ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.selectOption('select[name="ownerId"], [role="combobox"]', testOwnerId);
    await page.fill('input[name="ownershipPercentage"]', '100');
    await page.selectOption('select[name="ownershipType"]', 'FULL');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    
    // Set end date before start date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await page.fill('input[name="endDate"]', pastDate.toISOString().split('T')[0]);
    
    await page.click('button:has-text("שמירה")');
    
    // Should show validation error
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    console.log('✅ End date validation works');
  });

  // ============================================================================
  // TC-E2E-5.7-007: Ownership appears in history
  // ============================================================================
  test('TC-E2E-5.7-007-ownership-appears-in-history', async () => {
    console.log('\n=== TC-E2E-5.7-007: Ownership Appears in History ===');
    
    // Create ownership via API first
    const response = await fetch(`${BACKEND_URL}/properties/${testPropertyId}/ownerships`, {
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
    
    expect(response.ok).toBeTruthy();
    
    // Navigate to property page
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    // Verify ownership appears in table
    await page.waitForSelector('text=בעלים בדיקה', { timeout: 5000 });
    
    console.log('✅ Ownership appears in history');
  });

  // ============================================================================
  // TC-E2E-5.7-008: Inline owner creation works
  // ============================================================================
  test('TC-E2E-5.7-008-inline-owner-creation-works', async () => {
    console.log('\n=== TC-E2E-5.7-008: Inline Owner Creation Works ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button[role="tab"]:has-text("בעלות")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("הוסף בעלות")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Click "+ Create New Owner" option
    await page.click('text=+ צור בעלים חדש');
    await page.waitForSelector('[role="dialog"]:has-text("צור בעלים חדש")', { timeout: 5000 });
    
    // Fill owner form
    await page.fill('input[name="name"]', 'בעלים חדש מהטופס');
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=חברה');
    await page.waitForTimeout(300);
    
    // Submit owner creation
    await page.click('button:has-text("צור בעלים")');
    
    // Wait for owner to be created and auto-selected
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Verify new owner is selected in ownership form
    // (ownership dialog should still be open)
    const ownershipDialog = page.locator('[role="dialog"]:has-text("הוסף בעלות")');
    await expect(ownershipDialog).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Inline owner creation works');
  });
});
