# Account 2 Deletion & Account Selector Implementation

## Summary

Successfully implemented account management features:
1. ✅ Deleted Account 2 (`test-account-1`) and all its data
2. ✅ Added Account Selector component to home page
3. ✅ Integrated account selection throughout the application

---

## 1. Account 2 Deletion

### What Was Deleted

**Account ID**: `test-account-1`

**Data Deleted**:
- 3 Mortgage Payments
- 2 Leases
- 1 Mortgage
- 2 Property Ownerships
- 1 Plot Info
- 2 Units
- **32 Properties**
- 2 Tenants
- 2 Owners
- 0 Bank Accounts
- 0 Notifications
- 0 Investment Companies
- 0 Users

### Remaining Account

**Account ID**: `456fb3ba-2c72-4525-b3df-78980d07d8db`

**Account Data**:
- **Name**: Test Account
- **User**: test@example.com
- **Properties**: 31 (all from CSV import)
- **Owners**: 7 (יצחק נטוביץ, אביעד, ליאת, איציק, רפאל, אייל, רחל)
- **Mortgages**: 15
- **Bank Accounts**: 5

---

## 2. Account Selector Implementation

### Created Files

#### 1. `apps/frontend/src/contexts/AccountContext.tsx`

Context provider for account management:
```typescript
- currentAccountId: string | null
- setCurrentAccountId: (accountId: string) => void
- availableAccounts: Account[]
```

**Features**:
- Stores selected account in localStorage
- Default account: `456fb3ba-2c72-4525-b3df-78980d07d8db`
- Persists selection across sessions

#### 2. `apps/frontend/src/components/layout/AccountSelector.tsx`

UI component for account selection:
- Material-UI Select dropdown
- Shows account name and ID preview
- Reloads page on account change to fetch new data

#### 3. `apps/frontend/src/lib/accountStorage.ts`

Utility functions for account storage:
```typescript
- getCurrentAccountId(): string
- setCurrentAccountId(accountId: string): void
- getDefaultAccountId(): string
```

### Modified Files

#### 1. `apps/frontend/src/components/Providers.tsx`

Added `<AccountProvider>` wrapper around app:
```typescript
<AccountProvider>
  {children}
</AccountProvider>
```

#### 2. `apps/frontend/src/app/page.tsx`

Added Account Selector to home page:
```tsx
<Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
  <AccountSelector />
</Box>
```

#### 3. `apps/frontend/src/lib/api.ts`

Updated API interceptor to use selected account:
```typescript
import { getCurrentAccountId } from './accountStorage';

// In interceptor:
const accountId = getCurrentAccountId();
config.headers['X-Account-Id'] = accountId;
```

---

## 3. How It Works

### Account Selection Flow

1. **On App Load**:
   - `AccountProvider` loads selected account from localStorage
   - Falls back to default account if none selected
   - Makes account available via `useAccount()` hook

2. **User Selects Account**:
   - User opens Account Selector dropdown on home page
   - Selects an account
   - Selection saved to localStorage
   - Page reloads to fetch data for new account

3. **API Requests**:
   - All API requests include `X-Account-Id` header
   - Header value comes from `getCurrentAccountId()`
   - Backend filters data by this account ID

### Account Storage

```typescript
// Location
localStorage: 'selected_account_id'

// Default Value
'456fb3ba-2c72-4525-b3df-78980d07d8db'

// Read
const accountId = getCurrentAccountId();

// Write
setCurrentAccountId('new-account-id');
```

---

## 4. UI Screenshots

### Home Page - Account Selector

```
┌─────────────────────────────────┐
│  [Account Icon] ▼ חשבון ראשי    │
│                   31 נכסים       │
│                   456fb3ba...    │
└─────────────────────────────────┘
```

The selector appears at the top of the home page, showing:
- Account icon
- Account name: "חשבון ראשי - 31 נכסים"
- Account ID preview: "456fb3ba..."

---

## 5. Future Enhancements

### Adding More Accounts

To add another account for testing:

1. **Create a new account in database**:
   ```typescript
   await prisma.account.create({
     data: {
       name: 'Second Account',
       status: 'ACTIVE'
     }
   });
   ```

2. **Create a user for the account**:
   ```typescript
   await prisma.user.create({
     data: {
       accountId: 'new-account-id',
       email: 'user2@example.com',
       name: 'User 2',
       googleId: 'dev-user2@example.com',
       role: 'OWNER'
     }
   });
   ```

3. **Update AccountContext.tsx**:
   ```typescript
   const [availableAccounts] = useState<Account[]>([
     {
       id: '456fb3ba-2c72-4525-b3df-78980d07d8db',
       name: 'חשבון ראשי - 31 נכסים',
     },
     {
       id: 'new-account-id',
       name: 'חשבון שני',
     },
   ]);
   ```

### Dynamic Account Loading

Future enhancement: Load accounts dynamically from API:
```typescript
const { data: accounts } = useQuery({
  queryKey: ['accounts'],
  queryFn: () => api.get('/accounts').then(res => res.data)
});
```

---

## 6. Testing

### Verified Functionality

✅ **Account Deletion**:
- Account 2 completely removed from database
- All related data deleted (32 properties, 2 owners, etc.)
- No orphaned records

✅ **Account Selector**:
- Displays correctly on home page
- Shows current account (456fb3ba... with 31 properties)
- Dropdown works (only 1 account available)

✅ **API Integration**:
- All API requests use selected account ID
- Properties page shows correct 31 properties
- Data filtered by account ID

✅ **Persistence**:
- Selected account saved to localStorage
- Survives page refresh
- Falls back to default on first visit

---

## 7. Scripts Created

### Account Management Scripts

1. **`apps/backend/scripts/delete-account-2-simple.ts`**
   - Deletes an account and all its data
   - Respects foreign key constraints
   - Provides detailed summary

2. **`apps/backend/scripts/check-accounts.ts`**
   - Lists all accounts in database
   - Shows account stats (properties, owners, etc.)
   - Shows associated users

---

## 8. Configuration

### Default Account

Set in multiple places for consistency:

1. **Context**: `AccountContext.tsx`
   ```typescript
   const DEFAULT_ACCOUNT_ID = '456fb3ba-2c72-4525-b3df-78980d07d8db';
   ```

2. **Storage**: `accountStorage.ts`
   ```typescript
   const DEFAULT_ACCOUNT_ID = '456fb3ba-2c72-4525-b3df-78980d07d8db';
   ```

3. **Display**: Account name shows "חשבון ראשי - 31 נכסים"

---

## Summary

✅ **Account 2 Deleted**: Successfully removed test-account-1 with all 32 properties and related data

✅ **Account Selector Added**: Working dropdown on home page for account selection

✅ **API Integration**: All requests use selected account ID from localStorage

✅ **Data Verification**: 31 properties displayed correctly from Account 1

✅ **Persistence**: Account selection saved and restored across sessions

**Current State**: Single account system (Account 1) with infrastructure ready for multiple accounts in the future.

---

**Last Updated**: 2026-02-02
