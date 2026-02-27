# Epic 8: User Management & Settings

**Epic ID:** EPIC-08  
**Priority:** 🟠 High  
**Status:** ✅ Backend Complete (20/20 E2E tests passing), Frontend Implemented  
**Estimated Effort:** 4-6 days  
**Created:** February 6, 2026  
**Last Updated:** February 6, 2026

**Implementation Summary:** See [EPIC_08_IMPLEMENTATION_SUMMARY.md](./EPIC_08_IMPLEMENTATION_SUMMARY.md)

---

## 📋 Overview

Enable users to manage their profile information, account settings, and preferences. This epic builds on Epic 11 (Authentication) by allowing users to edit their profile, update account information, manage preferences, and control their sessions.

### Business Value
- Users can maintain accurate profile information
- Account owners can customize their account name
- Users can manage their preferences for better UX
- Session management for security
- Foundation for future team collaboration features

### User Benefit
Users have full control over their account information and can customize their experience through preferences and settings.

---

## 📖 User Stories

### US8.1: Edit User Profile
**As a** logged-in user  
**I can** edit my profile information (name)  
**So that** I can keep my profile information up to date

**Priority:** 🟠 High  
**Status:** ✅ Backend Complete (5/5 E2E tests passing), Frontend In Progress

**Acceptance Criteria:**
- User can access profile edit page/form
- User can update: Name (required)
- Email is displayed but read-only (managed by Google OAuth)
- System validates name is not empty
- Success message displayed on update
- Profile information updated immediately in UI
- Changes reflected in JWT token (on next login)

**Technical Requirements:**
- PATCH `/auth/profile` endpoint
- DTO validation with Zod
- Multi-tenancy enforcement (user can only edit own profile)
- Update User model in database

---

### US8.2: Update Account Settings
**As an** account owner  
**I can** update my account name  
**So that** I can customize how my account is identified

**Priority:** 🟠 High  
**Status:** ✅ Backend Complete (4/4 E2E tests passing), Frontend In Progress

**Acceptance Criteria:**
- Account owner can access account settings page
- Account owner can update: Account Name (required)
- System validates name is not empty
- Only account owners (role: OWNER) can update account settings
- Success message displayed on update
- Account name updated immediately in UI
- Account name displayed in account selector

**Technical Requirements:**
- PATCH `/auth/account` endpoint
- Role-based access control (OWNER only)
- DTO validation with Zod
- Multi-tenancy enforcement

---

### US8.3: View User Preferences
**As a** logged-in user  
**I can** view my user preferences  
**So that** I can see my current settings

**Priority:** 🟡 Medium  
**Status:** ✅ Backend Complete (3/3 E2E tests passing), Frontend In Progress

**Acceptance Criteria:**
- User can access preferences page
- Preferences displayed include: Language, Date Format, Currency, Theme (future)
- Preferences are loaded from database or localStorage
- Default preferences shown if none set

**Technical Requirements:**
- GET `/auth/preferences` endpoint
- Return user preferences or defaults
- Multi-tenancy enforcement

---

### US8.4: Update User Preferences
**As a** logged-in user  
**I can** update my user preferences  
**So that** I can customize my application experience

**Priority:** 🟡 Medium  
**Status:** ✅ Backend Complete (3/3 E2E tests passing), Frontend In Progress

**Acceptance Criteria:**
- User can update preferences: Language, Date Format, Currency, Theme (future)
- Preferences are saved to database
- Preferences persist across sessions
- Success message displayed on save
- UI updates immediately based on preferences

**Technical Requirements:**
- PUT `/auth/preferences` endpoint
- DTO validation with Zod
- Store preferences in database (UserPreferences table or User model)
- Multi-tenancy enforcement

---

### US8.5: View Active Sessions
**As a** logged-in user  
**I can** view my active sessions  
**So that** I can monitor where I'm logged in

**Priority:** 🟡 Medium  
**Status:** ✅ Backend Complete (3/3 E2E tests passing), Frontend In Progress

**Acceptance Criteria:**
- User can access sessions page
- List shows: Device, Location (IP-based), Last Activity, Current Session indicator
- User can see all active sessions
- Current session is highlighted

**Technical Requirements:**
- GET `/auth/sessions` endpoint
- Track sessions in database (Session model)
- Include device and location info
- Multi-tenancy enforcement

---

### US8.6: Logout from All Devices
**As a** logged-in user  
**I can** logout from all devices  
**So that** I can secure my account if needed

**Priority:** 🟡 Medium  
**Status:** ✅ Backend Complete (2/2 E2E tests passing), Frontend In Progress

**Acceptance Criteria:**
- User can initiate "Logout All" action
- Confirmation dialog shown before logout
- All sessions invalidated except current
- User remains logged in on current device
- Success message displayed
- Other devices will require re-login on next request

**Technical Requirements:**
- POST `/auth/logout-all` endpoint
- Invalidate all tokens except current
- Update session records
- Multi-tenancy enforcement

---

## 🔧 Technical Implementation

### Database Schema

```prisma
// User model already exists (Epic 11)
// Add preferences to User model or create UserPreferences table

model UserPreferences {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  language  String   @default("he")
  dateFormat String  @default("DD/MM/YYYY")
  currency  String   @default("ILS")
  theme     String   @default("light")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_preferences")
}

model Session {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  token       String   @unique
  device      String?
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  lastActivity DateTime @default(now()) @map("last_activity")
  createdAt   DateTime @default(now()) @map("created_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
  @@map("sessions")
}
```

### API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| PATCH | `/auth/profile` | Update user profile | ✅ JWT |
| PATCH | `/auth/account` | Update account settings | ✅ JWT (OWNER) |
| GET | `/auth/preferences` | Get user preferences | ✅ JWT |
| PUT | `/auth/preferences` | Update user preferences | ✅ JWT |
| GET | `/auth/sessions` | Get active sessions | ✅ JWT |
| POST | `/auth/logout-all` | Logout from all devices | ✅ JWT |

---

## 📝 Implementation Notes

- Builds on Epic 11 (Authentication) - requires existing auth system
- Multi-tenancy enforced on all endpoints
- Role-based access control for account settings (OWNER only)
- Preferences can be stored in UserPreferences table or User model JSON field
- Session tracking requires token storage mechanism

---

## ✅ Epic Completion Criteria

- [ ] All 6 user stories implemented
- [ ] All E2E tests passing
- [ ] Backend API endpoints tested
- [ ] Frontend components implemented
- [ ] Multi-tenancy enforced
- [ ] Role-based access control working
- [ ] Preferences persist across sessions

---

**Last Updated:** February 6, 2026  
**Version:** 1.0
