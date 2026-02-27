# Utility Info API

## Overview

Utility Info is a 1:1 relationship with Property. Each property can have at most one utility info record, storing account numbers and meter information for utilities (arnona, electricity, water, vaad bayit).

## Base URL

`/api/properties/:propertyId/utility-info`

**Note:** All endpoints are nested under a property. The `propertyId` is taken from the URL path.

## Endpoints

### Create Utility Info

`POST /api/properties/:propertyId/utility-info`

Creates utility info for a property. Each property can have only one.

#### Request Body

All fields are optional. At least one field should be provided for a meaningful record.

| Field | Type | Description |
|-------|------|-------------|
| `arnonaAccountNumber` | string | Arnona (property tax) account number |
| `electricityAccountNumber` | string | Electricity account number |
| `waterAccountNumber` | string | Water account number |
| `vaadBayitName` | string | Vaad Bayit (building committee) name |
| `waterMeterNumber` | string | Water meter number |
| `electricityMeterNumber` | string | Electricity meter number |
| `notes` | string | Additional notes |

#### Example Request

```json
{
  "arnonaAccountNumber": "12345678",
  "electricityAccountNumber": "987654321",
  "waterAccountNumber": "55555555",
  "vaadBayitName": "ועד בית גן",
  "waterMeterNumber": "WM-001",
  "electricityMeterNumber": "EM-002",
  "notes": "Meter readings taken monthly"
}
```

#### Example Response (201)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "arnonaAccountNumber": "12345678",
  "electricityAccountNumber": "987654321",
  "waterAccountNumber": "55555555",
  "vaadBayitName": "ועד בית גן",
  "waterMeterNumber": "WM-001",
  "electricityMeterNumber": "EM-002",
  "notes": "Meter readings taken monthly",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Get Utility Info

`GET /api/properties/:propertyId/utility-info`

Returns the utility info for the property. Returns 404 if none exists.

#### Example Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "arnonaAccountNumber": "12345678",
  "electricityAccountNumber": "987654321",
  "waterAccountNumber": "55555555",
  "vaadBayitName": "ועד בית גן",
  "waterMeterNumber": "WM-001",
  "electricityMeterNumber": "EM-002",
  "notes": "Meter readings taken monthly",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Update Utility Info

`PATCH /api/properties/:propertyId/utility-info`

Updates the utility info for the property. All fields are optional (partial update).

#### Example Request

```json
{
  "electricityAccountNumber": "987654322",
  "notes": "Updated meter info"
}
```

#### Example Response (200)

Returns the updated utility info.

---

### Delete Utility Info

`DELETE /api/properties/:propertyId/utility-info`

Deletes the utility info. Returns 204 No Content on success.

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error |
| 404 | Property not found, or utility info not found |
| 409 | Utility info already exists for this property (on create) |

## Related Endpoints

- [Properties API](properties.md) – Parent entity
