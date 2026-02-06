/**
 * US5.1 - Create Owner - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation.
 * 
 * Test Coverage:
 * - TC-E2E-5.1-001-create-with-required-fields
 * - TC-E2E-5.1-002-create-with-all-fields
 * - TC-E2E-5.1-003-validation-name-required
 * - TC-E2E-5.1-004-validation-type-required
 * - TC-E2E-5.1-005-validation-email-format
 * - TC-E2E-5.1-006-success-notification-displayed
 * - TC-E2E-5.1-007-owner-appears-in-list
 * - TC-E2E-5.1-008-cancel-creation-flow
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us5.1-create-owner-e2e.spec.ts
 * 
 * EXPECTED: ALL tests FAIL initially (TDD - feature not implemented yet)
 * This is CORRECT - tests written FIRST, implementation comes next!
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.1 - Create Owner (TDD)', () => {
  let page: Page;
  
  test.setTimeout(60000);

  /**
   * Helper: Clean test data before each test
   */
  async function cleanupTestData() {
    console.log('\n=== CLEANING TEST DATA ===');
    try {
      const response = await fetch(`${BACKEND_URL}/owners/test/cleanup`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Deleted ${result.deletedCount || 0} owners`);
      }
    } catch (error) {
      console.warn('⚠️ Error cleaning test data:', error);
    }
  }

  /**
   * Helper: Wait for owners page to be ready
   */
  async function waitForOwnersPageReady() {
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Wait a bit more for React to render
    await page.waitForTimeout(2000);
    
    // Check if we're still on the owners page (not redirected)
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    if (!currentUrl.includes('/owners')) {
      console.error(`❌ Redirected from /owners to ${currentUrl}`);
      // Check console for errors
      const consoleMessages = await page.evaluate(() => {
        return (window as any).__consoleErrors || [];
      });
      if (consoleMessages.length > 0) {
        console.error('Console errors:', consoleMessages);
      }
      throw new Error(`Expected to be on /owners page, but was on ${currentUrl}`);
    }
    
    // Check if page has loaded by looking for any text content
    const pageContent = await page.textContent('body');
    console.log(`Page content preview: ${pageContent?.substring(0, 200)}`);
    
    // Try multiple button selectors
    const createButton = page.locator('button:has-text("בעלים חדש")').first();
    
    // Debug: Check if button exists in DOM (even if not visible)
    const buttonCount = await page.locator('button:has-text("בעלים חדש")').count();
    console.log(`Found ${buttonCount} button(s) with text "בעלים חדש"`);
    
    if (buttonCount === 0) {
      // Try to find any button on the page
      const allButtons = await page.locator('button').all();
      console.log(`Total buttons on page: ${allButtons.length}`);
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent();
        console.log(`  Button ${i}: "${text}"`);
      }
    }
    
    await createButton.waitFor({ state: 'visible', timeout: 15000 });
    
    return createButton;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Clean test data
    await cleanupTestData();
    
    // Set test account in localStorage
    await setTestAccountInStorage(page, 'test-account-1');
    
    // Navigate to owners page
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // TC-E2E-5.1-001: Create owner with required fields only
  // ============================================================================
  test('TC-E2E-5.1-001-create-with-required-fields', async () => {
    console.log('\n=== TC-E2E-5.1-001: Create Owner with Required Fields ===');
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Click create owner button');
    await createButton.click();
    
    console.log('→ Step 3: Wait for create dialog');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    console.log('→ Step 4: Fill required fields');
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
    await page.fill('input[name="name"]', 'יוחנן כהן');
    
    // Select owner type
    await page.click('[data-testid="owner-type-select"], select[name="type"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.click('text=יחיד'); // INDIVIDUAL
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    console.log('→ Step 5: Submit form');
    const submitButton = page.locator('button[type="submit"], button:has-text("שמור"), button:has-text("צור")');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for API response
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/owners') && response.request().method() === 'POST',
      { timeout: 10000 }
    );
    
    await submitButton.click();
    const response = await responsePromise;
    
    console.log(`→ Step 6: Verify API response (status: ${response.status()})`);
    expect(response.status()).toBe(201);
    
    console.log('→ Step 7: Wait for success notification');
    const snackbar = page.locator('.MuiSnackbar-root .MuiAlert-message, [role="alert"]:has-text("נוסף בהצלחה")');
    await expect(snackbar).toBeVisible({ timeout: 10000 });
    const message = await snackbar.textContent();
    expect(message).toContain('בעלים');
    expect(message).toContain('נוסף בהצלחה');
    console.log(`✓ Success notification: ${message}`);
    
    console.log('→ Step 8: Verify owner in list');
    await page.waitForTimeout(1000); // Wait for list refresh
    await expect(page.locator('text=יוחנן כהן')).toBeVisible({ timeout: 5000 });
    console.log('✓ Owner appears in list');
    
    console.log('✓ Test completed successfully\n');
  });

  // ============================================================================
  // TC-E2E-5.1-002: Create owner with all fields
  // ============================================================================
  test('TC-E2E-5.1-002-create-with-all-fields', async () => {
    console.log('\n=== TC-E2E-5.1-002: Create Owner with All Fields ===');
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Open create dialog');
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    console.log('→ Step 3: Fill all fields');
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
    
    // Required fields
    await page.fill('input[name="name"]', 'דוד לוי');
    
    // Select type
    await page.click('[data-testid="owner-type-select"], select[name="type"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.click('text=חברה'); // COMPANY
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    // Optional fields
    await page.fill('input[name="idNumber"]', '123456789');
    await page.fill('input[name="email"]', 'david@example.com');
    await page.fill('input[name="phone"]', '050-1234567');
    await page.fill('textarea[name="address"]', 'רחוב הרצל 1, תל אביב');
    await page.fill('textarea[name="notes"]', 'הערות נוספות');
    
    console.log('→ Step 4: Submit form');
    const submitButton = page.locator('button[type="submit"], button:has-text("שמור")');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/owners') && response.request().method() === 'POST',
      { timeout: 10000 }
    );
    
    await submitButton.click();
    const response = await responsePromise;
    
    expect(response.status()).toBe(201);
    
    console.log('→ Step 5: Verify success notification');
    const snackbar = page.locator('.MuiSnackbar-root .MuiAlert-message');
    await expect(snackbar).toBeVisible({ timeout: 10000 });
    console.log('✓ Success notification displayed');
    
    console.log('→ Step 6: Verify owner in list');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=דוד לוי')).toBeVisible({ timeout: 5000 });
    console.log('✓ Owner appears in list');
    
    console.log('✓ Test completed successfully\n');
  });

  // ============================================================================
  // TC-E2E-5.1-003: Validation - Name required
  // ============================================================================
  test('TC-E2E-5.1-003-validation-name-required', async () => {
    console.log('\n=== TC-E2E-5.1-003: Validation - Name Required ===');
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Open create dialog');
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    console.log('→ Step 3: Select type without filling name');
    await page.waitForSelector('[data-testid="owner-type-select"], select[name="type"]', { state: 'visible', timeout: 5000 });
    await page.click('[data-testid="owner-type-select"], select[name="type"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.click('text=יחיד');
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    
    console.log('→ Step 4: Try to submit without name');
    const submitButton = page.locator('button[type="submit"], button:has-text("שמור")');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Submit button should be disabled or form should show validation error
    const isEnabled = await submitButton.isEnabled();
    if (isEnabled) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }
    
    console.log('→ Step 5: Check for validation error');
    const errorMessage = page.locator('.MuiFormHelperText-root.Mui-error, [role="alert"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.first().textContent();
    expect(errorText).toContain('שם');
    expect(errorText).toContain('חובה');
    console.log(`✓ Validation error displayed: ${errorText}`);
    
    console.log('✓ Test completed successfully\n');
  });

  // ============================================================================
  // TC-E2E-5.1-004: Validation - Type required
  // ============================================================================
  test('TC-E2E-5.1-004-validation-type-required', async () => {
    console.log('\n=== TC-E2E-5.1-004: Validation - Type Required ===');
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Open create dialog');
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    console.log('→ Step 3: Fill name without selecting type');
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
    await page.fill('input[name="name"]', 'משה ישראלי');
    
    console.log('→ Step 4: Try to submit');
    const submitButton = page.locator('button[type="submit"], button:has-text("שמור")');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    const isEnabled = await submitButton.isEnabled();
    if (isEnabled) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }
    
    console.log('→ Step 5: Check for validation error');
    const errorMessage = page.locator('.MuiFormHelperText-root.Mui-error, [role="alert"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.first().textContent();
    expect(errorText).toMatch(/סוג|type|חובה/i);
    console.log(`✓ Validation error displayed: ${errorText}`);
    
    console.log('✓ Test completed successfully\n');
  });

  // ============================================================================
  // TC-E2E-5.1-005: Validation - Email format
  // ============================================================================
  test('TC-E2E-5.1-005-validation-email-format', async () => {
    console.log('\n=== TC-E2E-5.1-005: Validation - Email Format ===');
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Open create dialog');
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    console.log('→ Step 3: Fill required fields');
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
    await page.fill('input[name="name"]', 'שרה כהן');
    
    await page.click('[data-testid="owner-type-select"], select[name="type"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.click('text=יחיד');
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    console.log('→ Step 4: Enter invalid email');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.locator('input[name="email"]').blur();
    await page.waitForTimeout(500);
    
    console.log('→ Step 5: Check for validation error');
    const errorMessage = page.locator('input[name="email"]').locator('..').locator('.MuiFormHelperText-root.Mui-error');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/אימייל|email|תקין/i);
    console.log(`✓ Validation error displayed: ${errorText}`);
    
    console.log('✓ Test completed successfully\n');
  });

  // ============================================================================
  // TC-E2E-5.1-006: Success notification displayed
  // ============================================================================
  test('TC-E2E-5.1-006-success-notification-displayed', async () => {
    console.log('\n=== TC-E2E-5.1-006: Success Notification Displayed ===');
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Create owner');
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
    await page.fill('input[name="name"]', 'אברהם אברהם');
    
    await page.click('[data-testid="owner-type-select"], select[name="type"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.click('text=שותפות'); // PARTNERSHIP
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    console.log('→ Step 3: Submit form');
    const submitButton = page.locator('button[type="submit"], button:has-text("שמור")');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    await submitButton.click();
    
    console.log('→ Step 4: Verify success notification');
    const snackbar = page.locator('.MuiSnackbar-root');
    await expect(snackbar).toBeVisible({ timeout: 10000 });
    
    const alertMessage = snackbar.locator('.MuiAlert-message, [role="alert"]');
    await expect(alertMessage).toBeVisible({ timeout: 5000 });
    
    const message = await alertMessage.textContent();
    expect(message).toContain('בעלים');
    expect(message).toMatch(/נוסף|נוצרה|הושלם/i);
    console.log(`✓ Success notification: ${message}`);
    
    // Verify notification is green/success
    const alertSeverity = await snackbar.locator('.MuiAlert-root').getAttribute('class');
    expect(alertSeverity).toContain('success');
    
    console.log('✓ Test completed successfully\n');
  });

  // ============================================================================
  // TC-E2E-5.1-007: Owner appears in list after creation
  // ============================================================================
  test('TC-E2E-5.1-007-owner-appears-in-list', async () => {
    console.log('\n=== TC-E2E-5.1-007: Owner Appears in List ===');
    
    const ownerName = `בעלים בדיקה ${Date.now()}`;
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Create owner');
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
    await page.fill('input[name="name"]', ownerName);
    
    await page.click('[data-testid="owner-type-select"], select[name="type"]');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.click('text=יחיד');
    await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);
    
    console.log('→ Step 3: Submit form');
    const submitButton = page.locator('button[type="submit"], button:has-text("שמור")');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/owners') && response.request().method() === 'POST',
      { timeout: 10000 }
    );
    
    await submitButton.click();
    await responsePromise;
    
    console.log('→ Step 4: Wait for dialog to close');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(1000);
    
    console.log('→ Step 5: Verify owner in list');
    await expect(page.locator(`text=${ownerName}`)).toBeVisible({ timeout: 10000 });
    console.log(`✓ Owner "${ownerName}" appears in list`);
    
    console.log('✓ Test completed successfully\n');
  });

  // ============================================================================
  // TC-E2E-5.1-008: Cancel creation flow
  // ============================================================================
  test('TC-E2E-5.1-008-cancel-creation-flow', async () => {
    console.log('\n=== TC-E2E-5.1-008: Cancel Creation Flow ===');
    
    console.log('→ Step 1: Navigate to owners page');
    await page.goto(`${FRONTEND_URL}/owners`);
    const createButton = await waitForOwnersPageReady();
    
    console.log('→ Step 2: Open create dialog');
    await createButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    console.log('→ Step 3: Fill some fields');
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
    await page.fill('input[name="name"]', 'בעלים שלא יישמר');
    await page.fill('input[name="email"]', 'test@example.com');
    
    console.log('→ Step 4: Click cancel');
    const cancelButton = page.locator('button:has-text("ביטול"), button:has-text("Cancel")');
    await cancelButton.waitFor({ state: 'visible', timeout: 5000 });
    await cancelButton.click();
    
    console.log('→ Step 5: Verify dialog closed');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    console.log('✓ Dialog closed');
    
    console.log('→ Step 6: Verify owner NOT in list');
    await page.waitForTimeout(1000);
    const ownerInList = await page.locator('text=בעלים שלא יישמר').count();
    expect(ownerInList).toBe(0);
    console.log('✓ Owner not saved (correct behavior)');
    
    console.log('✓ Test completed successfully\n');
  });
});
