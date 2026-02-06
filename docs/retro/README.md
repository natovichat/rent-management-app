# Retrospectives Index

This folder contains retrospective analyses conducted after bugs are found in QA cycles. Each retrospective documents root causes, solutions, and process improvements.

---

## Purpose

**Retrospectives help us:**
- Learn from mistakes systematically
- Prevent similar issues from recurring
- Improve our development process
- Build a searchable knowledge base
- Share learnings across the team

---

## When Retrospectives Are Conducted

### Mandatory Triggers:
- 🔴 **Critical bugs** found in any QA cycle
- 🟠 **Major bugs** that should have been caught earlier
- ⚠️ **Multiple minor bugs** indicating a process gap
- 🔄 **Recurring issues** across user stories

### Process:
1. QA cycle completes with failures
2. Dev team fixes issues
3. QA re-tests successfully
4. **Process Improvement Agent** conducts retrospective
5. Retrospective document created here

---

## Folder Structure

```
docs/retro/
├── README.md                     # This file
├── YYYY-MM-DD-epic-XX-us-X.X-<description>.md
├── YYYY-MM-DD-epic-XX-us-X.X-<description>.md
└── templates/
    └── retrospective-template.md
```

---

## Naming Convention

**Format:** `YYYY-MM-DD-epic-XX-us-X.X-<short-description>.md`

**Examples:**
- `2026-02-03-epic-01-us-1.1-e2e-button-selector-issue.md`
- `2026-02-05-epic-01-us-1.2-form-validation-missing.md`
- `2026-02-10-epic-02-us-2.1-authentication-flow-broken.md`

**Components:**
- `YYYY-MM-DD` - Date retrospective was conducted
- `epic-XX` - Epic number (e.g., `epic-01`)
- `us-X.X` - User story number (e.g., `us-1.1`)
- `<short-description>` - Kebab-case summary (3-5 words)

---

## Retrospectives by Epic

### Epic 01: Property Management

#### 2026-02-03: US1.1 - E2E Testing & Notifications Comprehensive Issues
- **File:** [RETRO_US1.1_E2E_AND_NOTIFICATIONS.md](RETRO_US1.1_E2E_AND_NOTIFICATIONS.md)
- **Severity:** 🔴 Critical
- **Issues:** 6 major issues (E2E not executed, Notifications invisible, POST timing, Strict mode, DB cleanup, No reporting)
- **Root Causes:** Workflow gaps, component lifecycle issues, test isolation problems, lack of reporting standards
- **Rules Created:** 
  - `e2e-testing-standards.mdc`
  - `e2e-html-reports.mdc`
- **GENERAL_REQUIREMENTS.md Updated:** 
  - Section 13 (Test Execution Requirements)
  - Section 23 (Database Cleanup)
  - Section 24 (HTML Reports)
  - Section 12.5 (Notification Placement)
- **Prevention:** Phase 2 gate, notification architecture pattern, database cleanup, HTML reporting
- **Time:** ~9 hours, 14 cycles
- **Status:** ✅ Resolved (6/8 tests passing, ready for manual test)

#### 2026-02-03: US1.1 - E2E Test Authentication and Button Selector Issues
- **File:** [2026-02-03-epic-01-us-1.1-e2e-authentication-button-selector.md](2026-02-03-epic-01-us-1.1-e2e-authentication-button-selector.md)
- **Severity:** 🟠 Major
- **Root Cause:** Test infrastructure issues (token key mismatch, button text mismatch)
- **Rules Created:** `test-execution-verification.mdc`
- **Skills Modified:** `implement-user-story/SKILL.md` (added Phase 2 verification gate)
- **Prevention:** Mandatory test execution proof, explicit field selectors
- **Status:** ✅ Resolved

---

### Epic 02: Unit Management
*No retrospectives yet*

---

### Epic 03: Ownership Management
*No retrospectives yet*

---

## Retrospectives by Category

### Test Coverage Gaps
- [2026-02-03] Epic 01, US1.1 - E2E test infrastructure
- [2026-02-03] Epic 01, US1.1 - E2E tests not executed (comprehensive retro)

### Validation Issues
*No retrospectives yet*

### Integration Problems
- [2026-02-03] Epic 01, US1.1 - POST request timing issues
- [2026-02-03] Epic 01, US1.1 - Database cleanup missing

### UI/UX Issues
- [2026-02-03] Epic 01, US1.1 - Notifications invisible (component lifecycle)

### Performance Issues
*No retrospectives yet*

---

## Retrospectives by Severity

### 🔴 Critical Bugs
- [2026-02-03] Epic 01, US1.1 - E2E & Notifications Comprehensive (6 major issues, ~9 hours)

### 🟠 Major Bugs
- [2026-02-03] Epic 01, US1.1 - E2E authentication and selectors

### 🟡 Minor Bugs
*No minor bugs retrospectives yet*

---

## Rules Created from Retrospectives

### Test Execution & Quality
1. **test-execution-verification.mdc** - Created 2026-02-03
   - **From:** Epic 01, US1.1
   - **Purpose:** Ensure tests are executed, not just written
   - **Prevents:** Features being marked "production ready" without actual test runs

2. **e2e-testing-standards.mdc** - Created 2026-02-03
   - **From:** Epic 01, US1.1 (Comprehensive Retro)
   - **Purpose:** Comprehensive E2E testing standards (timing, cleanup, locators)
   - **Prevents:** E2E timing issues, test interdependence, locator ambiguity

3. **e2e-html-reports.mdc** - Created 2026-02-03
   - **From:** Epic 01, US1.1 (Comprehensive Retro)
   - **Purpose:** Standard HTML reporting for E2E results
   - **Prevents:** Poor visibility, lack of stakeholder communication

### UI Component Standards
1. **Notification Placement Architecture** - Documented 2026-02-03
   - **From:** Epic 01, US1.1 (Comprehensive Retro)
   - **In:** GENERAL_REQUIREMENTS.md Section 12.5
   - **Purpose:** Notifications in persistent components, not temporary ones
   - **Prevents:** Notifications disappearing with dialog/modal close

### Backend Validation
*No rules yet*

### API Contract
*No rules yet*

---

## Skills Modified from Retrospectives

### Workflow Skills
1. **implement-user-story/SKILL.md** - Modified 2026-02-03
   - **From:** Epic 01, US1.1
   - **Addition:** Step 9 - Test Execution Verification Gate
   - **Addition:** Step 10 - Critical Bug Gate
   - **Purpose:** Block Phase 3 if tests not actually executed

### Team Skills
*No modifications yet*

---

## Common Patterns

### Pattern: Test Infrastructure Issues
**Occurrences:** 2
**Last Seen:** 2026-02-03 (Epic 01, US1.1 - Comprehensive)
**Root Causes:**
- Test configuration mismatches
- Missing test infrastructure setup
- Insufficient wait conditions for UI animations
- Tests written but not executed
- No database cleanup between tests
- Timing issues with POST requests

**Prevention:**
- Explicit test execution verification with proof
- Infrastructure validation before running tests
- Better wait strategies for UI components
- Mandatory database cleanup in beforeEach()
- Phase 2 Gate - block progression without execution proof
- Comprehensive E2E testing standards documented

---

### Pattern: Component Lifecycle Issues
**Occurrences:** 1
**Last Seen:** 2026-02-03 (Epic 01, US1.1 - Notifications)
**Root Causes:**
- UI components (Snackbar) placed in temporary parents (Dialog)
- Dialog closes immediately after action
- Notifications unmount before being visible

**Prevention:**
- Notifications must be in persistent parent components
- Component lifecycle awareness in architecture decisions
- Manual testing requirement before Phase 4 completion
- Document component placement patterns

---

### Pattern: Validation Gaps
**Occurrences:** 0
*No patterns yet*

---

### Pattern: Communication Gaps
**Occurrences:** 0
*No patterns yet*

---

## Metrics

### Overall Statistics
- **Total Retrospectives:** 2
- **Epics Covered:** 1 (Epic 01)
- **User Stories Analyzed:** 1 (US1.1)
- **Rules Created:** 4 (test-execution-verification, e2e-testing-standards, e2e-html-reports, notification-placement)
- **Skills Modified:** 1
- **GENERAL_REQUIREMENTS Sections Updated:** 4
- **Average Time to Retrospective:** ~2 hours after resolution

### By Severity
- 🔴 Critical: 1 (E2E & Notifications - 6 issues, ~9 hours)
- 🟠 Major: 1 (E2E authentication)
- 🟡 Minor: 0

### By Prevention Phase
- Phase 0 (API Contract): 0
- Phase 1 (Backend Unit Tests): 0
- Phase 1 (Frontend Component Tests): 0
- Phase 2 (API Integration Tests): 0
- Phase 2 (E2E Tests): 2 (test infrastructure, comprehensive E2E issues)
- Phase 4 (Full Stack Integration): 1 (notifications, database cleanup)

### Effectiveness
- **Similar Bugs Prevented:** 0 (baseline - new patterns established)
- **Process Improvements:** 6 (4 rules, 1 skill, 4 GENERAL_REQUIREMENTS sections)
- **Team Awareness:** High (immediate rule adoption, comprehensive documentation)
- **Architecture Patterns Established:** 1 (Notification placement in persistent components)
- **Testing Standards Formalized:** 2 (E2E execution, database cleanup)

---

## Using This Index

### Finding a Retrospective

**By Date:**
```bash
ls -la docs/retro/ | grep "2026-02-03"
```

**By Epic:**
```bash
ls -la docs/retro/ | grep "epic-01"
```

**By User Story:**
```bash
ls -la docs/retro/ | grep "us-1.1"
```

**By Keyword:**
```bash
grep -r "authentication" docs/retro/
```

### Adding a New Retrospective

1. **Create file** with naming convention
2. **Use template** from `templates/retrospective-template.md`
3. **Complete all sections** (no skipping!)
4. **Update this README:**
   - Add to epic section
   - Add to category section
   - Add to severity section
   - Update rules/skills lists
   - Update metrics
   - Update patterns (if applicable)

---

## Templates

### Retrospective Template
- **Location:** `templates/retrospective-template.md`
- **Purpose:** Standard structure for all retrospectives
- **Required:** Use this template for consistency

### Quick Retrospective
For minor issues, use abbreviated format:
- Issue summary
- Root cause (brief)
- Solution
- Prevention action

---

## Related Documentation

### Process Improvement
- **Agent Skill:** `.cursor/skills/process-improvement-agent/SKILL.md`
- **Workflow Integration:** `.cursor/skills/implement-user-story/SKILL.md`

### Rules Created
- **Test Execution:** `.cursor/rules/test-execution-verification.mdc`
- **Documentation:** `.cursor/rules/documentation-organization.mdc`

### Test Results
- **Test Results Folder:** `test-results/`
- **Test Organization:** `test-results/README.md`

---

## Best Practices

### Conducting Retrospectives

✅ **DO:**
- Conduct within 24 hours of resolution
- Interview all relevant teams
- Use structured methodology (5 Whys)
- Create actionable rules/skills
- Document thoroughly
- Update this index

❌ **DON'T:**
- Blame individuals
- Skip root cause analysis
- Create rules without examples
- Document without team input
- Forget to update index

### Writing Retrospectives

✅ **DO:**
- Be specific and detailed
- Include code examples
- Link to test results
- Show before/after
- Document learnings
- Create prevention checklist

❌ **DON'T:**
- Use vague language
- Skip technical details
- Forget to link files
- Ignore team feedback
- Rush the analysis

---

## Continuous Improvement

### Monthly Review

At end of each month:
- [ ] Review all retrospectives
- [ ] Identify recurring patterns
- [ ] Evaluate effectiveness of rules/skills
- [ ] Update prevention strategies
- [ ] Share learnings with team
- [ ] Celebrate improvements

### Quarterly Analysis

Every quarter:
- [ ] Analyze trends across epics
- [ ] Measure reduction in similar bugs
- [ ] Assess rule/skill effectiveness
- [ ] Identify systematic improvements
- [ ] Update team processes
- [ ] Document success stories

---

## Contact

**Process Improvement Agent:** @process-improvement-agent
**Questions:** Ask in team channel or tag the agent

---

**Remember**: Every bug is a learning opportunity. Document thoroughly, improve systematically, prevent recurrence.

---

**Last Updated:** February 3, 2026
**Total Retrospectives:** 2
**Latest Retrospective:** 2026-02-03 (Epic 01, US1.1 - E2E & Notifications Comprehensive)
**Most Comprehensive:** RETRO_US1.1_E2E_AND_NOTIFICATIONS.md (6 issues, 14 cycles, ~9 hours)

---

## 🎯 Key Learnings from US1.1

**Critical Insights:**
1. **"Written" ≠ "Executed"** - Always require proof of test execution
2. **Component Lifecycle Matters** - Notifications must be in persistent parents
3. **Test Isolation is Non-Negotiable** - Database must be clean before each test
4. **Manual Testing is Critical** - Automated tests can give false positives
5. **Good Reporting Matters** - Stakeholders need visual, comprehensive reports
6. **Architecture > Styling** - Placement of UI components is crucial

**Rules Established:**
- E2E Testing Standards (comprehensive)
- HTML Report Standards (professional presentation)
- Database Cleanup Requirements (test isolation)
- Notification Placement Architecture (component lifecycle)

**Impact:**
- 6 major issues resolved
- 4 new rules/standards created
- 4 GENERAL_REQUIREMENTS sections updated
- Strong foundation for remaining 9 user stories in Epic 01
