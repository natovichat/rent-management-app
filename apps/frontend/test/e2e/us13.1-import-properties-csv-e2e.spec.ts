/**
 * US13.1 - Import Properties from CSV - E2E Tests (Test-Driven Development)
 * 
 * QA Team Leader: Comprehensive E2E test suite written FIRST before implementation.
 * 
 * Test Coverage:
 * - TC-E2E-13.1-001: Happy path - Upload valid CSV file with all required fields
 * - TC-E2E-13.1-002: Happy path - Upload CSV with optional fields
 * - TC-E2E-13.1-003: Error path - Missing required columns validation
 * - TC-E2E-13.1-004: Error path - Invalid property type enum value
 * - TC-E2E-13.1-005: Error path - Invalid property status enum value
 * - TC-E2E-13.1-006: Error path - Invalid numeric fields (negative area, value)
 * - TC-E2E-13.1-007: Preview - Display import preview with validation status
 * - TC-E2E-13.1-008: Preview - Highlight invalid rows with error messages
 * - TC-E2E-13.1-009: Import - Import valid rows and skip invalid rows
 * - TC-E2E-13.1-010: Summary - Show import summary (successful, failed, errors)
 * - TC-E2E-13.1-011: Encoding - Support Hebrew text encoding (UTF-8)
 * - TC-E2E-13.1-012: File validation - Accept only .csv files
 * 
 * SETUP REQUIRED:
 * 1. Backend running on localhost:3001
 * 2. Frontend running on localhost:3000
 * 3. Playwright installed: npm install -D @playwright/test
 * 4. Browsers installed: npx playwright install
 * 
 * RUN TESTS:
 * cd apps/frontend
 * npx playwright test test/e2e/us13.1-import-properties-csv-e2e.spec.ts
 * 
 * EXPECTED: ALL tests FAIL initially (TDD - feature not implemented yet)
 * This is CORRECT - tests written FIRST, implementation comes next!
 */

import { test, expect, Page } from '@playwright/test';
import { selectTestAccount, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';
import * as fs from 'fs';
import * as path from 'path';

let TEST_ACCOUNT_ID: string;

test.describe('US13.1 - Import Properties from CSV (TDD)', () => {
  let page: Page;
  
  test.setTimeout(60000);

  async function waitForPropertiesPageReady() {
    await page.waitForLoadState('domcontentloaded');
    const url = page.url();
    if (!url.includes('/properties')) {
      throw new Error(`Expected to be on /properties page, but was redirected to: ${url}`);
    }
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async function fetchTestAccountId(): Promise<string> {
    try {
      const response = await fetch(`${BACKEND_URL}/accounts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }
      const accounts = await response.json();
      const testAccount = accounts.find((acc: any) => acc.name === 'Test Account');
      if (!testAccount) {
        throw new Error('Test Account not found in database');
      }
      return testAccount.id;
    } catch (error) {
      console.error('Failed to fetch Test Account ID:', error);
      throw error;
    }
  }

  test.beforeAll(async () => {
    TEST_ACCOUNT_ID = await fetchTestAccountId();
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(FRONTEND_URL);
    await selectTestAccount(page);
    await page.goto(`${FRONTEND_URL}/properties`);
    await waitForPropertiesPageReady();
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * Helper: Create CSV file content
   */
  function createCsvContent(rows: string[][]): string {
    const header = ['address', 'type', 'status', 'city', 'country', 'totalArea', 'landArea', 'estimatedValue', 'gush', 'helka', 'isMortgaged', 'notes'];
    const csvRows = [header, ...rows];
    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Helper: Upload CSV file
   */
  async function uploadCsvFile(csvContent: string, fileName: string = 'test-properties.csv') {
    // Create temporary file
    const tempDir = path.join(__dirname, '../../../../tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    // Find file input (might be hidden)
    const fileInput = page.locator('input[type="file"][accept*="csv"]').first();
    await fileInput.setInputFiles(filePath);

    // Clean up
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  test('TC-E2E-13.1-001: Upload valid CSV file with all required fields', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'OWNED', 'פתח תקווה', 'Israel', '140', '100', '7000000', '6393', '314/45', 'true', 'דירת פנטהאוס'],
    ]);

    // Find and click CSV import button/menu
    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    // Click import option
    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    // Upload file
    await uploadCsvFile(csvContent);

    // Wait for preview or import dialog
    await page.waitForSelector('text=תצוגה מקדימה, text=Preview, text=ייבוא, text=Import', { timeout: 10000 });

    // Verify preview shows valid data
    const previewTable = page.locator('table, [role="table"]').first();
    await expect(previewTable).toBeVisible();

    // Verify row shows correct data
    await expect(page.locator('text=שאול חרנם 6')).toBeVisible();
    await expect(page.locator('text=RESIDENTIAL')).toBeVisible();
    await expect(page.locator('text=OWNED')).toBeVisible();
  });

  test('TC-E2E-13.1-002: Upload CSV with optional fields', async () => {
    const csvContent = createCsvContent([
      ['רחוב הרצל 10', 'COMMERCIAL', 'INVESTMENT', 'תל אביב', 'Israel', '200', '150', '10000000', '1234', '567/89', 'false', 'משרדים'],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Verify optional fields are displayed
    await expect(page.locator('text=רחוב הרצל 10')).toBeVisible();
    await expect(page.locator('text=COMMERCIAL')).toBeVisible();
    await expect(page.locator('text=INVESTMENT')).toBeVisible();
  });

  test('TC-E2E-13.1-003: Missing required columns validation', async () => {
    // CSV with missing required columns (no 'type' column)
    const csvContent = 'address,status,city\n"שאול חרנם 6","OWNED","פתח תקווה"';

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    // Should show error about missing columns
    await page.waitForSelector('text=נדרש, text=required, text=שגיאה, text=error', { timeout: 10000 });
    
    const errorMessage = page.locator('text=/.*type.*required.*/i, text=/.*נדרש.*type.*/i').first();
    await expect(errorMessage).toBeVisible();
  });

  test('TC-E2E-13.1-004: Invalid property type enum value', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'INVALID_TYPE', 'OWNED', 'פתח תקווה', 'Israel', '140', '', '', '', '', '', ''],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Should highlight invalid row
    const invalidRow = page.locator('tr:has-text("INVALID_TYPE")').first();
    await expect(invalidRow).toBeVisible();

    // Should show error message
    await expect(page.locator('text=/.*INVALID_TYPE.*/, text=/.*שגיאה.*/i')).toBeVisible();
  });

  test('TC-E2E-13.1-005: Invalid property status enum value', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'INVALID_STATUS', 'פתח תקווה', 'Israel', '140', '', '', '', '', '', ''],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Should highlight invalid row
    const invalidRow = page.locator('tr:has-text("INVALID_STATUS")').first();
    await expect(invalidRow).toBeVisible();

    // Should show error message
    await expect(page.locator('text=/.*INVALID_STATUS.*/, text=/.*שגיאה.*/i')).toBeVisible();
  });

  test('TC-E2E-13.1-006: Invalid numeric fields (negative area, value)', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'OWNED', 'פתח תקווה', 'Israel', '-140', '100', '-7000000', '', '', '', ''],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Should highlight invalid row
    const invalidRow = page.locator('tr:has-text("שאול חרנם 6")').first();
    await expect(invalidRow).toBeVisible();

    // Should show error about negative values
    await expect(page.locator('text=/.*negative.*/i, text=/.*שלילי.*/i, text=/.*חיובי.*/i')).toBeVisible();
  });

  test('TC-E2E-13.1-007: Display import preview with validation status', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'OWNED', 'פתח תקווה', 'Israel', '140', '100', '7000000', '6393', '314/45', 'true', 'דירת פנטהאוס'],
      ['רחוב הרצל 10', 'COMMERCIAL', 'INVESTMENT', 'תל אביב', 'Israel', '200', '150', '10000000', '1234', '567/89', 'false', 'משרדים'],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Verify preview table is visible
    const previewTable = page.locator('table, [role="table"]').first();
    await expect(previewTable).toBeVisible();

    // Verify both rows are shown
    await expect(page.locator('text=שאול חרנם 6')).toBeVisible();
    await expect(page.locator('text=רחוב הרצל 10')).toBeVisible();

    // Verify validation status indicators (checkmarks or error icons)
    const statusIndicators = page.locator('[data-testid*="status"], [aria-label*="valid"], [aria-label*="invalid"]');
    await expect(statusIndicators.first()).toBeVisible();
  });

  test('TC-E2E-13.1-008: Highlight invalid rows with error messages', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'OWNED', 'פתח תקווה', 'Israel', '140', '100', '7000000', '6393', '314/45', 'true', 'דירת פנטהאוס'],
      ['רחוב הרצל 10', 'INVALID_TYPE', 'OWNED', 'תל אביב', 'Israel', '200', '150', '10000000', '1234', '567/89', 'false', 'משרדים'],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Invalid row should be highlighted (red background or error icon)
    const invalidRow = page.locator('tr:has-text("INVALID_TYPE")').first();
    await expect(invalidRow).toBeVisible();

    // Should have error styling or icon
    const errorIndicator = invalidRow.locator('[data-testid*="error"], [aria-label*="error"], .error, [class*="error"]').first();
    await expect(errorIndicator).toBeVisible();

    // Should show error message
    await expect(page.locator('text=/.*INVALID_TYPE.*/, text=/.*שגיאה.*/i')).toBeVisible();
  });

  test('TC-E2E-13.1-009: Import valid rows and skip invalid rows', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'OWNED', 'פתח תקווה', 'Israel', '140', '100', '7000000', '6393', '314/45', 'true', 'דירת פנטהאוס'],
      ['רחוב הרצל 10', 'INVALID_TYPE', 'OWNED', 'תל אביב', 'Israel', '200', '150', '10000000', '1234', '567/89', 'false', 'משרדים'],
      ['רחוב דיזנגוף 50', 'COMMERCIAL', 'INVESTMENT', 'תל אביב', 'Israel', '300', '200', '15000000', '5678', '90/12', 'false', 'חנות'],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Click import/confirm button
    const importButton = page.locator('button:has-text("ייבוא"), button:has-text("Import"), button:has-text("אישור"), button:has-text("Confirm")').first();
    await importButton.click();

    // Wait for import to complete
    await page.waitForSelector('text=הושלם, text=completed, text=סיכום, text=summary', { timeout: 15000 });

    // Verify summary shows 2 successful, 1 failed
    await expect(page.locator('text=/.*2.*/, text=/.*successful.*/i, text=/.*הצליח.*/i')).toBeVisible();
    await expect(page.locator('text=/.*1.*/, text=/.*failed.*/i, text=/.*נכשל.*/i')).toBeVisible();

    // Verify properties were imported (check properties list)
    await page.goto(`${FRONTEND_URL}/properties`);
    await waitForPropertiesPageReady();

    // Should see imported properties
    await expect(page.locator('text=שאול חרנם 6')).toBeVisible();
    await expect(page.locator('text=רחוב דיזנגוף 50')).toBeVisible();

    // Should NOT see the invalid one
    await expect(page.locator('text=רחוב הרצל 10')).not.toBeVisible();
  });

  test('TC-E2E-13.1-010: Show import summary (successful, failed, errors)', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'OWNED', 'פתח תקווה', 'Israel', '140', '100', '7000000', '6393', '314/45', 'true', 'דירת פנטהאוס'],
      ['רחוב הרצל 10', 'INVALID_TYPE', 'OWNED', 'תל אביב', 'Israel', '200', '150', '10000000', '1234', '567/89', 'false', 'משרדים'],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    const importButton = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importButton.click();

    await page.waitForSelector('text=סיכום, text=summary, text=הושלם, text=completed', { timeout: 15000 });

    // Verify summary statistics
    await expect(page.locator('text=/.*1.*/, text=/.*successful.*/i, text=/.*הצליח.*/i')).toBeVisible();
    await expect(page.locator('text=/.*1.*/, text=/.*failed.*/i, text=/.*נכשל.*/i')).toBeVisible();
    await expect(page.locator('text=/.*total.*/i, text=/.*סה"כ.*/i')).toBeVisible();

    // Verify error details are shown
    await expect(page.locator('text=/.*INVALID_TYPE.*/, text=/.*שגיאה.*/i')).toBeVisible();
  });

  test('TC-E2E-13.1-011: Support Hebrew text encoding (UTF-8)', async () => {
    const csvContent = createCsvContent([
      ['שאול חרנם 6', 'RESIDENTIAL', 'OWNED', 'פתח תקווה', 'Israel', '140', '100', '7000000', '6393', '314/45', 'true', 'דירת פנטהאוס עם נוף'],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Verify Hebrew text is displayed correctly
    await expect(page.locator('text=שאול חרנם 6')).toBeVisible();
    await expect(page.locator('text=פתח תקווה')).toBeVisible();
    await expect(page.locator('text=דירת פנטהאוס עם נוף')).toBeVisible();
  });

  test('TC-E2E-13.1-012: Accept only .csv files', async () => {
    // Try to upload a non-CSV file (create a text file)
    const tempDir = path.join(__dirname, '../../../../tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, 'test.txt');
    fs.writeFileSync(filePath, 'This is not a CSV file', 'utf-8');

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    // Try to upload non-CSV file
    const fileInput = page.locator('input[type="file"][accept*="csv"]').first();
    
    // File input should reject non-CSV files
    // If file input has accept=".csv", browser will prevent selection
    // If it doesn't, we should show error after upload
    
    // Clean up
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // If file was somehow selected, should show error
    // This test verifies file type validation
    await expect(fileInput).toHaveAttribute('accept', /csv/i);
  });
});
