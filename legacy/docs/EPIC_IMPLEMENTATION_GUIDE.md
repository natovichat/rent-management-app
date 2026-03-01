# Epic Implementation Guide

Complete guide for implementing epics with automated testing verification.

**Date:** February 2, 2026

---

## Overview

This guide explains how to use the new **epic implementation commands** that automate the entire development process from feature implementation to comprehensive testing.

---

## Two-Level Command Structure

### Level 1: Single User Story (@generate-workflow)
**Purpose:** Implement one user story using 4-phase workflow

**Command:**
```
@generate-workflow epic 01 user story 1.7
```

**Use for:**
- Implementing a single feature
- Working on specific user story
- Focused development on one requirement

---

### Level 2: Complete Epic (@implement-epic) 🆕
**Purpose:** Implement entire epic including all user stories and testing

**Command:**
```
@implement-epic 01
```

**Use for:**
- Implementing complete epic from start to finish
- Ensuring all features + testing are done
- Enforcing quality gates before epic completion

---

## The New Workflow: Epic → Stories → Testing

### Traditional Approach (Before)
```
1. Implement US1.1 manually
2. Implement US1.2 manually
3. Implement US1.3 manually
4. ... (repeat for all stories)
5. Manually write tests later (often forgotten)
6. Mark epic complete (without verification)
```

**Problems:**
- ❌ Testing often skipped or incomplete
- ❌ No consistent coverage targets
- ❌ Quality varies across epics
- ❌ Manual coordination required
- ❌ Easy to forget stories

---

### New Approach (Now)
```
1. Run: @implement-epic 01
2. AI implements US1.1 (4-phase workflow)
3. AI implements US1.2 (4-phase workflow)
4. ... (continues for all feature stories)
5. AI automatically runs US1.18 (testing story)
6. AI verifies quality gates
7. Epic marked complete ONLY if all tests pass
```

**Benefits:**
- ✅ Testing MANDATORY for epic completion
- ✅ Consistent 80%+ backend, 90%+ frontend coverage
- ✅ All endpoints tested
- ✅ All user flows tested
- ✅ Fully automated process
- ✅ Quality gates enforced

---

## Quality Gates Enforced

Every epic MUST meet these standards before being marked complete:

### Backend Testing
- ✅ Unit test coverage ≥ 80%
- ✅ All service methods tested
- ✅ All validation tested
- ✅ All error handling tested

### API Testing
- ✅ 100% endpoint coverage
- ✅ CRUD operations tested
- ✅ Validation errors tested
- ✅ Edge cases tested
- ✅ Security tested

### Frontend Testing
- ✅ Component test coverage ≥ 90%
- ✅ All components render correctly
- ✅ All forms validated
- ✅ All user interactions tested

### E2E Testing
- ✅ 100% user flow coverage
- ✅ Happy path flows tested
- ✅ Error flows tested
- ✅ Cross-feature integration tested
- ✅ Accessibility tested (WCAG AA)

### Code Quality
- ✅ Zero failing tests
- ✅ Zero critical bugs
- ✅ No linting errors
- ✅ No TypeScript errors

### Performance
- ✅ API response times < 200ms
- ✅ UI render times acceptable
- ✅ No memory leaks

---

## Testing User Stories

Every epic now has a **comprehensive testing user story** as the final story:

| Epic | Testing Story | Coverage |
|------|---------------|----------|
| 01 - Property Management | US1.18 | 15 endpoints, 60+ fields |
| 02 - Unit Management | US2.9 | 6 endpoints, 15+ fields |
| 03 - Tenant Management | US3.{N} | TBD |
| 04 - Lease Management | US4.{N} | TBD |
| 05 - Ownership Management | US5.{N} | TBD |
| 06 - Mortgage Management | US6.{N} | TBD |
| 07 - Bank Account Management | US7.{N} | TBD |
| 08 - Financial Tracking | US8.{N} | TBD |
| 09 - Investment Companies | US9.{N} | TBD |
| 10 - Dashboard & Analytics | US10.{N} | TBD |
| 11 - Authentication | US11.{N} | TBD |
| 12 - Notifications | US12.{N} | TBD |
| 13 - Data Import/Export | US13.{N} | TBD |

**Each testing story includes:**
- Backend team unit tests
- QA team API integration tests (4 engineers)
- Frontend team component tests (4 engineers)
- QA team E2E tests (4 engineers)
- Quality gate verification
- Test report generation

---

## Command Usage Examples

### Example 1: Fresh Epic Implementation

**Scenario:** Epic 03 (Tenant Management) hasn't been started

**Command:**
```
@implement-epic 03
```

**What happens:**
1. Reads EPIC_03_TENANT_MANAGEMENT.md
2. Finds all user stories (e.g., US3.1-3.10)
3. Implements each story sequentially
4. Runs testing story US3.{N}
5. Verifies quality gates
6. Marks epic complete

**Duration:** 4-8 hours (depending on story count)

---

### Example 2: Partial Epic Completion

**Scenario:** Epic 04 has 10 stories, 5 are done, 5 pending

**Command:**
```
@implement-epic 04 --pending-only
```

**What happens:**
1. Reads epic file
2. Identifies 5 pending stories
3. Implements only pending stories
4. Runs testing story
5. Verifies quality gates
6. Marks epic complete

**Duration:** 2-4 hours

---

### Example 3: Testing Only (After Manual Fixes)

**Scenario:** Epic 01 features complete but tests failing

**Command:**
```
@implement-epic 01 --testing-only
```

**What happens:**
1. Skips all feature stories
2. Runs testing story US1.18
3. Verifies quality gates
4. Reports pass/fail

**Duration:** 30-60 minutes

---

### Example 4: Single Story Implementation

**Scenario:** Just need to implement one specific story

**Command:**
```
@generate-workflow epic 01 user story 1.7
```

**What happens:**
1. Implements US1.7 only
2. Runs 4-phase workflow
3. Does NOT run testing story
4. Epic remains incomplete

**Duration:** 20-45 minutes

---

## Workflow Comparison

### Single Story (@generate-workflow)

```
Input: @generate-workflow US1.7

Process:
┌─────────────────────────────┐
│ Phase 0: API Contract       │
│ - Backend reviews API       │
│ - Frontend approves         │
│ - QA creates test plan      │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ Phase 1: Implementation     │
│ - Frontend builds UI        │
│ - Backend updates API       │
│ - Tests written             │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ Phase 2: Integration        │
│ - QA runs integration tests │
│ - Verify frontend+backend   │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ Phase 3: Review             │
│ - All teams review          │
│ - Approve for production    │
└──────────┬──────────────────┘
           │
           ▼
    US1.7 Complete ✅
    (Epic still incomplete)
```

**Time:** 20-45 minutes  
**Scope:** One user story  
**Testing:** Feature-level only

---

### Complete Epic (@implement-epic)

```
Input: @implement-epic 01

Process:
┌─────────────────────────────────────────┐
│ FOR EACH FEATURE STORY (US1.1 - US1.17)│
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Run @generate-workflow         │    │
│  │ - Phase 0: API Contract        │    │
│  │ - Phase 1: Implementation      │    │
│  │ - Phase 2: Integration         │    │
│  │ - Phase 3: Review              │    │
│  └────────────┬───────────────────┘    │
│               │                         │
│               ▼                         │
│         Story Complete ✅               │
│                                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ COMPREHENSIVE TESTING STORY (US1.18)     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ Backend Unit Tests             │     │
│  │ - All services tested          │     │
│  │ - ≥80% coverage verified       │     │
│  └────────────┬───────────────────┘     │
│               │                          │
│  ┌────────────▼───────────────────┐     │
│  │ API Integration Tests          │     │
│  │ - All endpoints tested         │     │
│  │ - 100% coverage verified       │     │
│  └────────────┬───────────────────┘     │
│               │                          │
│  ┌────────────▼───────────────────┐     │
│  │ Frontend Component Tests       │     │
│  │ - All components tested        │     │
│  │ - ≥90% coverage verified       │     │
│  └────────────┬───────────────────┘     │
│               │                          │
│  ┌────────────▼───────────────────┐     │
│  │ E2E Tests                      │     │
│  │ - All flows tested             │     │
│  │ - 100% user flow coverage      │     │
│  └────────────┬───────────────────┘     │
│               │                          │
│  ┌────────────▼───────────────────┐     │
│  │ Quality Gate Verification      │     │
│  │ - Check all targets met        │     │
│  │ - Verify zero failures         │     │
│  └────────────┬───────────────────┘     │
│               │                          │
└───────────────┼──────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  All Pass?    │
        └───┬───────┬───┘
            │       │
         Yes│       │No
            │       │
            ▼       ▼
    ┌───────────┐ ┌──────────────┐
    │Epic ✅    │ │Epic 🔴       │
    │Complete   │ │Blocked       │
    │Production │ │Fix & Retry   │
    │Ready      │ │              │
    └───────────┘ └──────────────┘
```

**Time:** 4-8 hours  
**Scope:** Entire epic  
**Testing:** Comprehensive (unit + integration + component + E2E)

---

## Quality Gate Failure Example

### Scenario: Backend Coverage Too Low

```
@implement-epic 01

... [all features complete] ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 COMPREHENSIVE TESTING PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running Backend Unit Tests...
❌ Backend: 72% coverage (Target: ≥80%)
   Tests: 98 passed, 0 failed
   
   Uncovered Files:
   - properties.service.ts: 68%
   - csv-import.service.ts: 55%
   
Running API Integration Tests...
✅ API: 15/15 endpoints tested (100%)

Running Frontend Component Tests...
✅ Frontend: 92% coverage (Target: ≥90%)

Running E2E Tests...
❌ E2E: 7/8 flows tested
   Failed: Property deletion with units
   
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ QUALITY GATE FAILURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Failed Gates:
   ❌ Backend coverage: 72% (need 80%)
   ❌ 1 failing E2E test

Epic Status: 🔴 BLOCKED

Required Actions:
   1. Add unit tests for:
      - properties.service.ts (need +12% coverage)
      - csv-import.service.ts (need +25% coverage)
   
   2. Fix E2E test:
      - Property deletion with units should show error
      - Currently: No error message displayed
      - Expected: "Cannot delete property with units" error

Once fixed, re-run:
   @implement-epic 01 --testing-only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Next steps:**
1. Developer adds missing unit tests
2. Developer fixes E2E test issue
3. Re-run: `@implement-epic 01 --testing-only`
4. Quality gates pass
5. Epic marked complete

---

## When To Use Each Command

### Use @generate-workflow When:
✅ Working on a single user story  
✅ Incremental development  
✅ Story-by-story approach  
✅ Don't need full epic completion yet  
✅ Prototyping or experimenting  

### Use @implement-epic When:
✅ Need to complete entire epic  
✅ Want enforced quality gates  
✅ Ready for comprehensive testing  
✅ Need production-ready epic  
✅ Want automated testing verification  

---

## Team Workflow Integration

### Sprint Planning
1. Select epic to implement
2. Review user stories in epic
3. Estimate: 4-8 hours for complete epic
4. Assign: One developer runs @implement-epic
5. Team monitors progress

### During Sprint
1. Developer runs: `@implement-epic {number}`
2. AI implements all stories
3. AI runs comprehensive testing
4. If tests fail → Fix and re-run testing
5. When tests pass → Epic complete

### Sprint Review
1. Demo completed epic
2. Show test coverage reports
3. Show quality gate results
4. Confirm production readiness

---

## Monitoring Progress

### Real-Time Progress Updates

```
Epic 01 Progress: ████████░░░░░░░░ 50% (8/16 stories)

Current: US1.9 - Edit Property Information
Status: Phase 2 (Integration Testing)
Next: US1.10 - Delete Property
Estimated Time Remaining: 2 hours 15 minutes

Stories Completed Today:
   ✅ US1.1 - Create Property (32 min)
   ✅ US1.2 - Add Property Details (28 min)
   ✅ US1.7 - Filter Properties (45 min)
   ... (5 more)

Stories Pending:
   ⏳ US1.9 - Edit Property (in progress)
   ⏳ US1.10 - Delete Property
   ⏳ US1.16 - Link to Investment Company
   ... (5 more)
```

### Coverage Progress

```
Test Coverage Progress:

Backend:
   ████████████████░░░░ 72% → 80% (target)
   Need: +8% (+15 tests estimated)

Frontend:
   ████████████████████ 92% ✅ (target: 90%)
   Status: PASSED

API:
   ████████████████████ 100% ✅ (15/15 endpoints)
   Status: PASSED

E2E:
   ██████████████████░░ 87% (7/8 flows)
   Need: 1 more flow (property deletion edge case)
```

---

## Benefits Summary

### For Developers
✅ **No manual coordination** - AI orchestrates everything  
✅ **Consistent quality** - Same standards across all epics  
✅ **Fast implementation** - Automated workflows  
✅ **Clear targets** - Know exactly what's required  

### For QA
✅ **Comprehensive testing** - Nothing skipped  
✅ **Automated execution** - Tests run automatically  
✅ **Coverage enforced** - Can't skip quality gates  
✅ **Clear reporting** - Know exactly what was tested  

### For Product
✅ **Production ready** - Every epic fully tested  
✅ **Predictable quality** - Enforced standards  
✅ **Fast delivery** - Automated processes  
✅ **Confidence** - Quality gates passed  

---

## Epic Status Tracking

### Before implement-epic:
```markdown
**Status:** 🟡 Partially Implemented  
**Stories Complete:** 10/18  
**Test Coverage:** Unknown
```

### After implement-epic (Success):
```markdown
**Status:** ✅ Complete  
**Completion Date:** February 2, 2026  
**Stories Complete:** 18/18  
**Test Coverage:** Backend 84%, Frontend 92%  
**All Quality Gates:** ✅ Passed
```

### After implement-epic (Failure):
```markdown
**Status:** 🔴 Blocked  
**Stories Complete:** 17/18 (testing failed)  
**Test Coverage:** Backend 72%, Frontend 92%  
**Quality Gates:** ❌ 2 failed
**Next Action:** Fix coverage and re-run --testing-only
```

---

## FAQ

### Q: Can I interrupt the process?
**A:** Not recommended. Let it complete. If you must, you can resume with `--start-from US{X}.{Y}`.

### Q: What if a story fails?
**A:** You'll be prompted to skip, retry, or abort. Choose based on the error.

### Q: How long does a full epic take?
**A:** 4-8 hours typically, depending on story count and complexity.

### Q: Can I run multiple epics in parallel?
**A:** Not recommended - can cause conflicts. Run sequentially.

### Q: What if I just want to add one feature?
**A:** Use `@generate-workflow` for single stories. Use `@implement-epic` for complete epics.

### Q: Are the quality gates flexible?
**A:** No. 80% backend, 90% frontend, 100% endpoint coverage are mandatory.

### Q: What if testing keeps failing?
**A:** Fix the issues and use `@implement-epic {number} --testing-only` to re-run just testing.

---

## Quick Reference Card

```bash
# Complete Epic Implementation (NEW!)
@implement-epic 01                    # Full epic with testing
@implement-epic 01 --pending-only     # Skip implemented stories
@implement-epic 01 --testing-only     # Only run testing
@implement-epic 01 --force            # Re-implement everything
@implement-epic 01 --dry-run          # Preview plan

# Single Story Implementation
@generate-workflow epic 01 story 1.7  # One story only
@generate-workflow US1.7              # Short form
@generate-workflow backend US2.3      # Backend only
@generate-workflow frontend US3.4     # Frontend only

# Status Checks
Check epic 01 status                  # Current status
Show epic 02 progress                 # Progress details
```

---

## Next Steps

### For Developers:
1. Read this guide
2. Try @implement-epic on a small epic first (Epic 07 or Epic 12)
3. Monitor the progress
4. Review quality gate results
5. Use for all future epic implementations

### For QA:
1. Understand testing story structure
2. Review quality gate requirements
3. Prepare test environments
4. Monitor automated test execution
5. Review test reports

### For Product:
1. Understand quality guarantees
2. Plan epic implementations in sprints
3. Expect 4-8 hours per epic
4. Review completion reports
5. Approve for production deployment

---

**Every epic now has guaranteed quality through automated comprehensive testing!** 🚀
