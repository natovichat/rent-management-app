# User Story Template - MANDATORY

All user stories in the rebuild epics MUST follow this structure.

---

## Template

```markdown
### US{X}.{N}: [Story Title]
**As a** [user role],  
**I can** [action/capability],  
**So that** [benefit/value].

**Priority:** 🔴 Critical | 🟠 High | 🟡 Medium  
**Complexity:** Low | Medium | High  
**Dependencies:** [List dependencies]

**Acceptance Criteria:**
- [ ] [CRUD] Create/Read/Update/Delete operations as applicable
- [ ] Unit tests for service layer
- [ ] API integration tests for controller endpoints
- [ ] DTOs with class-validator
- [ ] Error handling (400, 404, 409)
- [ ] Account isolation (multi-tenancy) enforced
- [ ] [Story-specific criteria]
```

---

## Mandatory Elements Per User Story

### 1. CRUD Operations
- **Create:** POST endpoint, CreateDto, validation
- **Read:** GET list (paginated) and GET by ID
- **Update:** PATCH endpoint, UpdateDto
- **Delete:** DELETE endpoint, cascade/restrict rules

### 2. Unit Tests (Service Layer)
- All service methods tested
- Mock Prisma/client
- Edge cases (null, empty, invalid)
- Target: ≥80% coverage per module

### 3. API Integration Tests
- All controller endpoints
- Real or test database
- Request/response validation
- Error status codes
- Target: 100% endpoint coverage

### 4. DTOs & Validation
- CreateDto: required + optional fields
- UpdateDto: all optional (partial update)
- class-validator decorators
- Clear error messages

### 5. Error Handling
- 400 Bad Request - validation errors
- 404 Not Found - resource not found
- 409 Conflict - business rule violation (e.g., delete blocked)
- 500 Internal Server Error - server errors

---

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests pass
- [ ] API integration tests pass
- [ ] DTOs validated
- [ ] Error handling in place
- [ ] Multi-tenancy enforced
- [ ] Code review completed

---

**Last Updated:** February 12, 2026
