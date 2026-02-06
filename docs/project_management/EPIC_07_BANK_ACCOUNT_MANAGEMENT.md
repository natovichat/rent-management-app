# Epic 7: Bank Account Management

**Epic ID:** EPIC-07  
**Priority:** 🟡 Medium  
**Status:** ✅ Implemented  
**Estimated Effort:** 5-8 days  
**Created:** February 2, 2026

---

## 📋 Overview

Enable users to manage bank accounts for tracking mortgage automatic payments (הוראת קבע). Users can create, view, edit, and link bank accounts to mortgages, with inline creation capability directly from the mortgage form.

### Business Value
- Track which bank account is used for each mortgage's automatic payments
- Prevent duplicate bank account entries
- Seamless inline creation without leaving the mortgage form
- Protect bank accounts that are in use by mortgages
- Support multiple account types (Checking, Savings, Business)

### User Benefit
Property owners can maintain accurate records of their bank accounts and clearly see which account handles each mortgage payment, improving financial tracking and organization.

---

## 📖 User Stories

### US7.1: Create Bank Account
**As a** property owner  
**I can** create a new bank account  
**So that** I can track mortgage payments from specific accounts

**Acceptance Criteria:**
- ✅ User can access bank account creation form
- ✅ User must provide: Bank Name (required), Account Number (required)
- ✅ User can optionally provide: Branch Number, Account Type, Account Holder, Notes
- ✅ System validates required fields
- ✅ System prevents duplicate accounts (same bankName + accountNumber + accountId)
- ✅ Account is created as active by default
- ✅ Account is associated with user's accountId (multi-tenancy)
- ✅ Success message displayed on creation
- ✅ User redirected to bank accounts list

**Technical Requirements:**
- POST `/bank-accounts` endpoint
- DTO validation with Zod
- Unique constraint validation
- Multi-tenancy enforcement

---

### US7.2: View Bank Accounts List
**As a** property owner  
**I can** view all my bank accounts  
**So that** I can see what accounts I have in the system

**Acceptance Criteria:**
- ✅ User can access bank accounts list page
- ✅ List displays: Bank Name, Account Number (formatted), Branch Number, Account Type, Status
- ✅ Only accounts belonging to user's account are shown (multi-tenancy)
- ✅ Active accounts are highlighted/marked
- ✅ Inactive accounts are dimmed/marked
- ✅ List shows number of mortgages using each account
- ✅ User can click to view account details
- ✅ User can click to edit account
- ✅ User can activate/deactivate account

**Technical Requirements:**
- GET `/bank-accounts` endpoint
- Account isolation by accountId
- Include mortgage count

---

### US7.3: Edit Bank Account
**As a** property owner  
**I can** edit a bank account's details  
**So that** I can update account information when it changes

**Acceptance Criteria:**
- ✅ User can access edit form for any bank account
- ✅ Form is pre-populated with current data
- ✅ User can update: Bank Name, Branch Number, Account Number, Account Type, Account Holder, Notes
- ✅ System validates updated data
- ✅ System prevents duplicate accounts after edit
- ✅ User cannot change account ownership (accountId)
- ✅ Success message displayed on update
- ✅ Changes reflected immediately in UI

**Technical Requirements:**
- PATCH `/bank-accounts/:id` endpoint
- DTO validation
- Ownership verification
- Duplicate check excluding current account

---

### US7.4: Delete Bank Account with Validation
**As a** property owner  
**I can** delete a bank account  
**So that** I can remove accounts I no longer use

**Acceptance Criteria:**
- ✅ User can initiate delete from bank accounts list
- ✅ System checks if account is linked to any mortgages
- ✅ **If account is linked:** System prevents deletion and shows error: "Cannot delete bank account that is linked to mortgages. Remove the link from mortgages first."
- ✅ **If account is not linked:** System shows confirmation dialog
- ✅ User must confirm deletion
- ✅ On confirm: Account is permanently deleted
- ✅ Success message displayed
- ✅ Account removed from list immediately

**Technical Requirements:**
- DELETE `/bank-accounts/:id` endpoint
- Check for existing mortgage links: `mortgages.count({ where: { bankAccountId: id } })`
- Return 400 error if linked
- Ownership verification before delete

---

### US7.5: Activate/Deactivate Bank Account
**As a** property owner  
**I can** activate or deactivate a bank account  
**So that** I can temporarily disable accounts without deleting them

**Acceptance Criteria:**
- ✅ User can toggle account status from list or details page
- ✅ Deactivating account does NOT remove mortgage links
- ✅ Deactivated accounts are marked as "Inactive" in UI
- ✅ Deactivated accounts do NOT appear in mortgage dropdown by default
- ✅ User can filter to view inactive accounts
- ✅ User can re-activate deactivated accounts
- ✅ Success message displayed on status change

**Technical Requirements:**
- PATCH `/bank-accounts/:id/activate` endpoint
- PATCH `/bank-accounts/:id/deactivate` endpoint
- Update `isActive` field
- Filter by `isActive: true` in mortgage dropdowns

---

### US7.6: Create Bank Account Inline from Mortgage Form
**As a** property owner  
**I can** create a new bank account directly from the mortgage creation/edit form  
**So that** I don't need to leave the mortgage form to add a bank account

**Acceptance Criteria:**
- ✅ Mortgage form has bank account dropdown
- ✅ Dropdown shows "+ Create New Bank Account" option at bottom
- ✅ Clicking option opens inline dialog
- ✅ Dialog contains bank account creation form
- ✅ User fills bank account details and saves
- ✅ **On successful creation:**
  - Dialog closes automatically
  - New bank account is added to dropdown
  - **New bank account is automatically selected**
  - User can continue with mortgage form without interruption
- ✅ On error: Error message shown, dialog stays open
- ✅ User can cancel dialog and return to mortgage form

**Technical Requirements:**
- Inline dialog component in mortgage form
- Bank account creation API call
- State management to refresh dropdown
- Auto-select newly created account
- Form state preservation

**Implementation Pattern:**
```typescript
const [createBankAccountDialogOpen, setCreateBankAccountDialogOpen] = useState(false);

const createBankAccountMutation = useMutation({
  mutationFn: (data) => bankAccountsApi.createBankAccount(data),
  onSuccess: (newBankAccount) => {
    queryClient.invalidateQueries(['bankAccounts']);
    setCreateBankAccountDialogOpen(false);
    // Auto-select newly created account
    mortgageForm.setValue('bankAccountId', newBankAccount.id);
  },
});

const handleCreateNewBankAccount = () => {
  setCreateBankAccountDialogOpen(true);
};
```

---

### US7.7: View Mortgages Using Bank Account
**As a** property owner  
**I can** view all mortgages linked to a specific bank account  
**So that** I can see which mortgages use this account for payments

**Acceptance Criteria:**
- ✅ User can access bank account details page
- ✅ Page displays list of all mortgages using this account
- ✅ For each mortgage, show: Property Address, Lender, Monthly Payment, Status
- ✅ User can click mortgage to view full mortgage details
- ✅ If no mortgages linked: Show "No mortgages use this account"
- ✅ List updates in real-time when mortgage is added/removed

**Technical Requirements:**
- GET `/bank-accounts/:id/mortgages` endpoint
- Include property and mortgage details
- Filter mortgages by `bankAccountId`

---

## ✅ Acceptance Criteria Summary

### Functional Requirements
- [x] CRUD operations for bank accounts
- [x] Inline creation from mortgage form
- [x] Duplicate prevention (unique constraint)
- [x] Delete protection for accounts in use
- [x] Activate/deactivate functionality
- [x] View mortgages using account
- [x] Multi-tenancy (account isolation)

### Technical Requirements
- [x] RESTful API endpoints
- [x] DTO validation with Zod
- [x] Unique constraint on [accountId, bankName, accountNumber]
- [x] Foreign key relation to mortgages
- [x] Inline dialog pattern for creation
- [x] State management for dropdown refresh
- [x] Auto-selection of newly created account

### UX Requirements
- [x] Seamless inline creation workflow
- [x] Clear error messages
- [x] Confirmation dialogs for destructive actions
- [x] Loading states during API calls
- [x] Success/error notifications
- [x] Formatted account display (Bank - Account#)

---

## 🛠️ Implementation Notes

### Database Schema

**BankAccount Model:**
```prisma
model BankAccount {
  id            String   @id @default(uuid())
  accountId     String   @map("account_id")
  
  // Bank account details
  bankName      String   @map("bank_name")
  branchNumber  String?  @map("branch_number")
  accountNumber String   @map("account_number")
  accountType   BankAccountType @map("account_type") @default(CHECKING)
  
  // Account holder info
  accountHolder String?  @map("account_holder")
  notes         String?
  
  // Status
  isActive      Boolean  @default(true) @map("is_active")
  
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  // Relations
  account       Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  mortgages     Mortgage[]
  
  @@index([accountId])
  @@index([bankName])
  @@unique([accountId, bankName, accountNumber])
  @@map("bank_accounts")
}

enum BankAccountType {
  CHECKING     // חשבון עו"ש
  SAVINGS      // חשבון חיסכון
  BUSINESS     // חשבון עסקי
}
```

**Mortgage Model (relation):**
```prisma
model Mortgage {
  // ... other fields ...
  bankAccountId   String?  @map("bank_account_id")
  bankAccount     BankAccount? @relation(fields: [bankAccountId], references: [id], onDelete: SetNull)
  // ...
}
```

---

### API Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/bank-accounts` | Create bank account | ✅ |
| GET | `/bank-accounts` | List all bank accounts | ✅ |
| GET | `/bank-accounts/:id` | Get bank account details | ✅ |
| PATCH | `/bank-accounts/:id` | Update bank account | ✅ |
| DELETE | `/bank-accounts/:id` | Delete bank account | ✅ |
| PATCH | `/bank-accounts/:id/activate` | Activate account | ✅ |
| PATCH | `/bank-accounts/:id/deactivate` | Deactivate account | ✅ |
| GET | `/bank-accounts/:id/mortgages` | Get mortgages using account | ✅ |

---

### DTOs

**CreateBankAccountDto:**
```typescript
export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsOptional()
  branchNumber?: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsEnum(BankAccountType)
  @IsOptional()
  accountType?: BankAccountType;

  @IsString()
  @IsOptional()
  accountHolder?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

**UpdateBankAccountDto:**
```typescript
export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {}
```

---

### Frontend Implementation

**API Service (`lib/api/bank-accounts.ts`):**
```typescript
export interface BankAccount {
  id: string;
  bankName: string;
  branchNumber?: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'BUSINESS';
  accountHolder?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const bankAccountsApi = {
  createBankAccount: async (data: CreateBankAccountDto): Promise<BankAccount> => {
    const response = await api.post('/bank-accounts', data);
    return response.data;
  },
  // ... other methods
};
```

**Display Helper:**
```typescript
export function formatBankAccountDisplay(account: BankAccount): string {
  return `${account.bankName} - ${account.accountNumber}`;
}
```

**Inline Creation Component:**
```typescript
// In mortgage form page
const [createBankAccountDialogOpen, setCreateBankAccountDialogOpen] = useState(false);

const createBankAccountMutation = useMutation({
  mutationFn: (data: BankAccountFormData) => bankAccountsApi.createBankAccount(data),
  onSuccess: (newBankAccount) => {
    queryClient.invalidateQueries(['bankAccounts']);
    setCreateBankAccountDialogOpen(false);
    // Auto-select newly created account
    mortgageForm.setValue('bankAccountId', newBankAccount.id);
    showSnackbar('Bank account created successfully', 'success');
  },
  onError: (error) => {
    showSnackbar('Failed to create bank account', 'error');
  },
});

// In mortgage form dropdown
<FormControl fullWidth>
  <InputLabel>Bank Account</InputLabel>
  <Select {...mortgageForm.register('bankAccountId')}>
    {bankAccounts.map((account) => (
      <MenuItem key={account.id} value={account.id}>
        {formatBankAccountDisplay(account)}
      </MenuItem>
    ))}
    <MenuItem value="__create_new__" onClick={handleCreateNewBankAccount}>
      + Create New Bank Account
    </MenuItem>
  </Select>
</FormControl>

// Inline creation dialog
<Dialog open={createBankAccountDialogOpen} onClose={...}>
  <Box component="form" onSubmit={bankAccountForm.handleSubmit(handleBankAccountSubmit)}>
    <DialogTitle>Create New Bank Account</DialogTitle>
    <DialogContent>
      {/* Bank account form fields */}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setCreateBankAccountDialogOpen(false)}>Cancel</Button>
      <Button type="submit" variant="contained">Create</Button>
    </DialogActions>
  </Box>
</Dialog>
```

---

### Validation Rules

**Backend Validation:**
```typescript
// Unique constraint validation
async create(accountId: string, createDto: CreateBankAccountDto) {
  // Check for existing account
  const existing = await this.prisma.bankAccount.findFirst({
    where: {
      accountId,
      bankName: createDto.bankName,
      accountNumber: createDto.accountNumber,
    },
  });

  if (existing) {
    throw new ConflictException(
      'Bank account with this bank name and account number already exists'
    );
  }

  return this.prisma.bankAccount.create({
    data: { accountId, ...createDto },
  });
}

// Delete validation
async remove(id: string, accountId: string) {
  // Check if used by mortgages
  const mortgageCount = await this.prisma.mortgage.count({
    where: { bankAccountId: id },
  });

  if (mortgageCount > 0) {
    throw new BadRequestException(
      `Cannot delete bank account that is linked to ${mortgageCount} mortgage(s)`
    );
  }

  return this.prisma.bankAccount.delete({
    where: { id, accountId },
  });
}
```

**Frontend Validation (Zod):**
```typescript
const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  branchNumber: z.string().optional(),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'BUSINESS']).optional(),
  accountHolder: z.string().optional(),
  notes: z.string().optional(),
});
```

---

### Multi-Tenancy Implementation

All bank account operations are scoped to the user's accountId:

```typescript
// Backend (Guard)
@UseGuards(JwtAuthGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  @Post()
  create(
    @AccountId() accountId: string,
    @Body() createDto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(accountId, createDto);
  }

  @Get()
  findAll(@AccountId() accountId: string) {
    return this.bankAccountsService.findAll(accountId);
  }
  // ...
}
```

```typescript
// Frontend (Development mode)
api.interceptors.request.use((config) => {
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    config.headers['X-Account-Id'] = getCurrentAccountId();
  }
  return config;
});
```

---

### Error Handling

**Common Errors:**
1. **Duplicate Account:** HTTP 409 - "Bank account with this bank name and account number already exists"
2. **Delete Protected:** HTTP 400 - "Cannot delete bank account that is linked to N mortgage(s)"
3. **Not Found:** HTTP 404 - "Bank account not found"
4. **Validation Error:** HTTP 400 - Field-specific validation messages
5. **Unauthorized:** HTTP 403 - "You don't have permission to access this account"

---

### Testing Considerations

**Unit Tests:**
- ✅ BankAccountsService methods
- ✅ Duplicate detection logic
- ✅ Delete protection logic
- ✅ Account isolation

**Integration Tests:**
- ✅ API endpoints with various payloads
- ✅ Multi-tenancy enforcement
- ✅ Unique constraint violations
- ✅ Foreign key constraints

**E2E Tests:**
- ✅ Create bank account flow
- ✅ Inline creation from mortgage form
- ✅ Auto-selection after creation
- ✅ Delete protection validation
- ✅ Edit and activate/deactivate

**Test Results:** See `apps/backend/test/e2e/BANK_ACCOUNT_API_TEST_RESULTS.md`

---

## 📊 Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | BankAccount model, relations |
| Migration | ✅ Applied | Unique constraints, indexes |
| DTOs | ✅ Complete | Create, Update, Response DTOs |
| Service | ✅ Complete | All CRUD + validation logic |
| Controller | ✅ Complete | All endpoints with Swagger docs |
| API Tests | ✅ Complete | E2E test suite passed |
| Frontend API | ✅ Complete | TypeScript service |
| Inline Creation | ✅ Complete | Dialog pattern, auto-select |
| Mortgage Integration | ✅ Complete | Dropdown, display, linking |
| Documentation | ✅ Complete | This epic + feature docs |

---

## 🔗 Related Documentation

- [Bank Account Mortgage Feature](../BANK_ACCOUNT_MORTGAGE_FEATURE.md) - Implementation details
- [Bank Account API Test Results](../../apps/backend/test/e2e/BANK_ACCOUNT_API_TEST_RESULTS.md)
- [Epic 6: Mortgage Management](./EPIC_06_MORTGAGE_MANAGEMENT.md)
- [Inline Entity Creation Rule](../../.cursor/rules/inline-entity-creation.mdc)

---

## 🚀 Future Enhancements

1. **Bank Account Types Localization**
   - Hebrew labels for account types
   - Customizable account type categories

2. **Bank Account Balances**
   - Track current balance
   - Transaction history integration

3. **Multiple Currency Support**
   - Support for foreign bank accounts
   - Currency conversion

4. **Bank Account Verification**
   - Bank details validation
   - Account ownership verification

5. **Bulk Operations**
   - Import bank accounts from CSV
   - Bulk activation/deactivation

6. **Advanced Filtering**
   - Filter by bank name
   - Filter by account type
   - Search by account number

---

**Epic Created:** February 2, 2026  
**Last Updated:** February 6, 2026  
**Status:** ✅ Fully Implemented and Tested

## 🧪 Test Results Summary

**E2E Test Suite:** `apps/backend/test/e2e/epic7-bank-accounts.e2e-spec.ts`

**Test Results:**
- ✅ **28/28 tests passing** (100% pass rate)
- ✅ **US7.1:** Create Bank Account - 6/6 tests passing
- ✅ **US7.2:** View Bank Accounts List - 5/5 tests passing
- ✅ **US7.3:** Edit Bank Account - 4/4 tests passing
- ✅ **US7.4:** Delete Bank Account with Validation - 3/3 tests passing
- ✅ **US7.5:** Activate/Deactivate Bank Account - 4/4 tests passing
- ✅ **US7.6:** Create Bank Account Inline from Mortgage Form - 1/1 test passing
- ✅ **US7.7:** View Mortgages Using Bank Account - 4/4 tests passing
- ✅ **Multi-tenancy Security** - 1/1 test passing

**Test Coverage:**
- ✅ All CRUD operations tested
- ✅ Validation and error handling tested
- ✅ Duplicate prevention tested
- ✅ Delete protection tested
- ✅ Activate/deactivate tested
- ✅ Inline creation tested
- ✅ Mortgage integration tested
- ✅ Multi-tenancy isolation tested

**Implementation Verification:**
- ✅ Backend: All endpoints implemented and tested
- ✅ Frontend: All components implemented with inline creation
- ✅ Integration: Mortgage form has inline bank account creation
- ✅ Auto-selection: Newly created accounts auto-selected in mortgage form
