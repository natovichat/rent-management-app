# Team Subagents - Quick Start

Fast reference for using your engineering team subagents.

## Team Members

### Managers (3)
- 🎨 **Web Team Leader** + 4 Senior Web Engineers
- ⚙️ **Backend Team Leader** + 4 Senior Backend Engineers  
- ✅ **QA Team Leader** + 4 Senior QA Engineers

## Quick Commands

### Deploy Full Feature (All Teams in Parallel)

```typescript
// Web Team
Task({
  description: "Web Team - [Feature Name]",
  prompt: "As Web Team Leader, coordinate 4 engineers to build [feature]. Engineer 1: [task], Engineer 2: [task], Engineer 3: [task], Engineer 4: [task]",
  subagent_type: "generalPurpose"
});

// Backend Team  
Task({
  description: "Backend Team - [Feature Name]",
  prompt: "As Backend Team Leader, coordinate 4 engineers to build [feature]. Engineer 1: [task], Engineer 2: [task], Engineer 3: [task], Engineer 4: [task]",
  subagent_type: "generalPurpose"
});

// QA Team
Task({
  description: "QA Team - [Feature Name]",
  prompt: "As QA Team Leader, coordinate 4 engineers to test [feature]. Engineer 1: [task], Engineer 2: [task], Engineer 3: [task], Engineer 4: [task]",
  subagent_type: "generalPurpose"
});
```

### Code Review

```typescript
Task({
  description: "Web Team - Review Code",
  prompt: "As Web Team Leader, review [component/feature] for quality, accessibility, and best practices",
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

### Bug Investigation

```typescript
Task({
  description: "QA Team - Investigate Bug",
  prompt: "As QA Team Leader, assign engineer to reproduce and document: [bug description]",
  subagent_type: "generalPurpose",
  model: "fast"
});
```

### Performance Optimization

```typescript
// Parallel optimization
Task({
  description: "Backend - Optimize Performance",
  prompt: "As Backend Team Leader, optimize: Engineer 1: DB indexes, Engineer 2: Query optimization, Engineer 3: Caching, Engineer 4: Pagination",
  subagent_type: "generalPurpose"
});

Task({
  description: "Frontend - Optimize Performance",  
  prompt: "As Web Team Leader, optimize: Engineer 1: Code splitting, Engineer 2: Images, Engineer 3: Lazy loading, Engineer 4: Re-renders",
  subagent_type: "generalPurpose"
});
```

## Task Distribution Templates

### Backend Feature (4 Engineers)
```
Engineer 1: Database schema, migrations, seed data
Engineer 2: API endpoints (CRUD operations)
Engineer 3: Business logic, validation, error handling
Engineer 4: Integration, caching, optimization
```

### Frontend Feature (4 Engineers)
```
Engineer 1: Core components (list, cards)
Engineer 2: Form components (create, edit)
Engineer 3: Detail pages, routing
Engineer 4: Responsive design, animations, polish
```

### QA Testing (4 Engineers)
```
Engineer 1: API testing (endpoints, validation, auth)
Engineer 2: UI automation (E2E tests, user flows)
Engineer 3: Performance testing (load, stress, spike)
Engineer 4: Security testing (vulnerabilities, exploits)
```

## Common Patterns

### Pattern: API-First Development
1. Backend creates API endpoints
2. Frontend consumes API
3. QA tests integration

### Pattern: Component-First Development
1. Frontend builds UI components
2. Backend provides mock data
3. QA tests UI flows

### Pattern: Bug Fix Flow
1. QA reproduces and documents
2. Backend/Frontend fixes (based on issue)
3. QA verifies fix

## Model Selection

| Task Type | Model | Reason |
|-----------|-------|--------|
| Feature implementation | default | Complex reasoning needed |
| Code review | fast | Straightforward analysis |
| Bug investigation | fast | Quick debugging |
| Performance testing | default | Comprehensive analysis |
| Simple refactoring | fast | Mechanical changes |

## Skill References

When you need detailed guidance:
- **@web-team-manager** - Frontend leadership, React patterns
- **@backend-team-manager** - API design, database optimization  
- **@qa-team-manager** - Test strategy, quality gates
- **@senior-web-engineer** - Component implementation
- **@senior-backend-engineer** - Service implementation
- **@senior-qa-engineer** - Test automation

## Examples

### Example 1: New Feature
```typescript
Task({
  description: "Build User Profile Feature",
  prompt: `
  As Backend Team Leader, build user profile API:
  - Engineer 1: Extend user schema (avatar, bio, preferences)
  - Engineer 2: GET/PUT /api/users/:id/profile endpoints
  - Engineer 3: Image upload service (avatar)
  - Engineer 4: Profile cache (Redis)
  `,
  subagent_type: "generalPurpose"
});
```

### Example 2: Code Review
```typescript
Task({
  description: "Review Property Form PR",
  prompt: `
  As Web Team Leader, review PropertyForm.tsx changes:
  - Check component structure
  - Validate TypeScript types
  - Review form validation (React Hook Form + Zod)
  - Check accessibility
  - Verify responsive design
  `,
  subagent_type: "explore",
  model: "fast",
  readonly: true
});
```

### Example 3: Bug Fix
```typescript
// Step 1: QA investigates
Task({
  description: "QA - Investigate Login Bug",
  prompt: "As QA Team Leader, reproduce: Users can't login with valid credentials. Create detailed bug report with steps.",
  subagent_type: "generalPurpose",
  model: "fast"
});

// Step 2: Backend fixes (after QA report)
Task({
  description: "Backend - Fix Login Bug",
  prompt: "As Backend Team Leader, fix: Password comparison failing for some users. Assign engineer to investigate bcrypt implementation.",
  subagent_type: "generalPurpose"
});

// Step 3: QA verifies
Task({
  description: "QA - Verify Login Fix",
  prompt: "As QA Team Leader, verify login fix: Test with various passwords, run regression tests, confirm bug resolved.",
  subagent_type: "generalPurpose",
  model: "fast"
});
```

## Tips

1. **Be Specific**: Clearly define what each engineer should work on
2. **Set Success Criteria**: Define done (< 100ms, 80% coverage, etc.)
3. **Provide Context**: Share requirements, constraints, related features
4. **Use Parallel Tasks**: Independent work can run simultaneously
5. **Sequential for Dependencies**: Wait when teams depend on each other
6. **Fast Model for Reviews**: Save cost on straightforward tasks

## Need Help?

- **Full Guide**: See `TEAM_AGENTS_GUIDE.md` for comprehensive examples
- **Skills Documentation**: Read individual skill files for detailed guidance
- **Cursor Docs**: Check Cursor documentation for Task tool details

---

**Quick Tip**: Start with planning (exploration), then implement (parallel teams), then test (QA), then review. This workflow ensures quality at every step.
