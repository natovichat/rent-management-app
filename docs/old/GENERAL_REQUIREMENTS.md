# General Requirements - MANDATORY

**Date:** February 2, 2026  
**Status:** ✅ Active  
**Applies To:** ALL user stories and epics

---

## Overview

This document defines the **mandatory requirements** that apply to **EVERY** user story and epic implementation in the Property Portfolio Management System. All development teams (Backend, Frontend, QA) MUST follow these requirements.

**These requirements are ALWAYS applicable and must be checked BEFORE starting any implementation.**

---

## 🌐 Internationalization & Localization

### 1. Hebrew Language (עברית)

**MANDATORY:** All user-facing text must be in Hebrew.

#### Frontend Requirements:
```tsx
// ✅ Good - Hebrew text
<Button>צור נכס חדש</Button>
<TextField label="כתובת" />
<Typography>סה"כ נכסים: {count}</Typography>

// ❌ Bad - English text
<Button>Create New Property</Button>
<TextField label="Address" />
<Typography>Total Properties: {count}</Typography>
```

#### What Must Be in Hebrew:
- ✅ All UI labels and buttons
- ✅ Form field labels
- ✅ Validation error messages
- ✅ Success/info messages
- ✅ Dialog titles and content
- ✅ Menu items
- ✅ Tooltips and help text
- ✅ Empty state messages
- ✅ Loading messages
- ✅ Confirmation dialogs

#### What Can Stay in English:
- ✅ Code comments
- ✅ Variable names
- ✅ Function names
- ✅ API endpoints
- ✅ Database field names
- ✅ Log messages (backend)

---

### 2. Right-to-Left (RTL) Layout

**MANDATORY:** All UI components must support RTL layout for Hebrew.

#### MUI Theme Configuration:
```tsx
// ✅ Required: RTL theme configuration
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
});

// Wrap app with RTL support
<CacheProvider value={cacheRtl}>
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
</CacheProvider>
```

#### Component-Level RTL:
```tsx
// ✅ Good - RTL-aware layout
<Box sx={{ 
  direction: 'rtl',
  textAlign: 'right',
  paddingRight: 2, // Not paddingLeft
}}>
  <Typography>כתובת</Typography>
</Box>

// ✅ Good - DataGrid RTL
<DataGrid
  sx={{
    direction: 'rtl',
    '& .MuiDataGrid-columnHeaders': {
      direction: 'rtl',
    },
  }}
/>

// ❌ Bad - LTR layout for Hebrew
<Box sx={{ direction: 'ltr' }}>
  <Typography>כתובת</Typography>
</Box>
```

#### RTL Checklist:
- [ ] Text aligned to right (not left)
- [ ] Form fields aligned right
- [ ] Icons positioned correctly (reverse for RTL)
- [ ] Dialogs/modals open from right
- [ ] Menus expand from right
- [ ] Progress indicators flow right-to-left
- [ ] DataGrid columns: primary on right
- [ ] Breadcrumbs flow right-to-left

---

## 🎨 UI/UX Standards

### 3. Material-UI (MUI) Components

**MANDATORY:** Use MUI components for all UI elements.

```tsx
// ✅ Good - MUI components
import { Button, TextField, Dialog, DataGrid } from '@mui/material';

<Button variant="contained">שמור</Button>
<TextField label="שם" fullWidth />

// ❌ Bad - Plain HTML elements
<button>שמור</button>
<input type="text" placeholder="שם" />
```

---

### 4. Form Validation

**MANDATORY:** All forms must have proper validation.

#### Client-Side Validation:
```tsx
// ✅ Good - React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  address: z.string().min(1, 'כתובת היא שדה חובה'),
  estimatedValue: z.number().positive('ערך חייב להיות חיובי'),
});

const form = useForm({
  resolver: zodResolver(schema),
});

// Error messages in Hebrew
{form.formState.errors.address && (
  <FormHelperText error>
    {form.formState.errors.address.message}
  </FormHelperText>
)}
```

#### Required Field Indicators:
```tsx
// ✅ Good - Mark required fields
<TextField 
  label="כתובת *" 
  required 
  error={!!errors.address}
  helperText={errors.address?.message}
/>
```

---

### 5. Loading States

**MANDATORY:** Show loading indicators during async operations.

```tsx
// ✅ Good - Loading state
import { CircularProgress } from '@mui/material';

{isLoading ? (
  <Box display="flex" justifyContent="center" p={4}>
    <CircularProgress />
    <Typography sx={{ ml: 2 }}>טוען...</Typography>
  </Box>
) : (
  <DataGrid rows={data} columns={columns} />
)}
```

---

### 6. Empty States

**MANDATORY:** Handle empty data gracefully.

```tsx
// ✅ Good - Empty state with Hebrew
{data.length === 0 ? (
  <Box textAlign="center" p={4}>
    <Typography variant="h6" color="text.secondary">
      לא נמצאו נכסים
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      התחל בהוספת הנכס הראשון שלך
    </Typography>
    <Button variant="contained" sx={{ mt: 2 }}>
      צור נכס חדש
    </Button>
  </Box>
) : (
  <DataGrid rows={data} columns={columns} />
)}
```

---

### 7. Error Handling

**MANDATORY:** Show user-friendly error messages in Hebrew.

```tsx
// ✅ Good - Hebrew error messages
import { Snackbar, Alert } from '@mui/material';

<Snackbar open={error} autoHideDuration={6000}>
  <Alert severity="error">
    אירעה שגיאה בשמירת הנכס. אנא נסה שוב.
  </Alert>
</Snackbar>

// Error messages by type
const ERROR_MESSAGES = {
  NETWORK: 'שגיאת תקשורת. בדוק את החיבור לאינטרנט.',
  VALIDATION: 'נתונים לא תקינים. אנא בדוק את השדות.',
  UNAUTHORIZED: 'אין הרשאה לביצוע פעולה זו.',
  NOT_FOUND: 'הפריט לא נמצא.',
  SERVER: 'שגיאת שרת. אנא נסה שוב מאוחר יותר.',
};
```

---

## 🔐 Multi-Tenancy (Account Isolation)

### 8. Account-Based Data Isolation

**MANDATORY:** ALL data must be isolated per account.

#### Backend Implementation:
```typescript
// ✅ Good - Account filtering
async findAll(accountId: string) {
  return this.prisma.property.findMany({
    where: { accountId }, // MANDATORY filter
  });
}

async findOne(id: string, accountId: string) {
  return this.prisma.property.findUnique({
    where: { 
      id,
      accountId, // MANDATORY: Prevent cross-account access
    },
  });
}

// ❌ Bad - No account filtering
async findAll() {
  return this.prisma.property.findMany(); // Returns ALL accounts' data!
}
```

#### Account ID Extraction:
```typescript
// ✅ Good - Get accountId from authenticated user
@UseGuards(AuthGuard)
@Get()
async findAll(@Request() req) {
  const accountId = req.user.accountId;
  return this.propertiesService.findAll(accountId);
}
```

#### Testing Multi-Tenancy:
```typescript
// ✅ Good - Test account isolation
it('should not return properties from other accounts', async () => {
  const account1Properties = await service.findAll('account-1');
  const account2Properties = await service.findAll('account-2');
  
  expect(account1Properties).not.toContainEqual(
    expect.objectContaining({ accountId: 'account-2' })
  );
});
```

---

## 📊 DataGrid Standards

### 9. DataGrid Configuration

**MANDATORY:** Follow these standards for all data tables.

#### Column Reordering:
```tsx
// ✅ Good - Enable column reordering
<DataGrid
  rows={data}
  columns={columns}
  disableColumnReorder={false} // MANDATORY
  sx={{ direction: 'rtl' }}
/>
```

#### Column Order (RTL):
```tsx
// ✅ Good - Primary column first (right-most in RTL)
const columns: GridColDef[] = [
  { field: 'address', headerName: 'כתובת', flex: 1 }, // Primary (right)
  { field: 'fileNumber', headerName: 'מספר תיק', width: 150 },
  { field: 'city', headerName: 'עיר', width: 120 },
  { field: 'createdAt', headerName: 'תאריך יצירה', width: 150 },
  { field: 'actions', type: 'actions', headerName: 'פעולות', width: 150 }, // Actions (left)
];
```

#### Pagination:
```tsx
// ✅ Good - Server-side pagination
<DataGrid
  rows={data}
  columns={columns}
  paginationMode="server"
  rowCount={totalCount}
  page={page}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

---

## 🔍 Search & Filter

### 10. Search Functionality

**MANDATORY:** Implement debounced search with Hebrew support.

```tsx
// ✅ Good - Debounced search
import { useDebounce } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch] = useDebounce(searchTerm, 300);

<TextField
  label="חיפוש"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="חפש לפי כתובת או מספר תיק..."
  fullWidth
/>
```

#### Backend Search:
```typescript
// ✅ Good - Case-insensitive search with Hebrew
async search(accountId: string, searchTerm: string) {
  return this.prisma.property.findMany({
    where: {
      accountId,
      OR: [
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { fileNumber: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
  });
}
```

---

### 11. Filter Functionality

**MANDATORY:** Support multiple filter combinations.

```tsx
// ✅ Good - Multiple filters
<Box display="flex" gap={2} mb={2}>
  <FormControl sx={{ minWidth: 150 }}>
    <InputLabel>סוג נכס</InputLabel>
    <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
      <MenuItem value="">הכל</MenuItem>
      <MenuItem value="RESIDENTIAL">מגורים</MenuItem>
      <MenuItem value="COMMERCIAL">מסחרי</MenuItem>
      <MenuItem value="LAND">קרקע</MenuItem>
    </Select>
  </FormControl>
  
  <FormControl sx={{ minWidth: 150 }}>
    <InputLabel>סטטוס</InputLabel>
    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
      <MenuItem value="">הכל</MenuItem>
      <MenuItem value="OWNED">בבעלות</MenuItem>
      <MenuItem value="IN_CONSTRUCTION">בבנייה</MenuItem>
      <MenuItem value="SOLD">נמכר</MenuItem>
    </Select>
  </FormControl>
</Box>
```

---

## 🔗 Inline Entity Creation Pattern

### 12. Inline Creation for Related Entities

**MANDATORY:** When a form has a dropdown for a related entity, provide "+ Create New" option.

```tsx
// ✅ Good - Inline creation
<Select
  value={investmentCompanyId}
  onChange={(e) => {
    if (e.target.value === '__CREATE_NEW__') {
      setCreateCompanyDialogOpen(true);
    } else {
      setInvestmentCompanyId(e.target.value);
    }
  }}
>
  {companies.map(company => (
    <MenuItem key={company.id} value={company.id}>
      {company.name}
    </MenuItem>
  ))}
  <MenuItem 
    value="__CREATE_NEW__"
    sx={{ 
      color: 'primary.main', 
      fontWeight: 600,
      borderTop: 1,
      borderColor: 'divider',
    }}
  >
    + צור חברת השקעה חדשה
  </MenuItem>
</Select>

{/* Inline creation dialog */}
<Dialog open={createCompanyDialogOpen} onClose={...}>
  <DialogTitle>צור חברת השקעה חדשה</DialogTitle>
  <DialogContent>
    {/* Form fields */}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCancel}>ביטול</Button>
    <Button variant="contained" onClick={handleCreate}>
      צור
    </Button>
  </DialogActions>
</Dialog>
```

#### Auto-Select After Creation:
```typescript
// ✅ MANDATORY - Auto-select newly created entity
const createCompanyMutation = useMutation({
  mutationFn: companiesApi.create,
  onSuccess: (newCompany) => {
    // Auto-select the new company
    form.setValue('investmentCompanyId', newCompany.id);
    setCreateCompanyDialogOpen(false);
    // Refresh list
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  },
});
```

---

## 🔔 Success Notifications

### 12.5 Toast/Snackbar Notifications

**MANDATORY:** Display success notification after EVERY entity save operation.

#### Implementation with MUI Snackbar:
```tsx
// ✅ Good - Success notification after entity creation
import { Snackbar, Alert } from '@mui/material';

const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as 'success' | 'error' | 'info' | 'warning',
});

const createMutation = useMutation({
  mutationFn: api.create,
  onSuccess: () => {
    // ✅ MANDATORY: Show success notification
    setSnackbar({
      open: true,
      message: 'הנכס נוסף בהצלחה', // Hebrew message
      severity: 'success',
    });
    onClose(); // Close dialog/form
    queryClient.invalidateQueries({ queryKey: ['entities'] });
  },
  onError: (error) => {
    setSnackbar({
      open: true,
      message: 'שגיאה בשמירת הנכס',
      severity: 'error',
    });
  },
});

<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  sx={{
    zIndex: 9999, // Ensure visibility above all other elements
    '& .MuiAlert-root': {
      fontSize: '1.1rem',
      fontWeight: 600,
      minWidth: '400px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    }
  }}
>
  <Alert 
    onClose={() => setSnackbar({ ...snackbar, open: false })} 
    severity={snackbar.severity}
    sx={{ width: '100%' }}
    variant="filled"
  >
    {snackbar.message}
  </Alert>
</Snackbar>
```

#### Notification Messages (Hebrew):

**Property (נכס):**
- Create: `הנכס נוסף בהצלחה ✓`
- Update: `הנכס עודכן בהצלחה ✓`
- Delete: `הנכס נמחק בהצלחה ✓`

**Owner (בעלים):**
- Create: `הבעלים נוסף בהצלחה ✓`
- Update: `הבעלים עודכן בהצלחה ✓`
- Delete: `הבעלים נמחק בהצלחה ✓`

**Tenant (דייר):**
- Create: `הדייר נוסף בהצלחה ✓`
- Update: `הדייר עודכן בהצלחה ✓`
- Delete: `הדייר נמחק בהצלחה ✓`

**Lease (חוזה):**
- Create: `החוזה נוסף בהצלחה ✓`
- Update: `החוזה עודכן בהצלחה ✓`
- Delete: `החוזה נמחק בהצלחה ✓`

**Investment Company (חברת השקעה):**
- Create: `חברת ההשקעה נוספה בהצלחה ✓`
- Update: `חברת ההשקעה עודכנה בהצלחה ✓`
- Delete: `חברת ההשקעה נמחקה בהצלחה ✓`

#### Notification Requirements:
- ✅ Display at **top center** of screen
- ✅ Auto-dismiss after **6 seconds** (enough time to read)
- ✅ Green for success, red for error
- ✅ Include checkmark icon (✓) for success
- ✅ Allow manual dismiss (X button)
- ✅ Hebrew text only
- ✅ Clear, concise message (5-10 words)
- ✅ High z-index (9999) to appear above all content
- ✅ Large, bold text for visibility
- ✅ Prominent shadow for contrast

#### Error Notification:
```tsx
// ✅ Good - Error notification
onError: (error: any) => {
  const message = error.response?.data?.message || 'אירעה שגיאה. אנא נסה שוב.';
  setSnackbar({
    open: true,
    message,
    severity: 'error',
  });
}
```

#### Validation vs. Success Notifications:

**Validation Errors:**
- Show inline below form fields (FormHelperText)
- Stay visible until user corrects
- Red text, no auto-dismiss

**Success Notifications:**
- Show as toast/snackbar at top
- Auto-dismiss after 4 seconds
- Green background with checkmark

**❌ Don't:**
- Use validation errors for success messages
- Show success inline in forms
- Mix validation and success feedback

**✅ Do:**
- Use Snackbar/Toast for all CRUD success messages
- Use FormHelperText for validation errors
- Keep messages short and clear in Hebrew

---

## 🧪 Testing Requirements

### 13. Test Coverage & Execution Proof

**MANDATORY:** All code must have tests AND tests must be EXECUTED with proof.

#### 🚨 Critical: Test Execution Verification

**"Tests written" ≠ "Tests executed"**

All implementations must provide PROOF of test execution:

**Required Evidence:**
1. **Backend Unit Tests:**
   - ✅ Test files written
   - ✅ Tests EXECUTED: `npm test` output captured
   - ✅ Pass/fail counts reported
   - ✅ Coverage report: `npm test -- --coverage`
   - 📋 Example: "✅ 39/39 backend unit tests passing (87% coverage)"

2. **E2E Tests:**
   - ✅ Test files written
   - ✅ Test infrastructure verified (Playwright/Cypress installed)
   - ✅ Tests EXECUTED: `npx playwright test` output captured
   - ✅ Pass/fail counts reported
   - 📋 Example: "✅ 8/8 E2E tests passing"

3. **API Integration Tests:**
   - ✅ Test files written
   - ✅ Tests EXECUTED with real backend
   - ✅ Pass/fail counts reported
   - 📋 Example: "✅ 12/12 API integration tests passing"

**🚨 Phase 2 Gate: Cannot proceed to Phase 3 without execution proof!**

#### Backend Tests:
- ✅ Unit tests: ≥80% coverage
- ✅ Service methods tested
- ✅ Validation tested
- ✅ Error handling tested
- ✅ **EXECUTED with output captured**

#### Frontend Tests:
- ✅ Component tests: ≥90% coverage
- ✅ Components render correctly
- ✅ Form validation tested
- ✅ User interactions tested
- ✅ **EXECUTED with output captured**

#### E2E Tests:
- ✅ E2E test files written
- ✅ Playwright/Cypress installed and configured
- ✅ **Database cleaned before EACH test** (test account only)
- ✅ Tests EXECUTED in real browser
- ✅ All user flows covered
- ✅ **Success notifications verified** in all create/update/delete tests
- ✅ **EXECUTED with screenshots/video proof**
- ✅ **HTML report generated** (`playwright-report/index.html`)
- ✅ **HTML report manually reviewed** by QA engineer
- ✅ **HTML report archived** in cycle folder
- ✅ **Epic HTML report updated** (E2E_TEST_REPORT.html)

#### API Tests:
- ✅ 100% endpoint coverage
- ✅ CRUD operations tested
- ✅ Validation errors tested
- ✅ Edge cases tested
- ✅ **EXECUTED with real backend running**

**Rejection Criteria:**
- ❌ Tests written but not executed
- ❌ Test infrastructure missing (Playwright not installed)
- ❌ No test execution output provided
- ❌ Aggregate test counts hide missing E2E tests
- ❌ "Tests pass" claim without proof

---

### 13.5. Test Naming Convention (MANDATORY)

**CRITICAL:** All test cases must follow a clear, descriptive naming convention that includes the user story ID and test description.

#### Test Case Naming Format:

```
TC-E2E-<US_ID>-<SEQ>-<short-description>
```

**Components:**
- `TC-E2E` = Test Case - End to End (fixed prefix)
- `<US_ID>` = User Story ID (e.g., `1.1`, `1.3`, `2.5`)
- `<SEQ>` = Sequential number within the user story (001, 002, etc.)
- `<short-description>` = Kebab-case description of what's being tested

#### Examples:

**✅ Good - Clear and Descriptive:**
```typescript
// US1.1 tests
test('TC-E2E-1.1-001-create-with-required-fields', async ({ page }) => {
  // Test creating property with only address
});

test('TC-E2E-1.1-002-create-with-all-fields', async ({ page }) => {
  // Test creating property with all fields
});

test('TC-E2E-1.1-003-validation-address-required', async ({ page }) => {
  // Test that address validation works
});

// US1.3 tests
test('TC-E2E-1.3-001-add-property-type-dropdown', async ({ page }) => {
  // Test property type selection
});

test('TC-E2E-1.3-002-add-property-status-dropdown', async ({ page }) => {
  // Test property status selection
});

test('TC-E2E-1.3-003-numeric-fields-accept-decimals', async ({ page }) => {
  // Test decimal number handling
});

// US1.1.2 tests
test('TC-E2E-1.1.2-001-account-selector-visible', async ({ page }) => {
  // Test account selector displays
});

test('TC-E2E-1.1.2-002-switching-accounts-filters-properties', async ({ page }) => {
  // Test that switching accounts filters data
});
```

**❌ Bad - Unclear:**
```typescript
// ❌ Bad - No user story ID
test('TC-E2E-001: Create property with required fields', async ({ page }) => {
  // Which user story is this for? Unknown!
});

// ❌ Bad - Generic numbering
test('TC-E2E-002: Property type dropdown', async ({ page }) => {
  // Is this US1.1, US1.3, or something else? Unclear!
});

// ❌ Bad - No description
test('TC-E2E-1.3-001', async ({ page }) => {
  // What is this testing? No idea!
});
```

#### Benefits of This Convention:

1. **✅ Immediate User Story Identification**
   - See "TC-E2E-1.3-" → Know it's US1.3
   - No need to open file to know what story it belongs to

2. **✅ Clear Test Purpose**
   - Description tells you what's being tested
   - Example: `-add-property-type-dropdown` → testing type dropdown

3. **✅ Easy Code Navigation**
   - Test name indicates which component/feature to look at
   - Example: `-switching-accounts-` → Look at AccountContext, account selector

4. **✅ Test Organization**
   - All US1.1 tests grouped together (1.1-001, 1.1-002, etc.)
   - All US1.3 tests grouped together (1.3-001, 1.3-002, etc.)

5. **✅ Better Test Reports**
   - HTML reports show clear test hierarchy
   - Easy to identify which user story has failing tests

6. **✅ Simplified Debugging**
   - Failed test name tells you exactly where to look
   - Example: "TC-E2E-1.3-002-add-property-status-dropdown failed"
     → Look at PropertyForm status dropdown logic

#### Implementation Guidelines:

**When Creating Test Files:**

```typescript
// File: apps/frontend/test/e2e/us1.3-property-details.spec.ts

test.describe('US1.3 - Add Property Details (TDD)', () => {
  
  test('TC-E2E-1.3-001-add-all-detail-fields', async ({ page }) => {
    /**
     * Tests: Adding property with all detail fields
     * Covers AC: Property type, status, city, country, areas, estimated value
     */
  });
  
  test('TC-E2E-1.3-002-property-type-dropdown-options', async ({ page }) => {
    /**
     * Tests: Property type dropdown shows all options
     * Covers AC: RESIDENTIAL, COMMERCIAL, LAND, MIXED_USE
     */
  });
  
  test('TC-E2E-1.3-003-property-status-dropdown-options', async ({ page }) => {
    /**
     * Tests: Property status dropdown shows all options
     * Covers AC: OWNED, IN_CONSTRUCTION, IN_PURCHASE, SOLD, INVESTMENT
     */
  });
});
```

#### Description Format:

**Use kebab-case for descriptions:**
- Lowercase words separated by hyphens
- Action-oriented or feature-oriented
- Max 5-6 words

**Examples:**
- ✅ `create-with-required-fields`
- ✅ `validation-address-required`
- ✅ `switching-accounts-filters-properties`
- ✅ `numeric-fields-accept-decimals`
- ✅ `property-type-dropdown-options`
- ❌ `CreatePropertyWithFields` (not kebab-case)
- ❌ `test1` (not descriptive)
- ❌ `this_is_a_very_long_description_that_goes_on_forever` (too long)

#### Unit Test Naming:

For unit tests (Jest/Vitest), use similar pattern:

```typescript
// File: apps/backend/src/modules/properties/properties.service.spec.ts

describe('PropertiesService - US1.3 Tests', () => {
  
  it('TC-UNIT-1.3-001-should-save-property-with-type', async () => {
    // Test that property type is saved correctly
  });
  
  it('TC-UNIT-1.3-002-should-save-property-with-status', async () => {
    // Test that property status is saved correctly
  });
  
  it('TC-UNIT-1.3-003-should-validate-decimal-areas', async () => {
    // Test decimal validation for area fields
  });
});
```

#### API Test Naming:

```typescript
// File: apps/backend/test/api/properties-api.spec.ts

describe('Properties API - US1.3 Tests', () => {
  
  it('TC-API-1.3-001-post-property-with-type-and-status', async () => {
    // POST /properties with type and status
  });
  
  it('TC-API-1.3-002-get-property-returns-all-details', async () => {
    // GET /properties/:id returns complete data
  });
});
```

#### Test ID Prefixes by Type:

| Test Type | Prefix | Example |
|-----------|--------|---------|
| E2E Tests | `TC-E2E` | `TC-E2E-1.3-001-add-all-fields` |
| Unit Tests | `TC-UNIT` | `TC-UNIT-1.3-001-save-with-type` |
| API Tests | `TC-API` | `TC-API-1.3-001-post-with-details` |
| Component Tests | `TC-COMP` | `TC-COMP-1.3-001-form-renders-fields` |

#### Migration of Existing Tests:

**When updating existing tests to new convention:**

```typescript
// Before ❌
test('TC-E2E-001: Create property with required fields', async ({ page }) => {
  // ...
});

// After ✅
test('TC-E2E-1.1-001-create-with-required-fields', async ({ page }) => {
  // ...
});
```

**Migration Checklist:**
- [ ] Add user story ID after TC-E2E-
- [ ] Convert description to kebab-case
- [ ] Keep same test logic (only rename)
- [ ] Update test file documentation
- [ ] Update test reports/documentation

#### Enforcement:

**Test Naming Requirements:**
- ✅ MUST include user story ID
- ✅ MUST include sequential number
- ✅ MUST include descriptive name
- ✅ Description in kebab-case
- ✅ Description max 6 words
- ✅ Test prefix matches test type (E2E/UNIT/API/COMP)

**Rejection Criteria:**
- ❌ Test name missing user story ID
- ❌ Test name has no description
- ❌ Test name unclear about what's being tested
- ❌ Cannot determine which user story from test name

---

### 14. Test Logging Standards (MANDATORY)

**CRITICAL:** All tests MUST include descriptive console logs to improve readability and debugging.

#### Why Logging Matters:

**Problems without logging:**
- ❌ Can't understand test flow from output
- ❌ Hard to debug failures
- ❌ Unclear which step failed
- ❌ No visibility into test state
- ❌ Difficult to follow test execution

**Benefits with logging:**
- ✅ Clear test execution flow
- ✅ Easy to identify failure points
- ✅ Visible test state at each step
- ✅ Faster debugging
- ✅ Better understanding of test behavior

---

#### E2E Test Logging Pattern (MANDATORY):

```typescript
import { test, expect } from '@playwright/test';

test('TC-E2E-1.1-001-create-with-required-fields', async ({ page }) => {
  // ✅ MANDATORY: Log test start
  console.log('\n=== TC-E2E-1.1-001: Create Property with Required Fields ===');
  
  // ✅ MANDATORY: Log major steps
  console.log('→ Step 1: Navigate to properties page');
  await page.goto(`${FRONTEND_URL}/properties`);
  
  console.log('→ Step 2: Select test account');
  const testAccount = await getTestAccount();
  await page.click('[data-testid="account-selector"]');
  await page.click(`[data-testid="account-option-${testAccount.id}"]`);
  
  console.log('→ Step 3: Open create property dialog');
  await page.click('button:has-text("צור נכס חדש")');
  
  console.log('→ Step 4: Fill property address');
  await page.fill('[name="address"]', 'רחוב הרצל 123, תל אביב');
  
  console.log('→ Step 5: Submit form');
  await page.click('button:has-text("שמור")');
  
  console.log('→ Step 6: Wait for success notification');
  const snackbar = page.locator('.MuiSnackbar-root .MuiAlert-message');
  await expect(snackbar).toBeVisible({ timeout: 10000 });
  await expect(snackbar).toHaveText('הנכס נוסף בהצלחה');
  console.log('✓ Success notification displayed');
  
  console.log('→ Step 7: Verify property in list');
  await expect(page.locator('text=רחוב הרצל 123, תל אביב')).toBeVisible();
  console.log('✓ Property appears in list');
  
  // ✅ MANDATORY: Log test completion
  console.log('✓ Test completed successfully\n');
});
```

**Output Example:**
```
=== TC-E2E-1.1-001: Create Property with Required Fields ===
→ Step 1: Navigate to properties page
→ Step 2: Select test account
→ Step 3: Open create property dialog
→ Step 4: Fill property address
→ Step 5: Submit form
→ Step 6: Wait for success notification
✓ Success notification displayed
→ Step 7: Verify property in list
✓ Property appears in list
✓ Test completed successfully
```

---

#### Unit Test Logging Pattern (MANDATORY):

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';

describe('PropertiesService - US1.3 Tests', () => {
  let service: PropertiesService;
  
  beforeAll(async () => {
    console.log('\n=== PropertiesService Test Suite: US1.3 ===');
    // Setup...
  });
  
  it('TC-UNIT-1.3-001-should-save-property-with-type', async () => {
    // ✅ MANDATORY: Log test start
    console.log('\n→ TC-UNIT-1.3-001: Save property with type');
    
    console.log('  → Creating property with type RESIDENTIAL');
    const property = await service.create({
      accountId: testAccountId,
      address: 'Test Address',
      type: PropertyType.RESIDENTIAL,
    });
    
    console.log(`  → Property created with ID: ${property.id}`);
    
    expect(property.type).toBe(PropertyType.RESIDENTIAL);
    console.log('  ✓ Property type saved correctly');
    
    console.log('  ✓ Test passed\n');
  });
  
  it('TC-UNIT-1.3-002-should-validate-decimal-areas', async () => {
    console.log('\n→ TC-UNIT-1.3-002: Validate decimal areas');
    
    console.log('  → Creating property with decimal area values');
    const property = await service.create({
      accountId: testAccountId,
      address: 'Test',
      totalArea: 150.75,
      builtArea: 120.50,
    });
    
    console.log('  → Verifying decimal precision');
    expect(property.totalArea).toBe(150.75);
    expect(property.builtArea).toBe(120.50);
    console.log('  ✓ Decimal values preserved correctly');
    
    console.log('  ✓ Test passed\n');
  });
});
```

**Output Example:**
```
=== PropertiesService Test Suite: US1.3 ===

→ TC-UNIT-1.3-001: Save property with type
  → Creating property with type RESIDENTIAL
  → Property created with ID: abc-123
  ✓ Property type saved correctly
  ✓ Test passed

→ TC-UNIT-1.3-002: Validate decimal areas
  → Creating property with decimal area values
  → Verifying decimal precision
  ✓ Decimal values preserved correctly
  ✓ Test passed
```

---

#### API Test Logging Pattern (MANDATORY):

```typescript
describe('Properties API - US1.3 Tests', () => {
  
  it('TC-API-1.3-001-post-property-with-details', async () => {
    console.log('\n→ TC-API-1.3-001: POST property with all details');
    
    console.log('  → Preparing request payload');
    const payload = {
      accountId: testAccountId,
      address: 'רחוב הרצל 123',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'תל אביב',
      country: 'ישראל',
      totalArea: 120.5,
      estimatedValue: 2500000,
    };
    console.log(`  → Payload: ${JSON.stringify(payload, null, 2)}`);
    
    console.log('  → Sending POST /properties request');
    const response = await request(app.getHttpServer())
      .post('/properties')
      .send(payload)
      .expect(201);
    
    console.log(`  → Response status: ${response.status}`);
    console.log(`  → Response body: ${JSON.stringify(response.body, null, 2)}`);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.type).toBe('RESIDENTIAL');
    expect(response.body.status).toBe('OWNED');
    console.log('  ✓ Property created with correct details');
    
    console.log('  ✓ Test passed\n');
  });
});
```

---

#### Database Cleanup Logging (MANDATORY):

```typescript
test.beforeEach(async ({ page }) => {
  // ✅ MANDATORY: Log cleanup operations
  console.log('\n=== CLEANING TEST DATA ===');
  
  try {
    console.log('→ Deleting properties for test account...');
    const propertiesResponse = await fetch(`${BACKEND_URL}/properties/test/cleanup`, {
      method: 'DELETE',
    });
    if (propertiesResponse.ok) {
      const result = await propertiesResponse.json();
      console.log(`✓ Deleted ${result.deletedCount} properties`);
    }
    
    console.log('→ Deleting owners for test account...');
    const ownersResponse = await fetch(`${BACKEND_URL}/owners/test/cleanup`, {
      method: 'DELETE',
    });
    if (ownersResponse.ok) {
      const result = await ownersResponse.json();
      console.log(`✓ Deleted ${result.deletedCount} owners`);
    }
    
    console.log('✓ Test data cleanup complete\n');
  } catch (error) {
    console.warn('⚠️ Error during cleanup:', error);
  }
});
```

**Output Example:**
```
=== CLEANING TEST DATA ===
→ Deleting properties for test account...
✓ Deleted 5 properties
→ Deleting owners for test account...
✓ Deleted 3 owners
✓ Test data cleanup complete
```

---

#### Log Format Standards:

**Symbols to Use:**
- `===` - Test suite/section start
- `→` - Action/step in progress
- `✓` - Success/completion
- `⚠️` - Warning
- `❌` - Error/failure
- `•` - Sub-item/detail

**Indentation:**
- No indent: Test name, major sections
- 2 spaces: Step actions
- 4 spaces: Sub-steps, details

**Examples:**

```typescript
// ✅ Good - Clear hierarchy
console.log('\n=== TC-E2E-1.3-001: Create Property ===');
console.log('→ Step 1: Navigate to page');
console.log('  → Waiting for page load');
console.log('  ✓ Page loaded');
console.log('✓ Test completed\n');

// ❌ Bad - No structure
console.log('create property');
console.log('going to page');
console.log('done');
```

---

#### What to Log (MANDATORY):

**E2E Tests - Log These:**
1. ✅ Test start (name and ID)
2. ✅ Each major step (navigate, click, fill, submit)
3. ✅ Account selection
4. ✅ Form interactions
5. ✅ Waiting for elements/notifications
6. ✅ Verification steps
7. ✅ Test completion
8. ✅ Cleanup operations

**Unit Tests - Log These:**
1. ✅ Test suite start
2. ✅ Test case start
3. ✅ Setup steps
4. ✅ Operation being tested
5. ✅ Expected vs actual values (on failure)
6. ✅ Test completion

**API Tests - Log These:**
1. ✅ Request details (method, endpoint, payload)
2. ✅ Response status
3. ✅ Response body (if relevant)
4. ✅ Assertions being checked
5. ✅ Test completion

---

#### Error Logging (MANDATORY):

```typescript
test('TC-E2E-1.3-001-handle-validation-error', async ({ page }) => {
  console.log('\n=== TC-E2E-1.3-001: Validation Error Handling ===');
  
  try {
    console.log('→ Attempting to submit empty form');
    await page.click('button:has-text("שמור")');
    
    console.log('→ Checking for validation error');
    const errorMessage = page.locator('.MuiFormHelperText-root.Mui-error');
    await expect(errorMessage).toBeVisible();
    
    const errorText = await errorMessage.textContent();
    console.log(`✓ Validation error displayed: "${errorText}"`);
    
  } catch (error) {
    // ✅ MANDATORY: Log detailed error info
    console.error('❌ Test failed with error:');
    console.error('  Error message:', error.message);
    console.error('  Stack trace:', error.stack);
    
    // Take screenshot on failure (Playwright does this automatically)
    console.log('→ Screenshot saved for debugging');
    
    throw error; // Re-throw to fail test
  }
});
```

---

#### Test Output Readability:

**✅ Good - Readable Output:**
```
=== Database Cleanup ===
→ Deleting properties...
✓ Deleted 5 properties
→ Deleting owners...
✓ Deleted 3 owners
✓ Cleanup complete

=== TC-E2E-1.1-001: Create Property with Required Fields ===
→ Step 1: Navigate to properties page
→ Step 2: Select test account
→ Step 3: Open create dialog
→ Step 4: Fill address: "רחוב הרצל 123"
→ Step 5: Submit form
→ Step 6: Wait for success notification
✓ Success notification: "הנכס נוסף בהצלחה"
→ Step 7: Verify property in list
✓ Property found in list
✓ Test completed successfully

=== TC-E2E-1.1-002: Create Property with All Fields ===
→ Step 1: Navigate to properties page
...
```

**❌ Bad - Unclear Output:**
```
test 1
going to page
clicking button
typing
done

test 2
page load
button click
...
```

---

#### Logging Best Practices:

**DO:**
- ✅ Use clear, descriptive messages
- ✅ Log major steps
- ✅ Use consistent symbols (→, ✓, ❌)
- ✅ Include newlines for readability (`\n`)
- ✅ Log success AND progress
- ✅ Log cleanup operations
- ✅ Use indentation for hierarchy
- ✅ Include relevant data (IDs, values)

**DON'T:**
- ❌ Use generic messages ("test", "checking")
- ❌ Skip important steps
- ❌ Log everything (too verbose)
- ❌ Use inconsistent formatting
- ❌ Forget to log test completion
- ❌ Mix languages (Hebrew + English)

---

#### Integration Test Logging:

```typescript
describe('Property Creation E2E Flow', () => {
  
  it('TC-INT-1.1-001-complete-property-creation-flow', async () => {
    console.log('\n=== TC-INT-1.1-001: Complete Property Creation Flow ===');
    
    // Step 1: Backend
    console.log('→ Step 1: Create property via API');
    const createResponse = await request(app.getHttpServer())
      .post('/properties')
      .send({ accountId: testAccountId, address: 'Test Address' });
    console.log(`  ✓ Property created: ID=${createResponse.body.id}`);
    
    // Step 2: Verify persistence
    console.log('→ Step 2: Verify property persisted in database');
    const property = await prisma.property.findUnique({
      where: { id: createResponse.body.id },
    });
    expect(property).toBeDefined();
    console.log('  ✓ Property found in database');
    
    // Step 3: Retrieve via API
    console.log('→ Step 3: Retrieve property via GET endpoint');
    const getResponse = await request(app.getHttpServer())
      .get(`/properties/${createResponse.body.id}`)
      .expect(200);
    console.log('  ✓ Property retrieved successfully');
    
    // Step 4: Verify data consistency
    console.log('→ Step 4: Verify data consistency');
    expect(getResponse.body.id).toBe(property.id);
    expect(getResponse.body.address).toBe(property.address);
    console.log('  ✓ Data matches across all layers');
    
    console.log('✓ Integration test completed\n');
  });
});
```

---

#### Performance Logging:

```typescript
test('TC-E2E-1.1-001-performance-check', async ({ page }) => {
  console.log('\n=== TC-E2E-1.1-001: Performance Check ===');
  
  const startTime = Date.now();
  
  console.log('→ Starting property creation...');
  await page.goto(`${FRONTEND_URL}/properties`);
  await page.click('button:has-text("צור נכס")');
  await page.fill('[name="address"]', 'Test');
  await page.click('button:has-text("שמור")');
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✓ Property created in ${duration}ms`);
  
  if (duration > 2000) {
    console.warn(`⚠️ Performance warning: Operation took ${duration}ms (target: <2000ms)`);
  }
  
  expect(duration).toBeLessThan(5000);
  console.log('✓ Performance within acceptable range\n');
});
```

---

#### Test Summary Logging:

```typescript
test.afterAll(async () => {
  // ✅ MANDATORY: Log test suite summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✓`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Duration: ${testResults.duration}ms`);
  console.log('='.repeat(60) + '\n');
});
```

---

#### Checklist for Test Logging:

**Before Committing Tests:**
- [ ] Test name logged at start
- [ ] Major steps logged with `→`
- [ ] Success indicators with `✓`
- [ ] Test completion logged
- [ ] Cleanup operations logged
- [ ] Error cases logged with `❌`
- [ ] Consistent formatting used
- [ ] Newlines for readability
- [ ] Indentation for hierarchy
- [ ] No excessive verbosity

**Review Test Output:**
- [ ] Can understand test flow from logs alone
- [ ] Easy to identify which step failed
- [ ] Clear what data was used
- [ ] Test completion visible
- [ ] Logs readable without code

---

#### Benefits of Proper Logging:

**Debugging:**
- ✅ 10x faster to identify failure point
- ✅ Clear visibility into test state
- ✅ Easy to reproduce issues

**Understanding:**
- ✅ New team members understand tests quickly
- ✅ Test purpose clear from output
- ✅ No need to read code to understand flow

**Maintenance:**
- ✅ Easy to update tests (know what they do)
- ✅ Clear when test expectations change
- ✅ Obvious when tests need refactoring

**Quality:**
- ✅ Professional test output
- ✅ Better test reports
- ✅ Easier code reviews

---

## 🧪 Test Account Usage

### 22.5. Test Account Requirement (MANDATORY)

**CRITICAL:** All E2E tests MUST use the test account defined in test-helpers.ts.

#### Test Account Details:

**Location:** `apps/frontend/test/utils/test-helpers.ts`

**Test Account ID:** `test-account-1`

**Helper Function:**
```typescript
import { getTestAccount } from '../utils/test-helpers';

// ✅ MANDATORY: Always fetch test account using helper
const testAccount = await getTestAccount();
// Returns: { id: 'test-account-1', name: 'Test Account', ... }
```

#### Why This Matters:

1. **Consistency** - All tests use the same account
2. **Isolation** - Test account separate from any production data
3. **Cleanup** - Easy to identify and clean test data
4. **Traceability** - All test data linked to known account

#### E2E Test Pattern (MANDATORY):

```typescript
import { test, expect } from '@playwright/test';
import { getTestAccount } from '../utils/test-helpers';

test.describe('Property Management', () => {
  let testAccount: any;

  test.beforeAll(async () => {
    // ✅ MANDATORY: Fetch test account before tests
    testAccount = await getTestAccount();
  });

  test('should create property for test account', async ({ page }) => {
    // Navigate to page
    await page.goto(`${FRONTEND_URL}/properties`);
    
    // Select test account in account selector
    await page.click('[data-testid="account-selector"]');
    await page.click(`[data-testid="account-option-${testAccount.id}"]`);
    
    // Continue with test...
  });
});
```

#### Backend Test Pattern (MANDATORY):

```typescript
import { getTestAccount } from '../../test/utils/test-helpers';

describe('PropertiesService', () => {
  let testAccount: any;

  beforeAll(async () => {
    // ✅ MANDATORY: Use test account for backend tests
    testAccount = await getTestAccount();
  });

  it('should create property for test account', async () => {
    const property = await service.create({
      accountId: testAccount.id, // Use test account ID
      address: 'Test Address',
      // ... other fields
    });

    expect(property.accountId).toBe(testAccount.id);
  });
});
```

#### Rules:

1. ✅ **Always import** `getTestAccount` from test-helpers.ts
2. ✅ **Never hardcode** account IDs in tests (except 'test-account-1' in cleanup)
3. ✅ **Fetch account** in beforeAll/beforeEach hooks
4. ✅ **Use account ID** for all test data creation
5. ✅ **Select account** in UI tests using account selector
6. ✅ **Document** test account usage in test comments

#### Account Selector in E2E Tests:

```typescript
// ✅ MANDATORY: Always select test account before performing actions
test('user flow', async ({ page }) => {
  const testAccount = await getTestAccount();
  
  // Navigate to page
  await page.goto(`${FRONTEND_URL}/properties`);
  
  // Select test account (MANDATORY STEP!)
  await page.click('[data-testid="account-selector"]');
  await page.click(`[data-testid="account-option-${testAccount.id}"]`);
  await page.waitForLoadState('networkidle');
  
  // Now proceed with test actions...
  await page.click('button:has-text("צור נכס חדש")');
  // ...
});
```

#### Benefits:

- ✅ **No hardcoded IDs** - All tests reference helper function
- ✅ **Easy maintenance** - Change account in one place
- ✅ **Clear intent** - Explicit test account usage
- ✅ **Safe cleanup** - All test data tied to known account

#### Common Mistakes:

**❌ Don't hardcode account IDs:**
```typescript
// ❌ Bad - Hardcoded ID
const accountId = '00000000-0000-0000-0000-000000000001';

// ✅ Good - Use helper
const testAccount = await getTestAccount();
const accountId = testAccount.id;
```

**❌ Don't skip account selection in E2E:**
```typescript
// ❌ Bad - Forgot to select account
test('create property', async ({ page }) => {
  await page.goto('/properties');
  await page.click('button:has-text("צור נכס")'); // Wrong account!
});

// ✅ Good - Select test account first
test('create property', async ({ page }) => {
  const testAccount = await getTestAccount();
  await page.goto('/properties');
  await page.click('[data-testid="account-selector"]');
  await page.click(`[data-testid="account-option-${testAccount.id}"]`);
  await page.click('button:has-text("צור נכס")'); // Correct!
});
```

**❌ Don't create data for other accounts in tests:**
```typescript
// ❌ Bad - Using random account
const property = await service.create({
  accountId: 'random-account-id', // Don't do this!
  address: 'Test',
});

// ✅ Good - Use test account
const testAccount = await getTestAccount();
const property = await service.create({
  accountId: testAccount.id, // Correct!
  address: 'Test',
});
```

---

## 🧹 E2E Database Cleanup

### 23. Test Data Cleanup (MANDATORY)

**CRITICAL:** All E2E tests MUST clean database before running.

#### Backend Requirements:

**Every entity controller must provide test cleanup endpoint:**

```typescript
@Delete('test/cleanup')
@ApiOperation({ 
  summary: 'מחיקת כל נתוני הטסט (TEST ONLY)',
  description: 'מוחק את כל הישויות של חשבון הטסט. ⚠️ משמש רק לטסטי E2E!'
})
async deleteTestData() {
  const result = await this.service.deleteAllForAccount(HARDCODED_ACCOUNT_ID);
  return {
    ...result,
    message: `Deleted ${result.deletedCount} entities for test account`,
  };
}
```

**Service layer with safety:**

```typescript
async deleteAllForAccount(accountId: string): Promise<{ deletedCount: number }> {
  // ⚠️ Safety: Only test account
  const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';
  if (accountId !== TEST_ACCOUNT_ID) {
    throw new ForbiddenException(
      'Can only delete data for test account. Safety measure.'
    );
  }

  const result = await this.prisma.entity.deleteMany({
    where: { accountId },
  });

  return { deletedCount: result.count };
}
```

**Safety Measures:**
- ✅ Only test account ID allowed
- ✅ Throws exception if trying to delete other accounts
- ✅ Safe even if accidentally run on production

---

#### Frontend E2E Tests:

**MANDATORY cleanup in test.beforeEach:**

```typescript
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

test.beforeEach(async ({ page }) => {
  // ✅ MANDATORY: Clean test data before each test
  console.log('=== CLEANING TEST DATA ===');
  try {
    const response = await fetch(`${BACKEND_URL}/entity/test/cleanup`, {
      method: 'DELETE',
    });
    if (response.ok) {
      const result = await response.json();
      console.log(`✓ Cleaned test data: ${result.deletedCount} entities deleted`);
    } else {
      console.warn('⚠️ Failed to clean test data:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ Error cleaning test data:', error);
  }
  
  // Then navigate to page
  await page.goto(`${FRONTEND_URL}/entity`);
  await page.waitForLoadState('networkidle');
});
```

**Benefits:**
- ✅ **Test Isolation** - No dependencies between tests
- ✅ **Reliability** - Same results every run
- ✅ **No Flakiness** - Predictable state
- ✅ **Safety** - Only test data deleted

**Required Endpoints by Entity:**
- Properties: `DELETE /properties/test/cleanup`
- Owners: `DELETE /owners/test/cleanup`
- Tenants: `DELETE /tenants/test/cleanup`
- Leases: `DELETE /leases/test/cleanup`
- Investment Companies: `DELETE /investment-companies/test/cleanup`

---

## 📊 E2E HTML Test Reports

### 24. Epic-Level HTML Reports (MANDATORY)

**CRITICAL:** Every Epic must have a single, comprehensive HTML report showing E2E test results for ALL user stories.

#### Report Requirements:

**Location:**
```
docs/test-results/epic-XX/E2E_TEST_REPORT.html
```

**Rule:** ONE HTML file per Epic (not one per user story!)

**Must Include:**
- ✅ Epic title and number
- ✅ Summary statistics (total/passed/failed/pending)
- ✅ Visual progress bars
- ✅ One card per user story with:
  - Status badge (Ready/In Progress/Pending/Failed)
  - Test results summary
  - Individual test cases (passed/failed/warning)
  - Key achievements
  - Known issues
  - Next steps
- ✅ Color-coded status (green/yellow/red/blue)
- ✅ RTL support for Hebrew
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Print-friendly CSS

**Visual Design Requirements:**
- ✅ Modern, professional look
- ✅ Interactive hover effects
- ✅ Clear visual hierarchy
- ✅ Accessible (WCAG AA)
- ✅ Lightweight (< 500KB)
- ✅ No external dependencies (inline CSS only)

**Update Triggers:**
- ✅ After Phase 4 completion for any user story
- ✅ After manual testing verification
- ✅ After bug fixes (re-run E2E)

**Companion Files:**
- ✅ `README.md` - How to view/use report
- ✅ `user-story-X.X/` - Detailed test results per story

**Example Structure:**
```
docs/test-results/
├── epic-01/
│   ├── E2E_TEST_REPORT.html    ← Single HTML for Epic 01
│   ├── README.md                ← Instructions
│   ├── user-story-1.1/          ← Detailed results
│   ├── user-story-1.2/
│   └── ...
├── epic-02/
│   ├── E2E_TEST_REPORT.html    ← Single HTML for Epic 02
│   └── ...
```

**Status Badge Colors:**
- ✅ Ready (Green): E2E passed, ready for manual test
- 🟡 In Progress (Yellow): Currently implementing/testing
- ⏳ Pending (Gray): Not started yet
- ❌ Failed (Red): Critical bugs, E2E failed

**Benefits:**
- ✅ Single source of truth per Epic
- ✅ Easy to share (single file)
- ✅ Works offline (no dependencies)
- ✅ Print/export to PDF
- ✅ Version controlled (Git)
- ✅ Professional presentation

**See Rule:** `.cursor/rules/e2e-html-reports.mdc` for detailed template and guidelines

**Template:** `docs/test-results/epic-01/E2E_TEST_REPORT.html`

---

### 24.5. Per-Execution HTML Reports (MANDATORY - NEW!)

**CRITICAL:** In addition to Epic-level reports, EVERY E2E test execution MUST generate an HTML report for manual review.

#### Why This Is Mandatory:

This requirement was added because:
- 🔍 **Visual verification** - QA must SEE what happened, not just read logs
- 📸 **Screenshot proof** - Capture actual UI state during tests
- 🐛 **Easier debugging** - Visual traces much clearer than text logs
- ✅ **Quality gate** - Cannot approve tests without manual HTML review
- 📋 **Documentation** - Proof that tests were actually executed
- 🎥 **Video evidence** - Optional recording of test execution

#### Report Requirements:

**Generated By:** Playwright (automatic)

**Location (Before Archive):**
```
playwright-report/
├── index.html              ← Main report - OPEN THIS!
├── data/
│   ├── screenshots/        ← Failure screenshots
│   ├── traces/             ← Test traces (interactive debugging)
│   └── videos/             ← Test videos (optional)
└── assets/                 ← Report CSS/JS
```

**Location (After Archive):**
```
docs/test-results/epic-XX/user-story-X.X/
├── cycle-1-20260203-143022/
│   ├── playwright-report/           ← Archived execution report
│   │   └── index.html               ← OPEN THIS for manual review
│   ├── test-output.log
│   └── CYCLE_NOTES.md
├── cycle-2-20260203-150145/
│   └── playwright-report/           ← Second execution
└── FINAL_STATUS.md
```

#### Playwright Configuration (MANDATORY):

**File:** `apps/frontend/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ✅ MANDATORY: HTML Reporter
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never' // Don't auto-open during CI
    }],
    ['list'], // Console output
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // ✅ MANDATORY: Screenshots on failure
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',  // Optional but recommended
    trace: 'retain-on-failure',   // Optional but recommended
  },
});
```

#### Running Tests & Generating HTML Report:

```bash
# Run E2E tests (generates HTML automatically)
cd apps/frontend
npm run test:e2e

# ✅ Report generated at: playwright-report/index.html

# Open for manual review (MANDATORY!)
npx playwright show-report
# OR
open playwright-report/index.html
```

#### What the HTML Report Includes:

**Playwright HTML Report Features:**
- ✅ Test results summary (passed/failed/skipped)
- ✅ Duration per test
- ✅ Screenshots on failure
- ✅ Full error stack traces
- ✅ Browser information
- ✅ Retry information
- ✅ Interactive filtering (by status, project, browser)
- ✅ Search functionality
- ✅ Trace viewer (click to debug interactively)
- ✅ Video playback (if enabled)

#### Manual Review Process (MANDATORY):

**After EVERY E2E test execution:**

1. ✅ Run tests: `npm run test:e2e`
2. ✅ Open report: `npx playwright show-report`
3. ✅ **Manually review ALL test results**
4. ✅ Check screenshots for failures
5. ✅ Verify visual behavior matches expectations
6. ✅ Document any unexpected issues
7. ✅ Archive report for reference

**QA Engineer Checklist:**
- [ ] HTML report generated successfully
- [ ] Report opened in browser
- [ ] All test results visible
- [ ] Screenshots captured (if failures)
- [ ] Error messages readable
- [ ] Test duration reasonable
- [ ] No unexpected warnings
- [ ] Visual verification complete
- [ ] Report archived in cycle folder

#### Archiving Reports (MANDATORY):

```bash
# After review, archive with timestamp
timestamp=$(date +%Y%m%d-%H%M%S)
mkdir -p docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp
cp -r playwright-report docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/

# Add cycle notes
cat > docs/test-results/epic-01/user-story-1.1/cycle-X-$timestamp/CYCLE_NOTES.md << EOF
# Cycle X - Manual Review Notes

**Date:** $(date)
**Tests:** 8 total, 6 passed, 2 failed
**Duration:** 45 seconds

## Manual Review:
✅ HTML report reviewed
✅ Screenshots verified
✅ Core functionality works
⚠️ 2 timing issues (not bugs)

## Next Steps:
- Proceed to manual testing
EOF
```

#### CI/CD Integration:

**GitHub Actions Example:**

```yaml
- name: Run E2E Tests
  run: npm run test:e2e

# ✅ MANDATORY: Upload HTML report as artifact
- name: Upload Playwright Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

#### Rules:

1. ✅ **Generate HTML report** on EVERY E2E test execution
2. ✅ **Manually review** HTML report before marking tests passed
3. ✅ **Archive HTML report** in cycle folder after review
4. ✅ **Include screenshots** on failure (minimum)
5. ✅ **Document issues** found during review in CYCLE_NOTES.md
6. ✅ **Never skip** HTML report review (even if tests pass)
7. ✅ **Keep reports** for at least last 3 cycles per user story

#### Benefits:

**Why per-execution HTML reports matter:**

- 🔍 **Visual Verification** - See actual UI, not just logs
- 📸 **Screenshot Evidence** - Visual proof of failures
- 🐛 **Easier Debugging** - Interactive traces and videos
- 📊 **Stakeholder Communication** - Show management actual results
- 📜 **Historical Record** - Track test evolution over time
- ✅ **Quality Gate** - Can't approve without reviewing HTML
- 🎯 **Compliance** - Proof tests were executed properly

#### Two-Level Reporting:

| Report Type | Purpose | Frequency | Audience |
|-------------|---------|-----------|----------|
| **Epic-Level** (`E2E_TEST_REPORT.html`) | Summary | After Phase 4 | Management, stakeholders |
| **Per-Execution** (`playwright-report/`) | Detailed | EVERY run | QA, developers |

**BOTH are mandatory!**

---

## ♿ Accessibility (A11y)

### 14. WCAG AA Compliance

**MANDATORY:** All UI must be accessible.

```tsx
// ✅ Good - Accessible form
<TextField
  label="כתובת"
  id="property-address"
  aria-label="כתובת הנכס"
  aria-required="true"
  aria-invalid={!!errors.address}
  aria-describedby="address-error"
/>

{errors.address && (
  <FormHelperText id="address-error" error>
    {errors.address.message}
  </FormHelperText>
)}
```

#### Keyboard Navigation:
- ✅ Tab through all interactive elements
- ✅ Enter to submit forms
- ✅ Escape to close dialogs
- ✅ Arrow keys for menus/lists

#### Screen Reader Support:
- ✅ All images have alt text
- ✅ All form fields have labels
- ✅ All buttons have descriptive text
- ✅ ARIA labels on custom components

---

## 📱 Responsive Design

### 15. Mobile-First Approach

**MANDATORY:** Support mobile, tablet, and desktop.

```tsx
// ✅ Good - Responsive layout
<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    padding: { xs: 1, sm: 2, md: 3 },
  }}
>
  {/* Content */}
</Box>
```

#### Breakpoints:
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

---

## 🔄 State Management

### 16. React Query for Server State

**MANDATORY:** Use React Query for all API calls.

```tsx
// ✅ Good - React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['properties', page, filters],
  queryFn: () => propertiesApi.getAll({ page, filters }),
});

const mutation = useMutation({
  mutationFn: propertiesApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  },
});
```

---

## 🎯 Performance

### 17. Performance Standards

**MANDATORY:** Meet these performance targets.

- ✅ API response < 200ms (list queries)
- ✅ API response < 100ms (single item)
- ✅ UI initial render < 1000ms
- ✅ No memory leaks
- ✅ Lazy load images/components
- ✅ Debounce search/filter (300ms)

---

## 🔒 Security

### 18. Security Requirements

**MANDATORY:** Follow security best practices.

#### Input Validation:
- ✅ Validate all user input (client + server)
- ✅ Sanitize HTML content
- ✅ Prevent SQL injection (use Prisma)
- ✅ Prevent XSS attacks

#### Authentication:
- ✅ Protect all routes with auth guard
- ✅ Validate JWT tokens
- ✅ Check account permissions

---

## 📝 Code Quality

### 19. TypeScript

**MANDATORY:** Use TypeScript with strict mode.

```typescript
// ✅ Good - Full typing
interface Property {
  id: string;
  accountId: string;
  address: string;
  type?: PropertyType;
  status?: PropertyStatus;
}

async function getProperty(id: string): Promise<Property> {
  return await api.get(`/properties/${id}`);
}
```

---

### 20. Code Formatting

**MANDATORY:** Follow these standards.

- ✅ Use Prettier for formatting
- ✅ Use ESLint for linting
- ✅ No unused variables
- ✅ No console.log in production code
- ✅ Meaningful variable/function names

---

## 🧩 Component Structure

### 21. Component Organization

**MANDATORY:** Organize components consistently.

```
components/
├── properties/
│   ├── PropertyList.tsx      # List view
│   ├── PropertyForm.tsx      # Create/Edit form
│   ├── PropertyDetails.tsx   # Details view
│   ├── PropertyCard.tsx      # Card component
│   └── PropertyFilters.tsx   # Filter component
```

---

## 🚀 Git Conventions

### 22. Commit Messages

**MANDATORY:** Use conventional commits.

```bash
# ✅ Good commit messages
feat(properties): add inline investment company creation
fix(properties): correct RTL alignment in property form
test(properties): add unit tests for property service
docs(properties): update API documentation

# ❌ Bad commit messages
update code
fix bug
changes
```

---

## 📋 Pre-Implementation Checklist

**Before starting ANY user story or epic, verify:**

### Frontend Checklist:
- [ ] All text will be in Hebrew
- [ ] RTL layout configured
- [ ] MUI components used
- [ ] Form validation with Zod
- [ ] Loading states implemented
- [ ] Empty states handled
- [ ] Error messages in Hebrew
- [ ] Inline entity creation (if applicable)
- [ ] DataGrid RTL configured
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] React Query for API calls

### Backend Checklist:
- [ ] Account isolation enforced
- [ ] All queries filter by accountId
- [ ] Input validation with DTOs
- [ ] Error handling with proper messages
- [ ] Unit tests ≥80% coverage
- [ ] API integration tests
- [ ] Case-insensitive search (Hebrew support)
- [ ] TypeScript strict mode
- [ ] No SQL injection vulnerabilities

### QA Checklist:
- [ ] API tests for all endpoints
- [ ] E2E tests for user flows
- [ ] **Database cleanup endpoint exists** (`DELETE /entity/test/cleanup`)
- [ ] **E2E tests clean DB in beforeEach** (test account only)
- [ ] **Success notifications verified** in E2E tests
- [ ] Cross-account access tested (must fail)
- [ ] Hebrew text display correct
- [ ] RTL layout correct
- [ ] Validation errors in Hebrew
- [ ] Accessibility compliance (WCAG AA)
- [ ] Performance targets met
- [ ] **NO CRITICAL BUGS** (crashes, exceptions, data loss)
- [ ] Core user flows work without errors
- [ ] Form submissions complete successfully
- [ ] No console errors during normal usage

**🚨 CRITICAL BUG GATE:**
- ❌ If clicking buttons throws exceptions → REJECT
- ❌ If primary features crash → REJECT
- ❌ If data loss occurs → REJECT
- ❌ If security vulnerabilities exist → REJECT
- ⚠️ Feature MUST return to dev team if critical bugs found
- ✅ Cannot approve for production with unresolved critical bugs

---

## 🎓 Training Resources

### For New Developers:

1. **Hebrew & RTL Guide:** `docs/guides/hebrew-rtl-guide.md`
2. **Multi-Tenancy Guide:** `docs/guides/multi-tenancy-guide.md`
3. **Component Standards:** `docs/guides/component-standards.md`
4. **Testing Guide:** `docs/guides/testing-guide.md`

---

## ⚡ Quick Reference Card

```
✅ Hebrew text everywhere (user-facing)
✅ RTL layout (direction: 'rtl')
✅ Account isolation (filter by accountId)
✅ MUI components only
✅ Form validation (Zod)
✅ Loading & empty states
✅ Error messages in Hebrew
✅ Inline entity creation
✅ DataGrid: primary column right, actions left
✅ Debounced search (300ms)
✅ React Query for API calls
✅ Keyboard navigation
✅ WCAG AA compliance
✅ Responsive design
✅ Tests: 80% backend, 90% frontend
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't:
- Use English in UI
- Use LTR layout for Hebrew
- Skip account filtering
- Use plain HTML elements instead of MUI
- Skip validation
- Forget loading states
- Use English error messages
- Skip inline creation for related entities
- Put actions column on right (should be left in RTL)
- Allow cross-account data access
- Skip tests

### ✅ Do:
- Always use Hebrew
- Always configure RTL
- Always filter by accountId
- Always use MUI components
- Always validate input
- Always show loading/empty states
- Always use Hebrew error messages
- Always provide inline creation
- Always put primary column on right (RTL)
- Always isolate accounts
- Always write tests

---

**These requirements are NON-NEGOTIABLE and apply to EVERY implementation!** 🚀

**Last Updated:** February 2, 2026  
**Version:** 1.0  
**Applies To:** All user stories and epics
