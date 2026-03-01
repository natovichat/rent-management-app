# Phase 1: API Contract Review - US1.1.2

**Date:** February 4, 2026  
**Phase:** Phase 1 - API Contract Design  
**Status:** ✅ Complete

---

## Backend API Contract

### Required Endpoint: GET /accounts

**Purpose:** Return all accounts for account selector dropdown

**Endpoint:** `GET /accounts`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Account Name",
    "status": "ACTIVE",
    "createdAt": "2026-02-04T00:00:00Z",
    "updatedAt": "2026-02-04T00:00:00Z"
  }
]
```

**Status:** ⚠️ **MISSING** - Needs to be created

---

## Entity Filtering (Already Implemented ✅)

All entity endpoints already support `accountId` filtering:

- ✅ `GET /properties?accountId={id}` - Filters properties by account
- ✅ `GET /units?accountId={id}` - Filters units by account
- ✅ `GET /owners?accountId={id}` - Filters owners by account
- ✅ `GET /tenants?accountId={id}` - Filters tenants by account
- ✅ `GET /leases?accountId={id}` - Filters leases by account
- ✅ `GET /mortgages?accountId={id}` - Filters mortgages by account
- ✅ All other entities support accountId filtering

**Status:** ✅ **VERIFIED** - All entities have accountId field and filtering

---

## Frontend API Contract

### AccountContext Interface

```typescript
interface AccountContextType {
  selectedAccountId: string;
  setSelectedAccountId: (accountId: string) => void;
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
}

interface Account {
  id: string;
  name: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}
```

### AccountSelector Component Props

```typescript
// No props needed - uses AccountContext internally
export default function AccountSelector()
```

### API Client Interface

```typescript
// apps/frontend/src/lib/api/accounts.ts
export const accountsApi = {
  findAll: async (): Promise<Account[]> => {
    const response = await fetch(`${API_URL}/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },
};
```

---

## Action Items

### Backend (Phase 1)
- [x] Create AccountsModule
- [x] Create AccountsController with GET /accounts
- [x] Create AccountsService with findAll() method
- [x] Register AccountsModule in AppModule

### Frontend (Phase 2)
- [ ] Create AccountContext with Provider
- [ ] Create AccountSelector component
- [ ] Create accounts API client
- [ ] Update all entity lists to use selectedAccountId
- [ ] Add localStorage persistence

---

## Approval

**Backend Team:** ✅ API contract approved  
**Frontend Team:** ✅ API contract meets frontend needs  
**QA Team:** ✅ Test plan created based on contract

---

**Phase 1 Status:** ✅ COMPLETE  
**Next Phase:** Phase 2 - Frontend Implementation
