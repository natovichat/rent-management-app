# Retrospective: [Short Issue Description]

**Date:** YYYY-MM-DD  
**Epic:** Epic XX - [Epic Name]  
**User Story:** US X.X - [User Story Name]  
**Test Cycle:** test-cycle-YYYYMMDD-HHMMSS  
**Severity:** 🔴 Critical / 🟠 Major / 🟡 Minor

---

## Issue Summary

**What Happened:**
[Clear description of the bug/issue that was found in the QA cycle]

**When Discovered:**
- Phase: [Phase 0 / Phase 1 / Phase 2 / Phase 3]
- Test: [Specific test that failed]
- Test Cycle: [Link to test-results folder]

**Impact:**
- User-facing: [Yes/No - what would users see?]
- Blocking: [Yes/No - blocked deployment?]
- Test Results: [X/Y tests failing]

---

## Timeline

**Bug Introduction:**
- Commit: [commit hash or describe when introduced]
- Date: [date bug was introduced]
- Change: [what change introduced the bug]

**Bug Discovery:**
- Date: [when bug was found]
- By: [QA Team / Manual testing / User report]
- Test: [which test caught it]

**Bug Resolution:**
- Date: [when bug was fixed]
- Fix: [brief description of fix]
- Commits: [list of fix commits]

---

## Root Cause Analysis

### 5 Whys

**Why 1:** [First why question]
→ [Answer]

**Why 2:** [Second why question]
→ [Answer]

**Why 3:** [Third why question]
→ [Answer]

**Why 4:** [Fourth why question]
→ [Answer]

**Why 5:** [Fifth why question]
→ [Answer]

**ROOT CAUSE:** [Fundamental reason the issue occurred - be specific]

---

### Team Interviews

**Backend Team Response:**
> [Quote or summary of backend team's perspective]
> - Why they think it wasn't caught in backend tests
> - What they would do differently

**Frontend Team Response:**
> [Quote or summary of frontend team's perspective]
> - Why they think it wasn't caught in component tests
> - What they would do differently

**QA Team Response:**
> [Quote or summary of QA team's perspective]
> - Why they think it reached E2E tests
> - What test coverage was missing

---

## Where Should This Have Been Caught?

**Ideal Prevention Phase:** [Phase 0 / Phase 1 Backend / Phase 1 Frontend / Phase 2 API Integration]

**Why It Should Have Been Caught There:**
[Explanation of what test or check should have existed in that phase]

**Why It Wasn't Caught:**
[Explanation of what was missing - test gap, rule gap, skill gap, etc.]

**Example Test That Would Have Caught It:**
```typescript
// Provide actual code example of a test that would have prevented this
describe('[Test Suite Name]', () => {
  it('should [test scenario]', () => {
    // Test code that would have caught the bug
  });
});
```

---

## Solution Implemented

### Code Changes

**Files Modified:**
1. `[filename]` - [description of change]
2. `[filename]` - [description of change]
3. `[filename]` - [description of change]

**Fix Description:**
[Detailed explanation of how the bug was fixed and why this solution works]

**Commits:**
- [commit hash]: [commit message]
- [commit hash]: [commit message]

### Test Cycle Comparison

**Before Fix:** test-cycle-[timestamp]
- Backend: X/Y passing
- E2E: X/Y passing
- Issues: [list specific issues]

**After Fix:** test-cycle-[timestamp]
- Backend: X/Y passing
- E2E: X/Y passing
- Issues: [list remaining issues or "None"]

**Improvement:** [Describe improvement - e.g., "0% → 100% E2E pass rate"]

---

## Process Improvements

### Rules Created/Modified

**1. Rule: [Rule Name]**
- **File:** `.cursor/rules/[filename].mdc`
- **Purpose:** [Why this rule prevents the issue]
- **Action:** Created / Modified
- **Key Requirements:**
  - [Requirement 1]
  - [Requirement 2]
  - [Requirement 3]

**2. Rule: [Another Rule if applicable]**
- **File:** `.cursor/rules/[filename].mdc`
- **Purpose:** [Purpose]
- **Action:** Created / Modified
- **Key Requirements:**
  - [Requirements]

### Skills Created/Modified

**1. Skill: [Skill Name]**
- **File:** `.cursor/skills/[skill-name]/SKILL.md`
- **Purpose:** [Why this skill improvement helps]
- **Action:** Created / Modified / Updated
- **Key Changes:**
  - [Change 1]
  - [Change 2]
  - [Change 3]

---

## Prevention Checklist

To prevent this issue in the future, ensure:

- [ ] [Specific preventive action 1]
- [ ] [Specific preventive action 2]
- [ ] [Specific preventive action 3]
- [ ] [Specific preventive action 4]
- [ ] [Specific preventive action 5]

---

## Related Issues

**Similar Past Issues:**
- [Link to previous retrospective if similar pattern]
- [None if this is a new pattern]

**Potentially Affected User Stories:**
- US X.X - [Name] - Status: [Needs review / Updated / No action needed]
- US X.X - [Name] - Status: [Status]

---

## Lessons Learned

### What Went Well
- ✅ [Positive aspect 1]
- ✅ [Positive aspect 2]
- ✅ [Positive aspect 3]

### What Didn't Go Well
- ❌ [Issue 1]
- ❌ [Issue 2]
- ❌ [Issue 3]

### Action Items

1. **Immediate:** [Action to take right away]
   - [Specific task]
   - [Specific task]

2. **Short-term:** [Action within this sprint]
   - [Specific task]
   - [Specific task]

3. **Long-term:** [Action for future improvements]
   - [Specific task]
   - [Specific task]

---

## Metrics

**Time to Detection:**
- Bug introduced: [date/time]
- Bug detected: [date/time]
- Duration: [X hours/days]

**Time to Resolution:**
- Bug detected: [date/time]
- Bug fixed: [date/time]
- Duration: [X hours/days]

**Test Cycle Impact:**
- Failed cycles: [number]
- Re-test cycles: [number]
- Total time: [X hours/days]

---

## Pattern Analysis

**New Pattern Identified:** [Yes/No]

If Yes:
- **Pattern Name:** [Name of pattern]
- **Frequency:** [How many times seen]
- **Prevention:** [How to prevent]

**Existing Pattern:** [Yes/No]

If Yes:
- **Pattern Name:** [Name]
- **Previous Occurrences:** [Link to other retrospectives]
- **Effectiveness of Previous Prevention:** [Did previous fixes help?]

---

**Status:** ✅ Resolved and Documented / ⚠️ Monitoring / 🔄 In Progress  
**Follow-up Required:** Yes / No  
**Next Review:** [Date if follow-up needed]

---

**Retrospective Conducted By:** Process Improvement Agent  
**Date Completed:** [Date]  
**Teams Involved:** [Backend / Frontend / QA / Other]

---

## Appendix: Additional Context

### Test Results Evidence

**Location:** [Path to test results]

**Key Files:**
- [List important test output files]
- [List error logs]
- [List screenshots/traces]

### Code Snippets

**Before Fix:**
```typescript
// Code showing the issue
```

**After Fix:**
```typescript
// Code showing the solution
```

### Screenshots

- [Link to relevant screenshots if available]

---

**This retrospective ensures the issue is understood, resolved, and prevented in the future.**
