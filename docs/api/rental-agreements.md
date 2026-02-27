# Rental Agreement API

## Overview

Rental agreements represent contracts between a property and a tenant (Person). They track:
- Monthly rent
- Start and end dates
- Status (FUTURE, ACTIVE, EXPIRED, TERMINATED)
- Extension options (extension until date, extension monthly rent)

## Base URL

`/api/rental-agreements`

## Rental Agreement Status

| Status | Description |
|--------|-------------|
| `FUTURE` | Not yet started |
| `ACTIVE` | Currently active |
| `EXPIRED` | Past end date |
| `TERMINATED` | Terminated early |

## Endpoints

### Create Rental Agreement

`POST /api/rental-agreements`

Creates a new rental agreement.

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `propertyId` | UUID | Yes | Valid UUID | Property UUID |
| `tenantId` | UUID | Yes | Valid UUID | Tenant (Person) UUID |
| `monthlyRent` | number | Yes | > 0 | Monthly rent amount |
| `startDate` | date | Yes | ISO 8601 | Start date |
| `endDate` | date | Yes | ISO 8601, after startDate | End date |
| `status` | enum | No | FUTURE, ACTIVE, EXPIRED, TERMINATED | Default: FUTURE |
| `hasExtensionOption` | boolean | No | default: false | Has extension option |
| `extensionUntilDate` | date | No | ISO 8601 | Extension until date |
| `extensionMonthlyRent` | number | No | > 0 | Rent during extension |
| `notes` | string | No | - | Notes |

#### Example Request

```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "660e8400-e29b-41d4-a716-446655440001",
  "monthlyRent": 5000,
  "startDate": "2025-01-01",
  "endDate": "2026-12-31",
  "status": "FUTURE",
  "hasExtensionOption": true,
  "extensionUntilDate": "2027-06-30",
  "extensionMonthlyRent": 5500,
  "notes": "First year fixed, extension negotiable"
}
```

#### Example Response (201)

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "660e8400-e29b-41d4-a716-446655440001",
  "monthlyRent": 5000,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2026-12-31T00:00:00.000Z",
  "status": "FUTURE",
  "hasExtensionOption": true,
  "extensionUntilDate": "2027-06-30T00:00:00.000Z",
  "extensionMonthlyRent": 5500,
  "notes": "First year fixed, extension negotiable",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### List Rental Agreements

`GET /api/rental-agreements?page=1&limit=20&status=ACTIVE&propertyId=...&tenantId=...`

Returns a paginated list of rental agreements with optional filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (1–100) |
| `status` | enum | - | Filter by status |
| `propertyId` | UUID | - | Filter by property ID |
| `tenantId` | UUID | - | Filter by tenant ID |

#### Example Response (200)

```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "propertyId": "550e8400-e29b-41d4-a716-446655440000",
      "tenantId": "660e8400-e29b-41d4-a716-446655440001",
      "monthlyRent": 5000,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "status": "ACTIVE",
      "hasExtensionOption": true,
      "extensionUntilDate": "2027-06-30T00:00:00.000Z",
      "extensionMonthlyRent": 5500,
      "notes": null,
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

### Get Rental Agreement by ID

`GET /api/rental-agreements/:id`

Returns a single rental agreement with property and tenant relations.

#### Example Response (200)

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "660e8400-e29b-41d4-a716-446655440001",
  "monthlyRent": 5000,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2026-12-31T00:00:00.000Z",
  "status": "ACTIVE",
  "hasExtensionOption": true,
  "extensionUntilDate": "2027-06-30T00:00:00.000Z",
  "extensionMonthlyRent": 5500,
  "notes": null,
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z",
  "property": { "id": "...", "address": "רחוב הרצל 15, תל אביב" },
  "tenant": { "id": "...", "name": "יוסי כהן", "email": "yossi@example.com", "phone": "050-1234567" }
}
```

---

### Update Rental Agreement

`PATCH /api/rental-agreements/:id`

Partially updates a rental agreement. All fields are optional.

#### Example Request

```json
{
  "status": "ACTIVE",
  "monthlyRent": 5200,
  "notes": "Rent increased after agreement"
}
```

---

### Delete Rental Agreement

`DELETE /api/rental-agreements/:id`

Deletes a rental agreement. Returns 204 No Content on success.

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error or related entity not found |
| 404 | Rental agreement not found |

## Related Endpoints

- **Rental Agreements by Property:** `GET /api/properties/:propertyId/rental-agreements`
- **Rental Agreements by Tenant:** `GET /api/persons/:personId/rental-agreements`
- [Persons API](persons.md) – tenantId
- [Properties API](properties.md) – propertyId
- [Property Events](property-events.md) – RentalPaymentRequestEvent links to rental agreements
