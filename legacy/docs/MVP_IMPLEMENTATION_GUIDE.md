# Rent Application MVP - Implementation Guide

This document provides a complete guide for implementing the MVP of the rent management SaaS application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Resources](#development-resources)
4. [Implementation Phases](#implementation-phases)
5. [Quality Assurance](#quality-assurance)
6. [Deployment](#deployment)

---

## Project Overview

### Goal
Build a multi-tenant SaaS application for property rental management with:
- Google OAuth authentication
- Multi-tenant data isolation
- Property, Unit, Tenant, and Lease management
- Automated lease expiration notifications
- Hebrew RTL interface

### MVP Scope (10-14 weeks)

**In Scope:**
- ✅ Google OAuth authentication with automatic account creation
- ✅ CRUD operations for Properties, Units, Tenants, Leases
- ✅ Property portfolio management with ownership tracking
- ✅ Mortgage and financial tracking
- ✅ Dashboard with statistics and charts
- ✅ Lease expiration notifications (email, 30/60/90 days)
- ✅ Hebrew RTL web interface
- ✅ Desktop-first responsive design

**Out of Scope (Post-MVP):**
- ❌ Payment tracking and management
- ❌ Advanced reports
- ❌ Multi-user management with roles
- ❌ Mobile app
- ❌ SMS/WhatsApp notifications
- ❌ Document uploads

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Material-UI (MUI) with RTL
- React Query
- React Hook Form + Zod

**Backend:**
- NestJS
- TypeScript
- PostgreSQL + Prisma
- Google OAuth + JWT
- Schedule (cron jobs)

**Infrastructure:**
- Docker
- CI/CD (GitHub Actions / GitLab CI)
- Cloud hosting (AWS / GCP / Vercel)

---

## Architecture

### Database Schema

```
┌─────────────┐
│   Account   │
└──────┬──────┘
       │
       ├──────┐
       │      │
┌──────▼────┐ ├──────────┐
│   User    │ │          │
└───────────┘ │          │
              │          │
         ┌────▼─────┐    │
         │ Property │    │
         └────┬─────┘    │
              │          │
         ┌────▼─────┐    │
         │   Unit   │    │
         └────┬─────┘    │
              │          │
         ┌────▼─────┐    │
         │  Lease   ├────┤
         └────┬─────┘    │
              │          │
         ┌────▼─────┐    │
         │ Tenant   ├────┘
         └──────────┘
```

### Multi-Tenancy Model

- **Row-Level Security**: Every table (except Account/User) has `accountId`
- **Account Isolation**: All queries filter by `accountId` from JWT token
- **Data Cascade**: Deleting account deletes all related data

### Authentication Flow

```
User → Google OAuth → Backend validates
     → Create/Get User + Account
     → Generate JWT (with accountId claim)
     → Return token to Frontend
     → Frontend stores token
     → All API requests include token
     → Backend validates token + extracts accountId
```

---

## Development Resources

### Cursor Rules Created

1. **`rent-application-standards.mdc`** - Main development standards
   - Multi-tenancy patterns
   - Hebrew RTL support
   - API response format
   - Security guidelines

2. **`database-schema.mdc`** - Database design patterns
   - Prisma schema structure
   - Migration best practices
   - Common queries
   - Data integrity rules

### Sub-Agents (AGENTS.md)

1. **Backend Developer** - NestJS services with multi-tenancy
2. **Frontend Developer** - Next.js + MUI with RTL
3. **Database Architect** - Prisma schema design
4. **Test Engineer** - Account isolation testing
5. **DevOps Engineer** - Deployment and CI/CD

### Skills Created

1. **`rent-app-setup`** - Complete project initialization
2. **`rent-app-auth`** - Google OAuth implementation
3. **`rent-app-crud`** - CRUD operations pattern

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Objectives:**
- Project structure created
- Database schema designed and migrated
- Authentication system working
- Basic infrastructure setup

**Tasks:**
1. ✅ Initialize monorepo structure
2. ✅ Set up backend (NestJS)
3. ✅ Set up frontend (Next.js)
4. ✅ Configure PostgreSQL + Prisma
5. ✅ Implement Google OAuth
6. ✅ Create Account/User models
7. ✅ Set up JWT authentication
8. ✅ Create auth guards and decorators
9. ✅ Configure RTL theme
10. ✅ Set up Docker for development

**Deliverables:**
- User can log in with Google
- Account created automatically
- JWT token generated
- Protected API endpoints work
- Frontend shows authenticated user

**Use Skill:** `rent-app-setup`, `rent-app-auth`

---

### Phase 2: Properties & Units (Week 3-4)

**Objectives:**
- Properties CRUD operational
- Units CRUD operational
- Property-Unit relationship working
- Basic frontend tables

**Tasks:**
1. ✅ Create Property model and migrations
2. ✅ Implement Properties CRUD service
3. ✅ Create Properties controller with API docs
4. ✅ Build Properties frontend service
5. ✅ Create Properties list component
6. ✅ Create Property form component
7. ✅ Create Unit model and migrations
8. ✅ Implement Units CRUD service
9. ✅ Create Units controller
10. ✅ Build Units frontend components
11. ✅ Test account isolation
12. ✅ Add validation and error handling

**Deliverables:**
- User can create/edit/delete properties
- User can create/edit/delete units
- Units belong to properties
- Hebrew RTL interface works
- Account isolation verified

**Use Skill:** `rent-app-crud` (for both entities)

---

### Phase 3: Tenants & Leases (Week 5-6)

**Objectives:**
- Tenants CRUD operational
- Leases CRUD operational
- Lease status management
- Lease-Tenant-Unit relationships

**Tasks:**
1. ✅ Create Tenant model and migrations
2. ✅ Implement Tenants CRUD service
3. ✅ Create Tenants controller
4. ✅ Build Tenants frontend components
5. ✅ Create Lease model with status enum
6. ✅ Implement Leases CRUD service
7. ✅ Create Leases controller
8. ✅ Build Leases list component
9. ✅ Create Lease form (multi-step)
10. ✅ Implement lease status calculation
11. ✅ Add lease date validation
12. ✅ Test complex queries

**Deliverables:**
- User can manage tenants
- User can create leases
- Lease status automatically calculated
- Form validates dates (end > start)
- Cannot delete unit with active lease

**Use Skill:** `rent-app-crud` (for both entities)

---

### Phase 4: Property Portfolio Management (Week 7-8)

**Objectives:**
- Complex ownership structures with percentage tracking
- Mortgage lifecycle management
- Financial analytics (expenses, income, valuations)
- Portfolio visualization and reporting
- International property support

**Tasks:**
1. ✅ Design enhanced database schema (9 new entities)
2. ✅ Create Owners module (individuals, companies, partnerships)
3. ✅ Create Ownerships module with 100% validation
4. ✅ Create Mortgages module with payment tracking
5. ✅ Create Valuations module for historical tracking
6. ✅ Create Financials module (expenses + income)
7. ✅ Enhance Properties module with new fields
8. ✅ Create frontend components (11 components)
9. ✅ Create data visualization charts (4 charts)
10. ✅ Build property details page with tabs
11. ✅ Implement advanced filtering
12. ✅ Add export to Excel/CSV functionality
13. ✅ Test all APIs and fix route issues
14. ✅ Create comprehensive documentation

**New Database Entities:**
- PlotInfo (Israeli land registry)
- Owner (INDIVIDUAL | COMPANY | PARTNERSHIP)
- PropertyOwnership (with percentage validation)
- Mortgage (with collateral support)
- MortgagePayment
- PropertyValuation
- PropertyExpense
- PropertyIncome
- InvestmentCompany

**API Endpoints Created:** 40+ new endpoints
- GET/POST/PATCH/DELETE /owners
- GET/POST/PATCH/DELETE /ownerships (with 100% validation)
- GET/POST/PATCH/DELETE /mortgages
- POST /mortgages/:id/payments
- GET /mortgages/:id/balance
- GET/POST/PATCH/DELETE /valuations
- GET /valuations/property/:id/latest
- GET/POST/PATCH/DELETE /financials/expenses
- GET/POST/PATCH/DELETE /financials/income
- GET /financials/summary
- GET /properties/portfolio/summary

**Frontend Components:**
- PropertyCard - Enhanced property display
- OwnershipPanel - Pie chart + owners table
- MortgageCard - Payment tracking with progress bar
- FinancialDashboard - 4-chart dashboard
- PropertyFilter - Advanced filtering (10+ criteria)
- PropertyReportActions - Excel/CSV export
- PropertyValueChart - Line chart for value trends
- PortfolioBreakdownChart - Donut chart
- MortgageTimelineChart - Gantt-style timeline
- IncomeExpenseChart - Bar chart comparison
- usePropertyFilters - Custom filter hook

**Deliverables:**
- User can manage property ownership with multiple owners
- Ownership percentages validated to equal 100%
- User can track mortgages with payment history
- User can record property valuations over time
- User can track property expenses and income
- Financial dashboard shows portfolio insights
- User can export data to Excel/CSV
- Property details page with tabbed interface
- Support for Plot/Parcel (Gush/Chelka) in Israel
- International property support (Germany, etc.)
- Investment company holdings tracking

**Documentation:**
- `PHASE_4_COMPLETE.md` - Detailed completion doc
- `PHASE_4_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- `PHASE_4_TEST_RESULTS.md` - API testing results
- `PROPERTY_PORTFOLIO_IMPLEMENTATION.md` - Technical guide
- `COMPONENT_USAGE_GUIDE.md` - Component examples

**Implementation Method:**
- Used 12 parallel subagents
- Completed in ~6-8 hours
- 80+ files created
- ~8,000+ lines of code

---

### Phase 5: Notifications System (Week 9-10)

**Objectives:**
- Automated lease expiration checks
- Email notifications working
- Notification history tracked
- Cron job scheduling

**Tasks:**
1. ✅ Create Notification model
2. ✅ Set up email service (SendGrid/AWS SES)
3. ✅ Implement notification service
4. ✅ Create cron job (daily check)
5. ✅ Implement 30/60/90 day logic
6. ✅ Create email templates (Hebrew)
7. ✅ Handle notification failures
8. ✅ Add notification history UI
9. ✅ Test notification scheduling
10. ✅ Add manual notification trigger (admin)

**Deliverables:**
- Daily automated check runs
- Emails sent 30/60/90 days before expiration
- Notification history visible
- Failed notifications logged
- Email templates in Hebrew

---

### Phase 6: Dashboard & Reports (Week 11-12)

**Objectives:**
- Dashboard with key statistics
- Lease expiration calendar
- Basic reports
- Data visualization

**Tasks:**
1. ✅ Create dashboard API endpoints
2. ✅ Implement statistics calculations
3. ✅ Build dashboard UI
4. ✅ Add statistics cards
5. ✅ Create lease expiration table
6. ✅ Add occupancy rate chart
7. ✅ Implement date range filtering
8. ✅ Create revenue summary
9. ✅ Add export to CSV functionality
10. ✅ Optimize dashboard queries

**Deliverables:**
- Dashboard shows key metrics
- Active leases count
- Leases expiring in 90 days
- Occupancy rate visualization
- Recent notifications list

---

### Phase 7: Polish & Testing (Week 13-14)

**Objectives:**
- Complete test coverage
- Performance optimization
- Bug fixes
- Documentation
- Deployment preparation

**Tasks:**
1. ✅ Write unit tests (backend)
2. ✅ Write integration tests
3. ✅ Write E2E tests (frontend)
4. ✅ Test account isolation thoroughly
5. ✅ Performance testing
6. ✅ Security audit
7. ✅ Fix identified bugs
8. ✅ Add error monitoring (Sentry)
9. ✅ Create API documentation
10. ✅ Write user guide
11. ✅ Set up CI/CD pipeline
12. ✅ Prepare production deployment

**Deliverables:**
- 85%+ test coverage
- All security checks pass
- API documentation complete
- User guide in Hebrew
- CI/CD pipeline working
- Production deployment ready

---

## Quality Assurance

### Testing Strategy

**Unit Tests (Backend):**
```typescript
// Test account isolation
describe('LeasesService', () => {
  it('should only return leases for account', async () => {
    const leases = await service.findAll('account-1');
    expect(leases.every(l => l.accountId === 'account-1')).toBe(true);
  });
  
  it('should throw error for wrong account', async () => {
    await expect(
      service.findOne('lease-id', 'wrong-account')
    ).rejects.toThrow(NotFoundException);
  });
});
```

**Integration Tests:**
```typescript
// Test complete flow
describe('Lease Creation Flow', () => {
  it('should create lease with notifications', async () => {
    const lease = await request(app)
      .post('/api/leases')
      .send(leaseData)
      .expect(201);
    
    const notifications = await prisma.notification.findMany({
      where: { leaseId: lease.body.id }
    });
    
    expect(notifications).toHaveLength(3); // 30, 60, 90 days
  });
});
```

**E2E Tests (Frontend):**
```typescript
// Test user flow
test('User can create property and unit', async () => {
  await page.goto('/properties');
  await page.click('button:has-text("נכס חדש")');
  await page.fill('input[name="address"]', 'רחוב הרצל 10');
  await page.click('button:has-text("שמירה")');
  
  await expect(page.locator('text=רחוב הרצל 10')).toBeVisible();
});
```

### Security Checklist

- [ ] All queries filter by accountId
- [ ] JWT secret is strong and secure
- [ ] Input validation on all endpoints
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS enforced in production
- [ ] SQL injection prevention (Prisma)
- [ ] Secrets in environment variables
- [ ] Audit logs for critical operations

### Performance Targets

- Page load time: < 2 seconds
- API response time: < 500ms
- Database query time: < 100ms
- Table with 1000 rows: < 1 second
- Notification cron job: < 30 seconds

---

## Deployment

### Environment Variables

**Backend (.env):**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=strong-random-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@yourdomain.com
SENDGRID_API_KEY=...
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Docker Deployment

```bash
# Build images
docker-compose build

# Run migrations
docker-compose run backend npx prisma migrate deploy

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm run test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: ./scripts/deploy.sh
```

### Monitoring

- **Application Logs**: Winston + CloudWatch
- **Error Tracking**: Sentry
- **Performance**: New Relic / DataDog
- **Uptime**: UptimeRobot
- **Backups**: Daily automated PostgreSQL backups

---

## Success Criteria

### MVP Launch Ready When:

✅ **Functionality:**
- User can log in with Google
- User can manage properties, units, tenants, leases
- Notifications sent automatically
- Dashboard shows statistics
- All features work in Hebrew RTL

✅ **Quality:**
- 85%+ test coverage
- All security checks pass
- Performance targets met
- Zero critical bugs

✅ **Documentation:**
- API documentation complete
- User guide available
- Deployment guide ready

✅ **Infrastructure:**
- CI/CD pipeline working
- Monitoring set up
- Backups configured
- Production environment ready

---

## Post-MVP Roadmap

### Phase 8: Payments & Checks (Month 5)
- Payment tracking
- Check management
- Payment reminders

### Phase 9: Advanced Reports (Month 6)
- Financial reports
- Tax reports
- Custom report builder

### Phase 10: Multi-User (Month 7)
- User roles and permissions
- Team collaboration
- Activity audit logs

### Phase 11: Mobile App (Month 8-9)
- React Native app
- Push notifications
- Offline support

---

## Resources

### Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [MUI RTL Guide](https://mui.com/material-ui/guides/right-to-left/)

### Cursor Resources
- Rules: `.cursor/rules/`
- Agents: `.cursor/AGENTS.md`
- Skills: `~/.cursor/skills/rent-app-*`

### Support
- Requirements: `docs/REQUIRMENTS`
- This Guide: `docs/MVP_IMPLEMENTATION_GUIDE.md`
- Database Schema: `.cursor/rules/database-schema.mdc`

---

**Last Updated:** February 2, 2026
**Version:** MVP 1.1 (with Phase 4 Property Portfolio Management)
**Estimated Completion:** 10-14 weeks
