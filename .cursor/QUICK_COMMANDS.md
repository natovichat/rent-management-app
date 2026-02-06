# Quick Command Reference

Fast commands for common development tasks in Cursor.

---

## ⚠️ **IMPORTANT: Automatic User Story Creation** 🆕

**When you request ANY new feature/requirement:**

The system **automatically**:
1. ✅ Analyzes your requirement
2. ✅ Finds or creates appropriate epic
3. ✅ Creates user story with acceptance criteria
4. ✅ Updates epic file
5. ✅ THEN proceeds with implementation

**Example:**
```
You: "Implement property valuation history"

AI Response:
  🔍 Analyzing requirement...
  📋 Found Epic 01: Property Management
  📝 Creating US1.19: Track Property Valuation History
  ✅ User story added to epic
  🚀 Implementing via /implement-user-story epic 01 user story 1.19
```

**This ensures:**
- ✅ All work tracked in epic system
- ✅ Acceptance criteria defined upfront
- ✅ Technical details documented
- ✅ No ad-hoc implementations

**Rule:** `.cursor/rules/requirement-to-user-story.mdc`

---

## 🎯 Implement Complete Epic (NEW!)

**Command**: Mention the `implement-epic` skill with an epic number.

### Basic Usage

```
@implement-epic 01
```

```
implement epic 02
```

```
Run epic 03 completely
```

### What It Does

This **meta-workflow** orchestrates the complete epic implementation:

1. ✅ **Verifies general requirements** (Hebrew, RTL, account isolation, etc.)
2. ✅ Reads epic file and extracts all user stories
3. ✅ Filters to feature stories (excludes testing story)
4. ✅ Executes each user story using @generate-workflow (sequential)
5. ✅ **Automatically runs the testing user story at the end**
6. ✅ Verifies all quality gates pass
7. ✅ Marks epic complete only if all tests pass

### Quality Gates (MUST Pass)

Epic CANNOT be marked complete until:

- ✅ Backend unit test coverage ≥ 80%
- ✅ API integration tests cover 100% of endpoints
- ✅ Frontend component test coverage ≥ 90%
- ✅ E2E tests cover 100% of user flows
- ✅ Zero failing tests
- ✅ Zero critical bugs
- ✅ Performance targets met
- ✅ Accessibility compliance (WCAG AA)

### Example Session

**You type:**
```
@implement-epic 01
```

**AI responds:**
```
🚀 IMPLEMENTING EPIC 01: PROPERTY MANAGEMENT

📋 Epic Overview:
   Total Stories: 18 (17 features + 1 testing)
   Status: 🟡 Partially Implemented
   Pending: 7 stories

🎯 Execution Plan:
   Phase 1: Implement 7 feature stories
   Phase 2: Execute comprehensive testing (US1.18)
   Phase 3: Verify quality gates
   Phase 4: Mark epic complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 STORY 1 OF 7: US1.1 - Create Property
[Executes 4-phase workflow via @generate-workflow]

✅ US1.1 Complete
   Files Changed: 5
   Tests Added: 12
   Coverage: 85%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 STORY 2 OF 7: US1.7 - Filter Properties
[Executes 4-phase workflow]

✅ US1.7 Complete
   Files Changed: 3
   Tests Added: 8
   Coverage: 87%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

... [continues for all 7 stories] ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL FEATURE STORIES COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Implementation Summary:
   Stories: 7/7 ✅
   Commits: 28
   Files Changed: 42
   Lines Added: 1,847
   Time: 3h 24m

🧪 Starting Comprehensive Testing...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 TESTING STORY: US1.18
Complete Testing Coverage for Property Management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running Backend Unit Tests...
✅ Backend: 84% coverage (Target: ≥80%)
   Tests: 127 passed, 0 failed

Running API Integration Tests...
✅ API: 15/15 endpoints tested (100%)
   Tests: 89 passed, 0 failed

Running Frontend Component Tests...
✅ Frontend: 92% coverage (Target: ≥90%)
   Tests: 156 passed, 0 failed

Running E2E Tests...
✅ E2E: 8/8 user flows tested (100%)
   Tests: 47 passed, 0 failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 QUALITY GATE VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Backend coverage ≥ 80%: 84%
✅ API endpoints: 15/15 (100%)
✅ Frontend coverage ≥ 90%: 92%
✅ E2E flows: 8 flows (100%)
✅ Zero failures: 0
✅ Zero critical bugs: 0
✅ Performance: ✅ Pass
✅ Accessibility: ✅ Pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 EPIC 01: COMPLETE & PRODUCTION READY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Final Stats:
   Stories: 18/18 (100%)
   Total Commits: 75
   Total Files: 128
   Total Time: 4h 12m
   Test Coverage: Backend 84%, Frontend 92%

✅ All quality gates passed
✅ Epic marked complete

Next: implement-epic 02
```

### Advanced Options

```bash
# Skip already implemented stories (continue partial epic)
@implement-epic 01 --pending-only

# Start from specific story
@implement-epic 01 --start-from US1.7

# Only run testing story (after manual fixes)
@implement-epic 01 --testing-only

# Force re-implementation of everything
@implement-epic 01 --force

# Preview execution plan without running
@implement-epic 01 --dry-run
```

### When to Use

✅ **Use for:**
- Implementing an entire epic from start to finish
- Ensuring comprehensive testing before epic completion
- Coordinating team work across multiple stories
- Enforcing quality gates

❌ **Don't use for:**
- Single user story implementation (use @generate-workflow instead)
- Quick bug fixes
- Experimental/prototype work

### Testing Story Details

Each epic has a **comprehensive testing user story** that runs at the end:

**Epic 01:** US1.18 - Complete Testing Coverage for Property Management  
**Epic 02:** US2.9 - Complete Testing Coverage for Unit Management  
**Epic 03:** US3.{N} - Complete Testing Coverage for Tenant Management  
... and so on for all epics

**What the testing story does:**
- Backend Team: Runs all unit tests, verifies ≥80% coverage
- QA Team (API): Tests all endpoints (100% coverage required)
- Frontend Team: Runs all component tests, verifies ≥90% coverage
- QA Team (E2E): Tests all user flows (100% coverage required)

**Quality gate failure example:**
```
❌ QUALITY GATE FAILURE

Failed Gates:
   ❌ Backend coverage: 72% (need 80%)
   ❌ 3 failing E2E tests

Epic Status: 🔴 BLOCKED

Required Actions:
   1. Add unit tests to reach 80% coverage
   2. Fix 3 failing E2E tests

Re-run: implement-epic 01 --testing-only
```

---

## 🚀 Generate Feature Workflow

**Command**: Mention the `generate-workflow` skill with epic and user story numbers.

### Basic Usage

```
@generate-workflow epic 01 user story 1.7
```

```
@generate-workflow implement US1.7
```

```
@generate-workflow run workflow for epic 2 story 3
```

### What It Does
1. ✅ **Verifies general requirements** (Hebrew, RTL, account isolation, etc.)
2. ✅ Reads the epic file and user story
3. ✅ Analyzes requirements and acceptance criteria  
4. ✅ Generates complete 4-phase workflow
5. ✅ **Executes the workflow automatically**
6. ✅ Reports progress and results

### Example Session

**You type:**
```
@generate-workflow epic 01 user story 1.7
```

**AI responds:**
```
🔍 Analyzing Epic 01, User Story 1.7...

📋 Found: US1.7 - Filter Properties
   Priority: 🟠 High
   Type: Full Stack Feature

⚡ Generating and executing 4-Phase Workflow...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0: API CONTRACT REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Backend Team - Reviewing existing filter API...
[Task executes...]

✅ Backend: API contract confirmed
✅ Frontend: API review approved  
✅ QA: Test plan created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Frontend Team - Implementing filter UI...
[Task executes in parallel...]

✅ Components created
✅ API integrated
✅ Tests written

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: INTEGRATION TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 QA Team - Running integration tests...
[Task executes...]

✅ All tests passing
✅ No integration issues

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3: FINAL REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 All teams - Final review...
[Task executes...]

✅ Approved for production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 US1.7 Complete! Ready to deploy.
```

---

## 📋 Command Variations

### Multiple Stories
```
@generate-workflow epic 01 stories 1.7, 1.8, 1.9
```

Executes all three workflows in sequence.

### Specific Template
```
@generate-workflow backend-only for US2.3
```

```
@generate-workflow frontend-only for US3.4
```

### Skip Phases (Advanced)
```
@generate-workflow US1.7 starting at phase 1
```

Useful when API contract already approved.

### Status Check First
```
@generate-workflow check status of US1.7
```

Shows current implementation status before running.

---

## 🎯 When to Use This Command

### ✅ Use for:
- Implementing any new user story
- Ensuring 4-phase workflow compliance
- Getting team coordination automatically
- Maintaining consistent quality

### ❌ Don't use for:
- Quick bug fixes (use simpler approach)
- Documentation updates only
- Configuration changes

---

## 💡 Pro Tips

1. **Let it complete** - Don't interrupt between phases
2. **Read the output** - AI reports findings from each phase
3. **Approve when asked** - Some steps require your confirmation
4. **Trust the process** - The 4 phases prevent integration bugs

---

## 🔧 Available Epic Numbers

| Epic | Name | Number |
|------|------|--------|
| Property Management | 01 |
| Unit Management | 02 |
| Ownership Management | 03 |
| Lease Management | 04 |
| Mortgage Management | 05 |
| Financial Tracking | 06 |
| Bank Account Management | 07 |
| Notifications | 08 |
| Portfolio Analytics | 09 |
| Data Import/Export | 10 |

---

## 📖 Examples by Epic

### Epic 01 - Property Management
```
@generate-workflow epic 01 user story 1.7   # Filter Properties
@generate-workflow implement US1.8          # View Property Details
@generate-workflow US1.13                   # Import Properties CSV
```

### Epic 02 - Unit Management
```
@generate-workflow epic 02 story 2.1        # Create Unit
@generate-workflow US2.4                    # Edit Unit Details
```

### Epic 04 - Lease Management
```
@generate-workflow epic 04 story 4.1        # Create Lease
@generate-workflow US4.6                    # Lease Expiration Alerts
```

---

## 🆘 Troubleshooting

### "Epic not found"
- Check epic number (01-10)
- Verify epic file exists in `docs/project_management/`

### "User story not found"
- Check user story number format (e.g., "1.7" not "17")
- Verify story exists in the epic file

### "Dependencies missing"
- AI will warn about missing prerequisites
- Implement dependency user stories first

### "Already implemented"
- AI will ask if you want to re-implement or enhance
- Choose the appropriate option

---

## 🎨 Customization

You can customize the workflow by editing:
- **Templates**: `@.cursor/WORKFLOW_TEMPLATES.md`
- **Team structure**: `@.cursor/TEAM_AGENTS_GUIDE.md`
- **Skill behavior**: `@.cursor/skills/generate-workflow/SKILL.md`

---

## 🚦 Workflow Status Indicators

- 🔴 **Critical** - Must be done immediately
- 🟠 **High** - Important, do soon
- 🟡 **Medium** - Normal priority
- 🟢 **Low** - Can wait

- ✅ **Implemented** - Done
- 🟡 **Partially Implemented** - In progress
- ⚪ **Not Started** - Pending

---

## ⚡ One-Line Quick Commands

Copy and customize these:

```bash
# Most common - implement a user story
@generate-workflow US1.7

# Check before implementing
@generate-workflow check US1.7

# Multiple stories batch
@generate-workflow US1.7, US1.8, US1.9

# Backend only
@generate-workflow backend US2.3

# Frontend only
@generate-workflow frontend US3.4
```

---

**Just type the command in Cursor chat - the AI will handle the rest!** 🚀
