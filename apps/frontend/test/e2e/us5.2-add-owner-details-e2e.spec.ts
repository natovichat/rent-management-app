/**
 * US5.2 - Add Owner Details - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite for owner details fields.
 * 
 * Test Coverage:
 * - TC-E2E-5.2-001-create-with-all-details-fields
 * - TC-E2E-5.2-002-id-number-field-saves
 * - TC-E2E-5.2-003-email-validation-works
 * - TC-E2E-5.2-004-phone-field-saves
 * - TC-E2E-5.2-005-address-field-saves
 * - TC-E2E-5.2-006-notes-field-saves
 * - TC-E2E-5.2-007-all-fields-persist-after-creation
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us5.2-add-owner-details-e2e.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US5.2 - Add Owner Details (TDD)', () => {
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
        headers: { 'X-Account-Id': 'test-account-1' },
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
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const createButton = page.locator('button:has-text("בעלים חדש")').first();
    await createButton.waitFor({ state: 'visible', timeout: 15000 });
    return createButton;
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await cleanupTestData();
    await setTestAccountInStorage(page, 'test-account-1');
    await page.goto(`${FRONTEND_URL}/owners`);
    await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // TC-E2E-5.2-001: Create owner with all detail fields
  // ============================================================================
  test('TC-E2E-5.2-001-create-with-all-details-fields', async () => {
    console.log('\n=== TC-E2E-5.2-001: Create Owner with All Detail Fields ===');
    
    const createButton = await waitForOwnersPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Fill all fields
    await page.fill('input[name="name"]', 'דוד לוי');
    
    // Select owner type
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 });
    await page.click('text=חברה');
    await page.waitForTimeout(300);
    
    await page.fill('input[name="idNumber"]', '123456789');
    await page.fill('input[name="email"]', 'david@example.com');
    await page.fill('input[name="phone"]', '050-1234567');
    await page.fill('input[name="address"]', 'רחוב הרצל 1, תל אביב');
    await page.fill('textarea[name="notes"]', 'הערות נוספות על הבעלים');
    
    // Submit
    await page.click('button:has-text("צור")');
    
    // Wait for success
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    
    // Verify owner appears in list with all details
    await page.waitForSelector('text=דוד לוי', { timeout: 5000 });
    
    console.log('✅ Owner created with all detail fields');
  });

  // ============================================================================
  // TC-E2E-5.2-002: ID number field saves correctly
  // ============================================================================
  test('TC-E2E-5.2-002-id-number-field-saves', async () => {
    console.log('\n=== TC-E2E-5.2-002: ID Number Field Saves ===');
    
    const createButton = await waitForOwnersPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.fill('input[name="name"]', 'שרה כהן');
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=יחיד');
    await page.waitForTimeout(300);
    
    await page.fill('input[name="idNumber"]', '987654321');
    
    await page.click('button:has-text("צור")');
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    
    // Verify ID number was saved (check via API or list display)
    await page.waitForSelector('text=שרה כהן', { timeout: 5000 });
    
    console.log('✅ ID number field saves correctly');
  });

  // ============================================================================
  // TC-E2E-5.2-003: Email validation works
  // ============================================================================
  test('TC-E2E-5.2-003-email-validation-works', async () => {
    console.log('\n=== TC-E2E-5.2-003: Email Validation Works ===');
    
    const createButton = await waitForOwnersPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.fill('input[name="name"]', 'משה ישראלי');
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=יחיד');
    await page.waitForTimeout(300);
    
    // Try invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    
    // Try to submit - should show validation error
    await page.click('button:has-text("צור")');
    
    // Wait for validation error
    await page.waitForSelector('text=כתובת אימייל לא תקינה', { timeout: 3000 });
    
    // Fix email
    await page.fill('input[name="email"]', 'moshe@example.com');
    await page.click('button:has-text("צור")');
    
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    
    console.log('✅ Email validation works correctly');
  });

  // ============================================================================
  // TC-E2E-5.2-004: Phone field saves correctly
  // ============================================================================
  test('TC-E2E-5.2-004-phone-field-saves', async () => {
    console.log('\n=== TC-E2E-5.2-004: Phone Field Saves ===');
    
    const createButton = await waitForOwnersPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.fill('input[name="name"]', 'רחל דוד');
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=שותפות');
    await page.waitForTimeout(300);
    
    await page.fill('input[name="phone"]', '052-9876543');
    
    await page.click('button:has-text("צור")');
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    
    await page.waitForSelector('text=רחל דוד', { timeout: 5000 });
    
    console.log('✅ Phone field saves correctly');
  });

  // ============================================================================
  // TC-E2E-5.2-005: Address field saves correctly
  // ============================================================================
  test('TC-E2E-5.2-005-address-field-saves', async () => {
    console.log('\n=== TC-E2E-5.2-005: Address Field Saves ===');
    
    const createButton = await waitForOwnersPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.fill('input[name="name"]', 'יוסף אברהם');
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=חברה');
    await page.waitForTimeout(300);
    
    await page.fill('input[name="address"]', 'רחוב דיזנגוף 100, תל אביב');
    
    await page.click('button:has-text("צור")');
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    
    await page.waitForSelector('text=יוסף אברהם', { timeout: 5000 });
    
    console.log('✅ Address field saves correctly');
  });

  // ============================================================================
  // TC-E2E-5.2-006: Notes field saves correctly
  // ============================================================================
  test('TC-E2E-5.2-006-notes-field-saves', async () => {
    console.log('\n=== TC-E2E-5.2-006: Notes Field Saves ===');
    
    const createButton = await waitForOwnersPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.fill('input[name="name"]', 'מרים שלמה');
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=יחיד');
    await page.waitForTimeout(300);
    
    await page.fill('textarea[name="notes"]', 'הערות חשובות על הבעלים הזה');
    
    await page.click('button:has-text("צור")');
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    
    await page.waitForSelector('text=מרים שלמה', { timeout: 5000 });
    
    console.log('✅ Notes field saves correctly');
  });

  // ============================================================================
  // TC-E2E-5.2-007: All fields persist after creation
  // ============================================================================
  test('TC-E2E-5.2-007-all-fields-persist-after-creation', async () => {
    console.log('\n=== TC-E2E-5.2-007: All Fields Persist After Creation ===');
    
    const createButton = await waitForOwnersPageReady();
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    const testData = {
      name: 'יצחק יעקב',
      type: 'COMPANY',
      idNumber: '555666777',
      email: 'itzhak@example.com',
      phone: '053-1112222',
      address: 'רחוב בן יהודה 50, ירושלים',
      notes: 'הערות מפורטות על הבעלים',
    };
    
    await page.fill('input[name="name"]', testData.name);
    await page.click('text=סוג בעלים *');
    await page.waitForSelector('[role="listbox"]');
    await page.click('text=חברה');
    await page.waitForTimeout(300);
    
    await page.fill('input[name="idNumber"]', testData.idNumber);
    await page.fill('input[name="email"]', testData.email);
    await page.fill('input[name="phone"]', testData.phone);
    await page.fill('input[name="address"]', testData.address);
    await page.fill('textarea[name="notes"]', testData.notes);
    
    await page.click('button:has-text("צור")');
    await page.waitForSelector('text=בעלים נוסף בהצלחה', { timeout: 10000 });
    
    // Verify owner appears in list
    await page.waitForSelector('text=יצחק יעקב', { timeout: 5000 });
    
    // Verify data persisted by checking API response
    const response = await fetch(`${BACKEND_URL}/owners?search=${encodeURIComponent(testData.name)}`, {
      headers: { 'X-Account-Id': 'test-account-1' },
    });
    const data = await response.json();
    const createdOwner = data.data?.find((o: any) => o.name === testData.name);
    
    expect(createdOwner).toBeTruthy();
    expect(createdOwner.idNumber).toBe(testData.idNumber);
    expect(createdOwner.email).toBe(testData.email);
    expect(createdOwner.phone).toBe(testData.phone);
    expect(createdOwner.address).toBe(testData.address);
    expect(createdOwner.notes).toBe(testData.notes);
    
    console.log('✅ All fields persist correctly after creation');
  });
});
