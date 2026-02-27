# Person API

## Overview

Persons represent individuals in the system. They are used as:
- **Mortgage owners** – individuals who own a mortgage
- **Mortgage payers** – individuals who pay the mortgage
- **Tenants** – individuals who rent properties via rental agreements

Persons are distinct from Owners; Owners represent property ownership entities (which can be individuals, companies, or partnerships).

## Base URL

`/api/persons`

## Endpoints

### Create Person

`POST /api/persons`

Creates a new person.

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 2–255 chars | Full name |
| `idNumber` | string | No | max 50 | Israeli ID (תעודת זהות) |
| `email` | string | No | valid email, max 255 | Email address |
| `phone` | string | No | max 50 | Phone number |
| `notes` | string | No | max 2000 | Additional notes |

#### Example Request

```json
{
  "name": "יוסי כהן",
  "idNumber": "123456789",
  "email": "yossi@example.com",
  "phone": "050-1234567",
  "notes": "Contact preferred in Hebrew"
}
```

#### Example Response (201)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "יוסי כהן",
  "idNumber": "123456789",
  "email": "yossi@example.com",
  "phone": "050-1234567",
  "notes": "Contact preferred in Hebrew",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### List Persons

`GET /api/persons?page=1&limit=10&search=יוסי`

Returns a paginated list of persons with optional search.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (1–100) |
| `search` | string | - | Search by name, email, or phone (partial, case-insensitive) |

#### Example Response (200)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "יוסי כהן",
      "idNumber": "123456789",
      "email": "yossi@example.com",
      "phone": "050-1234567",
      "notes": null,
      "createdAt": "2025-02-27T10:00:00.000Z",
      "updatedAt": "2025-02-27T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Get Person by ID

`GET /api/persons/:id`

Returns a single person by UUID.

#### Example Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "יוסי כהן",
  "idNumber": "123456789",
  "email": "yossi@example.com",
  "phone": "050-1234567",
  "notes": null,
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Get Rental Agreements for Person (Tenant)

`GET /api/persons/:personId/rental-agreements`

Returns all rental agreements where this person is the tenant.

#### Example Response (200)

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "propertyId": "770e8400-e29b-41d4-a716-446655440002",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "monthlyRent": 5000,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2026-12-31T00:00:00.000Z",
    "status": "ACTIVE",
    "hasExtensionOption": false,
    "extensionUntilDate": null,
    "extensionMonthlyRent": null,
    "notes": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Update Person

`PATCH /api/persons/:id`

Partially updates a person. All fields are optional.

#### Example Request

```json
{
  "phone": "052-9876543",
  "notes": "Updated contact info"
}
```

#### Example Response (200)

Returns the updated person object.

---

### Delete Person

`DELETE /api/persons/:id`

Deletes a person. Returns 204 No Content on success.

#### Error Cases

- **404** – Person not found
- **409** – Person has mortgages or rental agreements; cannot delete

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error (e.g., name too short, invalid email) |
| 404 | Person not found |
| 409 | Conflict – person has mortgages or rental agreements |

## Related Endpoints

- **Mortgages** – Persons can be `mortgageOwnerId` or `payerId` in [Mortgages API](mortgages.md)
- **Rental Agreements** – Persons are `tenantId` in [Rental Agreements API](rental-agreements.md)
