# Owner API

## Overview

Owners represent property ownership entities. Unlike Persons (individuals), Owners can be individuals, companies, or partnerships. Owners are linked to properties through the Ownership (M:N) junction.

## Base URL

`/api/owners`

## Owner Types

| Type | Description |
|------|-------------|
| `INDIVIDUAL` | Individual person |
| `COMPANY` | Company or corporation |
| `PARTNERSHIP` | Partnership entity |

## Endpoints

### Create Owner

`POST /api/owners`

Creates a new owner.

#### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 2–255 chars | Owner name |
| `type` | enum | Yes | INDIVIDUAL, COMPANY, PARTNERSHIP | Owner type |
| `idNumber` | string | No | max 50 | ID number (תעודת זהות / ח.פ.) |
| `email` | string | No | valid email, max 255 | Email address |
| `phone` | string | No | max 50 | Phone number |
| `address` | string | No | max 500 | Physical address |
| `notes` | string | No | max 2000 | Additional notes |

#### Example Request

```json
{
  "name": "יוסי כהן",
  "type": "INDIVIDUAL",
  "idNumber": "123456789",
  "email": "owner@example.com",
  "phone": "050-1234567",
  "address": "123 Main St, Tel Aviv",
  "notes": "Primary contact for property management"
}
```

#### Example Response (201)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "יוסי כהן",
  "idNumber": "123456789",
  "type": "INDIVIDUAL",
  "email": "owner@example.com",
  "phone": "050-1234567",
  "address": "123 Main St, Tel Aviv",
  "notes": "Primary contact for property management",
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### List Owners

`GET /api/owners?page=1&limit=10&search=יוסי&type=INDIVIDUAL`

Returns a paginated list of owners with optional search and type filter.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (1–100) |
| `search` | string | - | Search by name, email, or phone (partial, case-insensitive) |
| `type` | enum | - | Filter by owner type: INDIVIDUAL, COMPANY, PARTNERSHIP |

#### Example Response (200)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "יוסי כהן",
      "idNumber": "123456789",
      "type": "INDIVIDUAL",
      "email": "owner@example.com",
      "phone": "050-1234567",
      "address": "123 Main St, Tel Aviv",
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

### Get Owner by ID

`GET /api/owners/:id`

Returns a single owner by UUID.

#### Example Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "יוסי כהן",
  "idNumber": "123456789",
  "type": "INDIVIDUAL",
  "email": "owner@example.com",
  "phone": "050-1234567",
  "address": "123 Main St, Tel Aviv",
  "notes": null,
  "createdAt": "2025-02-27T10:00:00.000Z",
  "updatedAt": "2025-02-27T10:00:00.000Z"
}
```

---

### Update Owner

`PATCH /api/owners/:id`

Partially updates an owner. All fields are optional.

#### Example Request

```json
{
  "phone": "052-9876543",
  "notes": "Updated contact info"
}
```

#### Example Response (200)

Returns the updated owner object.

---

### Delete Owner

`DELETE /api/owners/:id`

Deletes an owner. Returns 204 No Content on success.

#### Error Cases

- **404** – Owner not found
- **409** – Owner has ownerships; cannot delete

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Validation error (e.g., invalid type, name too short) |
| 404 | Owner not found |
| 409 | Conflict – owner has ownerships |

## Related Endpoints

- **Ownerships** – Owners are linked to properties via [Ownerships API](ownerships.md)
- **List ownerships by owner:** `GET /api/owners/:ownerId/ownerships`
