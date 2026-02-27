# Epic Testing User Story - Standard Template

This template should be added as the **FINAL user story** in every epic to ensure comprehensive testing coverage before the epic is marked as complete.

---

## Template

```markdown
### US{X}.{FINAL}: Complete Testing Coverage for {Epic Name}
**As a** development team,  
**I can** verify that all {Epic Name} functionality is covered by comprehensive tests,  
**So that** we ensure quality, prevent regressions, and can confidently deploy to production.

**Priority:** 🔴 Critical  
**Status:** ⏳ Pending (only starts when all other user stories in epic are implemented)  
**Type:** Quality Assurance / Testing

**Dependencies:** ALL other user stories in this epic must be implemented first

---

**Acceptance Criteria:**

**Backend Team - Unit Tests (80%+ coverage target):**
- [ ] All service methods have unit tests
- [ ] All business logic covered with unit tests
- [ ] All edge cases tested (null values, empty arrays, boundary conditions)
- [ ] All validation logic tested
- [ ] All error handling tested
- [ ] All database queries tested (mocked)
- [ ] All DTOs validated with proper test cases
- [ ] All enum values tested
- [ ] Test coverage report generated and reviewed
- [ ] Coverage meets or exceeds 80% for all modules in this epic

**QA Team - Backend Integration/API Tests (100% endpoint coverage):**
- [ ] **Engineer 1: CRUD Operations Testing**
  - All CREATE endpoints tested with valid data
  - All READ endpoints tested (single item, list, filtered, paginated)
  - All UPDATE endpoints tested with valid data
  - All DELETE endpoints tested
  - Response schemas validated for all endpoints
  
- [ ] **Engineer 2: Validation & Error Handling Testing**
  - All required field validations tested
  - All data type validations tested
  - All constraint validations tested (unique, foreign key, etc.)
  - All error responses tested (400, 404, 409, 500)
  - Error message formats verified
  
- [ ] **Engineer 3: Edge Cases & Security Testing**
  - Empty request bodies tested
  - Invalid IDs tested
  - Unauthorized access tested (wrong account/user)
  - SQL injection attempts tested
  - Pagination edge cases tested (page 0, negative, beyond limit)
  - Search/filter edge cases tested
  
- [ ] **Engineer 4: Performance & Data Integrity Testing**
  - Response time benchmarks met (<200ms for simple queries)
  - Large dataset handling tested (1000+ records)
  - Concurrent requests tested
  - Database constraints verified
  - Referential integrity tested
  - Transaction rollback tested

**Frontend Team - UI/Component Tests (90%+ coverage target):**
- [ ] **Engineer 1: Component Unit Tests**
  - All components render correctly
  - All form components tested
  - All data display components tested
  - Component prop validation tested
  - Component state management tested
  
- [ ] **Engineer 2: Form Validation Tests**
  - All required field validations tested
  - All field format validations tested (email, phone, numbers, dates)
  - All custom validation rules tested
  - Validation error messages display correctly
  - Form submission with valid data succeeds
  - Form submission with invalid data shows errors
  
- [ ] **Engineer 3: User Interaction Tests**
  - All buttons clickable and trigger correct actions
  - All dropdowns/selects work correctly
  - All modals/dialogs open and close correctly
  - All navigation works correctly
  - All search functionality works
  - All filter functionality works
  - Loading states display correctly
  - Empty states display correctly
  
- [ ] **Engineer 4: Data Integration Tests**
  - All API calls made correctly (mocked with MSW)
  - Success responses handled correctly
  - Error responses handled correctly
  - Loading states managed correctly
  - Optimistic updates work correctly (if applicable)
  - Cache invalidation works correctly
  - Data refresh works correctly

**QA Team - End-to-End (E2E) Tests (All user flows covered):**
- [ ] **Engineer 1: Happy Path Flows**
  - Complete user journey for each user story tested
  - All CRUD operations work end-to-end
  - Data persists correctly across operations
  - Navigation between related pages works
  
- [ ] **Engineer 2: Alternative & Error Flows**
  - User cancels operations (data not saved)
  - User encounters errors (proper error messages shown)
  - User corrects validation errors (can retry)
  - User handles expired sessions
  
- [ ] **Engineer 3: Cross-Feature Integration**
  - Related entities work together (FK relationships)
  - Inline entity creation works end-to-end
  - Cascading operations work correctly
  - Data consistency across features
  
- [ ] **Engineer 4: UI/UX & Accessibility**
  - Responsive design works (mobile, tablet, desktop)
  - RTL layout works correctly (for Hebrew)
  - Keyboard navigation works
  - Screen reader compatibility verified
  - All form labels present
  - All ARIA attributes correct

**Documentation & Reporting:**
- [ ] Test coverage report generated for backend
- [ ] Test coverage report generated for frontend
- [ ] E2E test results documented
- [ ] All test failures documented and resolved
- [ ] Test execution time documented
- [ ] Known issues documented (if any)
- [ ] Testing summary report created

**Quality Gates (All must pass):**
- [ ] Backend unit test coverage ≥ 80%
- [ ] Frontend test coverage ≥ 90%
- [ ] All API endpoints have integration tests
- [ ] All user flows have E2E tests
- [ ] Zero failing tests
- [ ] Zero critical bugs
- [ ] All acceptance criteria from all user stories verified by tests

---

**Technical Details:**

**Backend Testing Stack:**
- Unit Tests: Jest + ts-jest
- Integration Tests: Jest + Supertest
- Database: In-memory Prisma for tests
- Mocking: Jest mocks for external services

**Frontend Testing Stack:**
- Component Tests: Jest + React Testing Library
- E2E Tests: Playwright
- API Mocking: MSW (Mock Service Worker)
- Accessibility: jest-axe

**Test Organization:**
```
tests/
├── unit/
│   ├── backend/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   └── frontend/
│       └── components/
├── integration/
│   └── api/
│       └── {epic-name}/
└── e2e/
    └── {epic-name}/
        ├── happy-paths/
        ├── error-handling/
        └── accessibility/
```

**Running Tests:**
```bash
# Backend unit tests
npm run test:backend:unit

# Backend integration tests
npm run test:backend:integration

# Frontend unit tests
npm run test:frontend:unit

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# Coverage reports
npm run test:coverage
```

---

**Definition of Done:**
- [ ] All quality gates passed
- [ ] Test coverage targets met
- [ ] All tests passing in CI/CD pipeline
- [ ] Code review completed
- [ ] Testing summary report reviewed by team leads
- [ ] Epic marked as ✅ Complete with comprehensive test coverage
```

---

## Notes for Implementation

### When to Add This User Story:
- Add as the **last user story** in each epic
- Use sequential numbering (e.g., if last feature story is US1.17, testing is US1.18)

### When to Start:
- **Only after** all other user stories in the epic are implemented
- Status should be ⏳ Pending until ready to start

### Team Coordination:
- Backend team focuses on unit tests while building features
- QA team writes integration tests alongside feature development
- Frontend team writes component tests alongside feature development
- QA team writes E2E tests after all features complete
- Final testing story coordinates all testing efforts

### Success Criteria:
- This user story is complete when ALL tests pass and coverage targets met
- Epic can only be marked ✅ Complete after this user story is done
- No epic should be closed without comprehensive testing coverage

---

## Customization Per Epic

### Variables to Replace:
- `{X}`: Epic number (e.g., 01, 02, 03)
- `{FINAL}`: Final user story number in epic
- `{Epic Name}`: Name of the epic (e.g., "Property Management", "Lease Management")

### Epic-Specific Testing Focus:

**Epic 01 (Property Management):**
- Focus: Property CRUD, filtering, search, portfolio statistics
- Critical paths: Create property → View list → Edit → Delete
- Special attention: Investment company inline creation

**Epic 02 (Unit Management):**
- Focus: Unit CRUD, property relationship, lease history
- Critical paths: Create unit → Assign to property → View leases
- Special attention: Property inline creation

**Epic 04 (Lease Management):**
- Focus: Lease CRUD, tenant/unit relationships, expiration tracking
- Critical paths: Create lease → Track payments → Expiration notification
- Special attention: Tenant and unit inline creation

---

## Example: Epic 01 - Property Management

```markdown
### US1.18: Complete Testing Coverage for Property Management
**As a** development team,  
**I can** verify that all Property Management functionality is covered by comprehensive tests,  
**So that** we ensure quality, prevent regressions, and can confidently deploy to production.

**Priority:** 🔴 Critical  
**Status:** ⏳ Pending (starts after US1.1-1.17 complete)  

[... rest of template with all acceptance criteria ...]
```

---

**This ensures every epic has comprehensive testing before being marked complete!**
