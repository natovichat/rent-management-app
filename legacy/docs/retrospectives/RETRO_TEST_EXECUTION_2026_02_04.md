# Retrospective: Test Execution Issues - February 4, 2026

## 📋 Overview

**Date**: February 4, 2026  
**Context**: Running E2E tests for US1.1 (Create Property) and US1.1.2 (Account Selector)  
**Duration**: ~1 hour  
**Test Results**: 10/15 tests passed (67% success rate)

---

## 🎯 What We Were Trying to Achieve

1. **Verify US1.1 Implementation** - Run E2E tests for property creation with dynamic Test Account
2. **Verify US1.1.2 Implementation** - Run E2E tests for multi-account filtering
3. **Ensure Clean Test Data** - Use `npm run db:reset:force` before each test

---

## ✅ What Went Well

### 1. Test Infrastructure Improvements
- ✅ Successfully implemented dynamic Test Account ID fetching
- ✅ `fetchTestAccountId()` helper works perfectly
- ✅ Database reset mechanism (`db:reset:force`) now functional
- ✅ Test isolation achieved - each test starts with clean DB

### 2. Bug Detection
- ✅ Tests successfully caught real bugs:
  - Missing npm script
  - Unused React hook
  - Missing API endpoints
  - Timing issues

### 3. Quick Problem Resolution
- ✅ Identified and fixed missing `db:reset:force` script in < 5 minutes
- ✅ Identified and fixed unused `useAccount` hook in < 3 minutes
- ✅ Clear error messages helped rapid diagnosis

---

## ⚠️ What Went Wrong

### Problem 1: Missing npm Script ⚠️

**Issue**: Tests failed immediately with:
```
npm error Missing script: "db:reset:force"
```

**Root Cause**: 
- Test code referenced `npm run db:reset:force`
- Script was never added to `apps/backend/package.json`
- No pre-test validation of required scripts

**Impact**: 
- **All tests failed** in `beforeEach` hook
- Wasted initial test execution time
- False failures (tests weren't actually testing functionality)

**Time Lost**: ~5 minutes

---

### Problem 2: Unused React Hook ⚠️

**Issue**: PropertyForm failed with:
```javascript
ReferenceError: selectedAccountId is not defined
```

**Root Cause**:
```typescript
// ❌ BAD - Hook imported but NOT used
import { useAccount } from '@/contexts/AccountContext';

export default function PropertyForm({ ... }) {
  // Missing: const { selectedAccountId } = useAccount();
  
  // Later in code:
  await propertiesApi.create(submitData, selectedAccountId); // ❌ undefined!
}
```

**Impact**:
- TC-E2E-001 (happy path) worked because it didn't hit this code path
- TC-E2E-002 (with optional fields) failed during form submission
- Properties couldn't be created successfully in some scenarios

**Time Lost**: ~3 minutes

**How It Slipped Through**:
- ✅ Unit tests passed (mocked dependencies)
- ❌ E2E tests caught it (real form submission)
- No TypeScript error (variable used in closure, ESLint didn't catch)

---

### Problem 3: Missing API Endpoints 🔴

**Issue**: US1.1.2 tests failed with:
```
Failed to create test account: 404 Not Found
```

**Root Cause**:
- Tests needed to create multiple accounts dynamically
- No `POST /accounts` endpoint exists in backend
- Test design assumed CRUD API for accounts

**Impact**:
- **2/7 tests failed** in US1.1.2
- Multi-account testing blocked
- Test coverage incomplete

**Time Lost**: Tests ran but failed (no fix applied yet)

**Design Flaw**:
- Tests **assumed** API endpoint exists
- No validation during test creation phase
- Mismatch between test requirements and actual API

---

### Problem 4: E2E Test Timing Issues ⚠️

**Issue**: Tests failed with timing-related errors:
- TC-E2E-002: "POST request not detected within timeout"
- TC-E2E-006: "Property created even after cancel"
- TC-E2E-007: "Property count = 0 instead of 1"

**Root Cause**:
- Race conditions between:
  - Form submission
  - API response
  - React Query cache invalidation
  - UI re-render
  - Database operations

**Impact**:
- **3/8 tests failed** in US1.1
- Tests are **flaky** (intermittent failures)
- Reduced confidence in test suite

**Time Lost**: Tests ran to completion but with failures

**Deeper Issues**:
- Hard-coded timeouts (`waitForTimeout(1000)`)
- Insufficient wait strategies
- No explicit wait for data to appear in list after creation

---

## 📊 Test Results Summary

### US1.1 - Create Property
```
✅ 5/8 Passed (62.5%)
⏱️ Duration: 4.4 minutes
```

| Test | Result | Issue |
|---|---|---|
| TC-E2E-001: Required fields | ✅ Pass | - |
| TC-E2E-002: Optional fields | ❌ Fail | Timing - POST not detected |
| TC-E2E-003: Missing fields | ✅ Pass | - |
| TC-E2E-004: Invalid data | ✅ Pass | - |
| TC-E2E-005: Special chars | ✅ Pass | - |
| TC-E2E-006: Cancel flow | ❌ Fail | Property created after cancel |
| TC-E2E-007: List appearance | ❌ Fail | Count = 0 instead of 1 |
| TC-E2E-008: Accordions | ✅ Pass | - |

### US1.1.2 - Account Selector
```
✅ 5/7 Passed (71.4%)
⏱️ Duration: 1.2 minutes
```

| Test | Result | Issue |
|---|---|---|
| TC-E2E-001: Display accounts | ✅ Pass | - |
| TC-E2E-002: Switch accounts | ❌ Fail | Missing POST /accounts |
| TC-E2E-003: Persist selection | ✅ Pass | - |
| TC-E2E-004: Default account | ✅ Pass | - |
| TC-E2E-005: Update entity lists | ❌ Fail | Missing POST /accounts |
| TC-E2E-006: Keyboard nav | ✅ Pass | - |
| TC-E2E-007: Mobile viewport | ✅ Pass | - |

---

## 🔍 Root Cause Analysis

### Why Did These Issues Occur?

#### 1. **Incomplete Test Setup** (db:reset:force)
- ❌ No checklist of required npm scripts
- ❌ No validation that scripts exist before test execution
- ❌ Test code references infrastructure that doesn't exist

**Pattern**: Infrastructure assumed but not verified

---

#### 2. **Code Review Gap** (useAccount hook)
- ❌ Hook imported but unused → No warning
- ✅ TypeScript didn't catch it (valid syntax)
- ❌ ESLint rule not enforced (`no-unused-vars` for imports)
- ✅ Unit tests passed (mocked)
- ✅ E2E tests caught it (real execution)

**Pattern**: Static analysis gap for imported-but-unused hooks

---

#### 3. **Test-API Mismatch** (POST /accounts)
- ❌ Tests written **before** API design finalized
- ❌ Assumption that CRUD endpoints exist for all entities
- ❌ No API contract validation during test creation

**Pattern**: Test implementation ahead of API implementation

---

#### 4. **E2E Test Fragility** (timing issues)
- ❌ Hard-coded waits instead of explicit conditions
- ❌ No retry strategies for transient UI updates
- ❌ Race conditions between DB write → API response → UI update

**Pattern**: Insufficient synchronization strategies

---

## 💡 Lessons Learned

### Lesson 1: Validate Test Dependencies BEFORE Execution
**What Happened**: Tests failed because `db:reset:force` script didn't exist  
**What We Learned**: Infrastructure dependencies must be validated upfront  
**Rule to Create**: Pre-test validation checklist

---

### Lesson 2: Static Analysis for React Hooks
**What Happened**: Hook imported but not used → runtime error  
**What We Learned**: TypeScript + ESLint don't catch all React hook issues  
**Rule to Create**: ESLint rule enforcement for unused imports

---

### Lesson 3: API Contract Before Test Implementation
**What Happened**: Tests assume `POST /accounts` exists → 404  
**What We Learned**: Test requirements must match implemented API  
**Rule to Create**: API-first test design (contract → tests → implementation)

---

### Lesson 4: E2E Tests Need Robust Wait Strategies
**What Happened**: Timing issues cause flaky tests  
**What We Learned**: `waitForTimeout()` is insufficient  
**Rule to Create**: Explicit wait strategies for E2E tests

---

### Lesson 5: Dynamic vs. Static Test Data
**What Happened**: Some tests need multiple accounts, tried dynamic creation  
**What We Learned**: Need balance between seed data and dynamic creation  
**Rule to Create**: Test data strategy (when seed vs. when dynamic)

---

## 📝 Proposed Rules & Standards

### Rule 1: Pre-Test Infrastructure Validation ✅

**File**: `.cursor/rules/e2e-test-infrastructure.mdc`

```markdown
# E2E Test Infrastructure Validation - MANDATORY

## Pre-Test Checklist

Before running ANY E2E tests, validate:

### Backend Scripts
- [ ] `npm run db:reset:force` exists
- [ ] `npm run start:dev` exists
- [ ] `npm run prisma:seed` exists

### Frontend Scripts
- [ ] `npm run dev` exists
- [ ] `npx playwright test` works

### Environment
- [ ] Backend running on localhost:3001
- [ ] Frontend running on localhost:3000
- [ ] Database accessible
- [ ] Test account seeded

## Validation Script

```bash
#!/bin/bash
# validate-test-env.sh

echo "🔍 Validating E2E Test Environment..."

# Check backend scripts
cd apps/backend
npm run | grep -q "db:reset:force" || { echo "❌ Missing: db:reset:force"; exit 1; }
npm run | grep -q "start:dev" || { echo "❌ Missing: start:dev"; exit 1; }

# Check backend running
curl -f http://localhost:3001/health > /dev/null 2>&1 || { echo "❌ Backend not running"; exit 1; }

# Check frontend running
curl -f http://localhost:3000 > /dev/null 2>&1 || { echo "❌ Frontend not running"; exit 1; }

echo "✅ Environment validated - ready for tests"
```

## Test File Template

```typescript
// At top of every E2E test file:
test.beforeAll(async () => {
  // Validate environment
  const backendHealth = await fetch('http://localhost:3001/health');
  if (!backendHealth.ok) {
    throw new Error('Backend not running - start with: npm run start:dev');
  }
  
  // Validate scripts exist
  const scripts = execSync('npm run --json', { cwd: '../backend' }).toString();
  if (!scripts.includes('db:reset:force')) {
    throw new Error('Missing script: db:reset:force - add to package.json');
  }
});
```

**Rationale**: Fail fast with clear error messages instead of cryptic test failures.
```

---

### Rule 2: React Hook Usage Validation ✅

**File**: `.cursor/rules/react-hook-usage.mdc`

```markdown
# React Hook Usage - MANDATORY

## ESLint Configuration

Add to `apps/frontend/.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    // Enforce that imported hooks are used
    '@typescript-eslint/no-unused-vars': ['error', {
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
    }],
    
    // React hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Custom rule: imported context hooks must be destructured and used
    'no-unused-vars': ['error', {
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }]
  }
};
```

## Pattern: Always Use Imported Hooks

```typescript
// ❌ BAD - Hook imported but not used
import { useAccount } from '@/contexts/AccountContext';

export default function MyComponent() {
  // Missing: const { selectedAccountId } = useAccount();
  
  // Later: selectedAccountId is undefined!
  api.create(data, selectedAccountId);
}

// ✅ GOOD - Hook imported AND used immediately
import { useAccount } from '@/contexts/AccountContext';

export default function MyComponent() {
  const { selectedAccountId } = useAccount(); // ✅ Used immediately
  
  api.create(data, selectedAccountId); // ✅ Defined
}
```

## Pre-Commit Hook

```bash
#!/bin/bash
# Check for unused imports in React components

echo "🔍 Checking for unused React hooks..."

# Find all .tsx files with useAccount import but no destructuring
grep -r "import.*useAccount" apps/frontend/src --include="*.tsx" | while read -r file; do
  filename=$(echo "$file" | cut -d: -f1)
  if ! grep -q "const.*useAccount()" "$filename"; then
    echo "⚠️ $filename: useAccount imported but not used"
    exit 1
  fi
done

echo "✅ All imported hooks are used"
```

**Rationale**: Prevent runtime errors from undefined variables that should come from hooks.
```

---

### Rule 3: API-First Test Design ✅

**File**: `.cursor/rules/api-first-testing.mdc`

```markdown
# API-First Test Design - MANDATORY

## Golden Rule

```
🎯 API Contract → Tests → Implementation
🚫 NEVER write tests that assume endpoints exist
✅ ALWAYS verify API availability before test implementation
```

## Test Design Workflow

### Phase 0: API Contract Verification (BEFORE writing tests)

**MANDATORY checklist before writing ANY E2E test:**

```typescript
// 1. Document required API endpoints
/**
 * US1.1.2 Test Requirements:
 * 
 * Required Endpoints:
 * - GET /accounts ✅ (exists)
 * - POST /accounts ❌ (does NOT exist)
 * - GET /properties?accountId=X ✅ (exists)
 * 
 * Decision: 
 * - Cannot test multi-account creation dynamically
 * - Solution: Use seed data with 2 pre-created test accounts
 */
```

```typescript
// 2. Validate endpoints exist
test.beforeAll(async () => {
  console.log('=== VALIDATING API ENDPOINTS ===');
  
  // Check GET /accounts
  const accounts = await fetch('http://localhost:3001/accounts');
  expect(accounts.ok).toBe(true);
  
  // Check POST /accounts (if test requires it)
  const testPost = await fetch('http://localhost:3001/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', status: 'ACTIVE' })
  });
  
  if (!testPost.ok && testPost.status === 404) {
    throw new Error(
      'Cannot run multi-account tests: POST /accounts not implemented. ' +
      'Either: (1) Implement endpoint, or (2) Use seed data with multiple accounts'
    );
  }
});
```

### Test Data Strategy Decision Matrix

| Scenario | Use Seed Data | Use Dynamic Creation |
|---|---|---|
| Entity CRUD exists | ❌ | ✅ (preferred) |
| Entity CRUD missing | ✅ (fallback) | ❌ |
| Multiple test entities needed | ✅ (if CRUD missing) | ✅ (if CRUD exists) |
| Clean DB each test | ✅ Reset + seed | ✅ Reset + create |

### Example: Multi-Account Testing

#### ❌ BAD - Assume endpoint exists
```typescript
test('switching accounts filters properties', async () => {
  // ❌ Assumes POST /accounts exists
  const account2 = await createTestAccount('Test Account 2');
  // Will fail with 404 if endpoint missing
});
```

#### ✅ GOOD - Verify or use seed
```typescript
test('switching accounts filters properties', async () => {
  // ✅ Option 1: Verify endpoint exists
  const canCreate = await checkEndpointExists('POST', '/accounts');
  
  if (canCreate) {
    const account2 = await createTestAccount('Test Account 2');
  } else {
    // ✅ Option 2: Use seed data
    console.log('⚠️ POST /accounts not available - using seed accounts');
    const accounts = await fetch('http://localhost:3001/accounts').then(r => r.json());
    expect(accounts.length).toBeGreaterThanOrEqual(2); // Seed must provide 2+ accounts
  }
});
```

## Pre-Test API Validation Tool

```typescript
// test/helpers/api-validator.ts
export async function validateAPIContract(endpoints: {
  method: string;
  path: string;
  required: boolean;
}[]) {
  const results = [];
  
  for (const endpoint of endpoints) {
    const available = await checkEndpointExists(endpoint.method, endpoint.path);
    
    if (!available && endpoint.required) {
      throw new Error(
        `Required endpoint not available: ${endpoint.method} ${endpoint.path}\n` +
        `Cannot run tests without this endpoint.`
      );
    }
    
    results.push({ ...endpoint, available });
  }
  
  return results;
}

// Usage in test file:
test.beforeAll(async () => {
  await validateAPIContract([
    { method: 'GET', path: '/accounts', required: true },
    { method: 'POST', path: '/accounts', required: false }, // Optional
    { method: 'POST', path: '/properties', required: true },
  ]);
});
```

**Rationale**: Tests should never fail because of missing API implementation.
```

---

### Rule 4: E2E Test Wait Strategies ✅

**File**: `.cursor/rules/e2e-wait-strategies.mdc`

```markdown
# E2E Test Wait Strategies - MANDATORY

## Golden Rules

```
🚫 NEVER use hard-coded waitForTimeout()
✅ ALWAYS use explicit wait conditions
⏱️ WAIT for the specific thing you need
```

## Wait Strategy Patterns

### Pattern 1: Wait for API Response

```typescript
// ❌ BAD - Hard-coded timeout
await page.click('[data-testid="submit-button"]');
await page.waitForTimeout(2000); // Hope it's done!
expect(successNotification).toBeVisible();

// ✅ GOOD - Wait for specific API call
await page.click('[data-testid="submit-button"]');
const response = await page.waitForResponse(
  resp => resp.url().includes('/properties') && resp.status() === 201,
  { timeout: 10000 }
);
expect(response.ok()).toBe(true);
```

### Pattern 2: Wait for UI Update After API

```typescript
// ❌ BAD - Assume UI updates immediately
await page.click('[data-testid="submit-button"]');
await page.waitForResponse(resp => resp.url().includes('/properties'));
const count = await page.locator('[data-testid="property-row"]').count();
expect(count).toBeGreaterThan(0); // ❌ Might be old cached data!

// ✅ GOOD - Wait for React Query invalidation + re-render
await page.click('[data-testid="submit-button"]');
await page.waitForResponse(resp => resp.url().includes('/properties') && resp.status() === 201);

// Wait for notification (proves mutation completed)
await page.waitForSelector('[role="alert"]:has-text("הנכס נוסף בהצלחה")', {
  state: 'visible',
  timeout: 5000
});

// Wait for list to refresh (proves query invalidation worked)
await page.waitForFunction(
  (expectedName) => {
    const rows = document.querySelectorAll('[data-testid="property-row"]');
    return Array.from(rows).some(row => row.textContent?.includes(expectedName));
  },
  propertyName,
  { timeout: 10000 }
);

// NOW we can verify
const count = await page.locator('[data-testid="property-row"]').count();
expect(count).toBeGreaterThan(0);
```

### Pattern 3: Wait for Element State Change

```typescript
// ❌ BAD - No wait for state change
await page.fill('[data-testid="address"]', 'רחוב הרצל 10');
await page.click('[data-testid="submit-button"]');

// ✅ GOOD - Wait for button to be enabled (validation passed)
await page.fill('[data-testid="address"]', 'רחוב הרצל 10');
await page.waitForSelector('[data-testid="submit-button"]:not([disabled])', {
  state: 'visible',
  timeout: 5000
});
await page.click('[data-testid="submit-button"]');
```

### Pattern 4: Wait for List to Update

```typescript
// ❌ BAD - Count immediately after creation
await createProperty('Test Property');
const count = await page.locator('[data-testid="property-row"]').count();
expect(count).toBe(1); // ❌ Race condition!

// ✅ GOOD - Wait for specific item to appear
await createProperty('Test Property');
await page.waitForSelector('[data-testid="property-row"]:has-text("Test Property")', {
  state: 'visible',
  timeout: 10000
});
const count = await page.locator('[data-testid="property-row"]').count();
expect(count).toBeGreaterThanOrEqual(1);
```

### Pattern 5: Chained Operations

```typescript
// ✅ COMPREHENSIVE - Create → Wait for API → Wait for notification → Wait for list
async function createPropertyAndVerify(propertyName: string) {
  console.log(`=== CREATING PROPERTY: ${propertyName} ===`);
  
  // 1. Fill form
  await page.fill('[data-testid="address"]', propertyName);
  await page.selectOption('[data-testid="type"]', 'מגורים');
  await page.selectOption('[data-testid="status"]', 'בבעלות');
  
  // 2. Wait for validation
  await page.waitForSelector('[data-testid="submit-button"]:not([disabled])');
  
  // 3. Submit and wait for API
  const [response] = await Promise.all([
    page.waitForResponse(
      resp => resp.url().includes('/properties') && resp.status() === 201,
      { timeout: 10000 }
    ),
    page.click('[data-testid="submit-button"]')
  ]);
  
  console.log(`✓ API responded: ${response.status()}`);
  
  // 4. Wait for success notification
  await page.waitForSelector('[role="alert"]:has-text("הנכס נוסף בהצלחה")', {
    state: 'visible',
    timeout: 5000
  });
  console.log('✓ Success notification appeared');
  
  // 5. Wait for notification to disappear (proves user saw it)
  await page.waitForSelector('[role="alert"]', {
    state: 'hidden',
    timeout: 8000
  });
  console.log('✓ Notification dismissed');
  
  // 6. Wait for item to appear in list
  await page.waitForSelector(`[data-testid="property-row"]:has-text("${propertyName}")`, {
    state: 'visible',
    timeout: 10000
  });
  console.log(`✓ Property "${propertyName}" appears in list`);
  
  return response;
}
```

## Timeout Configuration

```typescript
// playwright.config.ts
export default {
  timeout: 30000, // Global test timeout
  expect: {
    timeout: 10000, // Assertion timeout
  },
  use: {
    actionTimeout: 5000, // Action timeout (click, fill, etc.)
    navigationTimeout: 10000, // Page navigation
  },
};
```

## Debugging Wait Issues

```typescript
// Add trace on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    // Capture state at failure
    await page.screenshot({ path: `failure-${testInfo.title}.png` });
    
    // Log what we were waiting for
    console.error('Test failed while waiting for:', testInfo.error);
  }
});
```

**Rationale**: Explicit waits eliminate race conditions and make tests deterministic.
```

---

### Rule 5: Test Data Management Strategy ✅

**File**: `.cursor/rules/test-data-strategy.mdc`

```markdown
# Test Data Management Strategy - MANDATORY

## Decision Matrix

### When to Use Seed Data vs. Dynamic Creation

| Criterion | Use Seed Data | Use Dynamic Creation |
|---|---|---|
| **API Availability** | CRUD missing | CRUD exists |
| **Test Isolation** | If reset + seed is fast | If creation is fast |
| **Multiple Entities** | Pre-create all variants | Create on-demand |
| **Test Complexity** | Simple scenarios | Complex setups |
| **Maintenance** | Centralized in seed file | Distributed in tests |

### Example: Account Testing

#### Scenario: Need 2 test accounts

##### Option 1: Seed Data (RECOMMENDED if POST /accounts missing)

```typescript
// prisma/seed.ts
async function main() {
  // Create multiple test accounts for multi-account testing
  const testAccount1 = await prisma.account.create({
    data: {
      id: 'test-account-1',
      name: 'Test Account',
      status: 'ACTIVE',
    },
  });
  
  const testAccount2 = await prisma.account.create({
    data: {
      id: 'test-account-2',
      name: 'Test Account 2',
      status: 'ACTIVE',
    },
  });
  
  console.log('✅ Created 2 test accounts for multi-account testing');
}
```

```typescript
// test/e2e/multi-account.spec.ts
test.beforeEach(async () => {
  execSync('npm run db:reset:force'); // Resets + seeds both accounts
  TEST_ACCOUNT_1_ID = await fetchAccountByName('Test Account');
  TEST_ACCOUNT_2_ID = await fetchAccountByName('Test Account 2');
});

test('switching accounts filters properties', async () => {
  // Use pre-seeded accounts
  await createProperty(TEST_ACCOUNT_1_ID, 'Account 1 Property');
  await createProperty(TEST_ACCOUNT_2_ID, 'Account 2 Property');
  // ...
});
```

##### Option 2: Dynamic Creation (RECOMMENDED if POST /accounts exists)

```typescript
// test/e2e/multi-account.spec.ts
test.beforeEach(async () => {
  execSync('npm run db:reset:force'); // Creates base Test Account
  TEST_ACCOUNT_1_ID = await fetchAccountByName('Test Account');
});

test('switching accounts filters properties', async () => {
  // Create additional accounts on-demand
  const account2 = await createTestAccount('Test Account 2');
  
  await createProperty(TEST_ACCOUNT_1_ID, 'Account 1 Property');
  await createProperty(account2.id, 'Account 2 Property');
  // ...
});
```

### Decision Process

```typescript
// test/helpers/test-data-strategy.ts
export async function getTestAccounts(): Promise<{
  account1Id: string;
  account2Id: string;
  strategy: 'seed' | 'dynamic';
}> {
  // Check if POST /accounts exists
  const canCreateAccounts = await checkEndpointExists('POST', '/accounts');
  
  if (!canCreateAccounts) {
    console.log('ℹ️ POST /accounts not available - using seed strategy');
    
    // Verify seed provides 2 accounts
    const accounts = await fetch('http://localhost:3001/accounts').then(r => r.json());
    
    if (accounts.length < 2) {
      throw new Error(
        'Seed data must provide at least 2 test accounts for multi-account testing.\n' +
        'Update prisma/seed.ts to create "Test Account" and "Test Account 2"'
      );
    }
    
    return {
      account1Id: accounts.find(a => a.name === 'Test Account')!.id,
      account2Id: accounts.find(a => a.name === 'Test Account 2')!.id,
      strategy: 'seed'
    };
  } else {
    console.log('ℹ️ POST /accounts available - using dynamic creation');
    
    const account1Id = await fetchAccountByName('Test Account');
    const account2 = await createTestAccount('Test Account 2');
    
    return {
      account1Id,
      account2Id: account2.id,
      strategy: 'dynamic'
    };
  }
}
```

### Seed Data Standards

#### Naming Conventions
- Primary test account: `"Test Account"` (ID: `test-account-1`)
- Secondary test accounts: `"Test Account 2"`, `"Test Account 3"`, etc.
- IDs: `test-account-1`, `test-account-2`, etc.

#### Seed File Structure
```typescript
// prisma/seed.ts
async function main() {
  console.log('🌱 Starting seed...');
  
  // 1. Core test data (ALWAYS created)
  const testAccount = await createTestAccount('Test Account', 'test-account-1');
  const testUser = await createTestUser(testAccount.id);
  
  // 2. Multi-account test data (for US1.1.2)
  if (process.env.MULTI_ACCOUNT_TESTS === 'true') {
    await createTestAccount('Test Account 2', 'test-account-2');
    console.log('✅ Created multi-account test data');
  }
  
  // 3. Sample data (properties, tenants, etc.)
  await createSampleProperties(testAccount.id);
  
  console.log('🎉 Seed completed!');
}
```

### Migration Path

**Current situation** (2026-02-04):
- ❌ POST /accounts does NOT exist
- ❌ Tests assume dynamic creation
- ❌ Tests fail with 404

**Solution**:
```typescript
// Immediate fix: Update seed.ts to create 2 accounts
// Then update tests to use seed strategy

// Long-term: Implement POST /accounts
// Then switch tests to dynamic strategy
```

**Rationale**: Tests should adapt to API availability, not block on missing endpoints.
```

---

## 🎯 Action Items

### Immediate (This Week)
- [ ] **Create Rule**: E2E Test Infrastructure Validation
- [ ] **Create Rule**: React Hook Usage Validation
- [ ] **Create Rule**: API-First Test Design
- [ ] **Create Rule**: E2E Wait Strategies
- [ ] **Create Rule**: Test Data Management Strategy

### Short-Term (Next Sprint)
- [ ] **Implement**: `validate-test-env.sh` script
- [ ] **Configure**: ESLint rules for unused hooks
- [ ] **Update**: `prisma/seed.ts` to create 2 test accounts
- [ ] **Fix**: US1.1 timing issues (TC-E2E-002, TC-E2E-006, TC-E2E-007)
- [ ] **Update**: US1.1.2 tests to use seed-based account strategy

### Medium-Term (Next Quarter)
- [ ] **Implement**: POST /accounts endpoint
- [ ] **Migrate**: US1.1.2 tests to dynamic account creation
- [ ] **Add**: Pre-commit hooks for test validation
- [ ] **Document**: Test data strategy in testing guide

---

## 📈 Success Metrics

### Test Reliability
- **Current**: 67% pass rate (10/15 tests)
- **Target**: 95%+ pass rate (consistent green)

### Test Speed
- **Current**: 5.6 minutes total (4.4m + 1.2m)
- **Target**: < 3 minutes (with parallelization)

### Test Maintenance
- **Current**: 3 categories of failures (infrastructure, code, timing)
- **Target**: Only true bugs cause failures (no flaky tests)

---

## 🔄 Follow-Up Actions

### For Next Retrospective
- Review rule adoption rate
- Measure test pass rate improvement
- Collect feedback on new strategies
- Identify new patterns/issues

---

## 📚 References

- [E2E Test Results - US1.1](../test-results/epic-01/user-story-1.1/)
- [E2E Test Results - US1.1.2](../test-results/epic-01/user-story-1.1.2/)
- [5-Phase TDD Workflow](../WORKFLOW_UPDATE_5_PHASE_TDD.md)
- [General Requirements](../project_management/GENERAL_REQUIREMENTS.md)

---

## 🙏 Acknowledgments

**What Went Well**: Rapid problem identification and resolution  
**Team Effort**: Collaborative debugging and systematic root cause analysis  
**Continuous Improvement**: Turning failures into learning opportunities

**"Fail fast, learn faster, improve continuously"** 🚀
