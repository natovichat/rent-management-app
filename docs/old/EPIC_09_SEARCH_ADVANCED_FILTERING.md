# Epic 9: Search & Advanced Filtering

**Priority:** 🟠 High  
**Status:** ✅ Complete (Backend: 100%, Frontend: 100%)  
**Created:** February 6, 2026  
**Last Updated:** February 6, 2026  
**Completion Date:** February 6, 2026

---

## Overview

Search & Advanced Filtering enables users to quickly find and filter entities across the entire application. This epic provides comprehensive search capabilities and advanced filtering options for all major entities (Properties, Units, Tenants, Leases, Investment Companies, Owners, Mortgages).

**Business Value:**
- Quick entity discovery across the portfolio
- Efficient data navigation for large datasets
- Advanced filtering for complex queries
- Improved user productivity
- Better data organization and analysis

---

## User Stories

### US9.1: Search Properties
**As a** property owner,  
**I can** search properties by address or file number,  
**So that** I can quickly find specific properties in my portfolio.

**Priority:** 🔴 Critical  
**Status:** ✅ Complete (Backend: 10/10 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Search input field is available above properties list
- [ ] Search queries address field (partial match)
- [ ] Search queries fileNumber field (partial match)
- [ ] Search is debounced (waits for user to stop typing)
- [ ] Search results update automatically
- [ ] Search works with pagination
- [ ] Search is case-insensitive
- [ ] Empty search shows all properties
- [ ] Search state persists during navigation

**Technical Details:**
- Backend: Search parameter in `GET /api/properties?search={term}`
- Frontend: Search input with debounce (300ms)
- Query key: `['properties', page, searchTerm]`
- Search implemented in `PropertiesService.findAll()` with Prisma filters

---

### US9.2: Advanced Filter Properties
**As a** property owner,  
**I can** apply advanced filters to properties including date ranges, value ranges, and combined filters,  
**So that** I can perform complex queries on my property portfolio.

**Priority:** 🟠 High  
**Status:** ✅ Complete (Backend: 11/11 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Advanced filter panel available (collapsible accordion)
- [ ] Filter by date range (created date, last valuation date)
- [ ] Filter by value range (estimated value min/max)
- [ ] Filter by area range (total area, land area)
- [ ] Combine multiple filters (AND logic)
- [ ] Clear all filters button
- [ ] Filter count badge shows active filters
- [ ] Filters reset pagination to page 1
- [ ] Filters work with search

**Technical Details:**
- Backend: Query parameters for date ranges, value ranges
- Frontend: Advanced filter accordion in PropertyList
- API: `GET /api/properties?minValue={min}&maxValue={max}&minDate={date}&maxDate={date}`

---

### US9.3: Search Investment Companies
**As a** property owner,  
**I can** search investment companies by name, registration number, or country,  
**So that** I can quickly find specific companies in my portfolio.

**Priority:** 🟠 High  
**Status:** ✅ Complete (Backend: 10/10 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Search input field is available above investment companies list
- [ ] Search queries name, registrationNumber, and country fields
- [ ] Search is debounced (waits for user to stop typing)
- [ ] Search results update automatically
- [ ] Search works with pagination
- [ ] Search is case-insensitive
- [ ] Empty search shows all companies
- [ ] Search state persists during navigation

**Technical Details:**
- Backend: Search parameter in `GET /api/investment-companies?search={term}`
- Frontend: Search input with debounce (300ms)
- Query key: `['investment-companies', page, searchTerm]`

---

### US9.4: Advanced Filter Investment Companies
**As a** property owner,  
**I can** filter investment companies by country, investment amount range, ownership percentage range, and property count,  
**So that** I can analyze my investment company portfolio effectively.

**Priority:** 🟡 Medium  
**Status:** ✅ Complete (Backend: 12/12 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Advanced filter panel available (collapsible accordion)
- [ ] Filter by country (dropdown)
- [ ] Filter by investment amount range (min/max)
- [ ] Filter by ownership percentage range (min/max)
- [ ] Filter by property count range (min/max)
- [ ] Combine multiple filters (AND logic)
- [ ] Clear all filters button
- [ ] Filter count badge shows active filters
- [ ] Filters reset pagination to page 1
- [ ] Filters work with search

**Technical Details:**
- Backend: Query parameters for ranges
- Frontend: Advanced filter accordion in InvestmentCompanyList
- API: `GET /api/investment-companies?minInvestment={min}&maxInvestment={max}&minOwnership={min}&maxOwnership={max}&minProperties={min}&maxProperties={max}`

---

### US9.5: Search Owners
**As a** property owner,  
**I can** search owners by name, email, or phone number,  
**So that** I can quickly find specific owners in my portfolio.

**Priority:** 🟠 High  
**Status:** ✅ Complete (Backend: 12/12 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Search input field is available above owners list
- [ ] Search queries name, email, and phone fields
- [ ] Search is debounced (waits for user to stop typing)
- [ ] Search results update automatically
- [ ] Search works with pagination
- [ ] Search is case-insensitive
- [ ] Empty search shows all owners
- [ ] Search state persists during navigation

**Technical Details:**
- Backend: Search parameter in `GET /api/owners?search={term}`
- Frontend: Search input with debounce (300ms)
- Query key: `['owners', page, searchTerm]`

---

### US9.6: Advanced Filter Leases
**As a** property owner,  
**I can** apply advanced filters to leases including date ranges, rent ranges, and property filters,  
**So that** I can perform complex queries on my lease portfolio.

**Priority:** 🟠 High  
**Status:** ✅ Complete (Backend: 11/11 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Advanced filter panel available (collapsible accordion)
- [ ] Filter by start date range
- [ ] Filter by end date range
- [ ] Filter by monthly rent range (min/max)
- [ ] Filter by property (dropdown)
- [ ] Filter by tenant (dropdown)
- [ ] Combine multiple filters (AND logic)
- [ ] Clear all filters button
- [ ] Filter count badge shows active filters
- [ ] Filters reset pagination to page 1
- [ ] Filters work with search

**Technical Details:**
- Backend: Query parameters for date ranges, rent ranges
- Frontend: Advanced filter accordion in LeaseList
- API: `GET /api/leases?minRent={min}&maxRent={max}&startDateFrom={date}&startDateTo={date}&endDateFrom={date}&endDateTo={date}&propertyId={id}&tenantId={id}`

---

### US9.7: Search Mortgages
**As a** property owner,  
**I can** search mortgages by property address, bank name, or loan number,  
**So that** I can quickly find specific mortgages in my portfolio.

**Priority:** 🟠 High  
**Status:** ✅ Complete (Backend: 11/11 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Search input field is available above mortgages list
- [ ] Search queries property address, bank name, and loan number fields
- [ ] Search is debounced (waits for user to stop typing)
- [ ] Search results update automatically
- [ ] Search works with pagination
- [ ] Search is case-insensitive
- [ ] Empty search shows all mortgages
- [ ] Search state persists during navigation

**Technical Details:**
- Backend: Search parameter in `GET /api/mortgages?search={term}`
- Frontend: Search input with debounce (300ms)
- Query key: `['mortgages', page, searchTerm]`

---

### US9.8: Advanced Filter Mortgages
**As a** property owner,  
**I can** filter mortgages by bank, property, loan amount range, interest rate range, and status,  
**So that** I can analyze my mortgage portfolio effectively.

**Priority:** 🟡 Medium  
**Status:** ✅ Complete (Backend: 11/11 tests passing, Frontend: Implemented)

**Acceptance Criteria:**
- [ ] Advanced filter panel available (collapsible accordion)
- [ ] Filter by bank (dropdown)
- [ ] Filter by property (dropdown)
- [ ] Filter by loan amount range (min/max)
- [ ] Filter by interest rate range (min/max)
- [ ] Filter by status (dropdown)
- [ ] Combine multiple filters (AND logic)
- [ ] Clear all filters button
- [ ] Filter count badge shows active filters
- [ ] Filters reset pagination to page 1
- [ ] Filters work with search

**Technical Details:**
- Backend: Query parameters for ranges and dropdowns
- Frontend: Advanced filter accordion in MortgageList
- API: `GET /api/mortgages?bankId={id}&propertyId={id}&minAmount={min}&maxAmount={max}&minRate={min}&maxRate={max}&status={status}`

---

## Implementation Notes

### Search Pattern
All search implementations follow this pattern:
- Server-side search (not client-side)
- Case-insensitive (using Prisma `mode: 'insensitive'`)
- Partial match (using `contains`)
- Debounced input (300ms delay)
- Works with pagination
- State persists in URL or localStorage

### Advanced Filter Pattern
All advanced filters follow this pattern:
- Collapsible accordion (collapsed by default)
- Filter badge showing active filter count
- Clear all filters button
- AND logic for multiple filters
- Resets pagination to page 1
- Works in combination with search

### Backend Implementation
- Add `search` query parameter to list endpoints
- Add filter query parameters as needed
- Use Prisma `where` clause with `OR` for search
- Use Prisma `where` clause with `AND` for filters
- Account isolation always enforced

### Frontend Implementation
- Search input above list (consistent placement)
- Advanced filters in accordion
- React Query for API calls
- Debounce hook for search
- Filter state management
- URL persistence for search/filters

---

## Related Documentation

- [Epic 01: Property Management](./EPIC_01_PROPERTY_MANAGEMENT.md) - US1.7, US1.8
- [Epic 02: Unit Management](./EPIC_02_UNIT_MANAGEMENT.md) - US2.8
- [Epic 03: Tenant Management](./EPIC_03_TENANT_MANAGEMENT.md) - US3.5
- [Epic 04: Lease Management](./EPIC_04_LEASE_MANAGEMENT.md) - US4.7, US4.8
- [Epic 09: Investment Companies](./EPIC_09_INVESTMENT_COMPANIES.md) - US9.4

---

**Last Updated:** February 6, 2026  
**Version:** 1.0
