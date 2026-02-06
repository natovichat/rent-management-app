/**
 * US1.19 - Add Property Mortgages - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation.
 * 
 * Test Coverage:
 * - TC-E2E-1.19-001: Happy path - Access "Add Mortgage" button from property details page
 * - TC-E2E-1.19-002: Happy path - Create mortgage with all required fields
 * - TC-E2E-1.19-003: Happy path - Create mortgage with optional fields
 * - TC-E2E-1.19-004: Happy path - Mortgage appears in mortgages list after creation
 * - TC-E2E-1.19-005: Happy path - Create mortgage with bank account link
 * - TC-E2E-1.19-006: Validation - Bank name is required
 * - TC-E2E-1.19-007: Validation - Loan amount must be positive
 * - TC-E2E-1.19-008: Validation - Interest rate must be between 0-100
 * - TC-E2E-1.19-009: Validation - Monthly payment must be positive
 * - TC-E2E-1.19-010: Validation - Start date is required
 * - TC-E2E-1.19-011: Success - Success message displayed after creation
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us1.19-add-property-mortgages.e2e-spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US1.19 - Add Property Mortgages (TDD)', () => {
  let testAccountId: string;
  let testPropertyId: string;
  let testBankAccountId: string;

  test.beforeAll(async () => {
    // Fetch test account
    const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
    const accounts = await accountsResponse.json();
    const testAccount = accounts.find((a: any) => a.id === 'test-account-1');
    if (!testAccount) {
      throw new Error('Test account "test-account-1" not found');
    }
    testAccountId = testAccount.id;
  });

  test.beforeEach(async ({ page }) => {
    console.log('\n=== CLEANING TEST DATA ===');
    
    try {
      // Clean mortgages for test account
      console.log('→ Deleting mortgages for test account...');
      const mortgagesResponse = await fetch(`${BACKEND_URL}/mortgages`, {
        headers: {
          'X-Account-Id': testAccountId,
        },
      });
      if (mortgagesResponse.ok) {
        const mortgages = await mortgagesResponse.json();
        for (const mortgage of mortgages) {
          await fetch(`${BACKEND_URL}/mortgages/${mortgage.id}`, {
            method: 'DELETE',
            headers: {
              'X-Account-Id': testAccountId,
            },
          });
        }
        console.log(`✓ Cleaned ${mortgages.length} mortgages`);
      }
    } catch (error) {
      console.warn('⚠️ Error during mortgage cleanup:', error);
    }

    try {
      // Clean bank accounts for test account
      console.log('→ Deleting bank accounts for test account...');
      const bankAccountsResponse = await fetch(`${BACKEND_URL}/bank-accounts`, {
        headers: {
          'X-Account-Id': testAccountId,
        },
      });
      if (bankAccountsResponse.ok) {
        const bankAccounts = await bankAccountsResponse.json();
        for (const bankAccount of bankAccounts) {
          await fetch(`${BACKEND_URL}/bank-accounts/${bankAccount.id}`, {
            method: 'DELETE',
            headers: {
              'X-Account-Id': testAccountId,
            },
          });
        }
        console.log(`✓ Cleaned ${bankAccounts.length} bank accounts`);
      }
    } catch (error) {
      console.warn('⚠️ Error during bank account cleanup:', error);
    }

    try {
      // Clean properties for test account
      console.log('→ Deleting properties for test account...');
      const propertiesResponse = await fetch(`${BACKEND_URL}/properties/test/cleanup`, {
        method: 'DELETE',
        headers: {
          'X-Account-Id': testAccountId,
        },
      });
      if (propertiesResponse.ok) {
        const result = await propertiesResponse.json();
        console.log(`✓ Deleted ${result.deletedCount || 0} properties`);
      }
    } catch (error) {
      console.warn('⚠️ Error during property cleanup:', error);
    }

    // Create a test property
    console.log('→ Creating test property...');
    const createPropertyResponse = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': testAccountId,
      },
      body: JSON.stringify({
        address: 'רחוב הרצל 123, תל אביב',
        fileNumber: 'TEST-MORTGAGE-001',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        city: 'תל אביב',
        country: 'ישראל',
      }),
    });
    
    if (createPropertyResponse.ok) {
      const property = await createPropertyResponse.json();
      testPropertyId = property.id;
      console.log(`✓ Test property created with ID: ${testPropertyId}`);
    } else {
      throw new Error('Failed to create test property');
    }

    // Create a test bank account
    console.log('→ Creating test bank account...');
    const createBankAccountResponse = await fetch(`${BACKEND_URL}/bank-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': testAccountId,
      },
      body: JSON.stringify({
        bankName: 'בנק הפועלים',
        branchNumber: '123',
        accountNumber: '123456',
        accountType: 'CHECKING',
      }),
    });
    
    if (createBankAccountResponse.ok) {
      const bankAccount = await createBankAccountResponse.json();
      testBankAccountId = bankAccount.id;
      console.log(`✓ Test bank account created with ID: ${testBankAccountId}`);
    } else {
      console.warn('⚠️ Failed to create test bank account (optional)');
    }

    // Set test account in localStorage
    await setTestAccountInStorage(page, testAccountId);
    console.log('✓ Test account set in localStorage\n');
  });

  test('TC-E2E-1.19-001: Access "Add Mortgage" button from property details page', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-001: Access Add Mortgage Button ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Navigating to Mortgages tab...');
    // Click on Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await expect(mortgagesTab).toBeVisible({ timeout: 10000 });
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    console.log('→ Verifying "Add Mortgage" button is visible...');
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').or(
      page.locator('button:has-text("משכנתא חדשה")')
    ).first();
    await expect(addMortgageButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Add Mortgage button is visible');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-002: Create mortgage with all required fields', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-002: Create Mortgage with Required Fields ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await expect(mortgagesTab).toBeVisible({ timeout: 10000 });
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').or(
      page.locator('button:has-text("משכנתא חדשה")')
    ).first();
    await expect(addMortgageButton).toBeVisible({ timeout: 10000 });
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✓ Mortgage creation dialog opened');
    
    // Fill required fields
    console.log('→ Filling required fields...');
    
    // Bank name
    const bankField = page.locator('input[name="bank"]').or(
      page.locator('input[placeholder*="מלווה"]')
    ).first();
    await expect(bankField).toBeVisible({ timeout: 5000 });
    await bankField.fill('בנק לאומי');
    console.log('✓ Bank name filled');
    
    // Loan amount
    const loanAmountField = page.locator('input[name="loanAmount"]').or(
      page.locator('input[placeholder*="סכום הלוואה"]')
    ).first();
    await expect(loanAmountField).toBeVisible({ timeout: 5000 });
    await loanAmountField.fill('1000000');
    console.log('✓ Loan amount filled');
    
    // Start date
    const startDateField = page.locator('input[name="startDate"]').or(
      page.locator('input[type="date"]').first()
    ).first();
    await expect(startDateField).toBeVisible({ timeout: 5000 });
    const today = new Date().toISOString().split('T')[0];
    await startDateField.fill(today);
    console.log('✓ Start date filled');
    
    // Monthly payment (required in form)
    const monthlyPaymentField = page.locator('input[name="monthlyPayment"]').or(
      page.locator('input[placeholder*="תשלום חודשי"]')
    ).first();
    if (await monthlyPaymentField.isVisible({ timeout: 2000 })) {
      await monthlyPaymentField.fill('5000');
      console.log('✓ Monthly payment filled');
    }
    
    // Interest rate (required in form)
    const interestRateField = page.locator('input[name="interestRate"]').or(
      page.locator('input[placeholder*="ריבית"]')
    ).first();
    if (await interestRateField.isVisible({ timeout: 2000 })) {
      await interestRateField.fill('3.5');
      console.log('✓ Interest rate filled');
    }
    
    // Term months (required in form)
    const termMonthsField = page.locator('input[name="termMonths"]').or(
      page.locator('input[placeholder*="תקופה"]')
    ).first();
    if (await termMonthsField.isVisible({ timeout: 2000 })) {
      await termMonthsField.fill('240');
      console.log('✓ Term months filled');
    }
    
    // Ensure status field is set (required field)
    const statusSelect = page.locator('div[role="combobox"]').filter({ hasText: /סטטוס|פעיל|סולק/ }).first();
    if (await statusSelect.isVisible({ timeout: 2000 })) {
      await statusSelect.click();
      await page.locator('li[role="option"]:has-text("פעיל")').first().click();
      console.log('✓ Status set to ACTIVE');
    }
    
    // Submit form
    console.log('→ Submitting mortgage form...');
    
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Set up response listener BEFORE clicking
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/mortgages') && response.request().method() === 'POST',
      { timeout: 15000 }
    );
    
    const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').or(
      page.locator('button:has-text("שמור")')
    ).first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    
    // Check for validation errors before submitting
    const validationErrors = page.locator('.MuiFormHelperText-root.Mui-error');
    const errorCount = await validationErrors.count();
    if (errorCount > 0) {
      console.error(`✗ Form has ${errorCount} validation errors:`);
      for (let i = 0; i < errorCount; i++) {
        const errorText = await validationErrors.nth(i).textContent();
        console.error(`  - ${errorText}`);
      }
      throw new Error(`Form validation failed with ${errorCount} errors`);
    }
    
    // Check form values before submitting
    const formValues = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return null;
      const formData = new FormData(form as HTMLFormElement);
      const values: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        values[key] = value;
      }
      return values;
    });
    console.log('Form values before submit:', formValues);
    
    await submitButton.click();
    console.log('✓ Submit button clicked');
    
    // Wait a bit to see if form validation prevents submission
    await page.waitForTimeout(500);
    
    // Check if dialog is still open (form didn't submit)
    const dialog = page.locator('[role="dialog"]');
    const dialogStillOpen = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (dialogStillOpen) {
      // Form didn't submit - check for errors
      const errors = await page.locator('.MuiFormHelperText-root.Mui-error').allTextContents();
      if (errors.length > 0) {
        throw new Error(`Form validation errors: ${errors.join(', ')}`);
      }
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors: ${consoleErrors.join(', ')}`);
      }
      throw new Error('Form submission was prevented - no API call made and no validation errors found');
    }
    
    // Wait for API response
    let response;
    try {
      response = await responsePromise;
      console.log(`✓ API response received: ${response.status()}`);
    } catch (error) {
      if (consoleErrors.length > 0) {
        console.error('Browser console errors:', consoleErrors);
        throw new Error(`API call failed. Console errors: ${consoleErrors.join(', ')}`);
      }
      throw error;
    }
    
    if (response.status() !== 201) {
      const responseBody = await response.text();
      console.error(`✗ API error: ${response.status()} - ${responseBody}`);
      throw new Error(`API returned ${response.status()}: ${responseBody}`);
    }
    
    // Wait for success message using testid (more reliable)
    console.log('→ Waiting for success message...');
    const snackbarMessage = page.locator('[data-testid="snackbar-message-text"]');
    await expect(snackbarMessage).toBeVisible({ timeout: 10000 });
    await expect(snackbarMessage).toContainText('משכנתא נוספה בהצלחה', { timeout: 5000 });
    console.log('✓ Success message displayed');
    
    // Verify dialog closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Dialog closed');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-003: Create mortgage with optional fields', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-003: Create Mortgage with Optional Fields ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await expect(mortgagesTab).toBeVisible({ timeout: 10000 });
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').or(
      page.locator('button:has-text("משכנתא חדשה")')
    ).first();
    await expect(addMortgageButton).toBeVisible({ timeout: 10000 });
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill required fields
    const bankField = page.locator('input[name="bank"]').first();
    await bankField.fill('בנק מזרחי');
    
    const loanAmountField = page.locator('input[name="loanAmount"]').first();
    await loanAmountField.fill('2000000');
    
    const startDateField = page.locator('input[name="startDate"]').first();
    const today = new Date().toISOString().split('T')[0];
    await startDateField.fill(today);
    
    // Fill optional fields
    console.log('→ Filling optional fields...');
    
    const interestRateField = page.locator('input[name="interestRate"]').first();
    if (await interestRateField.isVisible({ timeout: 2000 })) {
      await interestRateField.fill('4.2');
      console.log('✓ Interest rate filled');
    }
    
    const monthlyPaymentField = page.locator('input[name="monthlyPayment"]').first();
    if (await monthlyPaymentField.isVisible({ timeout: 2000 })) {
      await monthlyPaymentField.fill('8000');
      console.log('✓ Monthly payment filled');
    }
    
    // Notes (optional)
    const notesField = page.locator('textarea[name="notes"]').or(
      page.locator('textarea[placeholder*="הערות"]')
    ).first();
    if (await notesField.isVisible({ timeout: 2000 })) {
      await notesField.fill('משכנתא לקניית נכס להשקעה');
      console.log('✓ Notes filled');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
    await submitButton.click();
    
    // Wait for success
    const successMessage = page.locator('text=נוסף בהצלחה').first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    console.log('✓ Mortgage created with optional fields');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-004: Mortgage appears in mortgages list after creation', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-004: Mortgage Appears in List ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await expect(mortgagesTab).toBeVisible({ timeout: 10000 });
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Create mortgage via API first
    console.log('→ Creating mortgage via API...');
    const createMortgageResponse = await fetch(`${BACKEND_URL}/mortgages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Id': testAccountId,
      },
      body: JSON.stringify({
        propertyId: testPropertyId,
        bank: 'בנק דיסקונט',
        loanAmount: 1500000,
        interestRate: 3.8,
        monthlyPayment: 7500,
        startDate: new Date().toISOString(),
        status: 'ACTIVE',
      }),
    });
    
    if (!createMortgageResponse.ok) {
      throw new Error('Failed to create mortgage via API');
    }
    const mortgage = await createMortgageResponse.json();
    console.log(`✓ Mortgage created with ID: ${mortgage.id}`);
    
    // Reload page to see new mortgage
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab again
    await mortgagesTab.click();
    await page.waitForTimeout(1000);
    
    // Verify mortgage appears in list
    console.log('→ Verifying mortgage appears in list...');
    const mortgageCard = page.locator(`text=בנק דיסקונט`).first();
    await expect(mortgageCard).toBeVisible({ timeout: 10000 });
    console.log('✓ Mortgage appears in list');
    
    // Verify loan amount is displayed
    const loanAmount = page.locator('text=1,500,000').or(
      page.locator('text=₪1,500,000')
    ).first();
    await expect(loanAmount).toBeVisible({ timeout: 5000 });
    console.log('✓ Loan amount displayed');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-005: Create mortgage with bank account link', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-005: Create Mortgage with Bank Account ===');
    
    test.skip(!testBankAccountId, 'Bank account not available');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await expect(mortgagesTab).toBeVisible({ timeout: 10000 });
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').first();
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill required fields
    const bankField = page.locator('input[name="bank"]').first();
    await bankField.fill('בנק הפועלים');
    
    const loanAmountField = page.locator('input[name="loanAmount"]').first();
    await loanAmountField.fill('3000000');
    
    const startDateField = page.locator('input[name="startDate"]').first();
    const today = new Date().toISOString().split('T')[0];
    await startDateField.fill(today);
    
    // Select bank account
    console.log('→ Selecting bank account...');
    const bankAccountSelect = page.locator('select[name="bankAccountId"]').or(
      page.locator('[role="combobox"]').filter({ hasText: 'חשבון בנק' })
    ).first();
    
    if (await bankAccountSelect.isVisible({ timeout: 2000 })) {
      await bankAccountSelect.click();
      await page.waitForTimeout(500);
      
      // Select the bank account option
      const bankAccountOption = page.locator(`text=בנק הפועלים`).or(
        page.locator(`[role="option"]:has-text("123456")`)
      ).first();
      await expect(bankAccountOption).toBeVisible({ timeout: 5000 });
      await bankAccountOption.click();
      console.log('✓ Bank account selected');
    }
    
    // Fill other optional fields
    const monthlyPaymentField = page.locator('input[name="monthlyPayment"]').first();
    if (await monthlyPaymentField.isVisible({ timeout: 2000 })) {
      await monthlyPaymentField.fill('12000');
    }
    
    const interestRateField = page.locator('input[name="interestRate"]').first();
    if (await interestRateField.isVisible({ timeout: 2000 })) {
      await interestRateField.fill('4.0');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
    await submitButton.click();
    
    // Wait for success
    const successMessage = page.locator('text=נוסף בהצלחה').first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    console.log('✓ Mortgage created with bank account link');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-006: Validation - Bank name is required', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-006: Validate Bank Name Required ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').first();
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Try to submit without bank name
    console.log('→ Attempting to submit without bank name...');
    const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
    await submitButton.click();
    
    // Verify validation error (wait a bit for validation to trigger)
    await page.waitForTimeout(500);
    const errorMessage = page.locator('text=מלווה הוא שדה חובה').or(
      page.locator('text=שדה חובה').or(
        page.locator('text=חובה')
      )
    ).first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    console.log('✓ Validation error displayed for bank name');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-007: Validation - Loan amount must be positive', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-007: Validate Loan Amount Positive ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').first();
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill bank name
    const lenderField = page.locator('input[name="lender"]').first();
    await lenderField.fill('בנק לאומי');
    
    // Fill negative loan amount
    console.log('→ Entering negative loan amount...');
    const loanAmountField = page.locator('input[name="loanAmount"]').first();
    await loanAmountField.fill('-1000');
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
    await submitButton.click();
    
    // Verify validation error
    const errorMessage = page.locator('text=חיובי').or(
      page.locator('text=חייב להיות חיובי')
    ).first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    console.log('✓ Validation error displayed for negative loan amount');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-008: Validation - Interest rate must be between 0-100', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-008: Validate Interest Rate Range ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').first();
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill required fields
    const bankField = page.locator('input[name="bank"]').first();
    await bankField.fill('בנק לאומי');
    
    const loanAmountField = page.locator('input[name="loanAmount"]').first();
    await loanAmountField.fill('1000000');
    
    // Fill invalid interest rate (>100)
    console.log('→ Entering invalid interest rate (>100)...');
    const interestRateField = page.locator('input[name="interestRate"]').first();
    if (await interestRateField.isVisible({ timeout: 2000 })) {
      await interestRateField.fill('150');
      
      // Try to submit
      const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
      await submitButton.click();
      
      // Verify validation error
      const errorMessage = page.locator('text=100').or(
        page.locator('text=בין 0 ל-100')
      ).first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      console.log('✓ Validation error displayed for interest rate >100');
    } else {
      console.log('⚠️ Interest rate field not found, skipping test');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-009: Validation - Monthly payment must be positive', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-009: Validate Monthly Payment Positive ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').first();
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill required fields
    const bankField = page.locator('input[name="bank"]').first();
    await bankField.fill('בנק לאומי');
    
    const loanAmountField = page.locator('input[name="loanAmount"]').first();
    await loanAmountField.fill('1000000');
    
    // Fill negative monthly payment
    console.log('→ Entering negative monthly payment...');
    const monthlyPaymentField = page.locator('input[name="monthlyPayment"]').first();
    if (await monthlyPaymentField.isVisible({ timeout: 2000 })) {
      await monthlyPaymentField.fill('-5000');
      
      // Try to submit
      const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
      await submitButton.click();
      
      // Verify validation error
      const errorMessage = page.locator('text=חיובי').or(
        page.locator('text=חייב להיות חיובי')
      ).first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      console.log('✓ Validation error displayed for negative monthly payment');
    } else {
      console.log('⚠️ Monthly payment field not found, skipping test');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-010: Validation - Start date is required', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-010: Validate Start Date Required ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').first();
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill bank name and loan amount (but not start date)
    const bankField = page.locator('input[name="bank"]').first();
    await bankField.fill('בנק לאומי');
    
    const loanAmountField = page.locator('input[name="loanAmount"]').first();
    await loanAmountField.fill('1000000');
    
    // Clear start date if it has a default value
    const startDateField = page.locator('input[name="startDate"]').first();
    await startDateField.clear();
    
    // Try to submit without start date
    console.log('→ Attempting to submit without start date...');
    const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
    await submitButton.click();
    
    // Verify validation error
    const errorMessage = page.locator('text=תאריך התחלה').or(
      page.locator('text=שדה חובה')
    ).first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    console.log('✓ Validation error displayed for start date');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.19-011: Success message displayed after creation', async ({ page }) => {
    console.log('\n=== TC-E2E-1.19-011: Success Message Displayed ===');
    
    await page.goto(`${FRONTEND_URL}/properties/${testPropertyId}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Mortgages tab
    const mortgagesTab = page.locator('button[role="tab"]:has-text("משכנתאות")');
    await mortgagesTab.click();
    await page.waitForTimeout(500);
    
    // Click "Add Mortgage" button
    const addMortgageButton = page.locator('button:has-text("הוסף משכנתא")').first();
    await addMortgageButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Fill all required fields
    const bankField = page.locator('input[name="bank"]').first();
    await bankField.fill('בנק מזרחי');
    
    const loanAmountField = page.locator('input[name="loanAmount"]').first();
    await loanAmountField.fill('2500000');
    
    const startDateField = page.locator('input[name="startDate"]').first();
    const today = new Date().toISOString().split('T')[0];
    await startDateField.fill(today);
    
    const monthlyPaymentField = page.locator('input[name="monthlyPayment"]').first();
    if (await monthlyPaymentField.isVisible({ timeout: 2000 })) {
      await monthlyPaymentField.fill('10000');
    }
    
    const interestRateField = page.locator('input[name="interestRate"]').first();
    if (await interestRateField.isVisible({ timeout: 2000 })) {
      await interestRateField.fill('4.5');
    }
    
    // Submit form
    console.log('→ Submitting mortgage form...');
    const submitButton = page.locator('button[type="submit"]:has-text("שמירה")').first();
    await submitButton.click();
    
    // Wait for success message
    console.log('→ Waiting for success message...');
    const successMessage = page.locator('text=נוסף בהצלחה').or(
      page.locator('text=משכנתא נוספה בהצלחה')
    ).first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    console.log('✓ Success message displayed');
    
    // Verify message disappears after timeout
    await expect(successMessage).not.toBeVisible({ timeout: 10000 });
    console.log('✓ Success message auto-dismissed');
    
    console.log('✓ Test completed successfully\n');
  });
});
