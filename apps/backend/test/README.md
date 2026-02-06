# Backend Testing Guide

Quick reference for running tests in the Rent Application backend.

---

## Test Types

### 1. Unit Tests (`.spec.ts`)

Test individual services and controllers in isolation.

**Location:** `src/**/*.spec.ts`

**Run:**
```bash
# Run all unit tests
npm test

# Run specific unit test
npm test -- owners.service.spec.ts

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

**Examples:**
- `src/modules/owners/owners.service.spec.ts`
- `src/modules/mortgages/mortgages.service.spec.ts`
- `src/modules/financials/financials.service.spec.ts`

---

### 2. E2E Tests (`.e2e-spec.ts`)

Test complete workflows through the API using a real test server.

**Location:** `test/*.e2e-spec.ts`

**Run:**
```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- property-fields.e2e-spec.ts

# Run with verbose output
npm run test:e2e -- --verbose

# Run single test by name
npm run test:e2e -- -t "should update plot field: gush"
```

**Available E2E Tests:**
- `test/property-fields.e2e-spec.ts` - Comprehensive property field modifications

---

## Quick Commands

### Most Common

```bash
# Run all tests (unit + e2e)
npm test && npm run test:e2e

# Run only unit tests
npm test

# Run only e2e tests
npm run test:e2e

# Watch mode for development
npm run test:watch
```

### With Coverage

```bash
# Unit test coverage
npm run test:cov

# View coverage report
open coverage/lcov-report/index.html
```

### Debugging

```bash
# Debug unit tests
npm run test:debug

# Debug e2e tests
node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --config ./test/jest-e2e.json --runInBand
```

---

## Test Structure

### Unit Test Example

```typescript
describe('OwnersService', () => {
  let service: OwnersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OwnersService, PrismaService],
    }).compile();

    service = module.get<OwnersService>(OwnersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create an owner', async () => {
    // Test implementation
  });
});
```

### E2E Test Example

```typescript
describe('Properties E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  it('should update property fields', async () => {
    await request(app.getHttpServer())
      .patch('/properties/123')
      .send({ address: 'New Address' })
      .expect(200);
  });
});
```

---

## Prerequisites

### For Unit Tests

- ✅ Dependencies installed (`npm install`)
- ✅ That's it! Unit tests are mocked

### For E2E Tests

- ✅ Dependencies installed (`npm install`)
- ✅ PostgreSQL running
- ✅ Database exists (`rent_app`)
- ✅ Migrations applied (`npx prisma migrate deploy`)
- ✅ `.env` configured with `DATABASE_URL`

**Note:** E2E tests start their own server - don't run `npm run dev` separately.

---

## Test Data Management

### Unit Tests
- ✅ Use mocked data (no database)
- ✅ No cleanup needed
- ✅ Fast execution

### E2E Tests
- ✅ Use real database
- ✅ Automatic cleanup in `afterAll()`
- ✅ Isolated test accounts
- ✅ No interference with production data

---

## Available E2E Tests

### Property Fields E2E (`property-fields.e2e-spec.ts`)

**Tests:** 39 tests across 5 suites  
**Duration:** ~2.5 seconds  
**Status:** ✅ All passing

**Coverage:**
- ✅ All 17 property fields
- ✅ New fields (gush, helka, isMortgaged)
- ✅ Field validation
- ✅ Account isolation
- ✅ Edge cases
- ✅ Complete lifecycle

**Run:**
```bash
npm run test:e2e -- property-fields.e2e-spec.ts
```

**Documentation:**
- Test guide: `test/e2e/PROPERTY_FIELDS_E2E_TEST.md`
- Test results: `test/e2e/TEST_RESULTS.md`

---

## Continuous Testing

### Pre-Commit

Run before every commit:
```bash
npm test
```

### Pre-Push

Run before pushing to remote:
```bash
npm test && npm run test:e2e
```

### Pre-Deploy

Run before deploying to production:
```bash
npm run test:cov
npm run test:e2e
```

---

## Troubleshooting

### Tests Timeout

**Problem:** Tests hang or timeout

**Solution:**
```bash
# Increase timeout
jest --testTimeout=30000
```

### Database Connection Failed

**Problem:** E2E tests can't connect to database

**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -d rent_app -c "SELECT 1;"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Run migrations
npx prisma migrate deploy
```

### Port Already in Use

**Problem:** E2E test fails with "Port 3000 already in use"

**Solution:**
```bash
# Stop any running backend server
pkill -f "nest start"

# E2E tests start their own server
npm run test:e2e
```

### Tests Pass But App Fails

**Problem:** Tests pass but production doesn't work

**Solution:**
- Tests use test environment
- Check production `.env` configuration
- Verify production database migrations
- Check production logs

---

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
- name: Run unit tests
  run: npm test
  working-directory: apps/backend

- name: Run E2E tests
  run: npm run test:e2e
  working-directory: apps/backend
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
cd apps/backend
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed - commit blocked"
  exit 1
fi
```

---

## Test Metrics

### Current Status

| Metric | Value |
|--------|-------|
| **Total Unit Tests** | 6 files |
| **Total E2E Tests** | 1 file (39 tests) |
| **Unit Test Coverage** | TBD |
| **E2E Test Success Rate** | 100% |
| **Average E2E Duration** | ~2.5s |

### Goals

| Metric | Current | Target |
|--------|---------|--------|
| **Unit Coverage** | TBD | >80% |
| **E2E Coverage** | Properties only | All modules |
| **Test Duration** | <5s | <10s |
| **Success Rate** | 100% | 100% |

---

## Summary

**Quick Commands:**
```bash
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:cov      # Unit tests with coverage
npm run test:watch    # Watch mode
```

**Status:**
- ✅ Unit tests: Ready
- ✅ E2E tests: Ready
- ✅ Test infrastructure: Complete
- ✅ Documentation: Complete

**Next:**
- Expand E2E coverage to other modules
- Add integration tests
- Increase unit test coverage

---

**Last Updated:** February 2, 2026  
**Test Framework:** Jest 29.7.0  
**E2E Framework:** Supertest 6.3.4
