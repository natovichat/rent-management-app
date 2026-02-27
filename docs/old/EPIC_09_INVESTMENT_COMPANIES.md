# Epic 9: Investment Company Management

**Priority:** 🟠 High  
**Status:** 🟡 Not Started  
**Created:** February 2, 2026  
**Last Updated:** February 2, 2026

---

## Overview

Investment Company Management enables property owners to manage investment companies and corporate holdings for their property portfolio. This epic provides comprehensive functionality for creating and managing investment companies, tracking company details (name, registration number, country, investment amount, ownership percentage), linking properties to investment companies, viewing company property portfolios, calculating total investment values, and managing corporate investment structures.

**Business Value:**
- Track investment properties held through companies
- Manage corporate ownership structures
- Calculate total investment value per company
- View company property portfolios
- Track investment amounts and ownership percentages
- Support for multi-country investment companies
- Foundation for corporate financial reporting
- Legal compliance with company registration documentation

---

## User Stories

### US9.1: Create Investment Company
**As a** property owner,  
**I can** create a new investment company with basic information (name, registration number, country),  
**So that** I can track properties held through corporate entities.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US9.2: Add Investment Company Details
**As a** property owner,  
**I can** add comprehensive investment company details including name, registration number, country, investment amount, ownership percentage, and notes,  
**So that** I have complete information about each investment company in my portfolio.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US9.3: View Investment Companies List
**As a** property owner,  
**I can** view a paginated list of all investment companies with key information (name, registration number, country, investment amount, ownership percentage, property count),  
**So that** I can quickly browse and manage all investment companies in my portfolio.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US9.4: Search Investment Companies
**As a** property owner,  
**I can** search investment companies by name, registration number, or country,  
**So that** I can quickly find specific companies in my portfolio.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

### US9.5: Edit Investment Company Information
**As a** property owner,  
**I can** edit any investment company information including name, registration number, country, investment amount, ownership percentage, and notes,  
**So that** I can keep company information up to date.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US9.6: Delete Investment Company
**As a** property owner,  
**I can** delete an investment company that has no associated properties,  
**So that** I can remove companies that are no longer relevant to my portfolio.

**Priority:** 🟡 Medium  
**Status:** 🟡 Not Started

---

### US9.7: Link Property to Investment Company
**As a** property owner,  
**I can** link a property to an investment company from the property details page,  
**So that** I can track which properties are held through which companies.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US9.8: View Company's Property Portfolio
**As a** property owner,  
**I can** view all properties linked to a specific investment company with their details (address, file number, estimated value),  
**So that** I can see the complete property portfolio for each investment company.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

### US9.9: Calculate Total Investment Value Per Company
**As a** property owner,  
**I can** view the total investment value for an investment company calculated from the sum of all linked properties' estimated values,  
**So that** I can assess the total value of assets held through each company.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

### US9.10: Track Company Holdings
**As a** property owner,  
**I can** view a summary of company holdings including total number of properties, total estimated value, average property value, and investment amount,  
**So that** I can monitor the performance and composition of each investment company's portfolio.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

## Acceptance Criteria

### US9.1: Create Investment Company
- [ ] User can access "Create Investment Company" button/action
- [ ] Form includes required fields: name, country (defaults to "Israel")
- [ ] Form includes optional fields: registrationNumber, investmentAmount, ownershipPercentage, notes
- [ ] Form validates that name is not empty
- [ ] Form validates that country is not empty
- [ ] Form validates that investmentAmount is positive (if provided)
- [ ] Form validates that ownershipPercentage is between 0 and 100 (if provided)
- [ ] Success message displayed after creation
- [ ] Company appears in investment companies list after creation
- [ ] Company is associated with user's account (multi-tenancy)
- [ ] Created company has timestamps (createdAt, updatedAt)

---

### US9.2: Add Investment Company Details
- [ ] Form includes name text field (required)
- [ ] Form includes registration number text field (optional)
- [ ] Form includes country text field (required, defaults to "Israel")
- [ ] Form includes investment amount numeric field (optional, positive number, currency format)
- [ ] Form includes ownership percentage numeric field (optional, 0-100, decimal precision 2)
- [ ] Form includes notes textarea field (optional)
- [ ] All fields are saved correctly to database
- [ ] Investment amount accepts decimal values (2 decimal places)
- [ ] Ownership percentage accepts decimal values (2 decimal places)
- [ ] Form supports Hebrew text input
- [ ] Currency formatting displayed (₪ for Israeli Shekel)

---

### US9.3: View Investment Companies List
- [ ] Investment companies list displays in a DataGrid component
- [ ] List shows: name, registration number, country, investment amount, ownership percentage, property count, creation date
- [ ] List supports server-side pagination
- [ ] Default page size is 10
- [ ] User can change page size (10, 25, 50, 100)
- [ ] User can navigate between pages
- [ ] List shows total count of investment companies
- [ ] Name column is clickable and navigates to company details (if implemented)
- [ ] List has RTL (right-to-left) layout for Hebrew
- [ ] Columns can be reordered by dragging
- [ ] List shows loading state while fetching data
- [ ] List shows error state if fetch fails
- [ ] Property count shows number of properties linked to each company
- [ ] Investment amount and ownership percentage formatted with appropriate symbols (₪, %)

---

### US9.4: Search Investment Companies
- [ ] Search input field is available above investment companies list
- [ ] Search queries name, registrationNumber, and country fields
- [ ] Search is debounced (waits for user to stop typing)
- [ ] Search results update automatically
- [ ] Search works with pagination
- [ ] Search is case-insensitive
- [ ] Empty search shows all companies
- [ ] Search state persists during navigation

---

### US9.5: Edit Investment Company Information
- [ ] Edit button available on company details page (if implemented)
- [ ] Edit button available in companies list actions
- [ ] Edit form pre-populates with existing company data
- [ ] Form includes all company fields
- [ ] Form validates input (same as create form)
- [ ] Success message displayed after update
- [ ] Updated data appears immediately in company details (if implemented)
- [ ] Updated data appears in companies list after refresh
- [ ] Update operation enforces multi-tenancy
- [ ] Update operation validates company exists and belongs to user

---

### US9.6: Delete Investment Company
- [ ] Delete button available in companies list actions
- [ ] Delete button available on company details page (if implemented)
- [ ] Confirmation dialog shown before deletion
- [ ] Deletion fails if company has associated properties
- [ ] Error message shown if deletion fails due to linked properties
- [ ] Success message shown after successful deletion
- [ ] Company removed from list after deletion
- [ ] User redirected to companies list after deletion
- [ ] Delete operation enforces multi-tenancy
- [ ] Delete operation validates company exists and belongs to user

---

### US9.7: Link Property to Investment Company
- [ ] Link to company option available on property details page
- [ ] Form includes investment company dropdown/selector (optional, can be cleared)
- [ ] Form shows current linked company (if any)
- [ ] User can select a company from dropdown
- [ ] User can clear selection to unlink property from company
- [ ] Form validates that selected company exists and belongs to user's account
- [ ] Success message displayed after linking/unlinking
- [ ] Property details page shows linked company name (if linked)
- [ ] Property appears in company's property portfolio after linking
- [ ] Property is removed from company's portfolio after unlinking
- [ ] Link operation enforces multi-tenancy

---

### US9.8: View Company's Property Portfolio
- [ ] Company details page (if implemented) shows properties section
- [ ] Properties list shows: property address, file number, estimated value, property type, status
- [ ] List supports pagination if company has many properties
- [ ] Property address is clickable and navigates to property details
- [ ] List shows total number of properties linked to company
- [ ] List shows total estimated value of all linked properties
- [ ] List has RTL layout for Hebrew
- [ ] List shows empty state if no properties are linked
- [ ] List can be filtered or sorted (future enhancement)

---

### US9.9: Calculate Total Investment Value Per Company
- [ ] Company details page shows total investment value metric
- [ ] Total value is calculated as sum of all linked properties' estimatedValue
- [ ] Calculation includes only properties with non-null estimatedValue
- [ ] Total value is displayed with currency formatting (₪)
- [ ] Total value updates automatically when properties are linked/unlinked
- [ ] Total value updates when property estimated values change
- [ ] Calculation handles null/zero values gracefully
- [ ] Tooltip or help text explains the calculation method

---

### US9.10: Track Company Holdings
- [ ] Company details page shows holdings summary section
- [ ] Summary displays:
  - Total number of properties
  - Total estimated value (sum of all property values)
  - Average property value (total value / property count)
  - Investment amount (from company record)
  - Ownership percentage (from company record)
- [ ] All metrics are formatted appropriately (currency, percentages, numbers)
- [ ] Summary updates automatically when properties are added/removed
- [ ] Summary updates when property values change
- [ ] Summary shows comparison between investment amount and total property value (if applicable)
- [ ] Summary can be exported or printed (future enhancement)

---

## Implementation Notes

### Database Tables

**Primary Tables:**
- `investment_companies` - Investment company records with name, registrationNumber, country, investmentAmount, ownershipPercentage, notes

**Related Tables:**
- `properties` - Properties that can be linked to investment companies (via `investmentCompanyId` foreign key)
- `accounts` - Account-level isolation (multi-tenancy)

**Database Schema Details:**

```prisma
model InvestmentCompany {
  id           String   @id @default(uuid())
  accountId    String   @map("account_id")
  
  name         String
  registrationNumber String? @map("registration_number")
  country      String   @default("Israel")
  investmentAmount Decimal? @map("investment_amount") @db.Decimal(12, 2)
  ownershipPercentage Decimal? @map("ownership_percentage") @db.Decimal(5, 2)
  
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  account      Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  properties   Property[]
  
  @@index([accountId])
  @@index([name])
  @@map("investment_companies")
}

model Property {
  // ... other fields ...
  
  // Investment company relation (optional)
  investmentCompanyId String? @map("investment_company_id")
  
  // Relations
  investmentCompany InvestmentCompany? @relation(fields: [investmentCompanyId], references: [id], onDelete: SetNull)
  
  @@index([investmentCompanyId])
}
```

**Key Points:**
- `investmentCompanyId` on Property is optional (nullable)
- Property can be unlinked from company (SetNull on delete)
- Investment company deletion is restricted if it has linked properties (enforced in application logic)
- Multi-tenancy enforced via `accountId` on both tables

---

### API Endpoints

**Base Path:** `/api/investment-companies` and `/api/properties/:id/investment-company`

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/investment-companies` | Get paginated list of investment companies with search | 🟡 Not Started |
| GET | `/investment-companies/:id` | Get single investment company by ID | 🟡 Not Started |
| POST | `/investment-companies` | Create new investment company | 🟡 Not Started |
| PATCH | `/investment-companies/:id` | Update investment company | 🟡 Not Started |
| DELETE | `/investment-companies/:id` | Delete investment company | 🟡 Not Started |
| GET | `/investment-companies/:id/properties` | Get properties linked to an investment company | 🟡 Not Started |
| GET | `/investment-companies/:id/holdings` | Get company holdings summary (totals, averages) | 🟡 Not Started |
| PATCH | `/properties/:id/investment-company` | Link/unlink property to/from investment company | 🟡 Not Started |

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10) - Items per page
- `search` (string, optional) - Search query for name/registrationNumber/country

**Authentication:**
- All endpoints require JWT authentication
- All endpoints enforce account-level multi-tenancy

---

### Frontend Components

**Main Components:**
- `InvestmentCompanyList` (`apps/frontend/src/components/investment-companies/InvestmentCompanyList.tsx`)
  - Displays investment companies in DataGrid
  - Handles pagination, search, CRUD operations
  - RTL layout support
  - Column reordering enabled
  - Shows property count per company

- `InvestmentCompanyForm` (`apps/frontend/src/components/investment-companies/InvestmentCompanyForm.tsx`)
  - Create/Edit form dialog
  - React Hook Form with Zod validation
  - Hebrew error messages
  - RTL layout support
  - Fields: name, registrationNumber, country, investmentAmount, ownershipPercentage, notes
  - Currency input for investmentAmount
  - Percentage input for ownershipPercentage

- `InvestmentCompanyDetailsPage` (`apps/frontend/src/app/investment-companies/[id]/page.tsx`) - Optional
  - Full company details view
  - Properties linked to this company
  - Holdings summary (totals, averages)
  - Edit and delete actions

- `PropertyInvestmentCompanySelector` (`apps/frontend/src/components/properties/PropertyInvestmentCompanySelector.tsx`)
  - Dropdown/select component for linking property to investment company
  - Shows current linked company
  - Option to clear/unlink
  - Inline company creation option (following inline-entity-creation.mdc pattern)

- `CompanyPropertyPortfolio` (`apps/frontend/src/components/investment-companies/CompanyPropertyPortfolio.tsx`)
  - Displays properties linked to an investment company
  - Shows property details (address, file number, estimated value)
  - Calculates and displays total investment value
  - Supports pagination

- `CompanyHoldingsSummary` (`apps/frontend/src/components/investment-companies/CompanyHoldingsSummary.tsx`)
  - Displays holdings summary metrics
  - Total properties count
  - Total estimated value
  - Average property value
  - Investment amount and ownership percentage

**Service Layer:**
- `investmentCompaniesApi` (`apps/frontend/src/services/investmentCompanies.ts`)
  - API client functions for investment companies CRUD
  - React Query integration
  - TypeScript types
  - Holdings calculation functions

---

### Data Transfer Objects (DTOs)

**CreateInvestmentCompanyDto:**
- `name` (required, string)
- `registrationNumber` (optional, string)
- `country` (required, string, defaults to "Israel")
- `investmentAmount` (optional, number, positive, decimal precision 2)
- `ownershipPercentage` (optional, number, 0-100, decimal precision 2)
- `notes` (optional, string)

**UpdateInvestmentCompanyDto:**
- Same fields as CreateInvestmentCompanyDto, all optional except name and country

**InvestmentCompanyResponseDto:**
- All InvestmentCompany fields plus:
- `propertyCount` (number) - Count of properties linked to company
- `totalPropertyValue` (number, optional) - Sum of all linked properties' estimatedValue
- `averagePropertyValue` (number, optional) - Average estimatedValue of linked properties
- `createdAt` (ISO date string)
- `updatedAt` (ISO date string)

**CompanyHoldingsResponseDto:**
- `companyId` (UUID)
- `companyName` (string)
- `totalProperties` (number)
- `totalEstimatedValue` (number, optional)
- `averagePropertyValue` (number, optional)
- `investmentAmount` (number, optional)
- `ownershipPercentage` (number, optional)
- `properties` (PropertyResponseDto[]) - List of linked properties

**LinkPropertyToCompanyDto:**
- `investmentCompanyId` (optional, UUID) - Set to null to unlink property

---

### Validation Rules

**InvestmentCompany Validation:**
- `name` - Required, must be non-empty string, min length 1
- `registrationNumber` - Optional, string format
- `country` - Required, must be non-empty string, defaults to "Israel"
- `investmentAmount` - Optional, must be positive number if provided, decimal precision 2
- `ownershipPercentage` - Optional, must be number between 0 and 100 if provided, decimal precision 2
- `notes` - Optional, string format

**Business Rules:**
- Investment company cannot be deleted if it has linked properties
- Property can be linked to at most one investment company
- Property can be unlinked from company (set investmentCompanyId to null)
- Investment company deletion sets linked properties' investmentCompanyId to null (SetNull on delete)
- All operations are account-scoped (multi-tenancy)
- Investment company must belong to user's account
- Property must belong to user's account when linking

---

### Multi-Tenancy

**Account Isolation:**
- All investment company queries filter by `accountId`
- All property queries filter by `accountId` when checking company links
- Users can only see/modify investment companies belonging to their account
- Account ID is extracted from JWT token via `AccountGuard` and `AccountId` decorator

**Implementation:**
- Backend: `InvestmentCompaniesService` methods accept `accountId` parameter
- Backend: All Prisma queries include `where: { accountId }`
- Frontend: API calls automatically include account context via JWT token

---

### Holdings Calculation Logic

**Total Investment Value Calculation:**
```typescript
// Pseudo-code
async function calculateCompanyHoldings(
  companyId: string,
  accountId: string
): Promise<CompanyHoldingsResponse> {
  const company = await prisma.investmentCompany.findUnique({
    where: { id: companyId, accountId },
    include: {
      properties: {
        where: { accountId },
        select: {
          id: true,
          address: true,
          fileNumber: true,
          estimatedValue: true,
          type: true,
          status: true,
        }
      }
    }
  });
  
  if (!company) {
    throw new NotFoundException('Investment company not found');
  }
  
  const properties = company.properties;
  const totalProperties = properties.length;
  
  const propertiesWithValue = properties.filter(p => p.estimatedValue != null);
  const totalEstimatedValue = propertiesWithValue.reduce(
    (sum, p) => sum + Number(p.estimatedValue),
    0
  );
  
  const averagePropertyValue = totalProperties > 0 && propertiesWithValue.length > 0
    ? totalEstimatedValue / propertiesWithValue.length
    : null;
  
  return {
    companyId: company.id,
    companyName: company.name,
    totalProperties,
    totalEstimatedValue: totalEstimatedValue > 0 ? totalEstimatedValue : null,
    averagePropertyValue,
    investmentAmount: company.investmentAmount ? Number(company.investmentAmount) : null,
    ownershipPercentage: company.ownershipPercentage ? Number(company.ownershipPercentage) : null,
    properties: properties.map(p => ({
      ...p,
      estimatedValue: p.estimatedValue ? Number(p.estimatedValue) : null,
    })),
  };
}
```

**User Experience:**
- Holdings summary displayed on company details page
- Total value updates automatically when properties are linked/unlinked
- Total value updates when property estimated values change
- Metrics formatted with currency symbols and percentages
- Empty state shown if no properties are linked

---

### Inline Company Creation Pattern

**Implementation Pattern:**
Following the [inline-entity-creation.mdc](.cursor/rules/inline-entity-creation.mdc) rule:

1. **Dialog State:**
   ```typescript
   const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false);
   ```

2. **Company Form Schema:**
   ```typescript
   const companySchema = z.object({
     name: z.string().min(1, 'שם הוא שדה חובה'),
     registrationNumber: z.string().optional(),
     country: z.string().min(1, 'מדינה היא שדה חובה').default('Israel'),
     investmentAmount: z.number().positive('סכום השקעה חייב להיות חיובי').optional(),
     ownershipPercentage: z.number().min(0).max(100, 'אחוז בעלות חייב להיות בין 0 ל-100').optional(),
     notes: z.string().optional(),
   });
   ```

3. **Creation Mutation with Auto-Select:**
   ```typescript
   const createCompanyMutation = useMutation({
     mutationFn: (data: CompanyFormData) => investmentCompaniesApi.createCompany(data),
     onSuccess: (newCompany) => {
       queryClient.invalidateQueries({ queryKey: ['investment-companies'] });
       setCreateCompanyDialogOpen(false);
       companyForm.reset();
       
       // Auto-select newly created company
       propertyForm.setValue('investmentCompanyId', newCompany.id);
       
       setSnackbar({ 
         open: true, 
         message: 'חברת השקעה נוספה בהצלחה', 
         severity: 'success' 
       });
     },
   });
   ```

4. **Select Component with Create Option:**
   ```typescript
   <Select
     value={propertyForm.watch('investmentCompanyId') || ''}
     onChange={(e) => {
       const value = e.target.value;
       if (value === '__CREATE_NEW__') {
         setCreateCompanyDialogOpen(true);
       } else if (value === '__CLEAR__') {
         propertyForm.setValue('investmentCompanyId', null);
       } else {
         propertyForm.setValue('investmentCompanyId', value);
       }
     }}
     label="חברת השקעה"
   >
     <MenuItem value="">
       <em>ללא חברת השקעה</em>
     </MenuItem>
     {companies.map((company) => (
       <MenuItem key={company.id} value={company.id}>
         {company.name}
       </MenuItem>
     ))}
     
     <MenuItem 
       value="__CREATE_NEW__"
       sx={{ 
         color: 'primary.main', 
         fontWeight: 600,
         borderTop: companies.length > 0 ? 1 : 0,
         borderColor: 'divider',
       }}
     >
       + צור חברת השקעה חדשה
     </MenuItem>
   </Select>
   ```

---

### Performance Considerations

**Pagination:**
- Server-side pagination for investment companies list
- Default page size: 10 items
- Configurable page sizes: 10, 25, 50, 100
- Reduces initial load time for large company lists

**Search:**
- Server-side search implemented
- Searches name, registrationNumber, and country fields
- Case-insensitive search
- Debounced input to reduce API calls

**Indexing:**
- Database indexes on: `accountId`, `name` (investment_companies table)
- Database indexes on: `investmentCompanyId` (properties table)
- Optimizes query performance for filtering and account isolation

**Caching:**
- React Query used for client-side caching
- Cache invalidation on create/update/delete operations
- Reduces unnecessary API calls

**Holdings Calculation:**
- Calculation runs server-side for accuracy
- Results cached during company details page view
- Recalculation triggered when properties are linked/unlinked or values change

---

### Error Handling

**Backend Errors:**
- 400 Bad Request - Invalid input data
- 401 Unauthorized - Missing or invalid JWT token
- 403 Forbidden - Company/property belongs to different account
- 404 Not Found - Company/property doesn't exist
- 409 Conflict - Cannot delete company with linked properties
- 500 Internal Server Error - Server error

**Frontend Error Handling:**
- Error messages displayed in Snackbar component
- Hebrew error messages for user-friendly experience
- Form validation errors shown inline
- Loading states during API calls
- Holdings calculation errors handled gracefully

---

### Testing Considerations

**Unit Tests:**
- Investment company service methods
- DTO validation
- Holdings calculation logic
- Multi-tenancy enforcement

**Integration Tests:**
- API endpoint testing
- Database operations
- Multi-tenancy enforcement
- Property linking/unlinking end-to-end
- Holdings calculation end-to-end
- Inline company creation flow

**E2E Tests:**
- Create investment company flow
- Edit investment company flow
- Delete investment company flow
- Link property to company flow
- Unlink property from company flow
- View company holdings flow
- Search companies flow
- Inline company creation from property form

---

### Future Enhancements

**Planned Features:**
- [ ] Investment company documents/attachments
- [ ] Company financial reporting
- [ ] Bulk property linking to company
- [ ] Company performance analytics (ROI per company)
- [ ] Multi-company property ownership (future schema enhancement)
- [ ] Company hierarchy (parent/subsidiary relationships)
- [ ] Company contact information management
- [ ] Company registration document storage
- [ ] Advanced company analytics (holdings distribution charts)
- [ ] Export company portfolio report (PDF/Excel)

**Related Epics:**
- Epic 1: Property Management (depends on properties)
- Epic 5: Ownership & Partners Management (related to company ownership)
- Epic 8: Financial Tracking (may calculate per-company financials)

---

## Related Documentation

- [Database Schema](../../apps/backend/prisma/schema.prisma)
- [Inline Entity Creation Rule](../../.cursor/rules/inline-entity-creation.mdc)
- [DataGrid Column Standards](../../.cursor/rules/datagrid-columns.mdc)
- [Epics Overview](./EPICS_OVERVIEW.md)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0
