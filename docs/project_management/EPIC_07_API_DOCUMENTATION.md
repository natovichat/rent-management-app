# Epic 7: API Documentation

**Priority:** 🟠 High  
**Status:** 📋 Planning  
**Complexity:** Low  
**Created:** February 12, 2026  
**Dependencies:** Can run in parallel with Epics 2–6

---

## Overview

API Documentation provides comprehensive, maintainable API documentation for the rebuilt backend. This epic ensures all endpoints are documented with request/response schemas, examples, and authentication requirements. Documentation can be generated from code (OpenAPI/Swagger) or maintained manually.

**Business Value:**
- Developer onboarding
- Frontend integration reference
- API contract clarity
- Reduced integration errors

---

## User Stories

### US7.1: OpenAPI/Swagger Specification
**As a** developer,  
**I can** access an OpenAPI 3.0 specification documenting all API endpoints,  
**So that** I have a machine-readable API contract.

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Dependencies:** At least Epic 1 (Core Entities) endpoints implemented

**Acceptance Criteria:**
- [ ] OpenAPI 3.0 spec file (openapi.yaml or openapi.json)
- [ ] All implemented endpoints documented
- [ ] Request/response schemas for each endpoint
- [ ] Path parameters, query parameters, request bodies documented
- [ ] HTTP status codes documented (200, 201, 400, 404, 409, 500)
- [ ] Authentication (Bearer JWT) documented
- [ ] Spec validates with OpenAPI validator

---

### US7.2: Interactive Swagger UI
**As a** developer,  
**I can** use an interactive Swagger UI to explore and test API endpoints,  
**So that** I can experiment with the API without writing code.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US7.1

**Acceptance Criteria:**
- [ ] Swagger UI served at `/api/docs` or `/docs`
- [ ] Loads OpenAPI spec
- [ ] Try-it-out functionality works (with auth)
- [ ] Available in development environment
- [ ] Optionally disabled or protected in production

---

### US7.3: DTO and Schema Documentation
**As a** developer,  
**I can** see documentation for all DTOs including validation rules,  
**So that** I understand request/response structure.

**Priority:** 🟠 High  
**Complexity:** Low  
**Dependencies:** US7.1

**Acceptance Criteria:**
- [ ] All Create/Update DTOs documented in OpenAPI components/schemas
- [ ] Required vs optional fields marked
- [ ] Validation rules (min, max, pattern, enum) documented
- [ ] Example values for complex types
- [ ] Nested objects (e.g., Person in Ownership response) documented

---

### US7.4: API Changelog and Versioning
**As a** developer,  
**I can** see an API changelog and understand versioning strategy,  
**So that** I can track API changes over time.

**Priority:** 🟡 Medium  
**Complexity:** Low  
**Dependencies:** US7.1

**Acceptance Criteria:**
- [ ] API version in OpenAPI spec (e.g., v1)
- [ ] Changelog document (CHANGELOG.md or API_CHANGELOG.md)
- [ ] Breaking changes documented
- [ ] Deprecation notices when applicable
- [ ] Versioning strategy documented (e.g., URL path /api/v1/)

---

## Dependencies Between Stories

```
Epic 1 (or any epic with endpoints)
   │
   ├─► US7.1 ──► US7.2
   │      └─► US7.3
   │
   └─► US7.4 (depends on US7.1)
```

---

## Technical Notes

**NestJS Swagger Integration:**
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Real Estate API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**DTO decorators for Swagger:**
```typescript
@ApiProperty({ example: 'John Doe', description: 'Person name' })
name: string;

@ApiPropertyOptional({ enum: [ 'INDIVIDUAL', 'COMPANY', 'PARTNERSHIP' ] })
type?: PersonType;
```

---

## Related Documentation

- [Rebuild Epics Overview](./REBUILD_EPICS_OVERVIEW.md)
- [Epic 1: Core Entities](./EPIC_01_CORE_ENTITIES.md)

---

**Last Updated:** February 12, 2026
