# Production Testing Guide

## Why Production Tests Are Critical

### The Gap: Development vs. Production

**What happened with the dynamic routes bug:**
- ✅ All development tests passed
- ✅ All unit tests passed
- ✅ All E2E tests on localhost passed
- ❌ **But production was broken!**

**Root cause:**
- `output: 'standalone'` in `next.config.js` worked fine in development
- But caused 404 errors for dynamic routes (`/properties/[id]`) on Vercel production
- Our E2E tests only ran on **localhost**, not on **production**

---

## Types of Tests by Environment

### 1. Development Tests (Localhost)
**Location:** `test/e2e/*.spec.ts`
**Run on:** `http://localhost:3000`
**Purpose:** Fast feedback during development
**Limitations:** May not catch production-specific issues

### 2. Production Smoke Tests
**Location:** `test/e2e/production/smoke-tests.spec.ts`
**Run on:** `https://rent-management-app-frontend.vercel.app`
**Purpose:** Verify critical flows work in production
**Run:** After every deployment

---

## Running Production Tests

### Prerequisites

```bash
# Install Playwright (if not already)
cd apps/frontend
npm install -D @playwright/test
npx playwright install
```

### Run Against Production

```bash
# Run production smoke tests
FRONTEND_URL=https://rent-management-app-frontend.vercel.app \
BACKEND_URL=https://rent-app-backend-6s337cqx6a-uc.a.run.app \
npx playwright test test/e2e/production/smoke-tests.spec.ts
```

### What Gets Tested

1. **Homepage loads** - Basic connectivity
2. **List pages load** - Properties, leases, tenants
3. **Dynamic routes work** - `/properties/[id]` ← Critical!
4. **Navigation works** - List → Details
5. **No redirects to homepage** - Verifies routing

---

## CI/CD Integration

### Add to GitHub Actions

Create `.github/workflows/production-smoke-tests.yml`:

```yaml
name: Production Smoke Tests

on:
  # Run after successful deployment
  workflow_run:
    workflows: ["Deploy Frontend to Vercel"]
    types:
      - completed
  # Allow manual trigger
  workflow_dispatch:

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: apps/frontend
        run: npm ci
        
      - name: Install Playwright browsers
        working-directory: apps/frontend
        run: npx playwright install --with-deps chromium
        
      - name: Wait for deployment (give Vercel time to deploy)
        run: sleep 60
        
      - name: Run production smoke tests
        working-directory: apps/frontend
        env:
          FRONTEND_URL: https://rent-management-app-frontend.vercel.app
          BACKEND_URL: https://rent-app-backend-6s337cqx6a-uc.a.run.app
        run: npx playwright test test/e2e/production/smoke-tests.spec.ts
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: production-smoke-test-results
          path: apps/frontend/playwright-report/
```

---

## Manual Verification Checklist

After every production deployment, manually verify:

### Critical User Flows
- [ ] Homepage loads
- [ ] Properties list loads
- [ ] Click on property → Details page loads (NOT homepage!)
- [ ] Click "צפייה" → Details page loads
- [ ] Back button → Returns to list
- [ ] Leases page loads
- [ ] Tenants page loads
- [ ] Create property form works
- [ ] Create expense with property selection works

---

## Test Coverage Gap Analysis

### What We Had
✅ Unit tests (85%+ coverage)
✅ API integration tests (backend)
✅ E2E tests on localhost

### What We Missed
❌ Production smoke tests
❌ Vercel-specific configuration tests
❌ Dynamic route verification on production
❌ Build configuration validation

---

## Best Practices Going Forward

### 1. Test Pyramid Enhanced

```
        Production Smoke Tests (5-10 critical flows)
              /\
             /  \
            /    \
           /  E2E \  (Localhost - comprehensive)
          /________\
         /          \
        / Integration \  (API tests)
       /______________\
      /                \
     /   Unit Tests     \  (85%+ coverage)
    /____________________\
```

### 2. When to Run Each Level

| Level | Frequency | Purpose |
|-------|-----------|---------|
| Unit | On every commit | Fast feedback |
| Integration | Before merge | API contracts |
| E2E (localhost) | Before merge | Full flows |
| **Production Smoke** | **After deployment** | **Config issues** |

### 3. What to Test in Production

**DO test (smoke tests):**
- ✅ Critical paths (login, list, details, create)
- ✅ Dynamic routing
- ✅ Configuration-dependent features
- ✅ CORS and API connectivity
- ✅ Authentication flows

**DON'T test (use dev tests):**
- ❌ Detailed validation logic
- ❌ Edge cases
- ❌ Complex workflows
- ❌ Destructive operations (unless cleanup is guaranteed)

---

## Lessons Learned

### Issue: Dynamic Routes Broken on Vercel

**Detection:**
- ❌ Not caught by unit tests (focused on logic)
- ❌ Not caught by integration tests (API only)
- ❌ Not caught by localhost E2E (works on dev server)
- ✅ **Should have been caught by production smoke tests**

**Prevention:**
- ✅ Add production smoke tests after deployments
- ✅ Test dynamic routes specifically
- ✅ Verify URL doesn't redirect to homepage
- ✅ Run tests on actual production environment

**Root Cause:**
- `output: 'standalone'` in `next.config.js` incompatible with Vercel
- Only manifests in production build

---

## Quick Reference Commands

```bash
# Run all development E2E tests (localhost)
cd apps/frontend
npx playwright test test/e2e/

# Run production smoke tests
FRONTEND_URL=https://rent-management-app-frontend.vercel.app \
BACKEND_URL=https://rent-app-backend-6s337cqx6a-uc.a.run.app \
npx playwright test test/e2e/production/

# Run specific production test
FRONTEND_URL=https://rent-management-app-frontend.vercel.app \
npx playwright test test/e2e/production/smoke-tests.spec.ts -g "SMOKE-003"

# Run with UI mode (visual debugging)
FRONTEND_URL=https://rent-management-app-frontend.vercel.app \
npx playwright test test/e2e/production/ --ui
```

---

## Summary

**How the bug slipped through:**
1. ✅ Code was correct
2. ✅ Worked in development
3. ✅ Passed all development tests
4. ❌ **Production-specific configuration issue**
5. ❌ **No production tests to catch it**

**Solution:**
1. ✅ Fixed the configuration (`next.config.js`)
2. ✅ Added production smoke tests
3. ✅ Documented testing strategy
4. 📋 TODO: Add to CI/CD pipeline

**Key Takeaway:**
> **Always test in the environment where users will use the app!**
> Development tests ≠ Production validation

---

**Created:** February 7, 2026  
**Author:** QA Team  
**Status:** Active
