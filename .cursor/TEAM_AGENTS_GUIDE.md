# Engineering Team Subagents Guide

Complete guide for coordinating your engineering team using specialized subagents and skills.

## 🎯 Mandatory Workflow

**ALL feature development MUST follow the 4-phase workflow:**

```
Phase 0: API Contract Design (Sequential) → All teams agree on API
Phase 1: Parallel Implementation (Backend + Frontend) → Build features
Phase 2: Full Stack Integration (QA) → Test integration
Phase 3: Review & Validation (All teams) → Final approval
```

📋 **See**: `.cursor/rules/feature-development-workflow.mdc` (automatically enforced)  
📝 **Templates**: `.cursor/WORKFLOW_TEMPLATES.md` (copy-paste templates)

**Why this workflow?**
- ✅ Prevents integration issues (API agreed before coding)
- ✅ Ensures quality (dedicated integration testing)
- ✅ Professional development (proper coordination)

---

## Team Structure

### Management Layer (3 Team Leaders)
- **Web Team Leader** - Frontend architecture and coordination
- **Backend Team Leader** - API design and backend services
- **QA Team Leader** - Quality assurance and testing strategy

### Engineering Layer (12 Senior Engineers)
- **4 Senior Web Engineers** - React/Next.js expertise
- **4 Senior Backend Engineers** - NestJS/Node.js expertise
- **4 Senior QA Engineers** - Test automation expertise

### Process Improvement Layer (1 Specialized Agent)
- **Process Improvement Agent** - Retrospectives, root cause analysis, continuous improvement

## Available Skills

### Manager Skills
1. **web-team-manager** - Frontend leadership, React architecture, UI/UX
2. **backend-team-manager** - API design, database architecture, scalability
3. **qa-team-manager** - Test strategy, quality gates, bug triage

### Engineer Skills
1. **senior-web-engineer** - Frontend implementation, component development
2. **senior-backend-engineer** - Backend services, API endpoints
3. **senior-qa-engineer** - Test automation, bug detection

### Process Skills
1. **process-improvement-agent** - Retrospectives, root cause analysis, rule/skill creation

## How to Use Team Subagents

### Pattern 1: Full Feature Development

Deploy all three teams in parallel for complete feature implementation:

```typescript
// Example: User Management Feature

// WEB TEAM (4 engineers working in parallel)
Task({
  description: "Web Team - User Management",
  prompt: `
  As the Web Team Leader, coordinate your 4 senior engineers to build the user management UI:
  
  Engineer 1: User list component with DataGrid
  - Implement sortable, filterable user table
  - Add pagination and search
  
  Engineer 2: User form component
  - Create/edit user form with validation
  - Use React Hook Form + Zod
  
  Engineer 3: User profile page
  - Display user details
  - Edit mode with inline editing
  
  Engineer 4: Responsive design & animations
  - Mobile-friendly layout
  - Loading states and transitions
  
  Follow all frontend best practices from the web-team-manager skill.
  `,
  subagent_type: "generalPurpose"
});

// BACKEND TEAM (4 engineers working in parallel)
Task({
  description: "Backend Team - User Management",
  prompt: `
  As the Backend Team Leader, coordinate your 4 senior engineers to build the user management API:
  
  Engineer 1: Database schema and migrations
  - Design User table with proper relationships
  - Create migrations and seed data
  
  Engineer 2: User CRUD endpoints
  - POST /api/users (create)
  - GET /api/users (list with pagination)
  - GET /api/users/:id (get one)
  - PUT /api/users/:id (update)
  - DELETE /api/users/:id (delete)
  
  Engineer 3: Authentication integration
  - JWT-based auth
  - Role-based access control
  - Password hashing
  
  Engineer 4: Performance optimization
  - Implement Redis caching
  - Query optimization
  - Add indexes
  
  Follow all backend best practices from the backend-team-manager skill.
  `,
  subagent_type: "generalPurpose"
});

// QA TEAM (4 engineers working in parallel)
Task({
  description: "QA Team - User Management",
  prompt: `
  As the QA Team Leader, coordinate your 4 senior engineers to comprehensively test user management:
  
  Engineer 1: API Testing
  - Test all user endpoints
  - Validate request/response schemas
  - Test auth and authorization
  
  Engineer 2: UI Automation
  - E2E tests for user creation
  - E2E tests for user editing
  - E2E tests for user deletion
  
  Engineer 3: Performance Testing
  - Load test user endpoints
  - Test with 1000 concurrent users
  - Measure response times
  
  Engineer 4: Security Testing
  - Test authentication bypass
  - Test SQL injection
  - Test XSS vulnerabilities
  
  Follow all QA best practices from the qa-team-manager skill.
  `,
  subagent_type: "generalPurpose"
});
```

### Pattern 2: Backend-First Development

Start with backend, then frontend, then QA:

```typescript
// Step 1: Backend API Development
Task({
  description: "Backend - Build API",
  prompt: `
  As the Backend Team Leader, coordinate your team to build the property management API:
  
  - Engineer 1: Property schema and migrations
  - Engineer 2: Property CRUD endpoints
  - Engineer 3: Owner relationship and queries
  - Engineer 4: Unit relationship and queries
  
  Complete implementation with all endpoints, validation, and error handling.
  `,
  subagent_type: "generalPurpose"
});

// Step 2: Frontend UI Development (after backend is done)
Task({
  description: "Frontend - Build UI",
  prompt: `
  As the Web Team Leader, coordinate your team to build the property management UI:
  
  - Engineer 1: Property list with DataGrid
  - Engineer 2: Property form (create/edit)
  - Engineer 3: Property details page
  - Engineer 4: Responsive design
  
  Use the backend API endpoints that were just created.
  `,
  subagent_type: "generalPurpose"
});

// Step 3: Comprehensive Testing (after both are done)
Task({
  description: "QA - Test Property Management",
  prompt: `
  As the QA Team Leader, coordinate comprehensive testing:
  
  - Engineer 1: API integration tests
  - Engineer 2: UI E2E tests
  - Engineer 3: Performance tests
  - Engineer 4: Security audit
  
  Test the complete property management feature end-to-end.
  `,
  subagent_type: "generalPurpose"
});
```

### Pattern 3: Bug Fix Coordination

Coordinate teams for bug investigation and fixing:

```typescript
// QA finds and documents bug
Task({
  description: "QA - Investigate Bug",
  prompt: `
  As the QA Team Leader, assign a senior QA engineer to investigate this bug:
  
  Bug: Users can't create properties with special characters in address
  
  Steps:
  1. Reproduce the bug
  2. Identify if it's frontend or backend issue
  3. Create detailed bug report
  4. Write regression test
  
  Provide detailed findings with reproduction steps.
  `,
  subagent_type: "generalPurpose"
});

// Based on findings, assign to appropriate team
Task({
  description: "Backend - Fix Validation Bug",
  prompt: `
  As the Backend Team Leader, assign an engineer to fix the property validation:
  
  Issue: Input validation is too strict, rejecting valid special characters
  
  Fix:
  1. Update validation rules to allow valid special chars
  2. Add unit tests
  3. Verify API endpoints
  4. Update API documentation
  
  Ensure backward compatibility.
  `,
  subagent_type: "generalPurpose"
});

// QA verifies the fix
Task({
  description: "QA - Verify Fix",
  prompt: `
  As the QA Team Leader, assign an engineer to verify the bug fix:
  
  1. Retest original reproduction steps
  2. Run regression test suite
  3. Test edge cases
  4. Update test documentation
  
  Confirm the bug is resolved and no regressions introduced.
  `,
  subagent_type: "generalPurpose"
});
```

### Pattern 4: Performance Optimization

Coordinate teams for performance improvements:

```typescript
Task({
  description: "QA - Performance Baseline",
  prompt: `
  As the QA Team Leader, assign an engineer to establish performance baseline:
  
  1. Run Lighthouse audit on all pages
  2. Measure API response times
  3. Test with realistic data volume (1000 properties)
  4. Document current metrics
  
  Provide detailed performance report.
  `,
  subagent_type: "generalPurpose"
});

Task({
  description: "Backend - Optimize Queries",
  prompt: `
  As the Backend Team Leader, coordinate database optimization:
  
  Engineer 1: Add database indexes
  Engineer 2: Optimize N+1 queries
  Engineer 3: Implement Redis caching
  Engineer 4: Add query pagination
  
  Target: < 100ms API response time for all endpoints.
  `,
  subagent_type: "generalPurpose"
});

Task({
  description: "Frontend - Optimize Bundle",
  prompt: `
  As the Web Team Leader, coordinate frontend optimization:
  
  Engineer 1: Implement code splitting
  Engineer 2: Optimize images (next/image)
  Engineer 3: Add lazy loading
  Engineer 4: Optimize re-renders
  
  Target: Lighthouse score > 90 on all metrics.
  `,
  subagent_type: "generalPurpose"
});

Task({
  description: "QA - Verify Improvements",
  prompt: `
  As the QA Team Leader, verify performance improvements:
  
  1. Re-run all performance tests
  2. Compare with baseline
  3. Validate targets met
  4. Document improvements
  
  Provide before/after comparison report.
  `,
  subagent_type: "generalPurpose"
});
```

### Pattern 5: Code Review Process

Use team leaders for code review:

```typescript
Task({
  description: "Web Team - Review PR",
  prompt: `
  As the Web Team Leader, review this pull request:
  
  PR: Add property filtering to DataGrid
  Files changed: 8 files
  
  Review checklist:
  - Component structure and patterns
  - TypeScript types
  - Accessibility
  - Responsive design
  - Performance considerations
  - Tests coverage
  
  Provide detailed feedback with priority levels (Blocker, Important, Suggestion).
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "Backend Team - Review PR",
  prompt: `
  As the Backend Team Leader, review this pull request:
  
  PR: Add property search endpoint
  Files changed: 6 files
  
  Review checklist:
  - API design and REST conventions
  - Database query optimization
  - Error handling
  - Security considerations
  - Tests coverage
  - API documentation
  
  Provide detailed feedback with security/performance concerns highlighted.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

### Pattern 6: Retrospective After Bug Discovery

Use Process Improvement Agent after QA cycles with failures:

```typescript
// ============================================
// SCENARIO: QA Cycle Failed with Critical/Major Bugs
// ============================================

// Step 1: QA notifies Process Improvement Agent
Task({
  description: "Process Improvement - Conduct Retrospective",
  prompt: `
  As the Process Improvement Agent, conduct a retrospective for this bug:
  
  Epic: Epic 01 - Property Management
  User Story: US1.1 - Create Property
  Test Cycle: test-results/epic-01/user-story-1.1/test-cycle-20260203-143022/
  
  Issues Found:
  - 🔴 Critical: E2E tests failed - authentication broken
  - 🟠 Major: Button selectors don't match actual UI
  - 🟡 Minor: Success message text mismatch
  
  Test Results:
  - Backend: 155/159 passing
  - E2E: 0/8 passing (all failed)
  
  After fixes were applied and re-testing completed successfully:
  - Re-test cycle: test-results/epic-01/user-story-1.1/test-cycle-20260203-180145/
  - Backend: 159/159 passing ✅
  - E2E: 8/8 passing ✅
  
  Conduct retrospective:
  1. Interview all teams (Backend, Frontend, QA)
  2. Perform root cause analysis (5 Whys)
  3. Identify which phase should have caught each issue
  4. Determine if process gaps exist
  5. Create or update rules/skills to prevent recurrence
  6. Document in docs/retro/YYYY-MM-DD-epic-01-us-1.1-<description>.md
  7. Update docs/retro/README.md with new retrospective
  
  Focus on: Why weren't these issues caught before E2E tests?
  `,
  subagent_type: "generalPurpose",
  model: "fast"
});

// ============================================
// TYPICAL RETROSPECTIVE WORKFLOW
// ============================================

// Trigger: After QA marks test cycle as FAILED and dev team fixes issues

// Step 1: QA notifies about failures
// Step 2: Dev team fixes and commits
// Step 3: QA re-tests (new test cycle)
// Step 4: If now passing, trigger retrospective

Task({
  description: "Process Improvement - Root Cause Analysis",
  prompt: `
  As Process Improvement Agent, analyze why [SPECIFIC BUG] reached E2E testing:
  
  Context:
  - Epic XX, User Story X.X
  - Bug: [Description]
  - Test Cycle: [Failed cycle location]
  - Resolution: [Successful re-test cycle location]
  
  Your tasks:
  1. Review test results from both cycles (before/after)
  2. Interview teams:
     - Backend: "Why didn't unit tests catch this?"
     - Frontend: "Why didn't component tests catch this?"
     - QA: "Why wasn't this in earlier test scenarios?"
  3. Perform 5 Whys root cause analysis
  4. Identify prevention phase (Phase 0/1/2)
  5. Determine if rule/skill gap exists
  6. Create/update rules or skills if needed
  7. Document retrospective in docs/retro/
  8. Update retrospective index
  
  Deliverables:
  - Retrospective document with full analysis
  - New/updated rule (if gap found)
  - New/updated skill (if gap found)
  - Prevention checklist
  `,
  subagent_type: "generalPurpose"
});
```

### Pattern 7: Continuous Process Improvement

Periodic review of retrospectives for patterns:

```typescript
// Quarterly or after multiple retrospectives
Task({
  description: "Process Improvement - Pattern Analysis",
  prompt: `
  As Process Improvement Agent, analyze retrospective patterns:
  
  Review all retrospectives in docs/retro/:
  
  1. Identify recurring patterns:
     - How many validation issues?
     - How many test coverage gaps?
     - How many integration problems?
  
  2. Evaluate rule/skill effectiveness:
     - Have similar bugs been prevented?
     - Are rules being followed?
     - Do skills need enhancement?
  
  3. Measure improvement:
     - Bugs caught earlier in workflow?
     - Fewer bugs reaching E2E tests?
     - Faster resolution times?
  
  4. Recommend systemic improvements:
     - New training needs?
     - Workflow refinements?
     - Tool additions?
  
  5. Create summary report:
     - Location: docs/retro/quarterly-pattern-analysis-YYYY-QX.md
     - Include metrics, trends, recommendations
  
  Deliverables:
  - Pattern analysis report
  - Updated prevention strategies
  - Team training recommendations
  `,
  subagent_type: "generalPurpose"
});
```

## Best Practices

### 1. Clear Task Assignment
Always specify which engineers should work on what:
```
Engineer 1: Database schema
Engineer 2: API endpoints
Engineer 3: Authentication
Engineer 4: Caching
```

### 2. Set Clear Success Criteria
Define what "done" means:
```
Target: < 100ms response time
Target: 80%+ test coverage
Target: Lighthouse score > 90
```

### 3. Coordinate Dependencies
If teams depend on each other, run sequentially:
```
1. Backend creates API (sequential)
2. Frontend consumes API (waits for backend)
3. QA tests both (waits for both)
```

### 4. Use Fast Model for Reviews
Code reviews and exploration can use faster models:
```typescript
Task({
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

### 5. Provide Context
Give teams the context they need:
```
Context: This is for the property management feature
Related: Properties have owners and units
Requirements: Must support pagination and filtering
```

## Example: Complete Feature Workflow

Here's a complete workflow for adding a new feature:

```typescript
// ============================================
// PHASE 1: PLANNING & DESIGN (Sequential)
// ============================================

Task({
  description: "Backend Team - Design API",
  prompt: `
  As Backend Team Leader, design the lease management API:
  
  1. Define data model (Lease, Tenant relationships)
  2. List all required endpoints
  3. Define request/response schemas
  4. Identify caching opportunities
  
  Provide API specification document.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "Web Team - Design UI",
  prompt: `
  As Web Team Leader, design the lease management UI:
  
  1. Define component hierarchy
  2. List all required components
  3. Plan state management approach
  4. Identify reusable patterns
  
  Provide UI architecture document.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "QA Team - Test Strategy",
  prompt: `
  As QA Team Leader, create test strategy:
  
  1. Identify test scenarios
  2. Plan test data requirements
  3. Define acceptance criteria
  4. List automation priorities
  
  Provide test plan document.
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

// ============================================
// PHASE 2: IMPLEMENTATION (Parallel)
// ============================================

Task({
  description: "Backend - Implement API",
  prompt: `
  As Backend Team Leader, coordinate implementation:
  
  Engineer 1: Database schema & migrations
  Engineer 2: CRUD endpoints
  Engineer 3: Business logic & validation
  Engineer 4: Integration with properties/units
  
  Complete, tested API endpoints.
  `,
  subagent_type: "generalPurpose"
});

Task({
  description: "Frontend - Implement UI",
  prompt: `
  As Web Team Leader, coordinate implementation:
  
  Engineer 1: Lease list DataGrid
  Engineer 2: Lease form (create/edit)
  Engineer 3: Lease detail page
  Engineer 4: Integration with API
  
  Complete, responsive UI components.
  `,
  subagent_type: "generalPurpose"
});

// ============================================
// PHASE 3: TESTING (After Implementation)
// ============================================

Task({
  description: "QA - Comprehensive Testing",
  prompt: `
  As QA Team Leader, coordinate testing:
  
  Engineer 1: API integration tests
  Engineer 2: UI E2E tests
  Engineer 3: Performance tests
  Engineer 4: Security audit
  
  Complete test results with coverage report.
  `,
  subagent_type: "generalPurpose"
});

// ============================================
// PHASE 4: REVIEW & POLISH (Parallel)
// ============================================

Task({
  description: "Code Review - Backend",
  prompt: `Review backend implementation for quality, security, performance.`,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "Code Review - Frontend",
  prompt: `Review frontend implementation for quality, accessibility, UX.`,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});

Task({
  description: "QA - Final Validation",
  prompt: `Run full regression suite and validate all acceptance criteria met.`,
  subagent_type: "generalPurpose",
  model: "fast"
});
```

## Troubleshooting

### Issue: Teams Waiting on Each Other
**Solution**: Run dependent tasks sequentially, independent tasks in parallel

### Issue: Unclear Requirements
**Solution**: Use exploration tasks first to clarify requirements

### Issue: Quality Issues
**Solution**: Include QA team early in planning phase

### Issue: Performance Problems
**Solution**: Include performance requirements in initial design

## Git Commit Strategy

### Automatic Enforcement

All teams follow git commit best practices automatically through:
- **Global Rule**: `.cursor/rules/git-commit-strategy.mdc` (applies to all agents)
- **Team Skills**: Each manager and engineer skill includes commit guidelines
- **Workflow**: Commits happen naturally as work progresses

### Commit Frequency

Teams are trained to commit:
- **After each logical unit**: Component, endpoint, test suite
- **Every 30-60 minutes**: Regular progress saves
- **Before switching tasks**: Clear boundaries
- **Never wait for completion**: Incremental commits

### Commit Message Format

All teams use standardized format:
```
<type>(<scope>): <description>

Examples:
feat(properties): add filtering to query builder
test(properties): add integration tests for filters
fix(auth): correct token validation logic
```

### Team Coordination

When teams work in parallel:
```
Backend Engineer 1: git commit -m "feat(properties): add filter schema"
Backend Engineer 2: git commit -m "feat(properties): add filter endpoint"
Frontend Engineer 1: git commit -m "feat(properties): add filter UI"
QA Engineer 1: git commit -m "test(properties): add filter tests"
```

Each engineer commits independently—no waiting for others.

### In Task Prompts

You can emphasize commits in prompts:
```
IMPORTANT: Each engineer should commit after completing their component.

Engineer 1: Add query builder
→ Commit: "feat(properties): add filtering query builder"

Engineer 2: Add controller endpoint
→ Commit: "feat(properties): add filter endpoint"
```

### Verification

After task completion, you can ask:
```
"List all commits made during this implementation"
```

Teams will report their commit history.

## Quick Reference

### Manager Skills
```
@web-team-manager - Frontend leadership + commit guidelines
@backend-team-manager - Backend leadership + commit guidelines
@qa-team-manager - QA leadership + commit guidelines
```

### Engineer Skills
```
@senior-web-engineer - Frontend implementation + commit practices
@senior-backend-engineer - Backend implementation + commit practices
@senior-qa-engineer - Quality assurance + commit practices
```

### Process Skills
```
@process-improvement-agent - Retrospectives, root cause analysis, continuous improvement
```

### Team Coordination
- **Parallel**: Independent teams working simultaneously
- **Sequential**: Dependent teams working in order
- **Exploration**: Read-only planning and review
- **Implementation**: Full feature development
- **Retrospective**: After QA failures, for continuous improvement

### Model Selection
- **Default**: Complex implementation tasks
- **Fast**: Code reviews, exploration, simple tasks, retrospectives

### Commit Best Practices
- **Frequent**: After each logical unit of work
- **Descriptive**: Clear type and scope
- **Independent**: Each engineer commits their work
- **Tested**: Verify code works before committing

### When to Use Process Improvement Agent
- **After QA failures**: Conduct retrospective
- **After critical bugs**: Root cause analysis
- **Recurring issues**: Pattern analysis
- **Quarterly**: Review all retrospectives for trends

---

**Remember**: You have an expert team at your disposal. Leverage their skills, coordinate their work effectively, maintain clear communication, ensure regular commits for traceability, and continuously improve through retrospectives after bugs are found.
