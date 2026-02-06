# Epic 5: Ownership & Partners Management

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started  
**Created:** February 2, 2026  
**Last Updated:** February 2, 2026

---

## Overview

Ownership & Partners Management enables property owners to manage the ownership structure of their properties, track individual owners and partners, and maintain accurate ownership records with percentages, types, and historical data. This epic provides comprehensive functionality for creating and managing owners (individuals, companies, partnerships), establishing property ownership relationships, tracking ownership percentages, managing ownership types, and ensuring ownership records are complete and accurate.

**Business Value:**
- Complete ownership structure tracking for properties
- Support for multiple ownership types (individual, company, partnership)
- Accurate ownership percentage management with validation
- Historical ownership tracking with start/end dates
- Foundation for financial calculations and reporting
- Legal compliance with ownership documentation
- Support for complex ownership structures (partial ownership, partnerships, company holdings)

---

## User Stories

### US5.1: Create Owner
**As a** property owner,  
**I can** create a new owner record with basic information (name, type),  
**So that** I can track who owns my properties.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US5.2: Add Owner Details
**As a** property owner,  
**I can** add comprehensive owner details including name, ID number, type (Individual/Company/Partnership), email, phone, address, and notes,  
**So that** I have complete contact and identification information for each owner.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US5.3: View Owners List
**As a** property owner,  
**I can** view a paginated list of all owners with key information (name, type, email, phone, property count),  
**So that** I can quickly browse and manage all owners in my portfolio.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US5.4: Search Owners
**As a** property owner,  
**I can** search owners by name, ID number, email, or phone,  
**So that** I can quickly find specific owners in my portfolio.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

### US5.5: Edit Owner Information
**As a** property owner,  
**I can** edit any owner information including name, ID number, type, contact details, address, and notes,  
**So that** I can keep owner information up to date.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US5.6: Delete Owner
**As a** property owner,  
**I can** delete an owner that has no associated property ownership records,  
**So that** I can remove owners that are no longer relevant to my portfolio.

**Priority:** 🟡 Medium  
**Status:** 🟡 Not Started

---

### US5.7: Create Property Ownership Record
**As a** property owner,  
**I can** create a property ownership record linking an owner to a property with ownership percentage, ownership type, start date, and optional end date,  
**So that** I can track who owns each property and their share.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US5.8: Set Ownership Percentage and Type
**As a** property owner,  
**I can** set the ownership percentage (0-100%) and ownership type (Full/Partial/Partnership/Company) for each property ownership record,  
**So that** I can accurately represent the ownership structure of each property.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US5.9: Validate Total Ownership Percentage
**As a** property owner,  
**I can** see validation that ensures the total ownership percentage for a property equals 100%,  
**So that** I can maintain accurate ownership records without gaps or overlaps.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

---

### US5.10: View Ownership History Per Property
**As a** property owner,  
**I can** view the complete ownership history for a property including all owners, their percentages, ownership types, and date ranges (start/end dates),  
**So that** I can track how ownership has changed over time.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

### US5.11: Inline Owner Creation from Ownership Form
**As a** property owner,  
**I can** create a new owner directly from the property ownership form without navigating away,  
**So that** I can quickly add owners while setting up property ownership without losing context.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

### US5.12: View Owner's Properties
**As a** property owner,  
**I can** view all properties owned by a specific owner with their ownership percentages and types,  
**So that** I can see the complete portfolio for each owner.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

---

## Acceptance Criteria

### US5.1: Create Owner
- [ ] User can access "Create Owner" button/action
- [ ] Form includes required fields: name, type (OwnerType enum)
- [ ] Form includes optional fields: idNumber, email, phone, address, notes
- [ ] Form validates that name is not empty
- [ ] Form validates that type is a valid OwnerType (INDIVIDUAL, COMPANY, PARTNERSHIP)
- [ ] Success message displayed after creation
- [ ] Owner appears in owners list after creation
- [ ] Owner is associated with user's account (multi-tenancy)
- [ ] Created owner has timestamps (createdAt, updatedAt)

---

### US5.2: Add Owner Details
- [ ] Form includes name text field (required)
- [ ] Form includes ID number text field (optional)
- [ ] Form includes type dropdown: INDIVIDUAL, COMPANY, PARTNERSHIP (required)
- [ ] Form includes email text field (optional, validated as email format)
- [ ] Form includes phone text field (optional)
- [ ] Form includes address textarea field (optional)
- [ ] Form includes notes textarea field (optional)
- [ ] All fields are saved correctly to database
- [ ] Email validation shows error for invalid format
- [ ] Form supports Hebrew text input

---

### US5.3: View Owners List
- [ ] Owners list displays in a DataGrid component
- [ ] List shows: name, type, email, phone, property count, creation date
- [ ] List supports server-side pagination
- [ ] Default page size is 10
- [ ] User can change page size (10, 25, 50, 100)
- [ ] User can navigate between pages
- [ ] List shows total count of owners
- [ ] Name column is clickable and navigates to owner details (if implemented)
- [ ] List has RTL (right-to-left) layout for Hebrew
- [ ] Columns can be reordered by dragging
- [ ] List shows loading state while fetching data
- [ ] List shows error state if fetch fails
- [ ] Property count shows number of properties owned by each owner

---

### US5.4: Search Owners
- [ ] Search input field is available above owners list
- [ ] Search queries name, idNumber, email, and phone fields
- [ ] Search is debounced (waits for user to stop typing)
- [ ] Search results update automatically
- [ ] Search works with pagination
- [ ] Search is case-insensitive
- [ ] Empty search shows all owners
- [ ] Search state persists during navigation

---

### US5.5: Edit Owner Information
- [ ] Edit button available on owner details page (if implemented)
- [ ] Edit button available in owners list actions
- [ ] Edit form pre-populates with existing owner data
- [ ] Form includes all owner fields
- [ ] Form validates input (same as create form)
- [ ] Success message displayed after update
- [ ] Updated data appears immediately in owner details (if implemented)
- [ ] Updated data appears in owners list after refresh
- [ ] Update operation enforces multi-tenancy
- [ ] Update operation validates owner exists and belongs to user

---

### US5.6: Delete Owner
- [ ] Delete button available in owners list actions
- [ ] Delete button available on owner details page (if implemented)
- [ ] Confirmation dialog shown before deletion
- [ ] Deletion fails if owner has associated property ownership records
- [ ] Error message shown if deletion fails due to ownership records
- [ ] Success message shown after successful deletion
- [ ] Owner removed from list after deletion
- [ ] User redirected to owners list after deletion
- [ ] Delete operation enforces multi-tenancy
- [ ] Delete operation validates owner exists and belongs to user

---

### US5.7: Create Property Ownership Record
- [ ] Create ownership button available on property details page
- [ ] Form includes owner dropdown/selector (required)
- [ ] Form includes ownership percentage numeric field (required, 0-100)
- [ ] Form includes ownership type dropdown: FULL, PARTIAL, PARTNERSHIP, COMPANY (required)
- [ ] Form includes start date date picker (required)
- [ ] Form includes end date date picker (optional)
- [ ] Form includes notes textarea field (optional)
- [ ] Form validates that owner is selected
- [ ] Form validates that ownership percentage is between 0 and 100
- [ ] Form validates that start date is not in the future (or allow future dates based on business rules)
- [ ] Form validates that end date is after start date (if provided)
- [ ] Success message displayed after creation
- [ ] Ownership record appears in property ownership history
- [ ] Ownership record is associated with user's account (multi-tenancy)
- [ ] Ownership percentage validation runs (total must equal 100%)

---

### US5.8: Set Ownership Percentage and Type
- [ ] Ownership percentage field accepts decimal values (0.00 to 100.00)
- [ ] Ownership percentage field shows validation error if value is outside range
- [ ] Ownership type dropdown shows all options: FULL, PARTIAL, PARTNERSHIP, COMPANY
- [ ] Ownership type selection is required
- [ ] Values are saved correctly to database
- [ ] Decimal precision is maintained (2 decimal places)
- [ ] Form shows percentage symbol (%) for clarity
- [ ] Ownership type is displayed in Hebrew labels

---

### US5.9: Validate Total Ownership Percentage
- [ ] System calculates sum of all ownership percentages for a property
- [ ] Validation runs when creating new ownership record
- [ ] Validation runs when updating existing ownership record
- [ ] Validation runs when deleting ownership record
- [ ] Error message displayed if total ownership percentage does not equal 100%
- [ ] Error message shows current total (e.g., "Total ownership is 85%. Must equal 100%")
- [ ] Warning message displayed if total ownership percentage exceeds 100%
- [ ] Success message displayed when total equals exactly 100%
- [ ] Validation prevents saving if total does not equal 100% (or allows with warning based on business rules)
- [ ] Validation considers only active ownership records (endDate is null or in the future)

---

### US5.10: View Ownership History Per Property
- [ ] Ownership history section available on property details page
- [ ] History displays all ownership records for the property
- [ ] Each record shows: owner name, ownership percentage, ownership type, start date, end date (if applicable)
- [ ] Records are sorted by start date (newest first or oldest first based on UX preference)
- [ ] Active ownership records are highlighted (endDate is null or in the future)
- [ ] Historical ownership records are shown with end dates
- [ ] History shows total ownership percentage for active records
- [ ] History shows visual indicator if total does not equal 100%
- [ ] User can click on owner name to view owner details (if implemented)
- [ ] History supports pagination if many records exist

---

### US5.11: Inline Owner Creation from Ownership Form
- [ ] Ownership form includes "+ Create New Owner" option in owner dropdown
- [ ] Clicking create option opens owner creation dialog
- [ ] Dialog is modal overlay (doesn't navigate away from ownership form)
- [ ] Dialog includes all owner fields (name, type, idNumber, email, phone, address, notes)
- [ ] Dialog validates owner data before creation
- [ ] After successful creation, new owner is automatically selected in ownership form
- [ ] Owner list is refreshed to include newly created owner
- [ ] Dialog closes automatically after successful creation
- [ ] User can cancel dialog without creating owner
- [ ] Form context is preserved (other fields remain filled)

---

### US5.12: View Owner's Properties
- [ ] Owner details page (if implemented) shows properties section
- [ ] Properties list shows: property address, ownership percentage, ownership type, start date, end date
- [ ] List supports pagination if owner has many properties
- [ ] Property address is clickable and navigates to property details
- [ ] List shows total number of properties owned
- [ ] List shows total ownership percentage across all properties (if applicable)
- [ ] List filters to show only active ownerships (or includes historical based on filter)
- [ ] List has RTL layout for Hebrew

---

## Implementation Notes

### Database Tables

**Primary Tables:**
- `owners` - Owner records with name, idNumber, type, contact info
- `property_ownerships` - Ownership relationships between owners and properties

**Related Tables:**
- `properties` - Properties that can have ownership records (many-to-many via PropertyOwnership)
- `accounts` - Account-level isolation (multi-tenancy)

**Enums:**
- `OwnerType`: INDIVIDUAL (יחיד), COMPANY (חברה), PARTNERSHIP (שותפות)
- `OwnershipType`: FULL (בעלות מלאה), PARTIAL (בעלות חלקית), PARTNERSHIP (שותפות), COMPANY (חברה)

**Database Schema Details:**

```prisma
model Owner {
  id           String   @id @default(uuid())
  accountId    String   @map("account_id")
  name         String
  idNumber     String?  @map("id_number")
  type         OwnerType
  email        String?
  phone        String?
  address      String?
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  account      Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  ownerships   PropertyOwnership[]
  
  @@index([accountId])
  @@index([name])
  @@map("owners")
}

model PropertyOwnership {
  id            String   @id @default(uuid())
  propertyId    String   @map("property_id")
  ownerId       String   @map("owner_id")
  accountId     String   @map("account_id")
  
  ownershipPercentage Decimal @map("ownership_percentage") @db.Decimal(5, 2)
  ownershipType       OwnershipType @map("ownership_type")
  startDate     DateTime @map("start_date")
  endDate       DateTime? @map("end_date")
  notes         String?
  
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  property      Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  owner         Owner    @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  
  @@index([propertyId])
  @@index([ownerId])
  @@index([accountId])
  @@map("property_ownerships")
}
```

---

### API Endpoints

**Base Path:** `/api/owners` and `/api/properties/:id/ownerships`

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/owners` | Get paginated list of owners with search | 🟡 Not Started |
| GET | `/owners/:id` | Get single owner by ID | 🟡 Not Started |
| POST | `/owners` | Create new owner | 🟡 Not Started |
| PATCH | `/owners/:id` | Update owner | 🟡 Not Started |
| DELETE | `/owners/:id` | Delete owner | 🟡 Not Started |
| GET | `/properties/:id/ownerships` | Get ownership records for a property | 🟡 Not Started |
| POST | `/properties/:id/ownerships` | Create property ownership record | 🟡 Not Started |
| PATCH | `/properties/:id/ownerships/:ownershipId` | Update ownership record | 🟡 Not Started |
| DELETE | `/properties/:id/ownerships/:ownershipId` | Delete ownership record | 🟡 Not Started |
| GET | `/owners/:id/properties` | Get properties owned by an owner | 🟡 Not Started |
| POST | `/properties/:id/ownerships/validate` | Validate total ownership percentage | 🟡 Not Started |

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10) - Items per page
- `search` (string, optional) - Search query for name/idNumber/email/phone

**Authentication:**
- All endpoints require JWT authentication
- All endpoints enforce account-level multi-tenancy

---

### Frontend Components

**Main Components:**
- `OwnerList` (`apps/frontend/src/components/owners/OwnerList.tsx`)
  - Displays owners in DataGrid
  - Handles pagination, search, CRUD operations
  - RTL layout support
  - Column reordering enabled

- `OwnerForm` (`apps/frontend/src/components/owners/OwnerForm.tsx`)
  - Create/Edit form dialog
  - React Hook Form with Zod validation
  - Hebrew error messages
  - RTL layout support
  - OwnerType dropdown (INDIVIDUAL, COMPANY, PARTNERSHIP)

- `PropertyOwnershipForm` (`apps/frontend/src/components/properties/PropertyOwnershipForm.tsx`)
  - Create/Edit ownership record form
  - Owner selector with inline creation option
  - Ownership percentage input with validation
  - OwnershipType dropdown (FULL, PARTIAL, PARTNERSHIP, COMPANY)
  - Date pickers for start/end dates
  - Total ownership percentage validation display

- `PropertyOwnershipHistory` (`apps/frontend/src/components/properties/PropertyOwnershipHistory.tsx`)
  - Displays ownership history for a property
  - Shows active and historical ownership records
  - Visual indicators for ownership status
  - Total ownership percentage display

- `OwnerDetailsPage` (`apps/frontend/src/app/owners/[id]/page.tsx`) - Optional
  - Full owner details view
  - Properties owned by this owner
  - Edit and delete actions

**Service Layer:**
- `ownersApi` (`apps/frontend/src/services/owners.ts`)
  - API client functions for owners CRUD
  - React Query integration
  - TypeScript types

- `propertyOwnershipsApi` (`apps/frontend/src/services/propertyOwnerships.ts`)
  - API client functions for ownership records
  - React Query integration
  - Ownership validation functions
  - TypeScript types

---

### Data Transfer Objects (DTOs)

**CreateOwnerDto:**
- `name` (required, string)
- `type` (required, OwnerType enum: INDIVIDUAL, COMPANY, PARTNERSHIP)
- `idNumber` (optional, string)
- `email` (optional, string, validated as email format)
- `phone` (optional, string)
- `address` (optional, string)
- `notes` (optional, string)

**UpdateOwnerDto:**
- Same fields as CreateOwnerDto, all optional except name and type

**OwnerResponseDto:**
- All Owner fields plus:
- `propertyCount` (number) - Count of properties owned
- `createdAt` (ISO date string)
- `updatedAt` (ISO date string)

**CreatePropertyOwnershipDto:**
- `ownerId` (required, UUID)
- `ownershipPercentage` (required, number, 0-100, decimal precision 2)
- `ownershipType` (required, OwnershipType enum: FULL, PARTIAL, PARTNERSHIP, COMPANY)
- `startDate` (required, ISO date string)
- `endDate` (optional, ISO date string, must be after startDate)
- `notes` (optional, string)

**UpdatePropertyOwnershipDto:**
- Same fields as CreatePropertyOwnershipDto, all optional

**PropertyOwnershipResponseDto:**
- All PropertyOwnership fields plus:
- `owner` (OwnerResponseDto) - Full owner details
- `property` (PropertyResponseDto) - Basic property details (address, fileNumber)
- `createdAt` (ISO date string)
- `updatedAt` (ISO date string)

**OwnershipValidationResponseDto:**
- `isValid` (boolean) - Whether total ownership equals 100%
- `totalPercentage` (number) - Current total ownership percentage
- `requiredPercentage` (number) - Always 100
- `message` (string) - Validation message in Hebrew

---

### Validation Rules

**Owner Validation:**
- `name` - Required, must be non-empty string, min length 1
- `type` - Required, must be valid OwnerType enum value
- `idNumber` - Optional, string format
- `email` - Optional, must be valid email format if provided
- `phone` - Optional, string format
- `address` - Optional, string format
- `notes` - Optional, string format

**PropertyOwnership Validation:**
- `ownerId` - Required, must be valid UUID, owner must exist and belong to user's account
- `ownershipPercentage` - Required, must be number between 0 and 100, decimal precision 2
- `ownershipType` - Required, must be valid OwnershipType enum value
- `startDate` - Required, must be valid ISO date string
- `endDate` - Optional, must be valid ISO date string, must be after startDate if provided
- `notes` - Optional, string format

**Business Rules:**
- Owner cannot be deleted if it has associated property ownership records
- Total ownership percentage for a property must equal 100% (validation runs on create/update/delete)
- Ownership records are account-scoped (multi-tenancy)
- Owner must belong to user's account
- Property must belong to user's account
- Only one active ownership record per owner-property pair (endDate is null or in the future)
- Ownership percentage cannot exceed 100% for a single record
- Ownership percentage cannot be negative

---

### Multi-Tenancy

**Account Isolation:**
- All owner queries filter by `accountId`
- All property ownership queries filter by `accountId`
- Users can only see/modify owners and ownership records belonging to their account
- Account ID is extracted from JWT token via `AccountGuard` and `AccountId` decorator

**Implementation:**
- Backend: `OwnersService` methods accept `accountId` parameter
- Backend: `PropertyOwnershipsService` methods accept `accountId` parameter
- Backend: All Prisma queries include `where: { accountId }`
- Frontend: API calls automatically include account context via JWT token

---

### Ownership Percentage Validation Logic

**Validation Rules:**
1. Calculate sum of all active ownership percentages for a property
2. Active ownership = `endDate` is null OR `endDate` is in the future
3. Total must equal exactly 100.00%
4. Validation runs on:
   - Creating new ownership record
   - Updating existing ownership record (recalculate total)
   - Deleting ownership record (recalculate remaining total)

**Validation Implementation:**
```typescript
// Pseudo-code
async function validateOwnershipPercentage(
  propertyId: string,
  accountId: string,
  excludeOwnershipId?: string
): Promise<OwnershipValidationResponse> {
  const activeOwnerships = await prisma.propertyOwnership.findMany({
    where: {
      propertyId,
      accountId,
      id: excludeOwnershipId ? { not: excludeOwnershipId } : undefined,
      OR: [
        { endDate: null },
        { endDate: { gt: new Date() } }
      ]
    }
  });
  
  const totalPercentage = activeOwnerships.reduce(
    (sum, ownership) => sum + Number(ownership.ownershipPercentage),
    0
  );
  
  return {
    isValid: totalPercentage === 100,
    totalPercentage,
    requiredPercentage: 100,
    message: totalPercentage === 100
      ? 'בעלות תקינה (100%)'
      : `סך הכל בעלות: ${totalPercentage}%. נדרש: 100%`
  };
}
```

**User Experience:**
- Real-time validation as user enters ownership percentage
- Visual indicator showing current total (e.g., "85% / 100%")
- Error message if total does not equal 100%
- Warning if total exceeds 100%
- Success indicator when total equals 100%

---

### Inline Owner Creation Pattern

**Implementation Pattern:**
Following the [inline-entity-creation.mdc](.cursor/rules/inline-entity-creation.mdc) rule:

1. **Dialog State:**
   ```typescript
   const [createOwnerDialogOpen, setCreateOwnerDialogOpen] = useState(false);
   ```

2. **Owner Form Schema:**
   ```typescript
   const ownerSchema = z.object({
     name: z.string().min(1, 'שם הוא שדה חובה'),
     type: z.nativeEnum(OwnerType),
     idNumber: z.string().optional(),
     email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
     phone: z.string().optional(),
     address: z.string().optional(),
     notes: z.string().optional(),
   });
   ```

3. **Creation Mutation with Auto-Select:**
   ```typescript
   const createOwnerMutation = useMutation({
     mutationFn: (data: OwnerFormData) => ownersApi.createOwner(data),
     onSuccess: (newOwner) => {
       queryClient.invalidateQueries({ queryKey: ['owners'] });
       setCreateOwnerDialogOpen(false);
       ownerForm.reset();
       
       // Auto-select newly created owner
       ownershipForm.setValue('ownerId', newOwner.id);
       
       setSnackbar({ 
         open: true, 
         message: 'בעלים נוסף בהצלחה', 
         severity: 'success' 
       });
     },
   });
   ```

4. **Select Component with Create Option:**
   ```typescript
   <Select
     value={ownershipForm.watch('ownerId')}
     onChange={(e) => {
       const value = e.target.value;
       if (value === '__CREATE_NEW__') {
         setCreateOwnerDialogOpen(true);
       } else {
         ownershipForm.setValue('ownerId', value);
       }
     }}
     label="בעלים"
   >
     {owners.map((owner) => (
       <MenuItem key={owner.id} value={owner.id}>
         {owner.name}
       </MenuItem>
     ))}
     
     <MenuItem 
       value="__CREATE_NEW__"
       sx={{ 
         color: 'primary.main', 
         fontWeight: 600,
         borderTop: owners.length > 0 ? 1 : 0,
         borderColor: 'divider',
       }}
     >
       + צור בעלים חדש
     </MenuItem>
   </Select>
   ```

---

### Performance Considerations

**Pagination:**
- Server-side pagination for owners list
- Default page size: 10 items
- Configurable page sizes: 10, 25, 50, 100
- Reduces initial load time for large owner lists

**Search:**
- Server-side search implemented
- Searches name, idNumber, email, and phone fields
- Case-insensitive search
- Debounced input to reduce API calls

**Indexing:**
- Database indexes on: `accountId`, `name` (owners table)
- Database indexes on: `propertyId`, `ownerId`, `accountId` (property_ownerships table)
- Optimizes query performance for filtering and account isolation

**Caching:**
- React Query used for client-side caching
- Cache invalidation on create/update/delete operations
- Reduces unnecessary API calls

**Ownership Validation:**
- Validation runs server-side for accuracy
- Client-side validation for immediate feedback
- Validation cached during form editing to reduce API calls

---

### Error Handling

**Backend Errors:**
- 400 Bad Request - Invalid input data, ownership percentage validation failed
- 401 Unauthorized - Missing or invalid JWT token
- 403 Forbidden - Owner/ownership belongs to different account
- 404 Not Found - Owner/ownership doesn't exist
- 409 Conflict - Ownership percentage total does not equal 100%
- 500 Internal Server Error - Server error

**Frontend Error Handling:**
- Error messages displayed in Snackbar component
- Hebrew error messages for user-friendly experience
- Form validation errors shown inline
- Loading states during API calls
- Ownership percentage validation shown in real-time

---

### Testing Considerations

**Unit Tests:**
- Owner service methods
- Property ownership service methods
- DTO validation
- Ownership percentage calculation logic
- Ownership validation logic

**Integration Tests:**
- API endpoint testing
- Database operations
- Multi-tenancy enforcement
- Ownership percentage validation end-to-end
- Inline owner creation flow

**E2E Tests:**
- Create owner flow
- Edit owner flow
- Delete owner flow
- Create property ownership flow
- Ownership percentage validation flow
- Inline owner creation from ownership form
- Search owners flow
- View ownership history flow

---

### Future Enhancements

**Planned Features:**
- [ ] Owner documents/attachments
- [ ] Owner contact history
- [ ] Bulk ownership import from CSV
- [ ] Ownership transfer workflow
- [ ] Ownership percentage change history
- [ ] Owner relationship mapping (family members, business partners)
- [ ] Owner financial information (for tax reporting)
- [ ] Owner communication preferences
- [ ] Ownership agreement documents storage
- [ ] Advanced ownership analytics (ownership distribution charts)

**Related Epics:**
- Epic 1: Property Management (depends on properties)
- Epic 6: Mortgage Management (may reference owners)
- Epic 8: Financial Tracking (may calculate per-owner financials)
- Epic 9: Investment Company Management (related to company ownership)

---

## Related Documentation

- [Database Schema](../../apps/backend/prisma/schema.prisma)
- [Inline Entity Creation Rule](../../.cursor/rules/inline-entity-creation.mdc)
- [DataGrid Column Standards](../../.cursor/rules/datagrid-columns.mdc)
- [Epics Overview](./EPICS_OVERVIEW.md)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0
