# Ownership API

## Overview

Ownership is the M:N junction between **Owner** and **Property**. It represents who owns a property and with what percentage. Each ownership record has:
- **Ownership percentage** (0–100)
- **Ownership type**: `REAL` (actual ownership) or `LEGAL` (legal/formal ownership)
- **Date range** (startDate, optional endDate)
- **Management fee** (optional)

The total ownership percentage for a property should typically sum to 100% for active ownerships. Use the validation endpoint to check.

## Base URLs

- **By Property:** `/api/properties/:propertyId/ownerships`
- **By Owner:** `/api/owners/:ownerId/ownerships`
- **By ID:** `/api/ownerships/:id`

## Ownership Types

| Type | Description |
|------|-------------|
| `REAL` | Actual/real ownership |
| `LEGAL` | Legal/formal ownership |

## Endpoints

### Create Ownership (under Property)

`POST /api/properties/:propertyId/ownerships`

Creates a new ownership linking an owner to the property.

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `ownerId` | UUID | Yes | Valid UUID | Owner UUID |
| `ownershipPercentage` | number | Yes | 0–100 | Ownership percentage |
| `ownershipType` | enum | Yes | REAL, LEGAL | Ownership type |
| `startDate` | date | Yes | ISO 8601 | Start date |
| `endDate` | date | No | ISO 8601 | End date (null = active) |
| `managementFee` | number | No | ≥ 0 | Management fee amount |
| `familyDivision` | boolean | No | default: false | Family division flag |
| `notes` | string | No | - | Additional notes |

#### Example Request

```json
{
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "ownershipPercentage": 50,
  "ownershipType": "REAL",
  "startDate": "2025-01-01",
  "endDate": "2030-12-31",
  "managementFee": 500,
  "familyDivision": false,
  "notes": "Primary owner"
}
```

#### Example Response (201)

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "ownershipPercentage": 50,
  "ownershipType": "REAL",
  "managementFee": 500,
  "familyDivision": false,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2030-12-31T00:00:00.000Z",
  "notes": "Primary owner",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### List Ownerships by Property

`GET /api/properties/:propertyId/ownerships`

Returns all ownerships for a property (with owner details).

#### Example Response (200)

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "propertyId": "660e8400-e29b-41d4-a716-446655440001",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "ownershipPercentage": 50,
    "ownershipType": "REAL",
    "managementFee": 500,
    "familyDivision": false,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2030-12-31T00:00:00.000Z",
    "notes": "Primary owner",
    "createdAt": "2025-02-27T10:00:00.000Z",
    "updatedAt": "2025-02-27T10:00:00.000Z",
    "owner": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "יוסי כהן",
      "type": "INDIVIDUAL",
      "email": "owner@example.com",
      "phone": "050-1234567"
    }
  }
]
```

---

### Validate Ownership Percentage

`GET /api/properties/:propertyId/ownerships/validate`

Validates that the total ownership percentage for active ownerships equals 100%.

#### Example Response (200)

```json
{
  "isValid": true,
  "totalPercentage": 100,
  "message": "Total ownership is 100%"
}
```

When invalid:

```json
{
  "isValid": false,
  "totalPercentage": 75,
  "message": "Total ownership is 75% (expected 100%)"
}
```

---

### List Ownerships by Owner

`GET /api/owners/:ownerId/ownerships`

Returns all ownerships for an owner (with property details).

#### Example Response (200)

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "propertyId": "660e8400-e29b-41d4-a716-446655440001",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "ownershipPercentage": 50,
    "ownershipType": "REAL",
    "managementFee": 500,
    "familyDivision": false,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2030-12-31T00:00:00.000Z",
    "notes": "Primary owner",
    "createdAt": "2025-02-27T10:00:00.000Z",
    "updatedAt": "2025-02-27T10:00:00.000Z",
    "property": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "address": "רחוב הרצל 15, תל אביב",
      "city": "תל אביב"
    }
  }
]
```

---

### Get Ownership by ID

`GET /api/ownerships/:id`

Returns a single ownership by UUID.

#### Example Response (200)

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "ownershipPercentage": 50,
  "ownershipType": "REAL",
  "managementFee": 500,
  "familyDivision": false,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2030-12-31T00:00:00.000Z",
  "notes": "Primary owner",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Update Ownership

`PATCH /api/ownerships/:id`

Partially updates an ownership. All fields are optional.

#### Example Request

```json
{
  "ownershipPercentage": 60,
  "endDate": "2031-12-31",
  "notes": "Updated percentage"
}
```

---

### Delete Ownership

`DELETE /api/ownerships/:id`

Deletes an ownership. Returns 204 No Content on success.

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error (e.g., percentage out of range) |
| 404 | Property, owner, or ownership not found |
| 409 | N/A |

## Related Endpoints

- [Owners API](owners.md) – Owner entity
- [Properties API](properties.md) – Property entity
