# Planning Process State API

## Overview

Planning Process State is a 1:1 relationship with Property. Each property can have at most one planning process state, which tracks the status of planning/development processes (e.g., TAMA 38, building permits).

## Base URL

`/api/properties/:propertyId/planning-process-state`

**Note:** All endpoints are nested under a property. The `propertyId` is taken from the URL path.

## Endpoints

### Create Planning Process State

`POST /api/properties/:propertyId/planning-process-state`

Creates a planning process state for a property. Each property can have only one.

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `stateType` | string | Yes | 1–100 chars | State type (e.g., IN_PROGRESS, AWAITING_APPROVAL) |
| `lastUpdateDate` | date | Yes | ISO 8601 | Last update date |
| `developerName` | string | No | max 255 | Developer name |
| `projectedSizeAfter` | string | No | max 255 | Projected size after planning (e.g., "150 sqm") |
| `notes` | string | No | max 2000 | Additional notes |

#### Example Request

```json
{
  "stateType": "IN_PROGRESS",
  "lastUpdateDate": "2025-02-27T10:00:00.000Z",
  "developerName": "Acme Developers Ltd",
  "projectedSizeAfter": "150 sqm",
  "notes": "Awaiting municipality approval"
}
```

#### Example Response (201)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "stateType": "IN_PROGRESS",
  "developerName": "Acme Developers Ltd",
  "projectedSizeAfter": "150 sqm",
  "lastUpdateDate": "2025-02-27T10:00:00.000Z",
  "notes": "Awaiting municipality approval",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Get Planning Process State

`GET /api/properties/:propertyId/planning-process-state`

Returns the planning process state for the property. Returns 404 if none exists.

#### Example Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "propertyId": "660e8400-e29b-41d4-a716-446655440001",
  "stateType": "IN_PROGRESS",
  "developerName": "Acme Developers Ltd",
  "projectedSizeAfter": "150 sqm",
  "lastUpdateDate": "2025-02-27T10:00:00.000Z",
  "notes": "Awaiting municipality approval",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Update Planning Process State

`PATCH /api/properties/:propertyId/planning-process-state`

Updates the planning process state for the property. All fields are optional (partial update).

#### Example Request

```json
{
  "stateType": "APPROVED",
  "lastUpdateDate": "2025-03-01T00:00:00.000Z",
  "notes": "Municipality approved"
}
```

#### Example Response (200)

Returns the updated planning process state.

---

### Delete Planning Process State

`DELETE /api/properties/:propertyId/planning-process-state`

Deletes the planning process state. Returns 204 No Content on success.

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error |
| 404 | Property not found, or planning process state not found |
| 409 | Property already has a planning process state (on create) |

## Related Endpoints

- [Properties API](properties.md) – Parent entity
- [Property Events](property-events.md) – PlanningProcessEvent type for event history
