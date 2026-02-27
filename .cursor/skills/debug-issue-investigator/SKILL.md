---
name: debug-issue-investigator
description: Systematically investigates bugs and issues by analyzing frontend console logs, backend server logs, database queries, and network requests. Use when debugging production issues, investigating errors, troubleshooting failures, or when the user reports bugs, mentions errors, logs, or debugging.
---

# Debug Issue Investigator

Expert debugger with systematic approach to investigating issues in full-stack applications using frontend and backend log analysis.

## Core Investigation Approach

### Phase 1: Initial Assessment

1. **Gather Issue Details**
   - User-reported symptoms
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (dev/staging/production)
   - Recent changes or deployments

2. **Check Quick Wins**
   - Is the service running?
   - Are there any obvious errors in recent logs?
   - Have there been recent deployments?
   - Are there known issues with similar symptoms?

### Phase 2: Frontend Investigation

#### Browser Console Analysis

**Location**: Browser DevTools → Console

```bash
# Open browser console and look for:
# 1. JavaScript errors (red text)
# 2. Failed network requests (red/yellow)
# 3. Warning messages (yellow)
# 4. React errors/warnings
```

**Common Frontend Issues to Check:**

```typescript
// ❌ Network Request Failures
// Look for: Failed to fetch, 404, 500, CORS errors
// Example console error:
// "GET http://localhost:3000/api/properties 500 (Internal Server Error)"

// ❌ React State/Rendering Issues
// Look for: "Cannot read property X of undefined"
// "Maximum update depth exceeded"

// ❌ Type/Data Issues
// Look for: "X is not a function"
// "Cannot convert undefined to object"

// ❌ Authentication Issues
// Look for: 401, 403 responses
// "Token expired" or "Invalid token"
```

#### Network Tab Analysis

**Location**: Browser DevTools → Network

```bash
# Investigate:
1. Failed requests (Status: 4xx, 5xx)
2. Request headers (Authorization token present?)
3. Request payload (correct data being sent?)
4. Response payload (error message from backend?)
5. Response time (performance issues?)
```

**Network Investigation Checklist:**
- [ ] Request URL correct?
- [ ] Request method correct (GET/POST/PUT/DELETE)?
- [ ] Authorization header present?
- [ ] Request body valid JSON?
- [ ] Response status code?
- [ ] Response error message?

#### React Query DevTools

**For React Query state inspection:**

```typescript
// Check in React Query DevTools:
// 1. Query status (loading, error, success)
// 2. Query data/error
// 3. Cache state
// 4. Refetch triggers

// Common React Query issues:
// - Stale queries not refetching
// - Cache invalidation not working
// - Query keys not matching
```

### Phase 3: Backend Investigation

#### NestJS Server Logs

**Locations to check:**
1. **Development**: Terminal running `npm run start:dev`
2. **Docker**: `docker logs <container-name>`
3. **Production**: Application logs (file or logging service)

**Log Analysis Commands:**

```bash
# Real-time log monitoring
npm run start:dev # Shows all logs in terminal

# Docker logs
docker logs -f rentapp-backend --tail 100

# Filter logs by level
grep "ERROR" logs/app.log
grep "WARN" logs/app.log

# Search for specific error
grep -i "prisma" logs/app.log
grep -i "cannot read property" logs/app.log

# Show last 50 lines
tail -50 logs/app.log

# Follow logs in real-time
tail -f logs/app.log
```

**NestJS Error Patterns:**

```typescript
// ❌ Database/Prisma Errors
// Look for:
// "Invalid `prisma.property.findMany()` invocation"
// "Foreign key constraint failed"
// "Unique constraint failed"
// "Query engine error"

// ❌ Validation Errors
// Look for:
// "Validation failed"
// "Bad Request Exception"
// "DTO validation error"

// ❌ Authentication/Authorization Errors
// Look for:
// "Unauthorized"
// "Invalid token"
// "Token expired"
// "Forbidden resource"

// ❌ Business Logic Errors
// Look for:
// Custom exception messages
// "NotFoundException"
// "ConflictException"
// "BadRequestException"

// ❌ Unhandled Exceptions
// Look for:
// "Unhandled Promise Rejection"
// Stack traces
// "Internal server error"
```

#### Database Query Analysis

**Using Prisma Query Logs:**

```typescript
// Enable Prisma query logging in prisma.service.ts
// or schema.prisma:
// log: ['query', 'error', 'warn']

// Look for:
// 1. Slow queries (execution time)
// 2. N+1 query problems
// 3. Missing indexes
// 4. Failed queries with SQL errors
```

**Example Prisma Log Investigation:**

```bash
# In logs, look for:
prisma:query SELECT "Property"."id", "Property"."address" FROM "Property" WHERE 1=1 AND "Property"."account_id" = $1

# Check:
# - Is accountId filter present? (CRITICAL for multi-tenancy)
# - Are there many similar queries? (N+1 problem)
# - Query execution time
# - Any SQL syntax errors
```

### Phase 4: Systematic Debugging Workflow

#### Step-by-Step Investigation

```markdown
## Investigation Checklist

### 1. Reproduce the Issue
- [ ] Can reproduce locally?
- [ ] Steps to reproduce documented
- [ ] Issue happens consistently or intermittently?

### 2. Check Frontend
- [ ] Browser console errors reviewed
- [ ] Network tab checked for failed requests
- [ ] Request/response payloads examined
- [ ] React state inspected (if applicable)
- [ ] Error boundaries checked

### 3. Check Backend
- [ ] Server logs reviewed
- [ ] Error stack traces analyzed
- [ ] Database query logs examined
- [ ] Authentication/authorization verified
- [ ] Request body validation checked

### 4. Check Database
- [ ] Prisma migrations up to date
- [ ] Data integrity verified
- [ ] Constraints not violated
- [ ] No orphaned records

### 5. Identify Root Cause
- [ ] Error message indicates cause
- [ ] Stack trace shows failing function
- [ ] Data flow traced end-to-end
- [ ] Hypothesis about cause formed

### 6. Verify Fix
- [ ] Fix implemented and tested locally
- [ ] Unit tests added for regression
- [ ] Integration tests pass
- [ ] Issue no longer reproduces
```

## Common Issue Patterns

### Pattern 1: Multi-Tenancy Violation

**Symptom**: User sees data from another account

**Investigation**:
```bash
# Check backend logs for queries
grep "SELECT.*WHERE" logs/app.log

# Look for missing accountId filter
# ❌ Bad: SELECT * FROM properties WHERE id = '...'
# ✅ Good: SELECT * FROM properties WHERE id = '...' AND account_id = '...'
```

**Fix**:
```typescript
// ❌ Bad - No account filter
async findAll() {
  return this.prisma.property.findMany();
}

// ✅ Good - Account filter present
async findAll(accountId: string) {
  return this.prisma.property.findMany({
    where: { accountId }
  });
}
```

### Pattern 2: Frontend-Backend Type Mismatch

**Symptom**: `undefined` errors in frontend despite backend returning data

**Investigation**:
```typescript
// 1. Check backend response in Network tab
// Example response: { id: "123", name: "Test", created_at: "..." }

// 2. Check frontend code expecting:
interface Property {
  id: string;
  name: string;
  createdAt: string; // ❌ Mismatch! Backend uses created_at
}

// Console error: "Cannot read property 'createdAt' of object"
```

**Fix**:
```typescript
// Option 1: Map in frontend
const property = {
  ...backendData,
  createdAt: backendData.created_at
};

// Option 2: Transform in backend DTO
export class PropertyResponseDto {
  id: string;
  name: string;
  
  @Expose({ name: 'created_at' })
  createdAt: string;
}
```

### Pattern 3: Prisma Unique Constraint Violation

**Symptom**: `500 Internal Server Error` on create/update

**Backend Log**:
```
Unique constraint failed on the fields: (`email`)
```

**Investigation**:
```bash
# Check server logs for Prisma error
grep "Unique constraint" logs/app.log

# Check which field violates constraint
# Usually: email, fileNumber, username
```

**Fix**:
```typescript
// Add proper error handling
async create(createUserDto: CreateUserDto) {
  try {
    return await this.prisma.user.create({
      data: createUserDto
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`
      );
    }
    throw error;
  }
}
```

### Pattern 4: N+1 Query Problem

**Symptom**: Page loads slowly, many database queries

**Investigation**:
```bash
# Check Prisma query logs
grep "prisma:query" logs/app.log | wc -l
# If count is very high for simple operation → N+1 problem

# Example N+1:
# SELECT * FROM properties
# SELECT * FROM owners WHERE id = '1' (repeated for each property)
# SELECT * FROM owners WHERE id = '2'
# ...
```

**Fix**:
```typescript
// ❌ Bad - N+1 queries
async getPropertiesWithOwners() {
  const properties = await this.prisma.property.findMany();
  
  // This causes N queries (one per property)
  for (const property of properties) {
    property.owner = await this.prisma.owner.findUnique({
      where: { id: property.ownerId }
    });
  }
  
  return properties;
}

// ✅ Good - Single query with include
async getPropertiesWithOwners() {
  return this.prisma.property.findMany({
    include: {
      owner: true // Eager load in one query
    }
  });
}
```

### Pattern 5: CORS Error

**Symptom**: Frontend cannot reach backend, CORS error in console

**Frontend Console Error**:
```
Access to fetch at 'http://localhost:4000/api/properties' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Investigation**:
```typescript
// Check backend main.ts for CORS configuration
// Check that frontend origin is allowed
```

**Fix**:
```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

## Tools and Commands

### Frontend Debugging

```bash
# Run frontend with verbose logging
npm run dev -- --verbose

# Check React component tree
# Use React DevTools browser extension

# Network request inspection
# Browser DevTools → Network → Filter by XHR/Fetch
```

### Backend Debugging

```bash
# Run with debug logging
DEBUG=* npm run start:dev

# Run with Prisma query logging
DATABASE_LOGGING=true npm run start:dev

# Inspect specific module
DEBUG=nestjs:* npm run start:dev

# Check application health
curl http://localhost:4000/health

# Test API endpoint
curl -X GET http://localhost:4000/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Debugging

```bash
# Connect to database
npx prisma studio

# Check migrations
npx prisma migrate status

# Reset database (CAUTION: loses data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Run seed
npx prisma db seed
```

## Debugging Techniques

### 1. Binary Search Debugging

When unsure where error occurs:

```typescript
// Add console.logs to narrow down
console.log('1. Before service call');
const result = await this.service.getData();
console.log('2. After service call', result);

const processed = this.processData(result);
console.log('3. After processing', processed);

return processed;
// Find which log appears last before error
```

### 2. Isolate Variables

Test each part independently:

```typescript
// Instead of chaining:
const result = await this.service.getData()
  .then(data => this.process(data))
  .then(processed => this.save(processed));

// Break down:
const data = await this.service.getData();
console.log('Data:', data); // Check data

const processed = this.process(data);
console.log('Processed:', processed); // Check processing

const saved = await this.save(processed);
console.log('Saved:', saved); // Check saving
```

### 3. Mock and Compare

When frontend-backend integration fails:

```typescript
// Frontend: Mock the API response
const mockResponse = {
  id: '123',
  name: 'Test Property',
  // ... expected structure
};

// Check if component works with mock
// If yes → backend response format issue
// If no → frontend logic issue
```

### 4. Add Detailed Logging

```typescript
// Backend service
async findOne(id: string, accountId: string) {
  this.logger.log(`Finding property ${id} for account ${accountId}`);
  
  const property = await this.prisma.property.findFirst({
    where: { id, accountId }
  });
  
  if (!property) {
    this.logger.warn(`Property ${id} not found for account ${accountId}`);
    throw new NotFoundException('Property not found');
  }
  
  this.logger.log(`Property ${id} found successfully`);
  return property;
}
```

## Production Debugging

### Safe Investigation Steps

```bash
# 1. Check application logs (READ ONLY)
tail -f /var/log/app/backend.log

# 2. Check error tracking service (Sentry, etc.)
# Look for error patterns and frequency

# 3. Check monitoring dashboards
# CPU, memory, response times, error rates

# 4. Review recent deployments
git log --oneline --since="24 hours ago"

# 5. Check database performance
# Query slow query logs
# Check connection pool usage
```

### Production Debugging Rules

- ✅ **DO**: Read logs, check monitoring, review code
- ❌ **DON'T**: Make changes directly in production
- ❌ **DON'T**: Run experimental queries on production DB
- ❌ **DON'T**: Add console.logs and deploy
- ✅ **DO**: Reproduce in staging/dev first
- ✅ **DO**: Add proper logging for future debugging
- ✅ **DO**: Write regression tests

## Communication During Debugging

### Status Updates

```markdown
**Investigating [Issue]**

**Status**: Investigating
**Started**: [Time]
**Current findings**: 
- Frontend error: [Error message]
- Backend logs show: [Log excerpt]
- Hypothesis: [Your theory]

**Next steps**:
- [ ] Test hypothesis by [action]
- [ ] Check [component/service]
- [ ] Verify [assumption]

**ETA**: [Estimated time to resolution]
```

### Issue Report

```markdown
## Bug Report: [Issue Title]

**Severity**: Critical/High/Medium/Low

### Symptoms
- [What the user experiences]
- [Error messages shown]

### Root Cause
- [Technical explanation]
- [Why it happens]

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Error occurs]

### Fix Implemented
- [Changes made]
- [Files modified]

### Verification
- [ ] Unit tests added
- [ ] Integration tests pass
- [ ] Issue no longer reproduces
- [ ] Regression tests prevent recurrence

### Prevention
- [How to prevent similar issues]
- [Monitoring/alerting added]
```

## Deliverables After Debugging

When issue is resolved:

- [ ] **Root cause identified and documented**
- [ ] **Fix implemented and tested**
- [ ] **Regression tests added**
- [ ] **Code reviewed and merged**
- [ ] **Documentation updated** (if needed)
- [ ] **Monitoring/logging improved** (if applicable)
- [ ] **Team notified** of resolution
- [ ] **Prevention measures** documented

---

**Remember**: Systematic investigation beats random guessing. Check logs first, form hypotheses, test one thing at a time, and document findings for future reference.
