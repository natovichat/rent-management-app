# Epic 10: Dashboard & Analytics

**Priority:** 🟠 High  
**Status:** ✅ Implemented  
**Created:** February 2, 2026  
**Last Updated:** February 6, 2026

---

## Overview

Dashboard & Analytics provides property owners with a comprehensive portfolio overview and analytics dashboard. This epic enables users to view portfolio summaries, track financial metrics, visualize data through interactive charts, analyze trends over time, monitor key performance indicators (KPIs), filter data by date ranges, export dashboard data, customize dashboard widgets, and gain insights into portfolio performance, occupancy rates, ROI metrics, debt-to-equity ratios, and cash flow summaries. The dashboard aggregates data from multiple tables (properties, units, leases, mortgages, valuations, income, expenses) to provide a unified view of the entire property portfolio.

**Business Value:**
- Complete portfolio overview at a glance
- Data-driven decision making
- Financial performance tracking
- Trend analysis and forecasting insights
- Customizable dashboard for different user needs
- Export capabilities for reporting and analysis
- Real-time portfolio health monitoring
- Foundation for advanced analytics and reporting

---

## User Stories

### US10.1: View Portfolio Summary
**As a** property owner,  
**I can** view a portfolio summary dashboard showing total properties, total units, total estimated value, total mortgage debt, net equity, occupancy rate, and active leases count,  
**So that** I can quickly understand the overall health and scale of my property portfolio.

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US10.2: View Property Distribution Chart
**As a** property owner,  
**I can** view a property distribution chart showing properties grouped by type (RESIDENTIAL, COMMERCIAL, LAND, MIXED_USE) and status (OWNED, IN_CONSTRUCTION, IN_PURCHASE, SOLD, INVESTMENT),  
**So that** I can visualize the composition of my portfolio.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US10.3: View Income vs Expenses Chart
**As a** property owner,  
**I can** view an income vs expenses chart comparing monthly income and expenses over time,  
**So that** I can assess profitability trends and identify periods of positive or negative cash flow.

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US10.4: View Property Value Over Time
**As a** property owner,  
**I can** view a chart showing total property value over time based on valuation history,  
**So that** I can track portfolio appreciation or depreciation trends.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US10.5: View Mortgage Summary
**As a** property owner,  
**I can** view a mortgage summary showing total mortgage debt, total monthly payments, active mortgages count, and remaining balance breakdown,  
**So that** I can understand my debt obligations and payment requirements.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US10.6: View Lease Expiration Timeline
**As a** property owner,  
**I can** view a timeline chart showing upcoming lease expirations over the next 12 months,  
**So that** I can proactively plan for lease renewals and identify potential vacancies.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US10.7: Filter Dashboard by Date Range
**As a** property owner,  
**I can** filter dashboard data by selecting a date range (start date and end date),  
**So that** I can analyze portfolio performance for specific periods (monthly, quarterly, yearly, custom ranges).

**Priority:** 🔴 Critical  
**Status:** ✅ Implemented

---

### US10.8: Export Dashboard Data
**As a** property owner,  
**I can** export dashboard data to PDF or Excel format,  
**So that** I can share portfolio reports with accountants, partners, or for tax purposes.

**Priority:** 🟡 Medium  
**Status:** ✅ Implemented

---

### US10.9: View Occupancy Rate
**As a** property owner,  
**I can** view the portfolio occupancy rate calculated as (active leases / total units) × 100,  
**So that** I can monitor how effectively I'm utilizing my properties.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US10.10: View ROI Metrics
**As a** property owner,  
**I can** view ROI (Return on Investment) metrics calculated as (Net Income / Total Property Value) × 100 for individual properties and the entire portfolio,  
**So that** I can evaluate investment performance and compare properties.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US10.11: View Debt-to-Equity Ratio
**As a** property owner,  
**I can** view the debt-to-equity ratio calculated as (Total Mortgage Debt / Net Equity),  
**So that** I can assess the financial leverage and risk level of my portfolio.

**Priority:** 🟡 Medium  
**Status:** ✅ Implemented

---

### US10.12: View Cash Flow Summary
**As a** property owner,  
**I can** view a cash flow summary showing monthly cash flow (income - expenses - mortgage payments) over time,  
**So that** I can understand my monthly cash position and plan for future expenses.

**Priority:** 🟠 High  
**Status:** ✅ Implemented

---

### US10.13: Customize Dashboard Widgets
**As a** property owner,  
**I can** customize which widgets are displayed on my dashboard, rearrange their order, and save my preferences,  
**So that** I can create a personalized dashboard view that focuses on the metrics most important to me.

**Priority:** 🟡 Medium  
**Status:** ✅ Implemented

---

## Acceptance Criteria

### US10.1: View Portfolio Summary

**Given** I am viewing the dashboard page  
**When** the dashboard loads  
**Then** I see summary cards displaying:
- Total properties count
- Total units count
- Total estimated value (sum of all property estimated values)
- Total mortgage debt (sum of all active mortgage loan amounts)
- Net equity (total estimated value - total mortgage debt)
- Occupancy rate (percentage)
- Active leases count
- Total area (sum of all property areas)
- Land area (sum of all land areas)

**Technical Requirements:**
- API endpoint: `GET /api/properties/portfolio/summary`
- Returns aggregated statistics from multiple tables
- Calculations performed at database level for performance
- Data cached for 5 minutes to reduce database load
- Summary cards display with appropriate icons and formatting
- Values formatted with currency symbols (₪) and Hebrew number formatting
- Loading state shown while data is fetched
- Error state shown if data cannot be loaded

---

### US10.2: View Property Distribution Chart

**Given** I am viewing the dashboard page  
**When** I view the "Property Distribution" chart  
**Then** I see:
- A donut or pie chart showing properties grouped by type (RESIDENTIAL, COMMERCIAL, LAND, MIXED_USE)
- A bar chart showing properties grouped by status (OWNED, IN_CONSTRUCTION, IN_PURCHASE, SOLD, INVESTMENT)
- Each segment shows count and percentage
- Chart is interactive (hover shows details)
- Chart is responsive and works on mobile devices
- Chart can be toggled between type and status views

**Technical Requirements:**
- API endpoint: `GET /api/properties/portfolio/distribution`
- Returns aggregated counts grouped by type and status
- Use Recharts library for visualization
- Chart colors are consistent and accessible
- Empty state shown when no properties exist
- Chart data updates when filters are applied

---

### US10.3: View Income vs Expenses Chart

**Given** I am viewing the dashboard page  
**When** I view the "Income vs Expenses" chart  
**Then** I see:
- A grouped bar chart or line chart comparing income and expenses over time
- X-axis shows time periods (months/quarters)
- Y-axis shows amounts in currency (₪)
- Income bars/lines displayed in green color
- Expenses bars/lines displayed in red color
- Net income (income - expenses) shown as a third series or calculated value
- Chart is interactive (hover shows exact values)
- Chart supports date range filtering
- Chart is responsive and works on mobile devices

**Technical Requirements:**
- API endpoint: `GET /api/financials/dashboard/income-expenses?startDate=&endDate=&groupBy=month`
- Returns aggregated data grouped by time period
- Supports grouping by month, quarter, or year
- Data aggregated from PropertyIncome and PropertyExpense tables
- Use Recharts library for visualization
- Chart updates when date range filter changes
- Empty state shown when no financial data exists

---

### US10.4: View Property Value Over Time

**Given** I am viewing the dashboard page  
**When** I view the "Property Value Over Time" chart  
**Then** I see:
- A line chart showing total portfolio value over time
- X-axis shows valuation dates
- Y-axis shows total property value
- Line connects all valuation data points
- Chart shows trend (increasing/decreasing)
- Chart supports date range filtering
- Chart is interactive (hover shows exact date and value)
- Chart is responsive and works on mobile devices
- Multiple valuation types can be displayed with different colors (optional)

**Technical Requirements:**
- API endpoint: `GET /api/properties/portfolio/valuation-history?startDate=&endDate=`
- Returns aggregated valuation data from PropertyValuation table
- Data aggregated by date (sum of all property valuations per date)
- Use Recharts library for visualization
- Chart updates when date range filter changes
- Empty state shown when no valuation data exists
- Handles multiple valuations per date (sums values)

---

### US10.5: View Mortgage Summary

**Given** I am viewing the dashboard page  
**When** I view the mortgage summary section  
**Then** I see:
- Total mortgage debt (sum of all active mortgage loan amounts)
- Total monthly payments (sum of all active mortgage monthly payments)
- Active mortgages count
- Paid off mortgages count
- Total remaining balance (sum of all mortgage remaining balances)
- Average interest rate (weighted average)
- Mortgage payoff timeline chart (optional)

**Technical Requirements:**
- API endpoint: `GET /api/mortgages/summary`
- Returns aggregated mortgage statistics
- Calculations include: total debt, total payments, counts by status, remaining balances
- Summary cards display with appropriate formatting
- Mortgage data aggregated from Mortgage and MortgagePayment tables
- Loading state shown while data is fetched
- Error state shown if data cannot be loaded
- Values formatted with currency symbols (₪)

---

### US10.6: View Lease Expiration Timeline

**Given** I am viewing the dashboard page  
**When** I view the "Lease Expiration Timeline" chart  
**Then** I see:
- A timeline or Gantt chart showing lease expirations over the next 12 months
- Each lease displayed as a bar or marker on the timeline
- X-axis shows months
- Y-axis shows properties/units
- Color coding for leases expiring soon (red), expiring later (yellow), recently expired (gray)
- Clicking on a lease bar shows lease details
- Chart shows count of leases expiring per month
- Chart is interactive and responsive

**Technical Requirements:**
- API endpoint: `GET /api/leases/expiration-timeline?months=12`
- Returns leases with endDate within specified months
- Data from Lease table filtered by endDate and status
- Use Recharts or custom timeline component for visualization
- Chart updates when date range changes
- Empty state shown when no leases exist
- Supports filtering by property or unit

---

### US10.7: Filter Dashboard by Date Range

**Given** I am viewing the dashboard page  
**When** I select a date range using the date range picker  
**Then**:
- All dashboard data is filtered to the selected date range
- Summary cards update to reflect filtered data
- Charts update to show only data within the range
- Date range is displayed clearly (e.g., "1/1/2026 - 31/12/2026")
- I can select predefined ranges (Last Month, Last Quarter, Last Year, This Year, All Time)
- I can select custom date range
- I can clear the filter to show all data
- Date range persists in URL query parameters for shareable links
- Date range is saved to user preferences (optional)

**Technical Requirements:**
- Date range picker component (DateRangePicker)
- Apply filter to all dashboard API endpoints
- Backend filters by respective date fields:
  - Income: `incomeDate`
  - Expenses: `expenseDate`
  - Valuations: `valuationDate`
  - Leases: `endDate`
- Frontend state management for date range
- URL query parameters: `?startDate=2026-01-01&endDate=2026-12-31`
- Date range validation (end date after start date)
- Hebrew date formatting (DD/MM/YYYY)

---

### US10.8: Export Dashboard Data

**Given** I am viewing the dashboard page  
**When** I click "Export Dashboard" and select format (PDF or Excel)  
**Then**:
- A dashboard report is generated including:
  - Portfolio summary statistics
  - Property distribution charts
  - Income vs expenses chart
  - Property value over time chart
  - Mortgage summary
  - Lease expiration timeline
  - ROI metrics
  - Cash flow summary
  - Date range (if filtered)
- The file downloads automatically
- PDF format includes charts as images
- Excel format includes data tables and summary sheets
- The report is formatted professionally with headers and branding
- Report filename includes date range (e.g., "Dashboard_Report_2026-01-01_to_2026-12-31.pdf")

**Technical Requirements:**
- API endpoint: `GET /api/dashboard/export?format=pdf|excel&startDate=&endDate=`
- PDF generation using library (e.g., puppeteer, pdfkit)
- Excel generation using library (e.g., exceljs, xlsx)
- Include all dashboard data and charts
- Support date range filtering
- Professional formatting with headers, tables, charts
- File download handled by frontend
- Loading state during export generation
- Error handling for export failures

---

### US10.9: View Occupancy Rate

**Given** I am viewing the dashboard page  
**When** I view the occupancy rate metric  
**Then** I see:
- Occupancy rate displayed as a percentage (e.g., "85%")
- Occupancy rate calculated as: (Active Leases Count / Total Units Count) × 100
- Visual indicator (progress bar or gauge chart) showing occupancy level
- Color coding: Green (≥80%), Yellow (60-79%), Red (<60%)
- Comparison to previous period (optional)
- Breakdown by property type (optional)

**Technical Requirements:**
- Occupancy rate calculated from Lease and Unit tables
- Formula: `(COUNT(leases WHERE status = 'ACTIVE') / COUNT(units)) * 100`
- API endpoint includes occupancy rate in portfolio summary
- Display as percentage with 1 decimal place
- Visual gauge or progress bar component
- Handle edge cases (zero units, zero leases)
- Update when date range filter changes
- Cache calculation for performance

---

### US10.10: View ROI Metrics

**Given** I am viewing the dashboard page  
**When** I view the ROI metrics section  
**Then** I see:
- Portfolio ROI calculated as: (Total Net Income / Total Property Value) × 100
- ROI displayed as a percentage (e.g., "8.5%")
- ROI calculated for a specific date range (if filtered)
- Per-property ROI breakdown (optional table or chart)
- ROI trend over time (optional chart)
- Tooltip explaining calculation method
- Comparison to previous period (optional)

**Technical Requirements:**
- ROI calculation: `((totalIncome - totalExpenses) / totalPropertyValue) * 100`
- Use latest property valuations or estimated values
- API endpoint: `GET /api/dashboard/roi?startDate=&endDate=`
- Handle edge cases (zero property value, negative ROI)
- Display ROI with 2 decimal places
- Visual indicator (positive/negative ROI)
- ROI breakdown by property type (optional)
- Update when date range filter changes

---

### US10.11: View Debt-to-Equity Ratio

**Given** I am viewing the dashboard page  
**When** I view the debt-to-equity ratio metric  
**Then** I see:
- Debt-to-equity ratio displayed as a decimal (e.g., "0.65" or "65%")
- Ratio calculated as: Total Mortgage Debt / Net Equity
- Visual indicator showing ratio level
- Color coding: Green (<0.5), Yellow (0.5-1.0), Red (>1.0)
- Tooltip explaining what the ratio means
- Comparison to previous period (optional)

**Technical Requirements:**
- Debt-to-equity calculation: `totalMortgageDebt / netEquity`
- Net equity = Total Property Value - Total Mortgage Debt
- API endpoint includes ratio in portfolio summary
- Display as decimal with 2 decimal places or percentage
- Handle edge cases (zero equity, zero debt)
- Visual gauge or progress bar component
- Update when mortgage or valuation data changes

---

### US10.12: View Cash Flow Summary

**Given** I am viewing the dashboard page  
**When** I view the cash flow summary  
**Then** I see:
- Monthly cash flow chart showing: Income - Expenses - Mortgage Payments
- Cash flow displayed as positive (green) or negative (red)
- Total cash flow for selected period
- Average monthly cash flow
- Cash flow trend over time
- Breakdown by property (optional)
- Projected cash flow for next 3-6 months (optional)

**Technical Requirements:**
- Cash flow calculation: `monthlyIncome - monthlyExpenses - monthlyMortgagePayments`
- API endpoint: `GET /api/dashboard/cash-flow?startDate=&endDate=&groupBy=month`
- Data aggregated from PropertyIncome, PropertyExpense, and MortgagePayment tables
- Use Recharts library for visualization
- Chart shows positive/negative cash flow clearly
- Support date range filtering
- Handle edge cases (no income, no expenses, no mortgages)
- Update when financial data changes

---

### US10.13: Customize Dashboard Widgets

**Given** I am viewing the dashboard page  
**When** I click "Customize Dashboard"  
**Then** I can:
- See a list of available widgets
- Toggle widgets on/off
- Drag and drop widgets to rearrange their order
- Save my widget preferences
- Reset to default layout
- Widget preferences are saved per user
- Dashboard displays only selected widgets in saved order

**Technical Requirements:**
- Widget configuration stored in user preferences or database
- API endpoint: `GET /api/user/preferences/dashboard` and `PUT /api/user/preferences/dashboard`
- Frontend drag-and-drop library (e.g., react-beautiful-dnd, dnd-kit)
- Widget state management (React Context or Redux)
- Default widget configuration
- Widget preferences persisted across sessions
- Loading state while preferences are saved
- Error handling for save failures

---

## Implementation Notes

### Database Tables

The dashboard aggregates data from multiple tables:

1. **Property** (`properties`)
   - Fields: `id`, `accountId`, `address`, `type`, `status`, `estimatedValue`, `totalArea`, `landArea`
   - Used for: Property counts, property distribution, total value

2. **Unit** (`units`)
   - Fields: `id`, `propertyId`, `accountId`, `apartmentNumber`
   - Used for: Total units count, occupancy rate calculation

3. **Lease** (`leases`)
   - Fields: `id`, `accountId`, `unitId`, `tenantId`, `startDate`, `endDate`, `status`, `monthlyRent`
   - Used for: Active leases count, occupancy rate, lease expiration timeline, income calculation

4. **Mortgage** (`mortgages`)
   - Fields: `id`, `propertyId`, `accountId`, `loanAmount`, `monthlyPayment`, `status`, `startDate`, `endDate`
   - Used for: Mortgage summary, debt-to-equity ratio, cash flow

5. **MortgagePayment** (`mortgage_payments`)
   - Fields: `id`, `mortgageId`, `accountId`, `paymentDate`, `amount`, `principal`, `interest`
   - Used for: Cash flow calculation, remaining balance

6. **PropertyValuation** (`property_valuations`)
   - Fields: `id`, `propertyId`, `accountId`, `valuationDate`, `estimatedValue`, `valuationType`
   - Used for: Property value over time chart

7. **PropertyIncome** (`property_income`)
   - Fields: `id`, `propertyId`, `accountId`, `incomeDate`, `amount`, `type`
   - Used for: Income vs expenses chart, cash flow, ROI

8. **PropertyExpense** (`property_expenses`)
   - Fields: `id`, `propertyId`, `accountId`, `expenseDate`, `amount`, `type`, `category`
   - Used for: Income vs expenses chart, cash flow, ROI

### API Endpoints

#### Portfolio Summary
- `GET /api/properties/portfolio/summary` - Get portfolio summary statistics
  - Returns: totalProperties, totalUnits, totalEstimatedValue, totalMortgageDebt, netEquity, occupancyRate, activeLeasesCount, totalArea, landArea, propertiesByType, propertiesByStatus

#### Distribution
- `GET /api/properties/portfolio/distribution` - Get property distribution by type and status
  - Returns: distributionByType, distributionByStatus

#### Valuation History
- `GET /api/properties/portfolio/valuation-history?startDate=&endDate=` - Get aggregated valuation history
  - Returns: Array of { date, totalValue } objects

#### Financial Dashboard
- `GET /api/financials/dashboard/income-expenses?startDate=&endDate=&groupBy=month` - Get income vs expenses data
  - Returns: Array of { period, income, expenses, net } objects
  - groupBy: month, quarter, year

#### Mortgage Summary
- `GET /api/mortgages/summary` - Get mortgage summary statistics
  - Returns: totalMortgageDebt, totalMonthlyPayments, activeMortgagesCount, paidOffMortgagesCount, totalRemainingBalance, averageInterestRate

#### Lease Expiration Timeline
- `GET /api/leases/expiration-timeline?months=12` - Get lease expiration timeline
  - Returns: Array of leases with endDate within specified months

#### ROI Metrics
- `GET /api/dashboard/roi?startDate=&endDate=` - Get ROI metrics
  - Returns: portfolioROI, roiByProperty, roiTrend

#### Cash Flow
- `GET /api/dashboard/cash-flow?startDate=&endDate=&groupBy=month` - Get cash flow summary
  - Returns: Array of { period, income, expenses, mortgagePayments, cashFlow } objects

#### Dashboard Export
- `GET /api/dashboard/export?format=pdf|excel&startDate=&endDate=` - Export dashboard report
  - Returns: File download (PDF or Excel)

#### User Preferences
- `GET /api/user/preferences/dashboard` - Get dashboard widget preferences
- `PUT /api/user/preferences/dashboard` - Save dashboard widget preferences
  - Request body: { widgets: [{ id, enabled, order }] }

### Frontend Components

#### Main Dashboard Component
- `DashboardPage` (`apps/frontend/src/app/dashboard/page.tsx`)
  - Main dashboard page container
  - Manages date range filter state
  - Orchestrates all dashboard widgets
  - Handles loading and error states

#### Summary Cards
- `PortfolioSummaryCards` (`apps/frontend/src/components/dashboard/PortfolioSummaryCards.tsx`)
  - Displays summary statistics cards
  - Total properties, units, value, mortgages, net equity, occupancy rate
  - Responsive grid layout
  - Loading skeletons

#### Chart Components
- `PropertyDistributionChart` (`apps/frontend/src/components/dashboard/PropertyDistributionChart.tsx`)
  - Donut/pie chart for property type distribution
  - Bar chart for property status distribution
  - Uses Recharts library

- `IncomeExpenseChart` (`apps/frontend/src/components/charts/IncomeExpenseChart.tsx`)
  - Already exists, reuse for dashboard
  - Grouped bar chart or line chart
  - Shows income vs expenses over time

- `PropertyValueChart` (`apps/frontend/src/components/charts/PropertyValueChart.tsx`)
  - Already exists, reuse for dashboard
  - Line chart showing property value over time

- `LeaseExpirationTimeline` (`apps/frontend/src/components/dashboard/LeaseExpirationTimeline.tsx`)
  - Timeline/Gantt chart for lease expirations
  - Shows leases expiring in next 12 months
  - Color coding for urgency

- `CashFlowChart` (`apps/frontend/src/components/dashboard/CashFlowChart.tsx`)
  - Bar chart showing monthly cash flow
  - Positive/negative cash flow visualization

#### Metric Components
- `OccupancyRateGauge` (`apps/frontend/src/components/dashboard/OccupancyRateGauge.tsx`)
  - Gauge chart or progress bar showing occupancy rate
  - Color coding based on percentage

- `ROIMetricCard` (`apps/frontend/src/components/dashboard/ROIMetricCard.tsx`)
  - Card displaying ROI percentage
  - Trend indicator
  - Tooltip with calculation explanation

- `DebtToEquityRatioCard` (`apps/frontend/src/components/dashboard/DebtToEquityRatioCard.tsx`)
  - Card displaying debt-to-equity ratio
  - Visual indicator with color coding
  - Tooltip explaining ratio meaning

#### Filter Components
- `DateRangePicker` (`apps/frontend/src/components/dashboard/DateRangePicker.tsx`)
  - Date range selection component
  - Predefined ranges (Last Month, Last Quarter, Last Year, This Year, All Time)
  - Custom date range selection
  - Hebrew date formatting

#### Export Component
- `DashboardExportButton` (`apps/frontend/src/components/dashboard/DashboardExportButton.tsx`)
  - Export button with format selection (PDF/Excel)
  - Loading state during export
  - Error handling

#### Customization Component
- `DashboardCustomization` (`apps/frontend/src/components/dashboard/DashboardCustomization.tsx`)
  - Widget customization dialog
  - Drag-and-drop widget reordering
  - Toggle widgets on/off
  - Save/reset preferences

#### Shared Components
- `DashboardWidget` (`apps/frontend/src/components/dashboard/DashboardWidget.tsx`)
  - Wrapper component for dashboard widgets
  - Loading and error states
  - Collapsible header
  - Refresh button

- `MetricCard` (`apps/frontend/src/components/dashboard/MetricCard.tsx`)
  - Reusable card component for metrics
  - Icon, title, value, trend indicator
  - Clickable for details

### Data Aggregation Strategy

**Performance Considerations:**
- Use database aggregation functions (SUM, COUNT, AVG) instead of fetching all records
- Implement materialized views for complex calculations (optional)
- Cache dashboard data for 5 minutes to reduce database load
- Use database indexes on date fields for efficient filtering
- Paginate large datasets where appropriate

**Aggregation Queries:**
```sql
-- Portfolio Summary
SELECT 
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(DISTINCT u.id) as total_units,
  SUM(p.estimated_value) as total_estimated_value,
  SUM(m.loan_amount) as total_mortgage_debt,
  SUM(p.estimated_value) - SUM(m.loan_amount) as net_equity
FROM properties p
LEFT JOIN units u ON u.property_id = p.id
LEFT JOIN mortgages m ON m.property_id = p.id AND m.status = 'ACTIVE'
WHERE p.account_id = $accountId;

-- Income vs Expenses (Monthly)
SELECT 
  DATE_TRUNC('month', income_date) as period,
  SUM(amount) as income
FROM property_income
WHERE account_id = $accountId
  AND income_date BETWEEN $startDate AND $endDate
GROUP BY DATE_TRUNC('month', income_date)
ORDER BY period;
```

### Charting Library

**Recommendation: Recharts**
- React-native charting library
- Responsive and mobile-friendly
- Supports line, bar, pie, area charts
- Interactive tooltips and legends
- RTL support
- Good TypeScript support

**Chart Types:**
- LineChart: Property value over time, ROI trend
- BarChart: Income vs expenses, cash flow
- PieChart: Property distribution
- AreaChart: Cash flow over time (optional)

### Performance Optimization

**Caching Strategy:**
- Cache dashboard summary data for 5 minutes
- Use React Query for client-side caching
- Invalidate cache on data updates (create/update/delete operations)
- Cache widget preferences in localStorage

**Lazy Loading:**
- Load dashboard widgets on demand
- Use React.lazy() for code splitting
- Load chart data only when widget is visible

**Database Optimization:**
- Indexes on: `accountId`, date fields (`incomeDate`, `expenseDate`, `valuationDate`, `endDate`)
- Use database views for complex aggregations
- Consider materialized views for frequently accessed summaries

**Frontend Optimization:**
- Debounce date range filter changes
- Virtualize long lists
- Memoize expensive calculations
- Use React.memo() for chart components

### Security & Authorization

- All endpoints require JWT authentication
- All endpoints enforce account-level multi-tenancy
- Verify `accountId` matches user's account
- Prevent access to other accounts' data
- Validate date range inputs
- Sanitize export file names

### Internationalization

- All UI text in Hebrew (RTL)
- Currency formatting: ₪ (Israeli Shekel)
- Date formatting: DD/MM/YYYY format
- Number formatting: Use locale-specific formatting (Hebrew)
- Chart labels and tooltips in Hebrew

### Testing Requirements

**Unit Tests:**
- Dashboard aggregation calculations
- ROI calculation logic
- Occupancy rate calculation
- Debt-to-equity ratio calculation
- Cash flow calculation
- Date range filtering logic

**Integration Tests:**
- API endpoint testing
- Database aggregation queries
- Multi-tenancy enforcement
- Date range filtering
- Export generation

**E2E Tests:**
- Dashboard page load
- Date range filter application
- Widget customization
- Dashboard export
- Chart interactions
- Metric calculations

### Future Enhancements

**Planned Features:**
- [ ] Property comparison view
- [ ] Advanced filtering (by property type, status, location)
- [ ] Dashboard templates (Investor, Manager, Accountant)
- [ ] Real-time dashboard updates (WebSocket)
- [ ] Dashboard sharing with team members
- [ ] Scheduled dashboard reports (email)
- [ ] Predictive analytics (forecasting)
- [ ] Benchmark comparisons (market averages)
- [ ] Custom KPI definitions
- [ ] Dashboard annotations/notes
- [ ] Mobile app dashboard
- [ ] Dashboard widgets marketplace

**Related Epics:**
- Epic 1: Property Management (dashboard depends on properties)
- Epic 2: Unit Management (dashboard depends on units)
- Epic 3: Tenant Management (dashboard depends on tenants)
- Epic 4: Lease Management (dashboard depends on leases)
- Epic 6: Mortgage Management (dashboard depends on mortgages)
- Epic 8: Financial Tracking (dashboard depends on income/expenses)

---

## Related Documentation

- [Database Schema](../../apps/backend/prisma/schema.prisma)
- [Epic 1: Property Management](./EPIC_01_PROPERTY_MANAGEMENT.md)
- [Epic 2: Unit Management](./EPIC_02_UNIT_MANAGEMENT.md)
- [Epic 3: Tenant Management](./EPIC_03_TENANT_MANAGEMENT.md)
- [Epic 4: Lease Management](./EPIC_04_LEASE_MANAGEMENT.md)
- [Epic 6: Mortgage Management](./EPIC_06_MORTGAGE_MANAGEMENT.md)
- [Epic 8: Financial Tracking](./EPIC_08_FINANCIAL_TRACKING.md)
- [Epics Overview](./EPICS_OVERVIEW.md)
- [Component Usage Guide](../COMPONENT_USAGE_GUIDE.md)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0
