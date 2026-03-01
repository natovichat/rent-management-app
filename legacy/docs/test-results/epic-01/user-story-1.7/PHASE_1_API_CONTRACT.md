# Phase 1: API Contract Review - US1.7 Search Properties

**Date:** February 5, 2026  
**Status:** ✅ Approved by All Teams

---

## API Contract Summary

**Endpoint:** `GET /api/properties`  
**Status:** ✅ Already Implemented  
**Changes Required:** None (API contract is complete)

---

## Request Parameters

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `search` | string | No | **Search query for address or fileNumber** | `"תל אביב"` or `"FILE-001"` |
| `type` | enum/array | No | Property type filter | `RESIDENTIAL` |
| `status` | enum/array | No | Property status filter | `OWNED` |
| `city` | string | No | City filter | `"תל אביב"` |
| `country` | string | No | Country filter | `"Israel"` |
| `isMortgaged` | boolean | No | Mortgage status filter | `true` |

### Search Parameter Details

**Parameter:** `search` (query string)  
**Type:** `string`  
**Required:** No  
**Description:** חיפוש בכתובת או מספר תיק (Search in address or file number)

**Behavior:**
- Searches both `address` and `fileNumber` fields
- Case-insensitive search (uses Prisma `mode: 'insensitive'`)
- Partial match (uses Prisma `contains`)
- Works with Hebrew text
- Empty string shows all properties

**Example Requests:**
```
GET /api/properties?search=תל%20אביב
GET /api/properties?search=FILE-001
GET /api/properties?search=הרצל
GET /api/properties?page=1&limit=10&search=דיזנגוף
```

---

## Response Schema

```typescript
{
  data: Property[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

**Property Object:**
```typescript
{
  id: string,
  accountId: string,
  address: string,
  fileNumber: string | null,
  type: PropertyType | null,
  status: PropertyStatus | null,
  city: string | null,
  country: string | null,
  // ... other fields
  unitCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Backend Implementation

**File:** `apps/backend/src/modules/properties/properties.service.ts`

**Search Logic:**
```typescript
...(search && {
  OR: [
    { address: { contains: search, mode: 'insensitive' as const } },
    { fileNumber: { contains: search, mode: 'insensitive' as const } },
  ],
}),
```

**Status:** ✅ Fully Implemented
- Case-insensitive search ✅
- Searches both address and fileNumber ✅
- Works with pagination ✅
- Works with other filters ✅

---

## Frontend Implementation Status

**Current State:**
- ✅ Search input field exists
- ✅ Search state managed (`search` state variable)
- ✅ Search passed to API correctly
- ✅ Search works with pagination
- ❌ **Debouncing NOT implemented** (calls API on every keystroke)
- ⚠️ **URL persistence partial** (search in URL but doesn't restore)

**File:** `apps/frontend/src/components/properties/PropertyList.tsx`

**Current Code:**
```typescript
const [search, setSearch] = useState('');

<TextField
  placeholder="חיפוש נכסים..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setPage(1);
  }}
/>
```

**Issue:** No debouncing - API called immediately on every keystroke

---

## Team Reviews

### Backend Team Leader ✅ APPROVED

**Review:**
- API contract is complete and well-designed
- Search parameter works correctly
- Case-insensitive search implemented
- Searches both address and fileNumber
- Works with pagination and other filters
- No backend changes needed

**Status:** ✅ Approved - No changes required

---

### Frontend Team Leader ✅ APPROVED (with implementation notes)

**Review:**
- API contract meets all UI requirements
- Response format works for DataGrid component
- Search parameter sufficient for requirements
- Can implement debouncing on frontend side
- URL persistence can be handled on frontend

**Required Frontend Changes:**
1. **Add debouncing** (300ms delay after typing stops)
2. **Fix URL persistence** (restore search from URL on page load)

**Status:** ✅ Approved - Frontend implementation needed

---

### QA Team Leader ✅ APPROVED

**Review:**
- API contract aligns with Phase 0 E2E tests
- All test scenarios can be verified with this API
- Search parameter covers all acceptance criteria
- Backend implementation verified working

**Test Coverage:**
- ✅ Search by address - Covered
- ✅ Search by fileNumber - Covered
- ✅ Case-insensitive - Covered
- ✅ Empty search - Covered
- ✅ Search with pagination - Covered

**Status:** ✅ Approved - Ready for Phase 2 implementation

---

## Implementation Requirements

### Frontend Changes Required

1. **Add Debouncing** (HIGH PRIORITY)
   - Use `useDebounce` hook or similar
   - Delay: 300ms after user stops typing
   - File: `apps/frontend/src/components/properties/PropertyList.tsx`
   - Package: Install `use-debounce` if not already installed

2. **Fix URL Persistence** (MEDIUM PRIORITY)
   - Restore search term from URL on component mount
   - Ensure search term persists after navigation
   - File: `apps/frontend/src/components/properties/PropertyList.tsx`

### Backend Changes Required

**None** - API contract is complete ✅

---

## Acceptance Criteria Mapping

| AC | API Support | Frontend Status |
|---|-------------|-----------------|
| Search input field available | N/A | ✅ Implemented |
| Search queries address | ✅ | ✅ Implemented |
| Search queries fileNumber | ✅ | ✅ Implemented |
| Search is debounced | N/A | ❌ **NOT IMPLEMENTED** |
| Search results update automatically | ✅ | ✅ Implemented |
| Search works with pagination | ✅ | ✅ Implemented |
| Search is case-insensitive | ✅ | ✅ Implemented |
| Empty search shows all properties | ✅ | ✅ Implemented |
| Search state persists during navigation | N/A | ⚠️ Partial (URL has search, doesn't restore) |

---

## Next Steps

1. ✅ Phase 1 Complete - API Contract Approved
2. ⏭️ Phase 2: Implement debouncing and URL persistence
3. ⏭️ Phase 3: Re-run E2E tests (should pass after implementation)
4. ⏭️ Phase 4: Final review and approval

---

**Status:** ✅ Phase 1 Complete - All Teams Approved - Ready for Phase 2
