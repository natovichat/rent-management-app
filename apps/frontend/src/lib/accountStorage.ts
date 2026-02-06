/**
 * Account storage utilities for managing selected account ID.
 */

const ACCOUNT_STORAGE_KEY = 'selected_account_id';
const DEFAULT_ACCOUNT_ID = '456fb3ba-2c72-4525-b3df-78980d07d8db';

/**
 * Get the currently selected account ID.
 * Returns default account if none is selected.
 */
export function getCurrentAccountId(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCOUNT_ID;
  }
  
  return localStorage.getItem(ACCOUNT_STORAGE_KEY) || DEFAULT_ACCOUNT_ID;
}

/**
 * Set the selected account ID.
 */
export function setCurrentAccountId(accountId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(ACCOUNT_STORAGE_KEY, accountId);
}

/**
 * Get the default account ID.
 */
export function getDefaultAccountId(): string {
  return DEFAULT_ACCOUNT_ID;
}
