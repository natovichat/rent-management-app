# US1.10 - Phase 1: API Contract Review

**Date:** 2026-02-05  
**User Story:** US1.10 - Edit Property Information  
**Phase:** 1 - API Contract Review

## Summary

The backend API contract for `PATCH /properties/:id` is **already implemented** and meets all requirements for US1.10. This phase reviews the existing contract to ensure it supports all edit functionality requirements.

## API Endpoint Review

### Endpoint: `PATCH /properties/:id`

**Location:** `apps/backend/src/modules/properties/properties.controller.ts:195-216`

**Method:** PATCH  
**Path:** `/properties/:id`  
**Summary:** עדכון נכס (Update Property)

### Request

**Path Parameters:**
- `id` (string, required): Property ID

**Headers:**
- `X-Account-Id` (string, optional): Account ID for multi-tenancy
  - Priority: Header > DTO > Hardcoded test account

**Body:** `UpdatePropertyDto` (extends `PartialType(CreatePropertyDto)`)
- All fields from `CreatePropertyDto` are optional
- Supports partial updates (only send fields to update)
- Account isolation: `accountId` extracted from header/DTO and passed separately to service

**Request DTO Structure:**
```typescript
UpdatePropertyDto extends PartialType(CreatePropertyDto)
// All 50+ property fields are optional:
- address?: string
- fileNumber?: string
- type?: PropertyType
- status?: PropertyStatus
- totalArea?: number
- landArea?: number
- // ... all other fields optional
```

### Response

**Success (200 OK):**
- Returns `PropertyResponseDto` with updated property data
- Includes `unitCount` field
- Includes all related data (units, ownerships, mortgages, etc.)

**Error Responses:**
- `404 Not Found`: Property not found or doesn't belong to account
- `400 Bad Request`: Validation errors or business rule violations
- `403 Forbidden`: Ownership verification failed

### Business Rules Validation

**Service:** `apps/backend/src/modules/properties/properties.service.ts:301-366`

**Validations Performed:**
1. **Ownership Verification:** `verifyOwnership(id, accountId)` ensures property belongs to account
2. **Business Rules:** `validateBusinessRules(updateDto)` validates:
   - Acquisition date ≤ Sale date (if both provided)
   - Land area ≤ Total area (if both provided)
3. **Combined Validation:** Validates against existing property values:
   - If updating `acquisitionDate` or `saleDate`, validates against existing values
   - If updating `landArea` or `totalArea`, validates against existing values

### Multi-Tenancy Support

✅ **Account Isolation:** Fully implemented
- `accountId` extracted from `X-Account-Id` header (priority 1)
- Falls back to DTO `accountId` (priority 2)
- Falls back to hardcoded test account (priority 3)
- Service verifies ownership before update
- Returns 404 if property doesn't belong to account

### Frontend Integration

**API Service:** `apps/frontend/src/services/properties.ts`

```typescript
update: async (
  id: string,
  data: Partial<CreatePropertyDto>,
): Promise<Property> => {
  // accountId is automatically added by API interceptor
  const response = await api.patch(`/properties/${id}`, data);
  return response.data;
}
```

✅ **Account ID Handling:** Automatic via API interceptor (no manual `accountId` needed)

## API Contract Compliance

### ✅ Requirements Met

1. **Partial Updates:** ✅ `UpdatePropertyDto` extends `PartialType(CreatePropertyDto)`
2. **All Fields Editable:** ✅ All 50+ property fields can be updated
3. **Validation:** ✅ Business rules and field validations enforced
4. **Account Isolation:** ✅ Multi-tenancy fully supported
5. **Error Handling:** ✅ Proper HTTP status codes and error messages
6. **Response Format:** ✅ Returns complete property object with related data

### ✅ Frontend Support

1. **PropertyForm Component:** ✅ Already supports edit mode
   - `property` prop triggers edit mode (`isEdit = !!property`)
   - Pre-populates form with existing property data
   - Calls `propertiesApi.update()` when `isEdit === true`
   - Handles success/error notifications

2. **Edit Triggers:** ✅ Multiple entry points exist
   - Property details page: Edit button opens dialog
   - Property list: Edit action in DataGrid
   - PropertyCard component: `onEdit` prop support

## Issues Identified

### 🔴 Critical: Button Text Mismatch

**Issue:** E2E tests expect button text "שמור" but form uses "שמירה"

**Location:** `apps/frontend/src/components/properties/PropertyForm.tsx:1706`

**Current Code:**
```tsx
{propertyMutation.isPending ? 'שומר...' : 'שמירה'}
```

**Expected by Tests:**
```tsx
{propertyMutation.isPending ? 'שומר...' : 'שמור'}
```

**Impact:** E2E tests fail because they can't find the submit button

**Resolution:** Change button text to "שמור" to match test expectations

### ⚠️ Potential: Form Dialog Opening

**Issue:** Tests may fail if dialog doesn't open properly

**Investigation Needed:**
- Verify edit button click handlers work correctly
- Verify dialog state management
- Verify form pre-population logic

## API Contract Approval

### Backend Team Leader Approval

✅ **API Contract Approved**
- Endpoint fully implemented
- All validations in place
- Multi-tenancy supported
- Error handling complete
- Response format correct

### Frontend Team Leader Approval

✅ **API Contract Approved**
- API service method exists
- Form component supports edit mode
- Multiple edit entry points available
- **Action Required:** Fix button text mismatch

### QA Team Leader Approval

✅ **API Contract Approved**
- Endpoint supports all edit scenarios
- Validation rules documented
- Error cases covered
- **Action Required:** Fix button text to match test expectations

## Next Steps

**Phase 2:** Frontend Implementation Fixes
1. Change submit button text from "שמירה" to "שמור"
2. Verify dialog opening logic
3. Verify form pre-population
4. Test all edit entry points

## Conclusion

The API contract is **complete and approved**. The backend fully supports property editing with all required validations and multi-tenancy. The frontend has the infrastructure in place but needs minor fixes to match E2E test expectations.

**Status:** ✅ **APPROVED** (with minor frontend fixes needed)
