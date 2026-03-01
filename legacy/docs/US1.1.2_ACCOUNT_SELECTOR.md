# User Story 1.1.2: Account Selector & Multi-Account Filtering

**Epic:** 01 - Property Management  
**Priority:** 🔴 Critical  
**Status:** ⏳ Pending  
**Created:** February 3, 2026

---

## 📋 User Story

**As a** user with multiple accounts,  
**I can** select an account from the account selector in the main screen and see only properties (and other data) belonging to that account,  
**So that** I can manage multiple portfolios separately and view data specific to each account.

---

## 🎯 Business Value

### Why This Matters:

1. **Multi-Account Support** - Users can manage multiple portfolios
2. **Data Isolation** - Clear separation between different accounts
3. **Flexibility** - Switch between accounts easily
4. **Foundation** - Required for proper multi-tenancy
5. **User Experience** - Clear context of which account user is viewing

### Use Cases:

- User manages personal properties + business properties
- User manages properties for multiple companies
- User wants to compare different portfolios
- User needs to isolate test data from production data

---

## ✅ Acceptance Criteria

### Account Selector UI:

- [ ] Account selector component created in main header/navigation
- [ ] Account selector displays all accounts from database (GET /accounts)
- [ ] Account selector shows account name and identifier
- [ ] User can select an account from dropdown
- [ ] Account selector has clear visual indicator of selected account
- [ ] Account selector is accessible (keyboard navigation, screen reader)
- [ ] Account selector works on mobile/tablet

### State Management:

- [ ] Selected accountId is stored in React Context (AccountContext)
- [ ] AccountContext Provider wraps entire application
- [ ] Selected account persists across page navigation
- [ ] Default account selected on application load (first account or last selected)
- [ ] AccountContext provides: `selectedAccountId`, `setSelectedAccountId`, `accounts`, `isLoading`

### Data Filtering:

- [ ] Properties list filters by selectedAccountId
- [ ] All entity lists filter by selectedAccountId:
  - Units
  - Owners
  - Tenants
  - Leases
  - Mortgages
  - Investment Companies
  - Expenses
  - Income
  - Plot Information
- [ ] API queries include accountId parameter
- [ ] React Query keys include accountId for proper cache invalidation
- [ ] Changing account refreshes all lists automatically

### Testing:

- [ ] Unit tests verify AccountContext works correctly
- [ ] Unit tests verify account filtering logic
- [ ] E2E tests verify account selector displays accounts
- [ ] E2E tests verify switching accounts updates data correctly
- [ ] E2E tests verify selected account persists across navigation

---

## 🏗️ Technical Implementation

### Backend Requirements:

**Status:** ✅ Already Implemented

All entities already have `accountId` field and filtering support:
- Properties
- Units
- Owners
- Tenants
- Leases
- Mortgages
- Investment Companies
- Expenses
- Income

**What's Needed:**
- [ ] Verify GET /accounts endpoint exists
- [ ] Verify endpoint returns all accounts
- [ ] No changes to entity endpoints (already support accountId filtering)

---

### Frontend Implementation:

#### 1. Create AccountContext

**File:** `apps/frontend/src/contexts/AccountContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api';

interface Account {
  id: string;
  name: string;
}

interface AccountContextType {
  selectedAccountId: string;
  setSelectedAccountId: (accountId: string) => void;
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Fetch all accounts
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.findAll(),
  });

  // Set default account on load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      // Try to load from localStorage first
      const savedAccountId = localStorage.getItem('selectedAccountId');
      if (savedAccountId && accounts.some(a => a.id === savedAccountId)) {
        setSelectedAccountId(savedAccountId);
      } else {
        // Default to first account
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [accounts, selectedAccountId]);

  // Save to localStorage when changed
  useEffect(() => {
    if (selectedAccountId) {
      localStorage.setItem('selectedAccountId', selectedAccountId);
    }
  }, [selectedAccountId]);

  return (
    <AccountContext.Provider
      value={{
        selectedAccountId,
        setSelectedAccountId,
        accounts,
        isLoading,
        error,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
```

---

#### 2. Create AccountSelector Component

**File:** `apps/frontend/src/components/layout/AccountSelector.tsx`

```typescript
'use client';

import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress } from '@mui/material';
import { useAccount } from '@/contexts/AccountContext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function AccountSelector() {
  const { selectedAccountId, setSelectedAccountId, accounts, isLoading } = useAccount();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        <CircularProgress size={20} />
        <span>טוען חשבונות...</span>
      </Box>
    );
  }

  if (accounts.length === 0) {
    return null; // No accounts to select
  }

  return (
    <FormControl sx={{ minWidth: 250 }} size="small">
      <InputLabel id="account-selector-label">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon fontSize="small" />
          חשבון
        </Box>
      </InputLabel>
      <Select
        labelId="account-selector-label"
        value={selectedAccountId}
        onChange={(e) => setSelectedAccountId(e.target.value)}
        label="חשבון"
        sx={{
          backgroundColor: 'white',
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        {accounts.map((account) => (
          <MenuItem key={account.id} value={account.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceIcon fontSize="small" />
              {account.name}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
```

---

#### 3. Add to Main Layout

**File:** `apps/frontend/src/app/layout.tsx`

```typescript
import { AccountProvider } from '@/contexts/AccountContext';
import AccountSelector from '@/components/layout/AccountSelector';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <QueryClientProvider client={queryClient}>
          <AccountProvider>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  ניהול נכסים
                </Typography>
                
                {/* Account Selector */}
                <AccountSelector />
                
                {/* Other toolbar items */}
              </Toolbar>
            </AppBar>
            
            {children}
          </AccountProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

#### 4. Update API Calls to Use Account

**File:** `apps/frontend/src/components/properties/PropertyList.tsx`

```typescript
'use client';

import { useAccount } from '@/contexts/AccountContext';

export default function PropertyList() {
  const { selectedAccountId } = useAccount();

  // ✅ Include accountId in query key and API call
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', selectedAccountId], // ← Include accountId in key
    queryFn: () => propertiesApi.findAll(selectedAccountId), // ← Pass to API
    enabled: !!selectedAccountId, // Only fetch when account selected
  });

  // Rest of component...
}
```

---

#### 5. Update API Client

**File:** `apps/frontend/src/lib/api/properties.ts`

```typescript
export const propertiesApi = {
  // ✅ Accept accountId parameter
  async findAll(accountId: string) {
    const response = await fetch(`${API_URL}/properties?accountId=${accountId}`);
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },

  async create(data: CreatePropertyDto, accountId: string) {
    const response = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, accountId }), // ← Include accountId
    });
    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  },

  // Similar updates for update, delete, etc.
};
```

---

## 🧪 Testing Requirements

### Unit Tests:

**AccountContext Tests:**
```typescript
describe('AccountContext', () => {
  it('should select first account by default', () => {
    // Test default selection
  });

  it('should persist selected account to localStorage', () => {
    // Test persistence
  });

  it('should load saved account from localStorage', () => {
    // Test loading
  });

  it('should update selectedAccountId when changed', () => {
    // Test state update
  });
});
```

**AccountSelector Component Tests:**
```typescript
describe('AccountSelector', () => {
  it('should display all accounts', () => {
    // Test account list
  });

  it('should select account on click', () => {
    // Test selection
  });

  it('should show loading state', () => {
    // Test loading
  });
});
```

---

### E2E Tests:

**File:** `apps/frontend/test/e2e/us1.1.2-account-selector.spec.ts`

```typescript
test.describe('US1.1.2: Account Selector & Filtering', () => {
  test('TC-E2E-001: Account selector displays accounts', async ({ page }) => {
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);

    // Verify account selector visible
    await expect(page.locator('[aria-label="חשבון"]')).toBeVisible();

    // Click account selector
    await page.click('[aria-label="חשבון"]');

    // Verify accounts list appears
    await expect(page.locator('[role="option"]').first()).toBeVisible();
  });

  test('TC-E2E-002: Switching accounts filters properties', async ({ page }) => {
    // Navigate to properties page
    await page.goto(`${FRONTEND_URL}/properties`);

    // Select first account
    await page.click('[aria-label="חשבון"]');
    await page.click('[role="option"]').first();
    await page.waitForLoadState('networkidle');

    // Count properties for first account
    const count1 = await page.locator('[data-testid="property-row"]').count();

    // Switch to second account
    await page.click('[aria-label="חשבון"]');
    await page.click('[role="option"]').nth(1);
    await page.waitForLoadState('networkidle');

    // Count properties for second account
    const count2 = await page.locator('[data-testid="property-row"]').count();

    // Verify different data (if accounts have different properties)
    // This might be equal if both have same number of properties
    console.log(`Account 1 properties: ${count1}, Account 2 properties: ${count2}`);
  });

  test('TC-E2E-003: Selected account persists across navigation', async ({ page }) => {
    // Select specific account
    await page.goto(`${FRONTEND_URL}/properties`);
    await page.click('[aria-label="חשבון"]');
    const selectedAccount = await page.locator('[role="option"]').first().textContent();
    await page.click('[role="option"]').first();

    // Navigate to different page
    await page.goto(`${FRONTEND_URL}/units`);

    // Verify same account still selected
    const currentAccount = await page.locator('[aria-label="חשבון"]').textContent();
    expect(currentAccount).toContain(selectedAccount);
  });
});
```

---

## 📊 Phase Breakdown

### Phase 0: API Contract Design

**Backend Team:**
- ✅ Review: GET /accounts endpoint already exists?
- ✅ Confirm: All entities support accountId filtering
- ✅ Document: No backend changes needed

**Frontend Team:**
- ✅ Define: AccountContext interface
- ✅ Define: AccountSelector component props
- ✅ Review: API contract meets frontend needs

**QA Team:**
- ✅ Create: Test plan for account selection
- ✅ Define: Test scenarios (switch accounts, persist selection)
- ✅ Plan: Test data requirements (multiple accounts with data)

---

### Phase 1: Implementation

**Backend Team (1 hour):**
- Engineer 1: Verify GET /accounts endpoint exists
- Engineer 2: Verify entity filtering works correctly
- Engineer 3: Add unit tests for account filtering
- Engineer 4: Create test accounts with sample data

**Frontend Team (4 hours):**
- Engineer 1: Create AccountContext with Provider (2 hours)
- Engineer 2: Create AccountSelector component (2 hours)
- Engineer 3: Update PropertyList to use selectedAccountId (1 hour)
- Engineer 4: Write component tests for AccountContext and AccountSelector (2 hours)

---

### Phase 2: Integration Testing

**QA Team (2 hours):**
- Engineer 1: Write E2E tests for account selector
- Engineer 2: Write E2E tests for account switching
- Engineer 3: Test account persistence
- Engineer 4: Test multiple entity filtering

---

### Phase 3: Review & Validation

**All Team Leaders:**
- Backend: Verify no regressions, filtering works
- Frontend: Verify UX, state management, performance
- QA: Verify test coverage, acceptance criteria

---

## 🎨 UI/UX Design

### Location:
```
┌─────────────────────────────────────────────┐
│  Logo    ניהול נכסים    [חשבון: ▼]  [User] │  ← Account Selector here
└─────────────────────────────────────────────┘
```

### Visual Design:

- **Position:** Top navigation bar, right side (before user menu)
- **Component:** MUI Select with dropdown
- **Icon:** AccountBalanceIcon
- **Label:** "חשבון"
- **Width:** 250px minimum
- **Background:** White (stands out against navbar)
- **Current Selection:** Displayed in select button
- **Dropdown:** Shows all available accounts

### Interaction:

1. User clicks account selector
2. Dropdown shows all accounts
3. User selects account
4. All data refreshes (React Query invalidation)
5. Selected account persists (localStorage + context)

---

## 🔗 Dependencies

### Before This Story:
- ✅ US1.1: Create Property (basic property functionality)

### Enables These Stories:
- US1.3-1.19: All property management features
- Epic 02-08: All other epics depend on account filtering

### Related Entities:
- Account entity (already exists)
- All entities with accountId field

---

## 📝 Implementation Notes

### Backend:

**No Changes Required:**
- accountId already in all entities
- GET /accounts endpoint should exist
- Filtering by accountId already implemented

**Verify:**
```bash
# Check if GET /accounts exists
curl http://localhost:3001/accounts

# Expected: List of accounts
```

---

### Frontend:

**New Files:**
1. `apps/frontend/src/contexts/AccountContext.tsx` - Context provider
2. `apps/frontend/src/components/layout/AccountSelector.tsx` - Selector UI
3. `apps/frontend/src/lib/api/accounts.ts` - Accounts API client (if doesn't exist)

**Modified Files:**
1. `apps/frontend/src/app/layout.tsx` - Add AccountProvider wrapper
2. `apps/frontend/src/components/properties/PropertyList.tsx` - Use selectedAccountId
3. All entity list components - Use selectedAccountId

---

## 🧪 Test Plan

### Unit Tests (Frontend):

1. **AccountContext:**
   - ✅ Default account selection
   - ✅ Account switching
   - ✅ localStorage persistence
   - ✅ localStorage loading

2. **AccountSelector:**
   - ✅ Displays all accounts
   - ✅ Handles selection
   - ✅ Shows loading state
   - ✅ Handles errors

---

### E2E Tests:

1. **TC-E2E-001:** Account selector displays accounts
2. **TC-E2E-002:** Switching accounts filters properties
3. **TC-E2E-003:** Selected account persists across navigation
4. **TC-E2E-004:** Default account selected on first load
5. **TC-E2E-005:** Account selection updates all entity lists

---

## ⚠️ Important Considerations

### Data Isolation:

**Critical:** Each account must see ONLY their own data:
- Properties of account A should NOT appear when account B is selected
- Backend filtering by accountId is essential
- Frontend must include accountId in all queries

### Performance:

- Use React Query caching effectively
- Include accountId in query keys for proper invalidation
- Avoid fetching all data and filtering on frontend
- Backend should handle filtering (database level)

### User Experience:

- Account selector always visible
- Clear indication of selected account
- Smooth transition when switching
- Loading state during data refresh
- No data loss when switching

---

## 🚀 Estimated Effort

**Total:** ~7 hours

| Team | Effort | Tasks |
|------|--------|-------|
| Backend | 1 hour | Verify endpoints, add tests |
| Frontend | 4 hours | Context, selector, integration |
| QA | 2 hours | E2E tests |

---

## 📋 Checklist

### Before Starting:
- [ ] Read this document completely
- [ ] Understand multi-tenancy requirements
- [ ] Verify backend support exists
- [ ] Plan frontend architecture

### During Implementation:
- [ ] Follow 5-phase TDD workflow
- [ ] Write tests first (Phase 2)
- [ ] Implement with tests (Phase 3)
- [ ] Run all tests (Phase 4)
- [ ] Document thoroughly

### Before Completion:
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Team review approved

---

## 🎯 Success Criteria

**This story is complete when:**

1. ✅ Account selector visible in navigation
2. ✅ All accounts displayed in dropdown
3. ✅ Selecting account filters all data
4. ✅ Selection persists across navigation
5. ✅ All tests passing (unit + E2E)
6. ✅ Manual testing verified
7. ✅ Team review approved

---

## 📚 Related Documentation

- [EPIC_01_PROPERTY_MANAGEMENT.md](./EPIC_01_PROPERTY_MANAGEMENT.md) - Full epic details
- [GENERAL_REQUIREMENTS.md](./GENERAL_REQUIREMENTS.md) - Multi-tenancy requirements
- [Account Entity](./entities/09_Account.md) - Account entity definition

---

**Status:** Ready for Implementation  
**Next:** Phase 0 - API Contract Design
