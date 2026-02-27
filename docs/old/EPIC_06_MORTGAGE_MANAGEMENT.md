# Epic 6: Mortgage & Loan Management

**Priority:** 🟠 High  
**Status:** ✅ Completed  
**Created:** February 2, 2026  
**Last Updated:** February 6, 2026

---

## Overview

Mortgage & Loan Management enables property owners to track and manage all mortgage and debt obligations associated with their properties. This epic provides comprehensive functionality for creating mortgages, recording payments, tracking payment history, managing mortgage status, linking mortgages to bank accounts, associating multiple properties as collateral, calculating remaining balances, and viewing mortgage details on property pages. This epic is essential for complete financial portfolio management and debt tracking.

**Business Value:**
- Complete mortgage and loan tracking
- Payment history and financial records
- Debt obligation management
- Multi-property collateral support
- Integration with bank account management
- Financial calculations (remaining balance, interest tracking)
- Foundation for financial reporting and analysis

---

## User Stories

### US6.1: Create Mortgage
**As a** property owner,  
**I can** create a new mortgage record with bank name, loan amount, interest rate, monthly payment, start date, and optional end date,  
**So that** I can track my mortgage obligations for each property.

**Priority:** 🔴 Critical  
**Status:** ✅ Completed

---

### US6.2: Link Mortgage to Property
**As a** property owner,  
**I can** link a mortgage to a specific property,  
**So that** I can associate mortgage obligations with the property they secure.

**Priority:** 🔴 Critical  
**Status:** ✅ Completed

---

### US6.3: Link Mortgage to Bank Account
**As a** property owner,  
**I can** link a mortgage to a bank account for automatic payment tracking,  
**So that** I can track which account is used for mortgage payments.

**Priority:** 🟠 High  
**Status:** ✅ Completed

---

### US6.4: Set Mortgage Loan Details
**As a** property owner,  
**I can** set the loan amount, interest rate, and monthly payment amount for a mortgage,  
**So that** I have complete financial information about my mortgage obligations.

**Priority:** 🔴 Critical  
**Status:** ✅ Completed

---

### US6.5: Set Mortgage Dates
**As a** property owner,  
**I can** set the mortgage start date and optional end date,  
**So that** I can track the mortgage term and duration.

**Priority:** 🟠 High  
**Status:** ✅ Completed

---

### US6.6: Track Mortgage Status
**As a** property owner,  
**I can** set and update the mortgage status (ACTIVE, PAID_OFF, REFINANCED, DEFAULTED),  
**So that** I can track the current state of each mortgage.

**Priority:** 🔴 Critical  
**Status:** ✅ Completed

---

### US6.7: Link Multiple Properties as Collateral
**As a** property owner,  
**I can** link multiple properties as collateral for a single mortgage using the linkedProperties array,  
**So that** I can track mortgages that secure multiple properties.

**Priority:** 🟠 High  
**Status:** ✅ Completed

---

### US6.8: Record Mortgage Payment
**As a** property owner,  
**I can** record a mortgage payment with payment date, amount, principal portion, and interest portion,  
**So that** I can maintain a complete payment history.

**Priority:** 🔴 Critical  
**Status:** ✅ Completed

---

### US6.9: View Payment History
**As a** property owner,  
**I can** view the complete payment history for a mortgage including all payment dates, amounts, principal, and interest,  
**So that** I can track payment patterns and verify payment records.

**Priority:** 🟠 High  
**Status:** ✅ Completed

---

### US6.10: Calculate Remaining Balance
**As a** property owner,  
**I can** view the calculated remaining balance for a mortgage based on loan amount and recorded payments,  
**So that** I can understand how much I still owe on each mortgage.

**Priority:** 🟠 High  
**Status:** ✅ Completed

---

### US6.11: View Mortgage Details on Property Page
**As a** property owner,  
**I can** view all mortgages associated with a property on the property details page,  
**So that** I can see all mortgage obligations for a specific property in one place.

**Priority:** 🔴 Critical  
**Status:** ✅ Completed

---

### US6.12: Filter Mortgages by Status
**As a** property owner,  
**I can** filter mortgages by status (ACTIVE, PAID_OFF, REFINANCED, DEFAULTED),  
**So that** I can view subsets of my mortgages based on their current state.

**Priority:** 🟡 Medium  
**Status:** ✅ Completed

---

### US6.13: Edit Mortgage Information
**As a** property owner,  
**I can** edit mortgage information including bank name, loan amount, interest rate, monthly payment, dates, status, and linked properties,  
**So that** I can keep mortgage records up to date.

**Priority:** 🔴 Critical  
**Status:** ✅ Completed

---

### US6.14: Delete Mortgage
**As a** property owner,  
**I can** delete a mortgage record that has no payment history,  
**So that** I can remove incorrect or duplicate mortgage entries.

**Priority:** 🟡 Medium  
**Status:** ✅ Completed

---

### US6.15: View Mortgage Summary
**As a** property owner,  
**I can** view a summary of all mortgages including total loan amount, total remaining balance, total monthly payments, and count by status,  
**So that** I can understand my overall mortgage obligations.

**Priority:** 🟠 High  
**Status:** ✅ Completed

---

## Acceptance Criteria

### US6.1: Create Mortgage
- [ ] User can access "Create Mortgage" button/action from property details page
- [ ] Form includes required fields: bank (string), loanAmount (decimal), startDate (date), status (MortgageStatus enum)
- [ ] Form includes optional fields: interestRate (decimal), monthlyPayment (decimal), endDate (date), bankAccountId (UUID), linkedProperties (array of property IDs), notes (string)
- [ ] Form includes propertyId field (pre-filled when accessed from property page)
- [ ] Form validates that bank is not empty
- [ ] Form validates that loanAmount is positive number
- [ ] Form validates that interestRate is between 0 and 100 if provided
- [ ] Form validates that monthlyPayment is positive if provided
- [ ] Form validates that startDate is a valid date
- [ ] Form validates that endDate is after startDate if provided
- [ ] Form validates that linkedProperties contains valid property IDs
- [ ] Success message displayed after creation
- [ ] Mortgage appears in property's mortgage list after creation
- [ ] Mortgage is associated with user's account (multi-tenancy)
- [ ] Created mortgage has default status of ACTIVE

---

### US6.2: Link Mortgage to Property
- [ ] PropertyId field is required when creating mortgage
- [ ] PropertyId can be selected from dropdown of user's properties
- [ ] PropertyId is pre-filled when creating mortgage from property page
- [ ] Property must exist and belong to user's account
- [ ] Mortgage is displayed on property details page after creation
- [ ] Property's isMortgaged flag can be automatically updated when mortgage is created (optional enhancement)

---

### US6.3: Link Mortgage to Bank Account
- [ ] Form includes bankAccountId dropdown selector
- [ ] Dropdown shows user's bank accounts (bank name, account number)
- [ ] BankAccountId field is optional
- [ ] Bank account must exist and belong to user's account
- [ ] Mortgage details page displays linked bank account information
- [ ] Link can be removed (set to null) after creation
- [ ] Link can be changed after creation

---

### US6.4: Set Mortgage Loan Details
- [ ] Form includes loanAmount field (required, decimal, positive)
- [ ] Form includes interestRate field (optional, decimal, 0-100)
- [ ] Form includes monthlyPayment field (optional, decimal, positive)
- [ ] Fields accept decimal values with appropriate precision
- [ ] Values are displayed with currency formatting (₪)
- [ ] Values are saved correctly to database
- [ ] Values can be edited after creation

---

### US6.5: Set Mortgage Dates
- [ ] Form includes startDate field (required, date picker)
- [ ] Form includes endDate field (optional, date picker)
- [ ] StartDate defaults to today's date
- [ ] EndDate validation ensures it's after startDate if provided
- [ ] Dates are displayed in Hebrew date format (DD/MM/YYYY)
- [ ] Dates are saved correctly to database
- [ ] Dates can be edited after creation

---

### US6.6: Track Mortgage Status
- [ ] Form includes status dropdown with options: ACTIVE, PAID_OFF, REFINANCED, DEFAULTED
- [ ] Status defaults to ACTIVE
- [ ] Status can be changed after creation
- [ ] Status is displayed with appropriate visual indicator (color/badge)
- [ ] Status change is saved correctly to database
- [ ] Status filter works correctly in mortgage list

---

### US6.7: Link Multiple Properties as Collateral
- [ ] Form includes linkedProperties multi-select field
- [ ] Multi-select shows user's properties (address, file number)
- [ ] Multiple properties can be selected
- [ ] Selected properties are stored as array of property IDs
- [ ] Linked properties are displayed on mortgage details page
- [ ] Linked properties can be added/removed after creation
- [ ] Property details pages show mortgages where they are linked as collateral

---

### US6.8: Record Mortgage Payment
- [ ] User can access "Record Payment" button from mortgage details page
- [ ] Form includes required fields: paymentDate (date), amount (decimal)
- [ ] Form includes optional fields: principal (decimal), interest (decimal), notes (string)
- [ ] Form validates that paymentDate is a valid date
- [ ] Form validates that amount is positive
- [ ] Form validates that principal + interest <= amount if both provided
- [ ] Payment is associated with mortgage
- [ ] Payment is associated with user's account (multi-tenancy)
- [ ] Success message displayed after recording payment
- [ ] Payment appears in payment history immediately
- [ ] Remaining balance is recalculated after payment

---

### US6.9: View Payment History
- [ ] Payment history table displays on mortgage details page
- [ ] Table shows columns: paymentDate, amount, principal, interest, notes
- [ ] Payments are sorted by date (newest first)
- [ ] Table supports pagination if many payments
- [ ] Table shows total payments count
- [ ] Table shows sum of all payment amounts
- [ ] Table shows sum of principal and interest
- [ ] Payment history is read-only (view only)
- [ ] Empty state shown when no payments recorded

---

### US6.10: Calculate Remaining Balance
- [ ] Remaining balance is calculated as: loanAmount - sum(principal payments)
- [ ] Remaining balance is displayed on mortgage details page
- [ ] Remaining balance updates automatically when payments are recorded
- [ ] If no principal payments recorded, remaining balance equals loanAmount
- [ ] Remaining balance cannot be negative
- [ ] Remaining balance is displayed with currency formatting (₪)
- [ ] Calculation is accurate and up-to-date

---

### US6.11: View Mortgage Details on Property Page
- [ ] Property details page includes "Mortgages" section/tab
- [ ] Section displays all mortgages linked to the property
- [ ] Each mortgage card shows: bank, loanAmount, interestRate, monthlyPayment, status, startDate, endDate
- [ ] Mortgage cards are clickable and navigate to mortgage details
- [ ] Section shows count of mortgages
- [ ] Section shows total loan amount for all mortgages
- [ ] Section shows total monthly payment for all active mortgages
- [ ] Empty state shown when property has no mortgages
- [ ] "Create Mortgage" button available in section

---

### US6.12: Filter Mortgages by Status
- [ ] Mortgage list page includes status filter dropdown
- [ ] Filter options: All, ACTIVE, PAID_OFF, REFINANCED, DEFAULTED
- [ ] Filter can be applied to mortgage list
- [ ] Filtered results update immediately
- [ ] Filter state persists during navigation
- [ ] Clear filter button available
- [ ] Active filter is displayed as chip/badge
- [ ] Filter works with search functionality

---

### US6.13: Edit Mortgage Information
- [ ] Edit button available on mortgage details page
- [ ] Edit button available in mortgage list actions
- [ ] Edit form pre-populates with existing mortgage data
- [ ] Form includes all mortgage fields
- [ ] Form validates input (same as create form)
- [ ] Success message displayed after update
- [ ] Updated data appears immediately in mortgage details
- [ ] Updated data appears in mortgage list after refresh
- [ ] Update operation enforces multi-tenancy
- [ ] Update operation validates mortgage exists and belongs to user

---

### US6.14: Delete Mortgage
- [ ] Delete button available in mortgage list actions
- [ ] Delete button available on mortgage details page
- [ ] Confirmation dialog shown before deletion
- [ ] Deletion fails if mortgage has associated payments
- [ ] Error message shown if deletion fails due to payments
- [ ] Success message shown after successful deletion
- [ ] Mortgage removed from list after deletion
- [ ] User redirected to property page or mortgage list after deletion
- [ ] Delete operation enforces multi-tenancy
- [ ] Delete operation validates mortgage exists and belongs to user

---

### US6.15: View Mortgage Summary
- [ ] Mortgage summary endpoint available: `GET /mortgages/summary`
- [ ] Summary includes: totalMortgages, totalLoanAmount, totalRemainingBalance, totalMonthlyPayments
- [ ] Summary includes: mortgagesByStatus (object with counts per status)
- [ ] Summary includes: activeMortgagesCount, paidOffMortgagesCount, refinancedMortgagesCount, defaultedMortgagesCount
- [ ] Summary is calculated per account (multi-tenancy)
- [ ] Summary is accurate and up-to-date
- [ ] Summary displayed in dashboard/overview page (future enhancement)

---

## Implementation Notes

### Database Tables

**Primary Table:**
- `mortgages` - Main mortgage table with all fields:
  - `id` (UUID, primary key)
  - `propertyId` (UUID, foreign key to properties)
  - `accountId` (UUID, foreign key to accounts)
  - `bank` (string, required)
  - `loanAmount` (decimal, required)
  - `interestRate` (decimal, optional)
  - `monthlyPayment` (decimal, optional)
  - `bankAccountId` (UUID, optional, foreign key to bank_accounts)
  - `startDate` (date, required)
  - `endDate` (date, optional)
  - `status` (MortgageStatus enum, required)
  - `linkedProperties` (array of UUIDs, optional)
  - `notes` (text, optional)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

**Related Table:**
- `mortgage_payments` - Payment records:
  - `id` (UUID, primary key)
  - `mortgageId` (UUID, foreign key to mortgages)
  - `accountId` (UUID, foreign key to accounts)
  - `paymentDate` (date, required)
  - `amount` (decimal, required)
  - `principal` (decimal, optional)
  - `interest` (decimal, optional)
  - `notes` (text, optional)
  - `createdAt` (timestamp)

**Related Tables:**
- `properties` - Properties that mortgages secure (many-to-one)
- `bank_accounts` - Bank accounts for automatic payments (many-to-one)

**Enums:**
- `MortgageStatus`: ACTIVE, PAID_OFF, REFINANCED, DEFAULTED

**Indexes:**
- `mortgages.propertyId` - For property-mortgage queries
- `mortgages.accountId` - For multi-tenancy
- `mortgages.status` - For status filtering
- `mortgages.bank` - For bank filtering
- `mortgages.bankAccountId` - For bank account queries
- `mortgage_payments.mortgageId` - For payment history queries
- `mortgage_payments.accountId` - For multi-tenancy
- `mortgage_payments.paymentDate` - For date-based queries

---

### API Endpoints

**Base Path:** `/api/mortgages`

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/mortgages` | Get paginated list of mortgages with search and filters | ✅ Implemented |
| GET | `/mortgages/summary` | Get mortgage summary statistics | ✅ Implemented |
| GET | `/mortgages/:id` | Get single mortgage by ID with payment history | ✅ Implemented |
| GET | `/mortgages/property/:propertyId` | Get all mortgages for a property | ✅ Implemented |
| POST | `/mortgages` | Create new mortgage | ✅ Implemented |
| PATCH | `/mortgages/:id` | Update mortgage | ✅ Implemented |
| DELETE | `/mortgages/:id` | Delete mortgage (if no payments) | ✅ Implemented |
| POST | `/mortgages/:id/payments` | Record mortgage payment | ✅ Implemented |
| GET | `/mortgages/:id/payments` | Get payment history for mortgage | ✅ Implemented |

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10) - Items per page
- `search` (string, optional) - Search query for bank name
- `status` (MortgageStatus, optional) - Filter by status
- `propertyId` (UUID, optional) - Filter by property
- `bankAccountId` (UUID, optional) - Filter by bank account

**Authentication:**
- All endpoints require JWT authentication
- All endpoints enforce account-level multi-tenancy

---

### Frontend Components

**Main Components:**
- `MortgageList` (`apps/frontend/src/components/mortgages/MortgageList.tsx`)
  - Displays mortgages in DataGrid
  - Handles pagination, search, filtering by status
  - CRUD operations
  - RTL layout support
  - Column reordering enabled

- `MortgageForm` (`apps/frontend/src/components/mortgages/MortgageForm.tsx`)
  - Create/Edit form dialog
  - React Hook Form with Zod validation
  - Property selector dropdown
  - Bank account selector dropdown
  - Linked properties multi-select
  - Status dropdown
  - Date pickers for start/end dates
  - Hebrew error messages
  - RTL layout support

- `MortgageDetailsPage` (`apps/frontend/src/app/mortgages/[id]/page.tsx`)
  - Full mortgage details view
  - Mortgage information display
  - Payment history table
  - Remaining balance calculation
  - Edit and delete actions
  - Record payment action

- `MortgageCard` (`apps/frontend/src/components/mortgages/MortgageCard.tsx`)
  - Compact mortgage display card
  - Shows key mortgage information
  - Status badge with color coding
  - Used in property details page mortgages section
  - Clickable to navigate to mortgage details

- `MortgagePaymentForm` (`apps/frontend/src/components/mortgages/MortgagePaymentForm.tsx`)
  - Form for recording mortgage payments
  - Payment date picker
  - Amount, principal, interest fields
  - Notes field
  - Validation for payment amounts

- `MortgagePaymentHistory` (`apps/frontend/src/components/mortgages/MortgagePaymentHistory.tsx`)
  - Table displaying payment history
  - Sortable columns
  - Pagination support
  - Totals row (sum of amounts, principal, interest)

**Service Layer:**
- `mortgagesApi` (`apps/frontend/src/services/mortgages.ts`)
  - API client functions
  - React Query integration
  - TypeScript types

---

### Data Transfer Objects (DTOs)

**CreateMortgageDto:**
- `propertyId` (required, UUID)
- `bank` (required, string)
- `loanAmount` (required, number, positive)
- `interestRate` (optional, number, 0-100)
- `monthlyPayment` (optional, number, positive)
- `bankAccountId` (optional, UUID)
- `startDate` (required, ISO date string)
- `endDate` (optional, ISO date string, must be after startDate)
- `status` (required, MortgageStatus enum)
- `linkedProperties` (optional, array of UUIDs)
- `notes` (optional, string)

**UpdateMortgageDto:**
- Same fields as CreateMortgageDto, all optional except propertyId cannot be changed

**MortgageResponseDto:**
- All Mortgage fields plus:
- `property` (PropertyResponseDto) - Related property
- `bankAccount` (BankAccountResponseDto, optional) - Linked bank account
- `linkedPropertiesDetails` (array of PropertyResponseDto) - Details of linked properties
- `paymentCount` (number) - Count of payments
- `remainingBalance` (number) - Calculated remaining balance
- `totalPaid` (number) - Sum of all payment amounts
- `createdAt` (ISO date string)
- `updatedAt` (ISO date string)

**CreateMortgagePaymentDto:**
- `mortgageId` (required, UUID)
- `paymentDate` (required, ISO date string)
- `amount` (required, number, positive)
- `principal` (optional, number, positive)
- `interest` (optional, number, positive)
- `notes` (optional, string)

**MortgagePaymentResponseDto:**
- `id` (UUID)
- `mortgageId` (UUID)
- `paymentDate` (ISO date string)
- `amount` (number)
- `principal` (number, optional)
- `interest` (number, optional)
- `notes` (string, optional)
- `createdAt` (ISO date string)

---

### Validation Rules

**Required Fields:**
- `propertyId` - Must be valid UUID, property must exist and belong to user's account
- `bank` - Must be non-empty string
- `loanAmount` - Must be positive number
- `startDate` - Must be valid date
- `status` - Must be valid MortgageStatus enum value

**Optional Fields:**
- `interestRate` - If provided, must be between 0 and 100
- `monthlyPayment` - If provided, must be positive
- `endDate` - If provided, must be after startDate
- `bankAccountId` - If provided, must be valid UUID, bank account must exist and belong to user's account
- `linkedProperties` - If provided, must be array of valid UUIDs, all properties must exist and belong to user's account
- `notes` - Free text

**Business Rules:**
- Mortgage cannot be deleted if it has associated payments
- Mortgage must belong to user's account (multi-tenancy enforced)
- Property must exist and belong to user's account
- Bank account must exist and belong to user's account if provided
- Linked properties must all exist and belong to user's account
- Payment principal + interest cannot exceed payment amount if both provided
- Remaining balance cannot be negative

---

### Multi-Tenancy

**Account Isolation:**
- All mortgage queries filter by `accountId`
- All payment queries filter by `accountId`
- Users can only see/modify mortgages belonging to their account
- Account ID is extracted from JWT token via `AccountGuard` and `AccountId` decorator

**Implementation:**
- Backend: `MortgagesService` methods accept `accountId` parameter
- Backend: All Prisma queries include `where: { accountId }`
- Frontend: API calls automatically include account context via JWT token

---

### Financial Calculations

**Remaining Balance Calculation:**
```typescript
remainingBalance = loanAmount - sum(principal payments)
```

If no principal payments recorded, remaining balance equals loanAmount.

**Payment Validation:**
- If both principal and interest are provided: principal + interest <= amount
- If only principal provided: principal <= amount
- If only interest provided: interest <= amount

**Mortgage Summary Calculations:**
- Total loan amount: sum of all loanAmount values
- Total remaining balance: sum of all remaining balances
- Total monthly payments: sum of monthlyPayment for ACTIVE mortgages
- Mortgages by status: count grouped by status

---

### Integration Points

**Property Integration:**
- Property details page displays mortgages section
- Property's `isMortgaged` flag can be automatically updated when mortgage is created (optional enhancement)
- Property list can show mortgage indicator

**Bank Account Integration:**
- Mortgage can be linked to bank account
- Bank account details displayed on mortgage page
- Bank account selector in mortgage form

**Financial Tracking Integration:**
- Mortgage payments can be tracked as expenses (future enhancement)
- Mortgage information used in financial reports (future enhancement)

---

### Performance Considerations

**Pagination:**
- Server-side pagination implemented for mortgage list
- Server-side pagination implemented for payment history
- Default page size: 10 items
- Configurable page sizes: 10, 25, 50, 100

**Search:**
- Server-side search implemented
- Searches bank name field
- Case-insensitive search
- Debounced input to reduce API calls

**Indexing:**
- Database indexes on: `propertyId`, `accountId`, `status`, `bank`, `bankAccountId`
- Database indexes on payments: `mortgageId`, `accountId`, `paymentDate`
- Optimizes query performance for filtering and account isolation

**Caching:**
- React Query used for client-side caching
- Cache invalidation on create/update/delete operations
- Reduces unnecessary API calls

---

### Error Handling

**Backend Errors:**
- 400 Bad Request - Invalid input data
- 401 Unauthorized - Missing or invalid JWT token
- 403 Forbidden - Mortgage belongs to different account
- 404 Not Found - Mortgage doesn't exist
- 409 Conflict - Cannot delete mortgage with payments
- 500 Internal Server Error - Server error

**Frontend Error Handling:**
- Error messages displayed in Snackbar component
- Hebrew error messages for user-friendly experience
- Form validation errors shown inline
- Loading states during API calls

---

### Testing Considerations

**Unit Tests:**
- Mortgage service methods
- Payment service methods
- DTO validation
- Financial calculations (remaining balance, totals)
- Status transitions

**Integration Tests:**
- API endpoint testing
- Database operations
- Multi-tenancy enforcement
- Payment recording and history
- Linked properties functionality

**E2E Tests:**
- Create mortgage flow
- Edit mortgage flow
- Delete mortgage flow
- Record payment flow
- View payment history flow
- Filter mortgages by status flow
- Link multiple properties flow

---

### Future Enhancements

**Planned Features:**
- [ ] Mortgage payment reminders/notifications
- [ ] Automatic payment calculation based on interest rate and loan amount
- [ ] Mortgage amortization schedule generation
- [ ] Mortgage refinancing workflow
- [ ] Mortgage comparison view
- [ ] Export mortgage data to CSV/Excel
- [ ] Mortgage payment templates
- [ ] Recurring payment setup
- [ ] Mortgage payment calendar view
- [ ] Integration with bank account transactions (automatic payment detection)
- [ ] Mortgage documents/attachments
- [ ] Mortgage history/audit log

**Related Epics:**
- Epic 1: Property Management (mortgages depend on properties)
- Epic 5: Bank Account Management (mortgages can link to bank accounts)
- Epic 8: Financial Tracking (mortgage payments are expenses)
- Epic 9: Investment Company Management (mortgages may relate to investment properties)

---

## Related Documentation

- [Database Schema](../../apps/backend/prisma/schema.prisma)
- [Epic 1: Property Management](./EPIC_01_PROPERTY_MANAGEMENT.md)
- [Epic 5: Bank Account Management](./EPIC_05_BANK_ACCOUNT_MANAGEMENT.md) (if exists)
- [Epics Overview](./EPICS_OVERVIEW.md)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0
