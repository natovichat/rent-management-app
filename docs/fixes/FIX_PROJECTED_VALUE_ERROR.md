# Fix: Property projectedValue Validation Error

**Date:** February 6, 2026  
**Issue:** Error when editing properties: "property projectedValue should not exist"  
**Status:** ✅ FIXED

---

## Problem Description

When users tried to edit a property in the application, they received a validation error:

```
property projectedValue should not exist
```

This error occurred because:

1. **Frontend** had `projectedValue` and `rentalIncome` fields in the Property form
2. **Backend DTO** did NOT have these fields defined
3. **Database schema** did NOT have these columns

When the form submitted data with these fields, the backend's class-validator rejected them as "unknown properties."

---

## Root Cause Analysis

The issue was a **schema mismatch** between frontend and backend:

### Frontend (Property Form)
```typescript
// apps/frontend/src/components/properties/PropertyForm.tsx
{
  rentalIncome: z.number().min(0).optional(),
  projectedValue: z.number().positive().optional(),
}

// UI Fields existed:
<TextField label="הכנסה משכירות (₪)" {...register('rentalIncome')} />
<TextField label="שווי צפוי (₪)" {...register('projectedValue')} />
```

### Backend (Before Fix)
```typescript
// apps/backend/src/modules/properties/dto/create-property.dto.ts
// ❌ NO rentalIncome field
// ❌ NO projectedValue field

// Prisma Schema
// ❌ NO rental_income column
// ❌ NO projected_value column
```

---

## Solution Implemented

### 1. Updated Prisma Schema

Added two new columns to the `Property` model:

```prisma
model Property {
  // ... existing fields ...
  
  // Financial
  acquisitionPrice Decimal? @map("acquisition_price") @db.Decimal(12, 2)
  acquisitionDate DateTime? @map("acquisition_date")
  acquisitionMethod AcquisitionMethod? @map("acquisition_method")
  rentalIncome Decimal? @map("rental_income") @db.Decimal(10, 2)      // ✅ ADDED
  projectedValue Decimal? @map("projected_value") @db.Decimal(12, 2)  // ✅ ADDED
}
```

### 2. Updated Backend DTO

Added field definitions with validation:

```typescript
// apps/backend/src/modules/properties/dto/create-property.dto.ts

@ApiProperty({
  description: 'הכנסה משכירות (₪ לחודש)',
  example: 5000,
  required: false,
})
@IsOptional()
@IsNumber()
@Min(0)
@Type(() => Number)
rentalIncome?: number;

@ApiProperty({
  description: 'שווי צפוי (₪)',
  example: 3000000,
  required: false,
})
@IsOptional()
@IsNumber()
@IsPositive()
@Type(() => Number)
projectedValue?: number;
```

### 3. Created Database Migration

```bash
cd apps/backend
npx prisma migrate dev --name add_rental_income_and_projected_value
```

Migration file created:
```
migrations/20260206123647_add_rental_income_and_projected_value/migration.sql
```

---

## Testing & Verification

### Automated Tests

**Test Script:** `/scripts/test-projected-value-fix.ts`

Test results:
```
✅ Property created successfully with rentalIncome and projectedValue
✅ Property updated successfully with new values
✅ Property retrieved with correct data
```

### Manual API Tests

**Create Property:**
```bash
curl -X POST http://localhost:3001/properties \
  -H "x-account-id: test-account-1" \
  -d '{
    "address": "בדיקה סופית 789",
    "rentalIncome": 5000,
    "projectedValue": 3000000
  }'

# Result: ✅ SUCCESS
```

**Update Property:**
```bash
curl -X PATCH http://localhost:3001/properties/{id} \
  -H "x-account-id: test-account-1" \
  -d '{
    "rentalIncome": 8000,
    "projectedValue": 3500000
  }'

# Result: ✅ SUCCESS
```

### TypeScript Build Verification
```bash
cd apps/backend && npm run build
# Result: ✅ No errors
```

---

## Files Modified

1. **Prisma Schema**
   - `apps/backend/prisma/schema.prisma`
   - Added: `rentalIncome` and `projectedValue` columns

2. **Backend DTO**
   - `apps/backend/src/modules/properties/dto/create-property.dto.ts`
   - Added: Field definitions with validation

3. **Database Migration**
   - Created: `migrations/20260206123647_add_rental_income_and_projected_value/`

4. **Test Script**
   - Created: `scripts/test-projected-value-fix.ts`

---

## Migration Applied

```sql
-- AlterTable
ALTER TABLE "properties" ADD COLUMN "rental_income" DECIMAL(10,2),
ADD COLUMN "projected_value" DECIMAL(12,2);
```

Database changes:
- ✅ Applied to development database
- ✅ Schema synchronized
- ✅ Prisma Client regenerated

---

## User Impact

### Before Fix
- ❌ Editing properties showed validation error
- ❌ Could not save properties with rental income or projected value
- ❌ Form fields visible but non-functional

### After Fix
- ✅ Can create properties with rental income
- ✅ Can create properties with projected value
- ✅ Can update existing properties with these fields
- ✅ Form fields work correctly
- ✅ Data persists to database

---

## Next Steps for Users

### In Test Account

1. **Navigate to Properties** → http://localhost:3000/properties
2. **Switch to "test" account** (if not already)
3. **Create a new property** with:
   - הכנסה משכירות (Rental Income): 5000
   - שווי צפוי (Projected Value): 2500000
4. **Edit the property** and change values
5. **Verify** no errors occur

### In Real Account (משפחת נטוביץ)

After confirming fix works in test account:

1. Can now update existing properties with rental income data
2. Can set projected values for investment properties
3. All financial tracking fields now work correctly

---

## Technical Details

### Field Types

- **rentalIncome**: `Decimal(10,2)` - Monthly rental income in ₪
- **projectedValue**: `Decimal(12,2)` - Projected property value in ₪

### Validation Rules

- **rentalIncome**: Optional, must be ≥ 0
- **projectedValue**: Optional, must be > 0

### API Responses

Fields are returned as strings in JSON (Prisma Decimal → string):
```json
{
  "rentalIncome": "5000.00",
  "projectedValue": "3000000.00"
}
```

---

## Lessons Learned

### Prevention Measures

1. **Keep schemas in sync**: Frontend types should match backend DTOs
2. **Validate early**: Check backend DTOs when adding form fields
3. **Test end-to-end**: Verify create AND update operations
4. **Use TypeScript**: Strong typing helps catch mismatches

### Best Practices

- ✅ Always add DTO validation when adding DB columns
- ✅ Always update frontend types when changing backend
- ✅ Always test in non-production account first
- ✅ Always create migration scripts for schema changes

---

## Status Summary

```
🟢 Backend Schema: UPDATED
🟢 Backend DTO: UPDATED
🟢 Database Migration: APPLIED
🟢 Automated Tests: PASSING
🟢 Manual Tests: PASSING
🟢 TypeScript Build: PASSING
```

**Issue Resolution:** ✅ COMPLETE

Users can now edit properties without "projectedValue should not exist" errors.

---

**Fixed by:** AI Assistant  
**Verified in:** test-account-1  
**Production Ready:** ✅ YES
