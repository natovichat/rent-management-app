# Property Events API

## Overview

Property events are polymorphic records stored in a single table. There are **4 event types**, each with type-specific fields and a dedicated POST endpoint:

| Event Type | POST Endpoint | Description |
|------------|---------------|-------------|
| `PlanningProcessEvent` | `POST .../planning-process` | Planning/development updates |
| `PropertyDamageEvent` | `POST .../property-damage` | Property damage incidents |
| `ExpenseEvent` | `POST .../expense` | Property expenses |
| `RentalPaymentRequestEvent` | `POST .../rental-payment-request` | Rental payment requests |

## Base URL

`/api/properties/:propertyId/events`

## Common Fields (All Event Types)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Event ID |
| `propertyId` | UUID | Property ID |
| `eventType` | enum | PlanningProcessEvent, PropertyDamageEvent, ExpenseEvent, RentalPaymentRequestEvent |
| `eventDate` | date | Event date |
| `description` | string | Description |
| `estimatedValue` | number | Estimated value |
| `estimatedRent` | number | Estimated rent |

---

## Endpoints

### Create Planning Process Event

`POST /api/properties/:propertyId/events/planning-process`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventDate` | date | Yes | ISO 8601 |
| `planningStage` | string | No | Planning stage |
| `developerName` | string | No | Developer name |
| `projectedSizeAfter` | string | No | Projected size after planning |
| `description` | string | No | Event description |

#### Example Request

```json
{
  "eventDate": "2025-01-15",
  "planningStage": "APPROVAL_PENDING",
  "developerName": "Acme Developers Ltd",
  "projectedSizeAfter": "150 sqm",
  "description": "Submitted for municipality approval"
}
```

#### Example Response (201)

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "PlanningProcessEvent",
  "eventDate": "2025-01-15T00:00:00.000Z",
  "description": "Submitted for municipality approval",
  "estimatedValue": null,
  "estimatedRent": null,
  "planningStage": "APPROVAL_PENDING",
  "developerName": "Acme Developers Ltd",
  "projectedSizeAfter": "150 sqm",
  "damageType": null,
  "estimatedDamageCost": null,
  "expenseId": null,
  "expenseType": null,
  "amount": null,
  "paidToAccountId": null,
  "affectsPropertyValue": null,
  "rentalAgreementId": null,
  "month": null,
  "year": null,
  "amountDue": null,
  "paymentDate": null,
  "paymentStatus": null,
  "createdAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Create Property Damage Event

`POST /api/properties/:propertyId/events/property-damage`

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `eventDate` | date | Yes | ISO 8601 | Event date |
| `damageType` | string | No | - | Type of damage |
| `estimatedDamageCost` | number | No | > 0 when provided | Estimated damage cost |
| `expenseId` | UUID | No | Valid UUID | Optional link to ExpenseEvent |
| `description` | string | No | - | Event description |

#### Example Request

```json
{
  "eventDate": "2025-01-15",
  "damageType": "Water damage",
  "estimatedDamageCost": 5000,
  "expenseId": "990e8400-e29b-41d4-a716-446655440004",
  "description": "Pipe burst in bathroom"
}
```

---

### Create Expense Event

`POST /api/properties/:propertyId/events/expense`

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `eventDate` | date | Yes | ISO 8601 | Event date |
| `expenseType` | enum | Yes | See below | Expense type |
| `amount` | number | Yes | > 0 | Amount |
| `paidToAccountId` | UUID | No | Valid UUID | Bank account payment was made to |
| `affectsPropertyValue` | boolean | No | default: false | Affects property value |
| `description` | string | No | - | Event description |

#### Expense Types

| Type | Description |
|------|-------------|
| `MANAGEMENT_FEE` | Management fee |
| `REPAIRS` | Repairs |
| `MAINTENANCE` | Maintenance |
| `TAX` | Tax |
| `INSURANCE` | Insurance |
| `UTILITIES` | Utilities |
| `OTHER` | Other |

#### Example Request

```json
{
  "eventDate": "2025-01-15",
  "expenseType": "REPAIRS",
  "amount": 1500,
  "paidToAccountId": "770e8400-e29b-41d4-a716-446655440002",
  "affectsPropertyValue": true,
  "description": "Bathroom pipe repair"
}
```

---

### Create Rental Payment Request Event

`POST /api/properties/:propertyId/events/rental-payment-request`

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `eventDate` | date | Yes | ISO 8601 | Event date |
| `rentalAgreementId` | UUID | Yes | Valid UUID | Rental agreement |
| `month` | number | Yes | 1–12 | Month |
| `year` | number | Yes | 1900–2100 | Year |
| `amountDue` | number | Yes | > 0 | Amount due |
| `paymentDate` | date | No | ISO 8601 | Payment date |
| `paymentStatus` | enum | No | PENDING, PAID, OVERDUE | Default: PENDING |
| `description` | string | No | - | Event description |

#### Example Request

```json
{
  "eventDate": "2025-01-15",
  "rentalAgreementId": "660e8400-e29b-41d4-a716-446655440001",
  "month": 1,
  "year": 2025,
  "amountDue": 5000,
  "paymentDate": "2025-01-20",
  "paymentStatus": "PAID",
  "description": "January 2025 rent"
}
```

**Note:** The combination of `rentalAgreementId` + `month` + `year` must be unique.

---

### List Property Events

`GET /api/properties/:propertyId/events?page=1&limit=10&eventType=ExpenseEvent`

Returns a paginated list of property events with optional event type filter.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (1–100) |
| `eventType` | enum | - | Filter by: PlanningProcessEvent, PropertyDamageEvent, ExpenseEvent, RentalPaymentRequestEvent |

#### Example Response (200)

```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "propertyId": "550e8400-e29b-41d4-a716-446655440000",
      "eventType": "ExpenseEvent",
      "eventDate": "2025-01-15T00:00:00.000Z",
      "description": "Bathroom pipe repair",
      "expenseType": "REPAIRS",
      "amount": 1500,
      "paidToAccountId": "770e8400-e29b-41d4-a716-446655440002",
      "affectsPropertyValue": true,
      "createdAt": "2025-02-27T10:00:00.000Z"
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

### Get Property Event by ID

`GET /api/properties/:propertyId/events/:id`

Returns a single property event.

---

### Update Property Event

`PATCH /api/properties/:propertyId/events/:id`

Partially updates a property event. The `eventType` is preserved and cannot be changed. All other fields are optional.

---

### Delete Property Event

`DELETE /api/properties/:propertyId/events/:id`

Deletes a property event. Returns 204 No Content on success.

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error |
| 404 | Property or event not found |
| 409 | Duplicate rentalAgreementId+month+year (RentalPaymentRequestEvent) |

## Related Endpoints

- [Properties API](properties.md) – Parent entity
- [Rental Agreements API](rental-agreements.md) – rentalAgreementId for RentalPaymentRequestEvent
- [Bank Accounts API](bank-accounts.md) – paidToAccountId for ExpenseEvent
