# Epic 11: Authentication & Multi-Tenancy

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented  
**Created:** February 2, 2026  
**Last Updated:** February 2, 2026

---

## Overview

Authentication & Multi-Tenancy is the foundational security epic that enables secure user authentication with Google OAuth 2.0 and ensures complete account isolation across all application features. This epic provides secure login/logout functionality, JWT-based session management, automatic account creation for new users, role-based access control (OWNER/USER), and strict multi-tenancy enforcement ensuring users can only access data belonging to their account.

**Business Value:**
- Secure authentication without password management overhead
- Complete data isolation between accounts (multi-tenancy)
- Seamless user onboarding with automatic account creation
- Role-based access control for future team collaboration features
- Foundation for all other epics (all features depend on authentication)
- Account status management for administrative control

---

## User Stories

### US11.1: Login with Google OAuth
**As a** user,  
**I can** log in using my Google account,  
**So that** I can securely access the application without managing passwords.

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US11.2: Automatic Account Creation
**As a** new user,  
**I can** automatically get an account created when I log in for the first time,  
**So that** I can start using the application immediately without manual registration.

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US11.3: Auto-Login with Stored Token
**As a** returning user,  
**I can** automatically log in using my stored authentication token,  
**So that** I don't have to log in every time I visit the application.

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US11.4: Logout
**As a** logged-in user,  
**I can** log out of the application,  
**So that** I can securely end my session and prevent unauthorized access.

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US11.5: View My Profile
**As a** logged-in user,  
**I can** view my account information including email, name, role, and account details,  
**So that** I can verify my account information and understand my access level.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US11.6: Account Isolation (Multi-Tenancy)
**As a** user,  
**I can** only access data belonging to my account,  
**So that** my data is completely isolated from other users' data and remains private.

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US11.7: Role-Based Access Control
**As a** system administrator,  
**I can** assign roles (OWNER/USER) to users,  
**So that** I can control access levels and prepare for future team collaboration features.

**Priority:** 🟡 Medium  
**Status:** ✅ Implemented (Database schema ready, UI pending)

---

### US11.8: Account Status Management
**As a** system administrator,  
**I can** manage account status (ACTIVE/SUSPENDED/INACTIVE),  
**So that** I can control which accounts can access the system and suspend problematic accounts.

**Priority:** 🟡 Medium  
**Status:** ✅ Implemented (Database schema ready, UI pending)

---

## Acceptance Criteria

### US11.1: Login with Google OAuth
- [x] User can click "Login with Google" button
- [x] User is redirected to Google OAuth consent screen
- [x] User can grant permissions (email, profile)
- [x] After consent, user is redirected back to application
- [x] JWT token is generated and stored in localStorage
- [x] User is redirected to application dashboard/home
- [x] Login flow works in both development and production environments
- [x] Google OAuth credentials are configured via environment variables
- [x] Error handling for OAuth failures (user denies, network errors)
- [x] Loading state shown during OAuth flow

---

### US11.2: Automatic Account Creation
- [x] New user logging in for first time triggers account creation
- [x] Account is created with default name: "{FirstName}'s Account"
- [x] Account status is set to ACTIVE by default
- [x] User is created with email from Google profile
- [x] User is created with name from Google profile
- [x] User is created with googleId from Google profile
- [x] First user in account is assigned OWNER role
- [x] Account and user creation happens in database transaction
- [x] User's lastLoginAt is set to current timestamp
- [x] JWT token is generated immediately after account creation
- [x] User can access application immediately after first login

---

### US11.3: Auto-Login with Stored Token
- [x] Application checks for stored token on page load
- [x] If valid token exists, user is automatically logged in
- [x] Token is validated for expiration before auto-login
- [x] Expired tokens are automatically removed from storage
- [x] Invalid tokens are automatically removed from storage
- [x] User session is restored (user info, account context)
- [x] Auto-login works across browser sessions (localStorage persistence)
- [x] Auto-login works after page refresh
- [x] Auto-login works after closing and reopening browser
- [x] Development mode bypass available for testing (dev login endpoint)

---

### US11.4: Logout
- [x] Logout button/action available in user interface
- [x] Clicking logout removes token from localStorage
- [x] User is redirected to home/login page after logout
- [x] All user session data is cleared
- [x] User cannot access protected routes after logout
- [x] Logout works from any page in the application
- [x] Logout clears any cached data (React Query cache)

---

### US11.5: View My Profile
- [x] Profile endpoint available: `GET /auth/profile`
- [x] Endpoint requires JWT authentication
- [x] Endpoint returns user information: id, email, name, role, accountId
- [x] Endpoint returns account information: account name, account status
- [x] Profile information is displayed in user interface
- [x] Profile page/section accessible from navigation
- [x] Profile information is accurate and up-to-date
- [x] Profile endpoint enforces multi-tenancy (user can only view own profile)

---

### US11.6: Account Isolation (Multi-Tenancy)
- [x] All database queries filter by accountId
- [x] Users can only access data belonging to their account
- [x] Account ID is extracted from JWT token
- [x] Account ID is validated on every API request
- [x] Attempts to access other accounts' data return 403 Forbidden
- [x] Account isolation enforced at database level (Prisma queries)
- [x] Account isolation enforced at API level (guards and decorators)
- [x] Account isolation enforced at service level (accountId parameter required)
- [x] Development mode supports X-Account-Id header for testing
- [x] Production mode uses JWT token exclusively
- [x] All CRUD operations enforce account isolation
- [x] All list/query operations filter by accountId
- [x] Account isolation tested and verified for all entities (properties, units, tenants, leases, etc.)

---

### US11.7: Role-Based Access Control
- [x] User model includes role field (UserRole enum)
- [x] UserRole enum values: OWNER, USER
- [x] Role is included in JWT token payload
- [x] Role is accessible in backend services via request.user
- [x] First user in account is assigned OWNER role
- [x] Role can be updated in database
- [ ] UI for managing user roles (pending - future enhancement)
- [ ] Role-based permissions enforced in API endpoints (pending - future enhancement)
- [ ] Role-based UI features (pending - future enhancement)

---

### US11.8: Account Status Management
- [x] Account model includes status field (AccountStatus enum)
- [x] AccountStatus enum values: ACTIVE, SUSPENDED, INACTIVE
- [x] New accounts are created with ACTIVE status
- [x] JWT validation checks account status (only ACTIVE accounts can authenticate)
- [x] Suspended accounts cannot authenticate (401 Unauthorized)
- [x] Inactive accounts cannot authenticate (401 Unauthorized)
- [x] Account status can be updated in database
- [ ] UI for managing account status (pending - future enhancement)
- [ ] Admin endpoints for account status management (pending - future enhancement)
- [ ] Account suspension workflow (pending - future enhancement)

---

## Implementation Notes

### Database Tables

**Primary Tables:**
- `accounts` - Account table with name and status
- `users` - User table with email, name, googleId, role, and accountId

**Enums:**
- `AccountStatus`: ACTIVE, SUSPENDED, INACTIVE
- `UserRole`: OWNER, USER

**Relationships:**
- Account has many Users (one-to-many)
- User belongs to Account (many-to-one)
- Account has many Properties, Tenants, Leases, etc. (one-to-many)

**Indexes:**
- `users.accountId` - Indexed for account filtering
- `users.email` - Unique index for email lookup
- `users.googleId` - Unique index for OAuth lookup

---

### Authentication Flow

**Google OAuth Flow:**
```
1. User clicks "Login with Google"
2. Frontend redirects to: GET /auth/google
3. Backend initiates Google OAuth flow (Passport Google Strategy)
4. User authenticates with Google and grants permissions
5. Google redirects to: GET /auth/google/callback
6. Backend validates OAuth response (GoogleStrategy.validate)
7. Backend checks if user exists by googleId
8. If new user: Create account + user in transaction
9. If existing user: Update lastLoginAt timestamp
10. Backend generates JWT token with user info and accountId
11. Backend redirects to frontend: /auth/callback?token={jwt}
12. Frontend stores token in localStorage
13. Frontend redirects to dashboard/home
```

**JWT Token Structure:**
```typescript
{
  sub: string;        // User ID
  email: string;      // User email
  accountId: string;  // Account ID (for multi-tenancy)
  role: string;       // User role (OWNER/USER)
  iat: number;        // Issued at timestamp
  exp: number;        // Expiration timestamp
  iss: 'rent-app';    // Issuer
  aud: 'rent-app-users'; // Audience
}
```

**Token Storage:**
- Frontend: localStorage (key: `auth_token`)
- Token expiration: 1 day (configurable via environment variable)
- Token validation: On every API request

---

### API Guards and Decorators

**JWT Authentication Guard:**
- `JwtAuthGuard` - Validates JWT token on protected routes
- Extracts user info from token payload
- Attaches user object to request (`request.user`)
- Checks account status (only ACTIVE accounts allowed)

**Account Guard:**
- `AccountGuard` - Extracts accountId from authenticated user
- Attaches accountId to request (`request.accountId`)
- Used in combination with JwtAuthGuard

**Account ID Decorator:**
- `@AccountId()` - Parameter decorator to extract accountId
- Usage: `async findAll(@AccountId() accountId: string)`
- Returns accountId from request.user or request.accountId

**Public Decorator:**
- `@Public()` - Marks routes as public (no authentication required)
- Used for login endpoints, OAuth callbacks, health checks

**Development Mode:**
- `DevAuthGuard` - Bypasses JWT validation in development
- Uses `X-Account-Id` header for testing
- Only available when `NODE_ENV !== 'production'`
- `JwtAuthGuard` also checks for `X-Account-Id` header in development

---

### Frontend Auth Context

**Authentication Utilities (`apps/frontend/src/lib/auth.ts`):**
- `login()` - Initiates Google OAuth login flow
- `logout()` - Clears token and redirects to home
- `handleCallback(token)` - Stores token after OAuth callback
- `isAuthenticated()` - Checks if user is authenticated
- `getToken()` - Retrieves stored token
- `setAuthToken(token)` - Stores token in localStorage

**Token Validation:**
- Checks token format (JWT structure: 3 parts separated by dots)
- Decodes payload to check expiration
- Removes expired/invalid tokens automatically
- Development mode bypass available

**API Client Integration:**
- All API requests include token in Authorization header: `Bearer {token}`
- Token is automatically attached to requests
- 401 responses trigger logout and redirect to login

---

### Multi-Tenancy Implementation

**Backend Implementation:**
- All service methods accept `accountId` parameter
- All Prisma queries include `where: { accountId }`
- Account ID extracted from JWT token via `JwtStrategy.validate()`
- Account ID attached to request via `AccountGuard`
- Account ID accessible via `@AccountId()` decorator

**Example Service Pattern:**
```typescript
async findAll(accountId: string) {
  return this.prisma.property.findMany({
    where: { accountId } // Multi-tenancy filter
  });
}

async findOne(id: string, accountId: string) {
  return this.prisma.property.findFirst({
    where: { 
      id,
      accountId // Multi-tenancy filter
    }
  });
}
```

**Example Controller Pattern:**
```typescript
@Controller('properties')
@UseGuards(JwtAuthGuard, AccountGuard)
export class PropertiesController {
  @Get()
  async findAll(@AccountId() accountId: string) {
    return this.propertiesService.findAll(accountId);
  }
}
```

**Frontend Implementation:**
- Account ID automatically included in JWT token
- No manual account ID handling required in frontend
- All API calls automatically scoped to user's account
- Account context available via React Context (if needed)

**Development Mode:**
- `X-Account-Id` header can be used to simulate different accounts
- Useful for testing multi-tenancy isolation
- Only available in development environment

---

### Security Requirements

**JWT Security:**
- Secret key stored in environment variables (never in code)
- Token expiration: 1 day (configurable)
- Token signed with HS256 algorithm
- Token includes issuer and audience claims
- Token validation on every request

**OAuth Security:**
- Google OAuth credentials stored in environment variables
- OAuth callback URL validated
- OAuth state parameter (can be added for CSRF protection)
- HTTPS required in production

**Account Isolation Security:**
- Account ID always extracted from JWT (never from user input)
- Account ID validated on every database query
- No cross-account data access possible
- 403 Forbidden returned for unauthorized access attempts

**API Security:**
- All endpoints protected by default (opt-out with `@Public()`)
- CORS configured for frontend origin only
- Rate limiting recommended (future enhancement)
- Input validation on all endpoints (class-validator)

---

### API Endpoints

**Base Path:** `/api/auth`

| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| GET | `/auth/google` | Initiate Google OAuth login | ❌ Public | ✅ Implemented |
| GET | `/auth/google/callback` | Google OAuth callback | ❌ Public | ✅ Implemented |
| GET | `/auth/profile` | Get current user profile | ✅ JWT | ✅ Implemented |
| POST | `/auth/dev-login` | Development login bypass | ❌ Public (dev only) | ✅ Implemented |

**Query Parameters:**
- `/auth/google/callback?token={jwt}` - Token passed to frontend after OAuth

**Request Headers:**
- `Authorization: Bearer {token}` - JWT token for authenticated requests
- `X-Account-Id: {uuid}` - Development mode account ID (dev only)

**Response Format:**
```typescript
// Profile response
{
  userId: string;
  email: string;
  accountId: string;
  role: 'OWNER' | 'USER';
}

// OAuth callback redirects to frontend
// Frontend URL: /auth/callback?token={jwt}
```

---

### Frontend Components

**Main Components:**
- `AuthCallbackPage` (`apps/frontend/src/app/auth/callback/page.tsx`)
  - Handles OAuth callback
  - Extracts token from URL
  - Stores token in localStorage
  - Redirects to dashboard

- `LoginButton` (if exists)
  - Initiates Google OAuth login
  - Calls `login()` from auth utilities

**Service Layer:**
- `auth.ts` (`apps/frontend/src/lib/auth.ts`)
  - Authentication utilities
  - Token management
  - Login/logout functions

- `api.ts` (`apps/frontend/src/lib/api.ts`)
  - API client configuration
  - Token attachment to requests
  - 401 error handling (logout)

---

### Environment Variables

**Backend (.env):**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Frontend URL (for OAuth redirect)
FRONTEND_URL=http://localhost:3001
```

**Frontend (.env.local):**
```bash
# Google OAuth (for direct OAuth flow if needed)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback

# Development mode
NEXT_PUBLIC_DEV_MODE=false
```

---

### Error Handling

**Backend Errors:**
- 401 Unauthorized - Missing or invalid JWT token
- 401 Unauthorized - Account status is not ACTIVE
- 403 Forbidden - Attempting to access other account's data
- 500 Internal Server Error - Server errors

**Frontend Error Handling:**
- 401 responses trigger automatic logout
- Error messages displayed in Snackbar
- Loading states during authentication
- Error states for OAuth failures

**OAuth Error Handling:**
- User denies permission - Redirect to login with error message
- Network errors - Display error message, allow retry
- Invalid callback - Log error, redirect to login

---

### Testing Considerations

**Unit Tests:**
- AuthService methods (validateOAuthLogin, createUserWithAccount, generateToken)
- JWT strategy validation
- Account guard logic
- Token generation and validation

**Integration Tests:**
- OAuth flow end-to-end
- Account creation flow
- Token refresh flow
- Multi-tenancy enforcement
- Account status validation

**E2E Tests:**
- Login flow (Google OAuth)
- Auto-login flow (stored token)
- Logout flow
- Account isolation (user A cannot access user B's data)
- Account status enforcement (SUSPENDED accounts cannot login)

**Test Data:**
- Mock Google OAuth responses
- Test accounts with different statuses
- Test users with different roles
- Test tokens (valid, expired, invalid)

---

### Future Enhancements

**Planned Features:**
- [ ] Token refresh mechanism (refresh tokens)
- [ ] Remember me functionality (longer token expiration)
- [ ] Two-factor authentication (2FA)
- [ ] Password-based login (alternative to OAuth)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Account switching (users with multiple accounts)
- [ ] Team collaboration (invite users to account)
- [ ] Role-based permissions (fine-grained access control)
- [ ] Account settings page (update account name, etc.)
- [ ] User profile editing (update name, email preferences)
- [ ] Session management (view active sessions, logout all devices)
- [ ] Admin panel for account management
- [ ] Account suspension workflow with notifications
- [ ] Account deletion workflow

**Related Epics:**
- All other epics depend on Epic 11 (authentication required)
- Epic 12: User Management (future - team collaboration)
- Epic 13: Admin Panel (future - account management)

---

## Related Documentation

- [Database Schema](../../apps/backend/prisma/schema.prisma)
- [Authentication Implementation](../../apps/backend/src/modules/auth/)
- [Multi-Tenancy Standards](../../.cursor/rules/rent-application-standards.mdc)
- [Epics Overview](./EPICS_OVERVIEW.md)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0
