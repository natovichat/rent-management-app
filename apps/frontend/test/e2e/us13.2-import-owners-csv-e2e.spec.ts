/**
 * US13.2 - Import Owners from CSV - E2E Tests (Test-Driven Development)
 */

import { test, expect, Page } from '@playwright/test';
import { selectTestAccount, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';
import * as fs from 'fs';
import * as path from 'path';

let TEST_ACCOUNT_ID: string;

test.describe('US13.2 - Import Owners from CSV (TDD)', () => {
  let page: Page;
  
  test.setTimeout(60000);

  async function waitForOwnersPageReady() {
    await page.waitForLoadState('domcontentloaded');
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
    await page.goto(`${FRONTEND_URL}/owners`);
    await waitForOwnersPageReady();
  });

  test.afterEach(async () => {
    await page.close();
  });

  function createCsvContent(rows: string[][]): string {
    const header = ['name', 'type', 'idNumber', 'email', 'phone', 'address', 'notes'];
    const csvRows = [header, ...rows];
    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  async function uploadCsvFile(csvContent: string, fileName: string = 'test-owners.csv') {
    const tempDir = path.join(__dirname, '../../../../tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    const fileInput = page.locator('input[type="file"][accept*="csv"]').first();
    await fileInput.setInputFiles(filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  test('TC-E2E-13.2-001: Upload valid CSV file with all required fields', async () => {
    const csvContent = createCsvContent([
      ['יצחק נטוביץ', 'INDIVIDUAL', '123456789', 'itzhak@example.com', '050-1234567', 'תל אביב', 'בעלים ראשי'],
    ]);

    // Find CSV import button
    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    const previewTable = page.locator('table, [role="table"]').first();
    await expect(previewTable).toBeVisible();

    await expect(page.locator('text=יצחק נטוביץ')).toBeVisible();
    await expect(page.locator('text=INDIVIDUAL')).toBeVisible();
  });

  test('TC-E2E-13.2-002: Validate owner type enum', async () => {
    const csvContent = createCsvContent([
      ['חברה בע"מ', 'COMPANY', '515123456', 'company@example.com', '', '', ''],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    await expect(page.locator('text=חברה בע"מ')).toBeVisible();
    await expect(page.locator('text=COMPANY')).toBeVisible();
  });

  test('TC-E2E-13.2-003: Handle duplicate owners', async () => {
    const csvContent = createCsvContent([
      ['יצחק נטוביץ', 'INDIVIDUAL', '123456789', 'itzhak@example.com', '', '', ''],
      ['יצחק נטוביץ', 'INDIVIDUAL', '123456789', 'itzhak2@example.com', '', '', ''],
    ]);

    const csvMenuButton = page.locator('button[aria-label*="CSV"], button:has-text("CSV")').first();
    await csvMenuButton.click();

    const importOption = page.locator('button:has-text("ייבוא"), button:has-text("Import")').first();
    await importOption.click();

    await uploadCsvFile(csvContent);

    await page.waitForSelector('text=תצוגה מקדימה, text=Preview', { timeout: 10000 });

    // Should show duplicate warning
    await expect(page.locator('text=/.*duplicate.*/i, text=/.*כפילות.*/i')).toBeVisible();
  });
});
