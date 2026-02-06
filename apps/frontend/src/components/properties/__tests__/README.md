# PropertyForm Unit Tests

Comprehensive unit tests for PropertyForm component to identify validation/mutation issues.

## Setup

Install testing dependencies:

```bash
cd apps/frontend
npm install
```

## Running Tests

Run all PropertyForm tests:

```bash
npm test PropertyForm.test.tsx
```

Run in watch mode:

```bash
npm test -- --watch PropertyForm.test.tsx
```

Run with coverage:

```bash
npm test -- --coverage PropertyForm.test.tsx
```

## Test Structure

### 1. Validation Tests
- Required field validation
- Valid numeric field acceptance
- Empty optional field handling
- **DEBUG test** to identify validation errors

### 2. Submission Tests
- API call on valid form
- No API call on invalid form
- Data cleaning (removing undefined/NaN)

### 3. Mutation Callback Tests
- onClose callback
- Success message display
- Form reset
- Query invalidation

### 4. Error Handling Tests
- API error display
- 400 Bad Request handling

### 5. DEBUG Test
The `DEBUG: Identify Validation Error` test will:
- Fill form with exact E2E test data
- Attempt submission
- Log all validation errors to console
- Identify which field is causing the "1 validation error"

## Expected Output

When running the DEBUG test, check the console for:
- Form field values
- Validation error messages
- Fields with `aria-invalid="true"`
- Helper text errors

This will help identify the root cause of the validation issue blocking E2E tests.

## Troubleshooting

If tests fail to run:
1. Ensure all dependencies are installed: `npm install`
2. Check Jest configuration: `jest.config.js`
3. Verify test setup: `jest.setup.js`
4. Check for TypeScript errors: `npm run type-check`
