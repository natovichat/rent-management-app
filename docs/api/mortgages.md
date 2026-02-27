# Mortgage API

## Overview

Mortgages represent loans secured by properties (or standalone loans when `propertyId` is null). Each mortgage links to:
- **Property** (optional) – Direct property; can also use `linkedProperties` for multi-property mortgages
- **Bank Account** (optional) – Account for payments
- **Person (mortgage owner)** (optional) – Individual who owns the mortgage
- **Person (payer)** (required) – Individual who pays the mortgage

## Base URL

`/api/mortgages`

## Mortgage Status

| Status | Description |
|--------|-------------|
| `ACTIVE` | Currently active |
| `PAID_OFF` | Fully paid |
| `REFINANCED` | Refinanced to another loan |
| `DEFAULTED` | In default |

## Endpoints

### Create Mortgage

`POST /api/mortgages`

Creates a new mortgage.

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `bank` | string | Yes | min 1 | Bank name |
| `loanAmount` | number | Yes | > 0 | Loan amount |
| `payerId` | UUID | Yes | Valid UUID | Payer person UUID |
| `startDate` | date | Yes | ISO 8601 | Start date |
| `status` | enum | Yes | ACTIVE, PAID_OFF, REFINANCED, DEFAULTED | Status |
| `propertyId` | UUID | No | Valid UUID | Property (nullable for standalone loans) |
| `bankAccountId` | UUID | No | Valid UUID | Bank account |
| `mortgageOwnerId` | UUID | No | Valid UUID | Mortgage owner person |
| `interestRate` | number | No | ≥ 0 | Interest rate (e.g., 3.5 for 3.5%) |
| `monthlyPayment` | number | No | ≥ 0 | Monthly payment |
| `earlyRepaymentPenalty` | number | No | ≥ 0 | Early repayment penalty |
| `endDate` | date | No | ISO 8601 | End date |
| `linkedProperties` | UUID[] | No | Valid UUIDs | Linked property IDs (multi-property) |
| `notes` | string | No | - | Notes |

#### Example Request

```json
{
  "bank": "בנק לאומי",
  "loanAmount": 1000000,
  "payerId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2025-01-01",
  "status": "ACTIVE",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "bankAccountId": "770e8400-e29b-41d4-a716-446655440002",
  "mortgageOwnerId": "550e8400-e29b-41d4-a716-446655440000",
  "interestRate": 3.5,
  "monthlyPayment": 5000,
  "earlyRepaymentPenalty": 10000,
  "endDate": "2040-12-31",
  "linkedProperties": ["660e8400-e29b-41d4-a716-446655440001"],
  "notes": "Primary mortgage"
}
```

#### Example Response (201)

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "bank": "בנק לאומי",
  "loanAmount": 1000000,
  "interestRate": 3.5,
  "monthlyPayment": 5000,
  "earlyRepaymentPenalty": 10000,
  "bankAccountId": "770e8400-e29b-41d4-a716-446655440002",
  "mortgageOwnerId": "550e8400-e29b-41d4-a716-446655440000",
  "payerId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2040-12-31T00:00:00.000Z",
  "status": "ACTIVE",
  "linkedProperties": ["660e8400-e29b-41d4-a716-446655440001"],
  "notes": "Primary mortgage",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### List Mortgages

`GET /api/mortgages?page=1&limit=20&status=ACTIVE&propertyId=...`

Returns a paginated list of mortgages with optional filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (1–100) |
| `status` | enum | - | Filter by status |
| `propertyId` | UUID | - | Filter by property ID |

#### Example Response (200)

```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "propertyId": "660e8400-e29b-41d4-a716-446655440001",
      "bank": "בנק לאומי",
      "loanAmount": 1000000,
      "interestRate": 3.5,
      "monthlyPayment": 5000,
      "earlyRepaymentPenalty": 10000,
      "status": "ACTIVE",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2040-12-31T00:00:00.000Z",
      "createdAt": "2025-02-27T10:00:00.000Z",
      "updatedAt": "2025-02-27T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### Get Mortgage by ID

`GET /api/mortgages/:id`

Returns a single mortgage with relations (property, bankAccount, mortgageOwner, payer).

#### Example Response (200)

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "bank": "בנק לאומי",
  "loanAmount": 1000000,
  "interestRate": 3.5,
  "monthlyPayment": 5000,
  "earlyRepaymentPenalty": 10000,
  "bankAccountId": "770e8400-e29b-41d4-a716-446655440002",
  "mortgageOwnerId": "550e8400-e29b-41d4-a716-446655440000",
  "payerId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2040-12-31T00:00:00.000Z",
  "status": "ACTIVE",
  "linkedProperties": ["660e8400-e29b-41d4-a716-446655440001"],
  "notes": "Primary mortgage",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z",
  "property": { "id": "...", "address": "רחוב הרצל 15, תל אביב" },
  "bankAccount": { "id": "...", "bankName": "בנק לאומי", "accountNumber": "123456" },
  "mortgageOwner": { "id": "...", "name": "יוסי כהן" },
  "payer": { "id": "...", "name": "יוסי כהן" }
}
```

---

### Update Mortgage

`PATCH /api/mortgages/:id`

Partially updates a mortgage. All fields are optional.

---

### Delete Mortgage

`DELETE /api/mortgages/:id`

Deletes a mortgage. Returns 204 No Content on success.

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error or related entity not found |
| 404 | Mortgage not found |

## Related Endpoints

- **Mortgages by Property:** `GET /api/properties/:propertyId/mortgages`
- [Persons API](persons.md) – payerId, mortgageOwnerId
- [Bank Accounts API](bank-accounts.md) – bankAccountId
- [Properties API](properties.md) – propertyId
