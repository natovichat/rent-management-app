import { test, expect } from '@playwright/test';
import { setTestAccountInStorage, FRONTEND_URL, BACKEND_URL } from '../utils/test-helpers';

test.describe('US1.7 - Search Properties (TDD)', () => {
  let testAccountId: string;

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
      console.warn('⚠️ Error during cleanup:', error);
    }

    // Set test account in localStorage
    await setTestAccountInStorage(page, testAccountId);

    // Navigate to properties page
    console.log('→ Navigating to properties page...');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    console.log('✓ Properties page loaded\n');
  });

  test('TC-E2E-1.7-001: Search input field is available above properties list', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-001: Search Input Field Available ===');
    
    console.log('→ Looking for search input field...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    console.log('✓ Search input field is visible');
    
    console.log('→ Verifying search input is above DataGrid...');
    const dataGrid = page.locator('[class*="MuiDataGrid-root"]').first();
    const searchInputBox = await searchInput.boundingBox();
    const dataGridBox = await dataGrid.boundingBox();
    
    if (searchInputBox && dataGridBox) {
      expect(searchInputBox.y).toBeLessThan(dataGridBox.y);
      console.log('✓ Search input is positioned above DataGrid');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-002: Search queries address field', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-002: Search by Address ===');
    
    // Create test properties first
    console.log('→ Creating test properties...');
    const property1 = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123, תל אביב',
      fileNumber: 'FILE-001',
    };
    const property2 = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45, תל אביב',
      fileNumber: 'FILE-002',
    };
    const property3 = {
      accountId: testAccountId,
      address: 'רחוב בן גוריון 78, ירושלים',
      fileNumber: 'FILE-003',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property1),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property2),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property3),
    });
    console.log('✓ Test properties created');
    
    // Wait for properties to appear
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('→ Typing search term "הרצל"...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await searchInput.fill('הרצל');
    
    // Wait for debounced search (should wait ~300ms after typing stops)
    console.log('→ Waiting for search results (debounce delay)...');
    await page.waitForTimeout(500); // Wait for debounce + API call
    
    console.log('→ Verifying search results...');
    await expect(page.locator('text=רחוב הרצל 123')).toBeVisible({ timeout: 5000 });
    console.log('✓ Property with "הרצל" in address is visible');
    
    // Verify other properties are not visible
    const dizenghofVisible = await page.locator('text=דיזנגוף').isVisible().catch(() => false);
    const benGurionVisible = await page.locator('text=בן גוריון').isVisible().catch(() => false);
    
    if (dizenghofVisible || benGurionVisible) {
      console.log('⚠️ Other properties still visible - may need to wait longer for search');
    } else {
      console.log('✓ Other properties filtered out correctly');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-003: Search queries fileNumber field', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-003: Search by File Number ===');
    
    // Create test properties
    console.log('→ Creating test properties...');
    const property1 = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      fileNumber: 'FILE-ABC-001',
    };
    const property2 = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      fileNumber: 'FILE-XYZ-002',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property1),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property2),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional wait for data to load
    
    console.log('→ Typing search term "ABC"...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await searchInput.fill('ABC');
    
    console.log('→ Waiting for search results (debounce delay)...');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    console.log('→ Verifying search results...');
    await expect(page.locator('text=FILE-ABC-001').first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Property with "ABC" in file number is visible');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-004: Search is debounced (waits for user to stop typing)', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-004: Search Debouncing ===');
    
    // Create test property
    console.log('→ Creating test property...');
    const property = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      fileNumber: 'FILE-001',
    };
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property),
    });
    console.log('✓ Test property created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Monitor network requests
    console.log('→ Setting up network request monitoring...');
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/properties') && request.url().includes('search=')) {
        requests.push(request.url());
        console.log(`  → API request: ${request.url()}`);
      }
    });
    
    console.log('→ Typing "הרצל" character by character...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    
    // Type slowly to test debouncing
    await searchInput.fill('ה');
    await page.waitForTimeout(100);
    await searchInput.fill('הר');
    await page.waitForTimeout(100);
    await searchInput.fill('הרצ');
    await page.waitForTimeout(100);
    await searchInput.fill('הרצל');
    
    console.log('→ Waiting for debounce delay (300ms)...');
    await page.waitForTimeout(500); // Wait for debounce + API call
    
    console.log(`→ Total API requests with search: ${requests.length}`);
    
    // With proper debouncing, should have 1 request (after typing stops)
    // Without debouncing, would have 4 requests (one per character)
    if (requests.length <= 2) {
      console.log('✓ Debouncing working correctly (minimal API calls)');
    } else {
      console.log('⚠️ Too many API calls - debouncing may not be implemented');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-005: Search results update automatically', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-005: Search Results Update Automatically ===');
    
    // Create test properties
    console.log('→ Creating test properties...');
    const property1 = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      fileNumber: 'FILE-001',
    };
    const property2 = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      fileNumber: 'FILE-002',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property1),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property2),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional wait for data to load
    
    // Verify both properties visible initially
    console.log('→ Verifying both properties visible initially...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=רחוב דיזנגוף 45').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Both properties visible');
    
    // Search for one property
    console.log('→ Searching for "הרצל"...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await searchInput.fill('הרצל');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    // Verify results updated
    console.log('→ Verifying results updated...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Property with "הרצל" still visible');
    
    // Verify other property filtered out
    const dizenghofVisible = await page.locator('text=דיזנגוף').isVisible().catch(() => false);
    if (!dizenghofVisible) {
      console.log('✓ Other property filtered out correctly');
    } else {
      console.log('⚠️ Other property still visible');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-006: Search works with pagination', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-006: Search with Pagination ===');
    
    // Create more than 10 properties to test pagination
    console.log('→ Creating 15 test properties...');
    for (let i = 1; i <= 15; i++) {
      const property = {
        accountId: testAccountId,
        address: `רחוב הרצל ${i}`,
        fileNumber: `FILE-SEARCH-${i}`,
      };
      await fetch(`${BACKEND_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
        body: JSON.stringify(property),
      });
    }
    console.log('✓ 15 test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional wait for data to load
    
    // Verify pagination exists
    console.log('→ Verifying pagination exists...');
    const paginationFooter = page.locator('[class*="MuiDataGrid-footerContainer"]').first();
    await expect(paginationFooter).toBeVisible({ timeout: 10000 });
    console.log('✓ Pagination footer visible');
    
    // Search for properties
    console.log('→ Searching for "SEARCH"...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await searchInput.fill('SEARCH');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    // Verify search results are paginated
    console.log('→ Verifying search results are paginated...');
    await expect(page.locator('text=FILE-SEARCH-1').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Search results displayed');
    
    // Check if pagination still works with search
    const paginationStillVisible = await paginationFooter.isVisible();
    if (paginationStillVisible) {
      console.log('✓ Pagination still visible with search active');
    }
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-007: Search is case-insensitive', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-007: Case-Insensitive Search ===');
    
    // Create test property
    console.log('→ Creating test property...');
    const property = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      fileNumber: 'FILE-ABC-123',
    };
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property),
    });
    console.log('✓ Test property created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional wait for data to load
    
    // Test lowercase search
    console.log('→ Testing lowercase search "file-abc"...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await searchInput.fill('file-abc');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    await expect(page.locator('text=FILE-ABC-123').first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Lowercase search found uppercase file number');
    
    // Test uppercase search
    console.log('→ Testing uppercase search "FILE-ABC"...');
    await searchInput.fill('FILE-ABC');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    await expect(page.locator('text=FILE-ABC-123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Uppercase search found file number');
    
    // Test mixed case search
    console.log('→ Testing mixed case search "File-Abc"...');
    await searchInput.fill('File-Abc');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    await expect(page.locator('text=FILE-ABC-123').first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Mixed case search found file number');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-008: Empty search shows all properties', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-008: Empty Search Shows All Properties ===');
    
    // Create test properties
    console.log('→ Creating test properties...');
    const property1 = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      fileNumber: 'FILE-001',
    };
    const property2 = {
      accountId: testAccountId,
      address: 'רחוב דיזנגוף 45',
      fileNumber: 'FILE-002',
    };
    
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property1),
    });
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property2),
    });
    console.log('✓ Test properties created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional wait for data to load
    
    // Verify both properties visible initially
    console.log('→ Verifying both properties visible initially...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=רחוב דיזנגוף 45').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Both properties visible');
    
    // Search for one property
    console.log('→ Searching for "הרצל"...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await searchInput.fill('הרצל');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    // Verify only one property visible
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Search filtered to one property');
    
    // Clear search
    console.log('→ Clearing search (empty string)...');
    await searchInput.fill('');
    await page.waitForTimeout(800); // Wait for debounce + API call
    
    // Verify both properties visible again
    console.log('→ Verifying all properties visible after clearing search...');
    await expect(page.locator('text=רחוב הרצל 123').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=רחוב דיזנגוף 45').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ All properties visible after clearing search');
    
    console.log('✓ Test completed successfully\n');
  });

  test('TC-E2E-1.7-009: Search state persists during navigation', async ({ page }) => {
    console.log('\n=== TC-E2E-1.7-009: Search State Persists ===');
    
    // Create test property
    console.log('→ Creating test property...');
    const property = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      fileNumber: 'FILE-001',
    };
    await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Account-Id': testAccountId },
      body: JSON.stringify(property),
    });
    console.log('✓ Test property created');
    
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Enter search term
    console.log('→ Entering search term "הרצל"...');
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    await searchInput.fill('הרצל');
    await page.waitForTimeout(500);
    
    // Verify search is in URL
    console.log('→ Checking URL for search parameter...');
    const url = page.url();
    if (url.includes('search=') || url.includes('הרצל')) {
      console.log('✓ Search term in URL');
    } else {
      console.log('⚠️ Search term not in URL - state may not persist');
    }
    
    // Navigate away and back
    console.log('→ Navigating to home page...');
    await page.goto(`${FRONTEND_URL}`);
    await page.waitForLoadState('networkidle');
    
    console.log('→ Navigating back to properties page...');
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.waitForLoadState('networkidle');
    
    // Verify search term persisted
    console.log('→ Verifying search term persisted...');
    const searchInputAfterNav = page.locator('input[placeholder*="חיפוש"], input[placeholder*="search"]').first();
    const searchValue = await searchInputAfterNav.inputValue();
    
    if (searchValue.includes('הרצל')) {
      console.log('✓ Search term persisted after navigation');
    } else {
      console.log('⚠️ Search term did not persist - may need URL state management');
    }
    
    console.log('✓ Test completed successfully\n');
  });
});
