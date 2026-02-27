# Property API

## Overview

Properties are the core entity representing real estate assets. Each property can have:
- **Ownerships** – M:N link to Owners
- **Mortgages** – Direct or linked mortgages
- **Rental Agreements** – Tenant contracts
- **Planning Process State** – 1:1 (optional)
- **Utility Info** – 1:1 (optional)
- **Property Events** – Polymorphic events (planning, damage, expense, rental payment)

## Base URL

`/api/properties`

## Property Fields Reference

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | string | Yes | Property address (5–500 chars) |
| `fileNumber` | string | No | File number |
| `type` | enum | No | RESIDENTIAL, COMMERCIAL, LAND, MIXED_USE |
| `status` | enum | No | OWNED, IN_CONSTRUCTION, IN_PURCHASE, SOLD, INVESTMENT (default: OWNED) |
| `country` | string | No | Default: Israel |
| `city` | string | No | City |
| `totalArea` | number | No | Total area in sqm |
| `landArea` | number | No | Land area in sqm |
| `estimatedValue` | number | No | Estimated value |
| `lastValuationDate` | date | No | Last valuation date |

### Plot/Land Registry

| Field | Type | Description |
|-------|------|-------------|
| `gush` | string | Plot registry (גוש) |
| `helka` | string | Parcel (חלקה) |
| `isMortgaged` | boolean | Whether property is mortgaged (default: false) |

### Area & Dimensions

| Field | Type | Description |
|-------|------|-------------|
| `floors` | number | Number of floors |
| `totalUnits` | number | Total units |
| `parkingSpaces` | number | Parking spaces |
| `balconySizeSqm` | number | Balcony size in sqm |
| `storageSizeSqm` | number | Storage size in sqm |
| `parkingType` | enum | REGULAR, CONSECUTIVE |

### Financial

| Field | Type | Description |
|-------|------|-------------|
| `purchasePrice` | number | Purchase price |
| `purchaseDate` | date | Purchase date |
| `acquisitionMethod` | enum | PURCHASE, INHERITANCE, GIFT, EXCHANGE, OTHER |
| `estimatedRent` | number | Estimated monthly rent |
| `rentalIncome` | number | Rental income |
| `projectedValue` | number | Projected value |
| `saleProjectedTax` | number | Sale projected tax |

### Legal & Registry

| Field | Type | Description |
|-------|------|-------------|
| `cadastralNumber` | string | Cadastral number |
| `taxId` | string | Tax ID |
| `registrationDate` | date | Registration date |
| `legalStatus` | enum | REGISTERED, IN_REGISTRATION, DISPUTED, CLEAR |

### Property Details

| Field | Type | Description |
|-------|------|-------------|
| `constructionYear` | number | Construction year (1800–2100) |
| `lastRenovationYear` | number | Last renovation year |
| `buildingPermitNumber` | string | Building permit number |
| `propertyCondition` | enum | EXCELLENT, GOOD, FAIR, NEEDS_RENOVATION |

### Land Information

| Field | Type | Description |
|-------|------|-------------|
| `landType` | enum | URBAN, AGRICULTURAL, INDUSTRIAL, MIXED |
| `landDesignation` | string | Land designation |

### Ownership

| Field | Type | Description |
|-------|------|-------------|
| `isPartialOwnership` | boolean | Partial ownership flag (default: false) |
| `sharedOwnershipPercentage` | number | Shared ownership % (0–100) |

### Sale Information

| Field | Type | Description |
|-------|------|-------------|
| `isSold` | boolean | Sold flag (default: false) |
| `saleDate` | date | Sale date |
| `salePrice` | number | Sale price |

### Management

| Field | Type | Description |
|-------|------|-------------|
| `propertyManager` | string | Property manager name |
| `managementCompany` | string | Management company |
| `managementFees` | number | Management fees |
| `managementFeeFrequency` | enum | MONTHLY, QUARTERLY, ANNUAL |

### Financial Obligations

| Field | Type | Description |
|-------|------|-------------|
| `taxAmount` | number | Tax amount |
| `taxFrequency` | enum | MONTHLY, QUARTERLY, ANNUAL |
| `lastTaxPayment` | date | Last tax payment date |

### Insurance & Utilities

| Field | Type | Description |
|-------|------|-------------|
| `insuranceDetails` | string | Insurance details |
| `insuranceExpiry` | date | Insurance expiry |
| `zoning` | string | Zoning info |
| `utilities` | string | Utilities info |
| `restrictions` | string | Restrictions |
| `estimationSource` | enum | PROFESSIONAL_APPRAISAL, MARKET_ESTIMATE, TAX_ASSESSMENT, OWNER_ESTIMATE |
| `notes` | string | Additional notes |

---

## Endpoints

### Create Property

`POST /api/properties`

Creates a new property. Only `address` is required; all other fields are optional.

#### Example Request

```json
{
  "address": "רחוב הרצל 15, תל אביב",
  "fileNumber": "12345",
  "type": "RESIDENTIAL",
  "status": "OWNED",
  "country": "Israel",
  "city": "תל אביב",
  "totalArea": 120.5,
  "estimatedValue": 1500000,
  "purchasePrice": 1200000,
  "purchaseDate": "2020-06-01",
  "acquisitionMethod": "PURCHASE",
  "estimatedRent": 5000,
  "constructionYear": 1995,
  "propertyCondition": "GOOD",
  "notes": "Corner unit with sea view"
}
```

#### Example Response (201)

Returns the created property with all fields.

---

### List Properties

`GET /api/properties?page=1&limit=10&search=תל אביב&type=RESIDENTIAL&status=OWNED&city=תל אביב&country=Israel`

Returns a paginated list of properties with search and filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (1–100) |
| `search` | string | - | Search by address, city, country (partial, case-insensitive) |
| `type` | enum | - | Filter by type: RESIDENTIAL, COMMERCIAL, LAND, MIXED_USE |
| `status` | enum | - | Filter by status: OWNED, IN_CONSTRUCTION, IN_PURCHASE, SOLD, INVESTMENT |
| `city` | string | - | Filter by city |
| `country` | string | - | Filter by country |

#### Example Response (200)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "address": "רחוב הרצל 15, תל אביב",
      "fileNumber": "12345",
      "type": "RESIDENTIAL",
      "status": "OWNED",
      "country": "Israel",
      "city": "תל אביב",
      "totalArea": 120.5,
      "estimatedValue": 1500000,
      "isMortgaged": true,
      "isPartialOwnership": false,
      "isSold": false,
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

### Get Property by ID

`GET /api/properties/:id?include=planningProcessState,utilityInfo`

Returns a single property. Optionally include related 1:1 entities.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `include` | string | Comma-separated: `planningProcessState`, `utilityInfo` |

#### Example Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "address": "רחוב הרצל 15, תל אביב",
  "fileNumber": "12345",
  "type": "RESIDENTIAL",
  "status": "OWNED",
  "country": "Israel",
  "city": "תל אביב",
  "totalArea": 120.5,
  "landArea": null,
  "estimatedValue": 1500000,
  "lastValuationDate": null,
  "gush": null,
  "helka": null,
  "isMortgaged": true,
  "floors": 3,
  "totalUnits": 4,
  "parkingSpaces": 2,
  "balconySizeSqm": 15.5,
  "storageSizeSqm": 8,
  "parkingType": "REGULAR",
  "purchasePrice": 1200000,
  "purchaseDate": "2020-06-01T00:00:00.000Z",
  "acquisitionMethod": "PURCHASE",
  "estimatedRent": 5000,
  "rentalIncome": 4800,
  "projectedValue": null,
  "saleProjectedTax": null,
  "cadastralNumber": null,
  "taxId": null,
  "registrationDate": null,
  "legalStatus": null,
  "constructionYear": 1995,
  "lastRenovationYear": 2020,
  "buildingPermitNumber": null,
  "propertyCondition": "GOOD",
  "landType": null,
  "landDesignation": null,
  "isPartialOwnership": false,
  "sharedOwnershipPercentage": null,
  "isSold": false,
  "saleDate": null,
  "salePrice": null,
  "propertyManager": null,
  "managementCompany": null,
  "managementFees": null,
  "managementFeeFrequency": null,
  "taxAmount": null,
  "taxFrequency": null,
  "lastTaxPayment": null,
  "insuranceDetails": null,
  "insuranceExpiry": null,
  "zoning": null,
  "utilities": null,
  "restrictions": null,
  "estimationSource": null,
  "notes": "Corner unit with sea view",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z",
  "planningProcessState": null,
  "utilityInfo": null
}
```

---

### Nested Routes

#### Get Mortgages for Property

`GET /api/properties/:propertyId/mortgages`

Returns mortgages directly linked to the property or linked via `linkedProperties`.

#### Get Rental Agreements for Property

`GET /api/properties/:propertyId/rental-agreements`

Returns all rental agreements for the property.

---

### Update Property

`PATCH /api/properties/:id`

Partially updates a property. All fields are optional.

#### Example Request

```json
{
  "estimatedValue": 1600000,
  "rentalIncome": 5200,
  "notes": "Updated after renovation"
}
```

---

### Delete Property

`DELETE /api/properties/:id`

Deletes a property. Returns 204 No Content on success.

#### Error Cases

- **404** – Property not found
- **409** – Property has ownerships, mortgages, or rental agreements; cannot delete

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error |
| 404 | Property not found |
| 409 | Conflict – has dependencies |

## Related Endpoints

- [Ownerships](ownerships.md) – `POST/GET /api/properties/:id/ownerships`
- [Planning Process State](planning-process-states.md) – `POST/GET/PATCH/DELETE /api/properties/:id/planning-process-state`
- [Utility Info](utility-info.md) – `POST/GET/PATCH/DELETE /api/properties/:id/utility-info`
- [Mortgages](mortgages.md) – `GET /api/properties/:id/mortgages`
- [Rental Agreements](rental-agreements.md) – `GET /api/properties/:id/rental-agreements`
- [Property Events](property-events.md) – `GET/POST /api/properties/:id/events`
