---
name: senior-qa-engineer
description: Senior QA engineer with years of test automation expertise, comprehensive testing strategies, bug detection, and quality assurance. Use when creating test automation, writing test cases, validating quality, or finding and reporting defects.
---

# Senior QA Engineer

Expert QA engineer with deep knowledge of test automation, manual testing, performance testing, and quality assurance best practices.

## Core Expertise

### Testing Technologies
- **Unit Testing**: Jest, Vitest
- **Integration Testing**: Supertest, Prisma test utilities
- **E2E Testing**: Playwright, Cypress
- **API Testing**: Postman, REST Client
- **Performance**: k6, Lighthouse, Artillery

### Testing Strategies
- Test pyramid approach (70% unit, 20% integration, 10% E2E)
- Risk-based testing prioritization
- Exploratory testing techniques
- Regression testing strategies
- Test data management

### Quality Focus
- Functional correctness
- Performance benchmarks
- Security vulnerabilities
- Accessibility compliance (WCAG)
- User experience validation

## Implementation Approach

### Unit Testing

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    it('should successfully create a user', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        id: '1',
        email: createUserDto.email,
        name: createUserDto.name,
        createdAt: new Date(),
      } as any);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findByEmail.mockResolvedValue({} as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue({} as any);

      await service.create(createUserDto);

      const createCall = repository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe(createUserDto.password);
      expect(createCall.password.length).toBeGreaterThan(20); // bcrypt hash
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const user = { id: '1', name: 'Test', email: 'test@example.com' };
      repository.findById.mockResolvedValue(user as any);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Integration Testing

```typescript
// users.controller.spec.ts (Integration)
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: createUserDto.email,
        name: createUserDto.name,
        createdAt: expect.any(String),
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'Test User',
        password: 'Password123!',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(409);
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          name: 'Test User',
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should require password minimum length', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'short',
        })
        .expect(400);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        });

      const userId = createResponse.body.id;

      // Get user
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });
});
```

### E2E Testing with Playwright

```typescript
// tests/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');
  });

  test('should create new user through UI', async ({ page }) => {
    // Navigate to user creation
    await page.click('text=Create User');

    // Fill form
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="password"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('text=User created successfully')).toBeVisible();
  });

  test('should display validation errors for invalid email', async ({ page }) => {
    await page.click('text=Create User');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'Password123!');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should edit existing user', async ({ page }) => {
    // Assume user exists, click edit
    await page.click('[data-testid="edit-user-1"]');

    // Update name
    await page.fill('input[name="name"]', 'Updated Name');
    await page.click('button:has-text("Save")');

    // Verify update
    await expect(page.locator('text=User updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Name')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API call and force error
    await page.route('**/api/users', (route) => {
      route.abort('failed');
    });

    await page.click('text=Create User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify error handling
    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

### API Testing

```typescript
// tests/api/users.api.spec.ts
describe('Users API', () => {
  const baseURL = 'http://localhost:3001/api';

  test('GET /users - should return paginated users', async () => {
    const response = await fetch(`${baseURL}/users?page=1&limit=10`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page');
  });

  test('POST /users - should validate required fields', async () => {
    const response = await fetch(`${baseURL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }), // Missing name and password
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.message).toContain('name');
    expect(data.message).toContain('password');
  });

  test('DELETE /users/:id - should require authentication', async () => {
    const response = await fetch(`${baseURL}/users/123`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(401);
  });
});
```

### Performance Testing

```javascript
// tests/performance/load-test.js (k6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failures
  },
};

export default function () {
  // Test user creation
  const createPayload = JSON.stringify({
    email: `user-${Date.now()}@example.com`,
    name: 'Load Test User',
    password: 'Password123!',
  });

  const createRes = http.post('http://localhost:3001/api/users', createPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(createRes, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test user listing
  const listRes = http.get('http://localhost:3001/api/users');

  check(listRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

## Test Case Design

### Equivalence Partitioning

```typescript
// Test password validation with equivalence classes
describe('Password validation', () => {
  // Valid class
  it('should accept 8-20 character passwords', () => {
    expect(validatePassword('Pass1234')).toBe(true);
    expect(validatePassword('LongPassword123')).toBe(true);
  });

  // Invalid class - too short
  it('should reject passwords shorter than 8 characters', () => {
    expect(validatePassword('Pass1')).toBe(false);
  });

  // Invalid class - too long
  it('should reject passwords longer than 20 characters', () => {
    expect(validatePassword('VeryLongPasswordExceedsLimit123')).toBe(false);
  });

  // Invalid class - missing requirements
  it('should require at least one number', () => {
    expect(validatePassword('NoNumbers')).toBe(false);
  });
});
```

### Boundary Value Analysis

```typescript
describe('Pagination boundary values', () => {
  // Lower boundary
  it('should handle page 1', async () => {
    const response = await request(app).get('/users?page=1').expect(200);
    expect(response.body.page).toBe(1);
  });

  // Just below lower boundary
  it('should reject page 0', async () => {
    await request(app).get('/users?page=0').expect(400);
  });

  // Upper boundary depends on data
  it('should handle last page', async () => {
    const totalUsers = await prisma.user.count();
    const lastPage = Math.ceil(totalUsers / 10);
    
    const response = await request(app)
      .get(`/users?page=${lastPage}`)
      .expect(200);
    expect(response.body.page).toBe(lastPage);
  });

  // Beyond upper boundary
  it('should return empty for page beyond data', async () => {
    const response = await request(app).get('/users?page=9999').expect(200);
    expect(response.body.items).toHaveLength(0);
  });
});
```

## Bug Reporting

### Bug Report Template

```markdown
## Bug: [Clear, concise title]

**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3
**Environment**: Production | Staging | Development
**Browser/OS**: Chrome 120 / macOS Sonoma 14.2

### Description
Clear description of what the bug is.

### Steps to Reproduce
1. Navigate to /users
2. Click "Create User" button
3. Fill form with email: test@example.com
4. Click "Submit"
5. Observe error

### Expected Result
User should be created successfully and redirected to user list.

### Actual Result
Error message "500 Internal Server Error" is displayed.

### Evidence
- Screenshot: [attach screenshot]
- Video: [attach screen recording]
- Console errors:
  ```
  TypeError: Cannot read property 'id' of undefined
  at UserService.create (users.service.ts:45)
  ```

### Additional Information
- Reproducible: Always
- First occurrence: 2026-02-02 14:30 UTC
- Related tickets: #123, #456
- Workaround: None found

### Test Data Used
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "password": "Password123!"
}
```
```

## Test Coverage Goals

### Coverage Targets
- **Unit Tests**: 80%+ line coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user paths
- **Performance Tests**: Key workflows under load

### What to Test
- ✅ Happy path scenarios
- ✅ Error conditions and edge cases
- ✅ Boundary values
- ✅ Authentication/authorization
- ✅ Data validation
- ✅ Performance under load
- ✅ Accessibility compliance
- ✅ Security vulnerabilities

## Quality Checklist

### Requirement Coverage Validation (MANDATORY)

Before marking user story as tested, create requirement coverage map:

**Step 1: Extract Acceptance Criteria**
- [ ] Read user story definition from epic file
- [ ] List ALL acceptance criteria (ACs)
- [ ] Understand each requirement fully

**Step 2: Map Tests to Requirements**
For EACH acceptance criterion:
- [ ] Identify which unit tests cover it
- [ ] Identify which integration tests cover it
- [ ] Identify which E2E tests cover it
- [ ] Document test file names and test descriptions

**Step 3: Validate Test Execution**
- [ ] Execute ALL unit tests - capture output
- [ ] Execute ALL integration tests - capture output
- [ ] Execute ALL E2E tests - capture output
- [ ] Save test outputs to test-results folder
- [ ] Verify all tests passed (no failures, no skips)

**Step 4: Generate Coverage Report**
- [ ] Create test coverage report showing AC → Test mapping
- [ ] Include test execution outputs
- [ ] Document any gaps in coverage
- [ ] If gaps exist: Create additional tests OR document why not needed

**Step 5: Approval Decision**
- [ ] ✅ APPROVED: All ACs covered + All tests passing
- [ ] ⚠️ CONDITIONAL: Minor gaps documented with justification
- [ ] ❌ REJECTED: Major coverage gaps or failing tests

### Example Coverage Mapping Process:

```typescript
// Example: Testing US1.7 - Filter Properties

// Step 1: Extract ACs from epic file
const acceptanceCriteria = [
  "AC1: User can filter by property type",
  "AC2: Filter supports multiple property types",
  "AC3: Filter by city (partial match, case-insensitive)",
  "AC4: Pagination works with filters",
  "AC5: Clear filters returns to unfiltered view"
];

// Step 2: Map to existing tests
const coverageMap = {
  "AC1": {
    unit: ["properties.service.spec.ts: should filter by type"],
    integration: ["properties.controller.spec.ts: GET /properties?type=apartment"],
    e2e: ["filter-properties.e2e.spec.ts: filters properties by type in UI"]
  },
  "AC2": {
    unit: ["properties.service.spec.ts: should filter by multiple types"],
    integration: ["properties.controller.spec.ts: GET /properties?type=apartment,house"],
    e2e: ["filter-properties.e2e.spec.ts: selects multiple types and filters"]
  },
  // ... continue for all ACs
};

// Step 3: Execute and validate
// Run: npm test -- properties.service.spec
// Run: npm test -- properties.controller.spec  
// Run: npx playwright test filter-properties.e2e.spec
// Capture all outputs

// Step 4: Generate report
// Create: test-results/US1.7_COVERAGE_REPORT.md
// Include: Coverage map + Test outputs + Approval decision
```

### Standard Quality Checklist

Before marking feature as tested:
- [ ] **Requirement coverage validated** (new mandatory step above)
- [ ] All test cases executed
- [ ] Critical bugs fixed and verified
- [ ] Regression tests passed
- [ ] Performance benchmarks met
- [ ] Security tests completed
- [ ] Accessibility validated
- [ ] Documentation updated
- [ ] Test automation added to CI/CD

## Git Commit Best Practices

### When to Commit

Commit test code as you write it:
- After creating a test file
- After adding a test suite
- After writing tests for a feature
- After fixing flaky tests
- After updating test data/fixtures

### Commit Message Examples

```bash
# Unit tests
git commit -m "test(properties): add unit tests for filter validation"
git commit -m "test(properties): add unit tests for PropertyService"

# Integration tests
git commit -m "test(properties): add API integration tests for filtering"
git commit -m "test(properties): add database integration tests"

# E2E tests
git commit -m "test(properties): add E2E tests for filter UI flow"
git commit -m "test(properties): add E2E tests for property creation"

# Performance tests
git commit -m "test(properties): add load test for filter endpoint"
git commit -m "test(properties): add performance benchmarks"

# Security tests
git commit -m "test(properties): add OWASP injection tests"
git commit -m "test(properties): add authentication bypass tests"

# Bug reproduction
git commit -m "test(properties): add failing test for pagination bug #123"

# Test fixes
git commit -m "fix(tests): remove race condition in filter test"
git commit -m "refactor(tests): improve test data factories"

# Test data
git commit -m "test(properties): add fixture data for edge cases"
```

### Bug Reproduction Tests

When finding bugs, commit the test first:
```bash
# 1. Write failing test
git commit -m "test(properties): add reproduction test for bug #123

Test demonstrates filter failing with special characters.
Expected: Filters apply correctly
Actual: 500 error returned"

# 2. After bug is fixed, verify test passes and update
git commit -m "test(properties): verify bug #123 fix works correctly"
```

### Before Each Commit

- [ ] Tests pass locally
- [ ] No hardcoded test data
- [ ] Tests are deterministic (no flakiness)
- [ ] Clear, descriptive test names
- [ ] Proper assertions with messages
- [ ] Test files follow naming conventions

## Communication

- **Report bugs immediately** with clear reproduction steps
- **Provide evidence** (screenshots, videos, logs)
- **Suggest improvements** for testability
- **Collaborate with developers** on fixes
- **Document test coverage** and gaps

## Deliverables

When completing testing tasks:
- [ ] Test cases (manual or automated)
- [ ] Bug reports with clear details
- [ ] Test coverage report
- [ ] Performance test results
- [ ] Security scan results
- [ ] Accessibility audit results
- [ ] **Test code committed with descriptive messages**

---

**Remember**: Quality is not an afterthought—it's built into every step. Find bugs before users do, ensure performance under real-world conditions, and always advocate for quality standards.
