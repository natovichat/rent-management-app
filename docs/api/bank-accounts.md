# Bank Account API

## Overview

Bank accounts store financial account information. They are used for:
- **Mortgages** – Bank account where mortgage payments are made
- **Property Events** – Expense events can record which account payment was made to

## Base URL

`/api/bank-accounts`

## Account Types

| Type | Description |
|------|-------------|
| `TRUST_ACCOUNT` | Trust account |
| `PERSONAL_CHECKING` | Personal checking account (default) |
| `PERSONAL_SAVINGS` | Personal savings account |
| `BUSINESS` | Business account |

## Uniqueness Constraint

**Critical:** The combination of `bankName` + `accountNumber` must be unique across all bank accounts. Creating or updating with a duplicate combination returns **409 Conflict**.

## Endpoints

### Create Bank Account

`POST /api/bank-accounts`

Creates a new bank account.

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `bankName` | string | Yes | min 1 | Bank name |
| `branchNumber` | string | No | - | Branch number |
| `accountNumber` | string | Yes | min 1 | Account number |
| `accountType` | enum | Yes | TRUST_ACCOUNT, PERSONAL_CHECKING, PERSONAL_SAVINGS, BUSINESS | Account type |
| `accountHolder` | string | No | - | Account holder name |
| `notes` | string | No | - | Notes |
| `isActive` | boolean | No | default: true | Whether account is active |

#### Example Request

```json
{
  "bankName": "בנק לאומי",
  "branchNumber": "689",
  "accountNumber": "123456",
  "accountType": "PERSONAL_CHECKING",
  "accountHolder": "יוסי כהן",
  "notes": "חשבון עיקרי",
  "isActive": true
}
```

#### Example Response (201)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bankName": "בנק לאומי",
  "branchNumber": "689",
  "accountNumber": "123456",
  "accountType": "PERSONAL_CHECKING",
  "accountHolder": "יוסי כהן",
  "notes": "חשבון עיקרי",
  "isActive": true,
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### List Bank Accounts

`GET /api/bank-accounts?page=1&limit=20&bankName=לאומי&accountType=PERSONAL_CHECKING&isActive=true`

Returns a paginated list of bank accounts with optional filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (1–100) |
| `bankName` | string | - | Filter by bank name (partial match) |
| `accountType` | enum | - | Filter by account type |
| `isActive` | boolean | - | Filter by active status |

#### Example Response (200)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "bankName": "בנק לאומי",
      "branchNumber": "689",
      "accountNumber": "123456",
      "accountType": "PERSONAL_CHECKING",
      "accountHolder": "יוסי כהן",
      "notes": null,
      "isActive": true,
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

### Get Bank Account by ID

`GET /api/bank-accounts/:id`

Returns a single bank account by UUID.

#### Example Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bankName": "בנק לאומי",
  "branchNumber": "689",
  "accountNumber": "123456",
  "accountType": "PERSONAL_CHECKING",
  "accountHolder": "יוסי כהן",
  "notes": null,
  "isActive": true,
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Update Bank Account

`PATCH /api/bank-accounts/:id`

Partially updates a bank account. All fields are optional.

#### Error Cases

- **409** – Duplicate `bankName` + `accountNumber` combination

---

### Delete Bank Account

`DELETE /api/bank-accounts/:id`

Deletes a bank account. Returns 204 No Content on success.

#### Error Cases

- **404** – Bank account not found
- **409** – Bank account has linked mortgages; cannot delete

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error |
| 404 | Bank account not found |
| 409 | Duplicate bankName+accountNumber, or has linked mortgages |

## Related Endpoints

- **Mortgages** – Bank accounts can be linked via `bankAccountId` in [Mortgages API](mortgages.md)
- **Property Events** – Expense events use `paidToAccountId` in [Property Events API](property-events.md)
