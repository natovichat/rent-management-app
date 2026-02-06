/**
 * Test utility functions for E2E tests
 */

/**
 * Frontend URL - where the Next.js app runs
 */
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Backend URL - where the NestJS API runs
 */
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * LOCAL STORAGE KEY for account selection (must match frontend code)
 */
const ACCOUNT_STORAGE_KEY = 'selectedAccountId';

/**
 * LOCAL STORAGE KEY for auth token (must match frontend code)
 */
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Create a mock JWT token for E2E testing.
 * This creates a valid JWT format token that won't expire for 24 hours.
 * Uses Node.js Buffer for base64 encoding (works in test environment).
 */
function createMockAuthToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub: 'test-user',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
    iat: Math.floor(Date.now() / 1000),
  })).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
}

/**
 * Set mock authentication token in browser localStorage.
 * This bypasses the authentication check for E2E tests.
 * 
 * NOTE: This function does NOT navigate - assumes page is already on the domain.
 * 
 * @param page Playwright page object
 */
export async function setMockAuthToken(page: any) {
  console.log('=== SETTING MOCK AUTH TOKEN IN LOCALSTORAGE ===');
  
  // Create and set mock token
  const mockToken = createMockAuthToken();
  await page.evaluate(([key, value]: [string, string]) => {
    localStorage.setItem(key, value);
  }, [AUTH_TOKEN_KEY, mockToken]);
  
  console.log('✓ Mock auth token set in localStorage');
}

/**
 * Set account ID in browser localStorage.
 * This automatically makes all API calls use this account via the axios interceptor.
 * 
 * This is the NEW preferred way to set account for E2E tests - no UI interaction needed!
 * 
 * IMPORTANT: This function navigates to the frontend URL first (required for localStorage access).
 * 
 * @param page Playwright page object
 * @param accountId The account ID to set (default: 'test-account-1')
 */
export async function setTestAccountInStorage(page: any, accountId: string = 'test-account-1') {
  console.log(`=== SETTING TEST ACCOUNT IN LOCALSTORAGE (${accountId}) ===`);
  
  // MUST navigate to domain first - localStorage is only accessible after navigation!
  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('networkidle');
  
  // Set mock auth token and accountId in one evaluate call (more efficient)
  const mockToken = createMockAuthToken();
  await page.evaluate(([authKey, token, accountKey, accountId]: [string, string, string, string]) => {
    localStorage.setItem(authKey, token);
    localStorage.setItem(accountKey, accountId);
  }, [AUTH_TOKEN_KEY, mockToken, ACCOUNT_STORAGE_KEY, accountId]);
  
  console.log(`✓ Mock auth token set`);
  console.log(`✓ Account ${accountId} set in localStorage - all API calls will use this account automatically!`);
}

/**
 * Select the test account (test-account-1) in the UI.
 * 
 * DEPRECATED: Use setTestAccountInStorage() instead for faster, more reliable tests!
 * This UI-based approach is kept for backward compatibility.
 * 
 * @param page Playwright page object
 */
export async function selectTestAccount(page: any) {
  console.log('=== SELECTING TEST ACCOUNT VIA UI (test-account-1) ===');
  console.log('⚠️  Consider using setTestAccountInStorage() instead for faster tests!');
  
  // Wait for page to load
  await page.waitForSelector('body', { timeout: 10000 });
  await page.waitForTimeout(1000);
  
  // Find and click account selector
  const accountSelector = page.locator('[aria-label*="חשבון"], [data-testid="account-selector"], .MuiSelect-select').first();
  await accountSelector.click({ timeout: 10000 });
  await page.waitForTimeout(500);
  
  // Select test-account-1 option
  const testAccountOption = page.locator('[role="option"][data-value="test-account-1"]');
  await testAccountOption.click({ timeout: 5000 });
  await page.waitForTimeout(2000); // Wait for account switch to complete
  
  console.log('✓ Test Account (test-account-1) selected via UI');
}

/**
 * Fetch the test account (test-account-1) from the backend
 * @returns The test account object
 * @throws Error if test account is not found
 */
export async function getTestAccount() {
  const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
  const accounts = await accountsResponse.json();
  
  const testAccount = accounts.find((a: any) => a.id === 'test-account-1');
  if (!testAccount) {
    throw new Error('Test account with ID "test-account-1" not found in database');
  }
  
  return testAccount;
}

/**
 * Fetch a specific account by ID
 * @param accountId The account ID to fetch
 * @returns The account object
 * @throws Error if account is not found
 */
export async function getAccountById(accountId: string) {
  const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
  const accounts = await accountsResponse.json();
  
  const account = accounts.find((a: any) => a.id === accountId);
  if (!account) {
    throw new Error(`Account with ID "${accountId}" not found in database`);
  }
  
  return account;
}

/**
 * Fetch all accounts from the backend
 * @returns Array of all accounts
 */
export async function getAllAccounts() {
  const accountsResponse = await fetch(`${BACKEND_URL}/accounts`);
  const accounts = await accountsResponse.json();
  return accounts;
}

/**
 * Fetch multiple accounts by IDs
 * @param accountIds Array of account IDs to fetch
 * @returns Object with account IDs as keys and account objects as values
 */
export async function getAccountsByIds(accountIds: string[]) {
  const accounts = await getAllAccounts();
  const result: Record<string, any> = {};
  
  for (const id of accountIds) {
    const account = accounts.find((a: any) => a.id === id);
    if (account) {
      result[id] = account;
    }
  }
  
  return result;
}
