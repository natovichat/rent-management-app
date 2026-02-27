# Rent Application API Documentation

## Overview

The Rent Application API is a RESTful API for managing property portfolios, including properties, owners, tenants, mortgages, rental agreements, and property events. It is built with NestJS and uses PostgreSQL via Prisma.

## Base URL

```
http://localhost:3000/api
```

For production deployments, replace with your deployed backend URL.

## Authentication

**Current Phase:** No authentication is required. All endpoints are publicly accessible.

Future phases may add JWT or session-based authentication.

## API Structure

| Entity | Base Path | Description |
|--------|-----------|-------------|
| [Persons](persons.md) | `/api/persons` | Individuals (mortgage owners, payers, tenants) |
| [Owners](owners.md) | `/api/owners` | Property owners (individuals, companies, partnerships) |
| [Bank Accounts](bank-accounts.md) | `/api/bank-accounts` | Bank accounts for mortgages and expenses |
| [Properties](properties.md) | `/api/properties` | Real estate properties |
| [Planning Process States](planning-process-states.md) | `/api/properties/:id/planning-process-state` | 1:1 with Property |
| [Utility Info](utility-info.md) | `/api/properties/:id/utility-info` | 1:1 with Property |
| [Ownerships](ownerships.md) | `/api/properties/:id/ownerships`, `/api/ownerships` | M:N Owner ↔ Property |
| [Mortgages](mortgages.md) | `/api/mortgages` | Mortgages and loans |
| [Rental Agreements](rental-agreements.md) | `/api/rental-agreements` | Property rental contracts |
| [Property Events](property-events.md) | `/api/properties/:id/events` | Polymorphic events (4 types) |

## Pagination

List endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-based) |
| `limit` | number | 10–20 | Items per page (max 100) |

### Paginated Response Format

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Error Codes

| Status | Description |
|--------|-------------|
| **400** | Bad Request – Validation error, invalid input |
| **404** | Not Found – Resource does not exist |
| **409** | Conflict – Business rule violation (e.g., duplicate, has dependencies) |
| **500** | Internal Server Error – Unexpected server error |

### Error Response Format

Validation errors (400) typically return:

```json
{
  "statusCode": 400,
  "message": ["name must be at least 2 characters"],
  "error": "Bad Request"
}
```

## Content Type

- **Request:** `Content-Type: application/json`
- **Response:** `Content-Type: application/json`

## Date Format

All dates use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`

Examples: `2025-01-15`, `2025-02-27T10:00:00.000Z`

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

## CORS

Allowed origins include:
- `http://localhost:3000`
- `https://rent-management-app.vercel.app`
- `https://rent-management-app-frontend.vercel.app`
- Any `*.vercel.app` preview deployment

## Related Documentation

- [Persons API](persons.md)
- [Owners API](owners.md)
- [Bank Accounts API](bank-accounts.md)
- [Properties API](properties.md)
- [Planning Process States API](planning-process-states.md)
- [Utility Info API](utility-info.md)
- [Ownerships API](ownerships.md)
- [Mortgages API](mortgages.md)
- [Rental Agreements API](rental-agreements.md)
- [Property Events API](property-events.md)
