# Epic 8: Financial Tracking & Reporting

## Overview

This epic enables comprehensive financial tracking and reporting for property portfolios. Property owners can record property valuations, track income and expenses, categorize transactions, view financial dashboards with charts and analytics, calculate ROI, and export detailed financial reports. The system supports multiple valuation types (market, purchase, tax, appraisal), expense categories (maintenance, tax, insurance, utilities, renovation, legal, other), and income types (rent, sale, capital gain, other).

## User Stories

### Valuation Management

- **US8.1:** As a property owner, I can record a property valuation with date, estimated value, valuation type, and valuator information, so that I can track property value changes over time.

- **US8.2:** As a property owner, I can view the complete valuation history for a property, so that I can see how property values have changed over time.

- **US8.3:** As a property owner, I can set the valuation type (MARKET, PURCHASE, TAX, or APPRAISAL) when recording a valuation, so that I can distinguish between different valuation methods.

- **US8.4:** As a property owner, I can view a chart showing property value over time, so that I can visualize value appreciation or depreciation trends.

### Expense Management

- **US8.5:** As a property owner, I can record a property expense with date, amount, type, category, description, and payment method, so that I can track all costs associated with my properties.

- **US8.6:** As a property owner, I can categorize expenses by type (MAINTENANCE, TAX, INSURANCE, UTILITIES, RENOVATION, LEGAL, or OTHER), so that I can organize and analyze expenses effectively.

- **US8.7:** As a property owner, I can view an expense breakdown chart by category, so that I can understand where my money is being spent.

- **US8.8:** As a property owner, I can filter expenses by date range, so that I can analyze expenses for specific periods (monthly, quarterly, yearly).

### Income Management

- **US8.9:** As a property owner, I can record property income with date, amount, type, source, and description, so that I can track all revenue from my properties.

- **US8.10:** As a property owner, I can categorize income by type (RENT, SALE, CAPITAL_GAIN, or OTHER), so that I can distinguish between different income sources.

- **US8.11:** As a property owner, I can view income breakdown by type, so that I can understand my revenue sources.

- **US8.12:** As a property owner, I can view an income/expense chart comparing revenue and costs over time, so that I can assess profitability trends.

### Financial Dashboard & Analytics

- **US8.13:** As a property owner, I can view a financial dashboard per property showing net income, total income, total expenses, and key metrics, so that I can quickly assess the financial health of each property.

- **US8.14:** As a property owner, I can calculate ROI (Return on Investment) for a property based on income, expenses, and property value, so that I can evaluate investment performance.

- **US8.15:** As a property owner, I can filter financial data (income, expenses, valuations) by date range, so that I can analyze performance for specific periods.

- **US8.16:** As a property owner, I can export a comprehensive financial report (PDF or Excel) including income, expenses, valuations, and calculated metrics, so that I can share financial data with accountants or for tax purposes.

## Acceptance Criteria

### US8.1: Record Property Valuation

**Given** I am viewing a property details page  
**When** I click "Add Valuation" and fill in:
- Valuation date (required)
- Estimated value (required, positive number)
- Valuation type: MARKET, PURCHASE, TAX, or APPRAISAL (required)
- Valuated by (optional text field)
- Notes (optional)

**Then**:
- The valuation is saved to the database
- The valuation appears in the property's valuation history
- The property's `lastValuationDate` is updated
- A success message is displayed
- The form validates that value is positive and date is not in the future

**Technical Requirements**:
- API endpoint: `POST /api/properties/:propertyId/valuations`
- Request body validation using Zod schema
- Database transaction ensures data consistency
- Return created valuation with ID

### US8.2: View Valuation History

**Given** I am viewing a property details page  
**When** I navigate to the "Valuations" tab  
**Then**:
- I see a list of all valuations ordered by date (newest first)
- Each entry shows: date, value, type, valuated by, and notes
- Values are formatted with currency symbol (₪)
- I can see the total number of valuations

**Technical Requirements**:
- API endpoint: `GET /api/properties/:propertyId/valuations`
- Support pagination (optional)
- Return valuations sorted by `valuationDate DESC`
- Include property relationship data

### US8.3: Set Valuation Type

**Given** I am recording a new valuation  
**When** I select a valuation type from the dropdown  
**Then**:
- The selected type is saved with the valuation
- The type is displayed in the valuation history
- I can filter valuations by type (future enhancement)

**Technical Requirements**:
- Use `ValuationType` enum: MARKET, PURCHASE, TAX, APPRAISAL
- Frontend dropdown/select component with all enum values
- Backend validates enum value

### US8.4: Property Value Over Time Chart

**Given** I am viewing a property's financial dashboard  
**When** I view the "Property Value Over Time" chart  
**Then**:
- I see a line chart with valuation dates on X-axis and values on Y-axis
- Multiple valuation types can be displayed with different colors
- I can toggle visibility of different valuation types
- Chart is responsive and works on mobile devices

**Technical Requirements**:
- Use charting library (e.g., Recharts, Chart.js, or similar)
- API endpoint: `GET /api/properties/:propertyId/valuations?chart=true`
- Return data formatted for chart consumption
- Support date range filtering

### US8.5: Record Property Expense

**Given** I am viewing a property details page  
**When** I click "Add Expense" and fill in:
- Expense date (required)
- Amount (required, positive number)
- Type: MAINTENANCE, TAX, INSURANCE, UTILITIES, RENOVATION, LEGAL, or OTHER (required)
- Category (required text field)
- Description (optional)
- Payment method (optional)

**Then**:
- The expense is saved to the database
- The expense appears in the property's expense list
- A success message is displayed
- Form validates that amount is positive

**Technical Requirements**:
- API endpoint: `POST /api/properties/:propertyId/expenses`
- Request body validation using Zod schema
- Use `ExpenseType` enum for type field
- Return created expense with ID

### US8.6: Categorize Expenses

**Given** I am recording a property expense  
**When** I select an expense type from the dropdown  
**Then**:
- The selected type is saved with the expense
- The type is used for categorization and reporting
- I can filter and group expenses by type

**Technical Requirements**:
- Use `ExpenseType` enum: MAINTENANCE, TAX, INSURANCE, UTILITIES, RENOVATION, LEGAL, OTHER
- Frontend dropdown/select component with Hebrew labels
- Backend validates enum value
- Support filtering by type in API: `GET /api/properties/:propertyId/expenses?type=MAINTENANCE`

### US8.7: Expense Breakdown by Category

**Given** I am viewing a property's financial dashboard  
**When** I view the "Expense Breakdown" chart  
**Then**:
- I see a pie chart or bar chart showing expenses grouped by type
- Each category shows total amount and percentage
- Chart is interactive (hover shows details)
- I can filter by date range

**Technical Requirements**:
- API endpoint: `GET /api/properties/:propertyId/expenses/breakdown?startDate=&endDate=`
- Return aggregated data grouped by `type`
- Use charting library for visualization
- Support date range filtering

### US8.8: Filter Expenses by Date Range

**Given** I am viewing a property's expenses  
**When** I select a date range (start date and end date)  
**Then**:
- Only expenses within the selected date range are displayed
- The expense list updates immediately
- Charts and totals reflect the filtered data
- Date range is persisted in URL query parameters

**Technical Requirements**:
- API endpoint: `GET /api/properties/:propertyId/expenses?startDate=&endDate=`
- Backend filters by `expenseDate` field
- Frontend date picker component
- URL query parameter support for shareable links

### US8.9: Record Property Income

**Given** I am viewing a property details page  
**When** I click "Add Income" and fill in:
- Income date (required)
- Amount (required, positive number)
- Type: RENT, SALE, CAPITAL_GAIN, or OTHER (required)
- Source (optional text field)
- Description (optional)

**Then**:
- The income is saved to the database
- The income appears in the property's income list
- A success message is displayed
- Form validates that amount is positive

**Technical Requirements**:
- API endpoint: `POST /api/properties/:propertyId/income`
- Request body validation using Zod schema
- Use `IncomeType` enum for type field
- Return created income record with ID

### US8.10: Categorize Income

**Given** I am recording property income  
**When** I select an income type from the dropdown  
**Then**:
- The selected type is saved with the income record
- The type is used for categorization and reporting
- I can filter and group income by type

**Technical Requirements**:
- Use `IncomeType` enum: RENT, SALE, CAPITAL_GAIN, OTHER
- Frontend dropdown/select component with Hebrew labels
- Backend validates enum value
- Support filtering by type in API: `GET /api/properties/:propertyId/income?type=RENT`

### US8.11: Income Breakdown by Type

**Given** I am viewing a property's financial dashboard  
**When** I view the "Income Breakdown" chart  
**Then**:
- I see a pie chart or bar chart showing income grouped by type
- Each type shows total amount and percentage
- Chart is interactive (hover shows details)
- I can filter by date range

**Technical Requirements**:
- API endpoint: `GET /api/properties/:propertyId/income/breakdown?startDate=&endDate=`
- Return aggregated data grouped by `type`
- Use charting library for visualization
- Support date range filtering

### US8.12: Income/Expense Chart

**Given** I am viewing a property's financial dashboard  
**When** I view the "Income vs Expenses" chart  
**Then**:
- I see a line or bar chart comparing income and expenses over time
- X-axis shows time periods (months/quarters)
- Y-axis shows amounts
- Income and expenses are displayed with different colors
- I can see net income (income - expenses) for each period
- Chart is responsive and works on mobile devices

**Technical Requirements**:
- API endpoint: `GET /api/properties/:propertyId/financial-summary?startDate=&endDate=&groupBy=month`
- Return aggregated data by time period
- Calculate net income per period
- Use charting library for visualization
- Support different grouping (month, quarter, year)

### US8.13: Financial Dashboard Per Property

**Given** I am viewing a property's financial dashboard  
**When** I navigate to the "Financial" tab  
**Then** I see:
- Total income (sum of all income records)
- Total expenses (sum of all expense records)
- Net income (income - expenses)
- Number of income transactions
- Number of expense transactions
- Average monthly income (if applicable)
- Average monthly expenses (if applicable)
- Property valuation (latest or average)
- Quick access to add income/expense/valuation
- Charts: income vs expenses, expense breakdown, income breakdown, property value over time

**Technical Requirements**:
- API endpoint: `GET /api/properties/:propertyId/financial-dashboard?startDate=&endDate=`
- Return aggregated financial metrics
- Include latest valuation
- Calculate averages and totals
- Support date range filtering
- Frontend dashboard component with cards and charts

### US8.14: Calculate ROI

**Given** I am viewing a property's financial dashboard  
**When** I view the ROI metric  
**Then**:
- ROI is calculated as: (Net Income / Property Value) × 100
- ROI is displayed as a percentage
- ROI can be calculated for a specific date range
- Tooltip explains the calculation method

**Technical Requirements**:
- Calculate ROI: `(totalIncome - totalExpenses) / propertyValue * 100`
- Use latest property valuation or purchase price
- API endpoint includes ROI in financial summary response
- Handle edge cases (zero property value, negative ROI)
- Display ROI with appropriate formatting (2 decimal places)

### US8.15: Filter Financial Data by Date Range

**Given** I am viewing financial data (income, expenses, valuations)  
**When** I select a date range using the date picker  
**Then**:
- All financial data is filtered to the selected date range
- Charts update to show only data within the range
- Totals and metrics recalculate based on filtered data
- Date range is displayed clearly
- I can clear the filter to show all data

**Technical Requirements**:
- Date range picker component (start date, end date)
- Apply filter to all financial API endpoints
- Backend filters by respective date fields (`incomeDate`, `expenseDate`, `valuationDate`)
- Frontend state management for date range
- URL query parameters for shareable filtered views

### US8.16: Export Financial Report

**Given** I am viewing a property's financial dashboard  
**When** I click "Export Report" and select format (PDF or Excel)  
**Then**:
- A financial report is generated including:
  - Property information (address, type, status)
  - Date range (if filtered)
  - Income summary (total, by type, list of transactions)
  - Expense summary (total, by type, list of transactions)
  - Valuation history
  - Net income calculation
  - ROI calculation
  - Charts/graphs (if PDF)
- The file downloads automatically
- The report is formatted professionally

**Technical Requirements**:
- API endpoint: `GET /api/properties/:propertyId/financial-report?format=pdf|excel&startDate=&endDate=`
- PDF generation using library (e.g., pdfkit, puppeteer)
- Excel generation using library (e.g., exceljs, xlsx)
- Include all financial data and calculations
- Support date range filtering
- Professional formatting with headers, tables, charts

## Implementation Notes

### Database Tables

The following Prisma models are involved:

1. **PropertyValuation** (`property_valuations` table)
   - Fields: `id`, `propertyId`, `accountId`, `valuationDate`, `estimatedValue`, `valuationType`, `valuatedBy`, `notes`, `createdAt`
   - Enum: `ValuationType` (MARKET, PURCHASE, TAX, APPRAISAL)
   - Indexes: `propertyId`, `accountId`, `valuationDate`

2. **PropertyExpense** (`property_expenses` table)
   - Fields: `id`, `propertyId`, `accountId`, `expenseDate`, `amount`, `type`, `category`, `description`, `paymentMethod`, `createdAt`
   - Enum: `ExpenseType` (MAINTENANCE, TAX, INSURANCE, UTILITIES, RENOVATION, LEGAL, OTHER)
   - Indexes: `propertyId`, `accountId`, `expenseDate`, `type`

3. **PropertyIncome** (`property_income` table)
   - Fields: `id`, `propertyId`, `accountId`, `incomeDate`, `amount`, `type`, `source`, `description`, `createdAt`
   - Enum: `IncomeType` (RENT, SALE, CAPITAL_GAIN, OTHER)
   - Indexes: `propertyId`, `accountId`, `incomeDate`, `type`

4. **Property** (for property details and relationships)
   - Fields: `id`, `estimatedValue`, `lastValuationDate` (updated when valuations are added)

### API Endpoints

#### Valuation Endpoints
- `GET /api/properties/:propertyId/valuations` - List all valuations for a property
- `POST /api/properties/:propertyId/valuations` - Create new valuation
- `GET /api/properties/:propertyId/valuations/:id` - Get single valuation
- `PUT /api/properties/:propertyId/valuations/:id` - Update valuation
- `DELETE /api/properties/:propertyId/valuations/:id` - Delete valuation

#### Expense Endpoints
- `GET /api/properties/:propertyId/expenses` - List expenses (supports filtering by date range and type)
- `POST /api/properties/:propertyId/expenses` - Create new expense
- `GET /api/properties/:propertyId/expenses/:id` - Get single expense
- `PUT /api/properties/:propertyId/expenses/:id` - Update expense
- `DELETE /api/properties/:propertyId/expenses/:id` - Delete expense
- `GET /api/properties/:propertyId/expenses/breakdown` - Get expense breakdown by category

#### Income Endpoints
- `GET /api/properties/:propertyId/income` - List income records (supports filtering by date range and type)
- `POST /api/properties/:propertyId/income` - Create new income record
- `GET /api/properties/:propertyId/income/:id` - Get single income record
- `PUT /api/properties/:propertyId/income/:id` - Update income record
- `DELETE /api/properties/:propertyId/income/:id` - Delete income record
- `GET /api/properties/:propertyId/income/breakdown` - Get income breakdown by type

#### Dashboard & Reporting Endpoints
- `GET /api/properties/:propertyId/financial-dashboard` - Get complete financial dashboard data
- `GET /api/properties/:propertyId/financial-summary` - Get financial summary (totals, averages, ROI)
- `GET /api/properties/:propertyId/financial-report` - Export financial report (PDF/Excel)

### Frontend Components

#### Valuation Components
- `ValuationForm.tsx` - Form for creating/editing valuations
- `ValuationList.tsx` - List of valuations with date, value, type
- `ValuationHistory.tsx` - Complete valuation history view
- `PropertyValueChart.tsx` - Line chart showing property value over time

#### Expense Components
- `ExpenseForm.tsx` - Form for creating/editing expenses
- `ExpenseList.tsx` - List of expenses with filtering
- `ExpenseBreakdownChart.tsx` - Pie/bar chart showing expenses by category
- `ExpenseFilters.tsx` - Date range and type filters

#### Income Components
- `IncomeForm.tsx` - Form for creating/editing income records
- `IncomeList.tsx` - List of income records with filtering
- `IncomeBreakdownChart.tsx` - Pie/bar chart showing income by type
- `IncomeFilters.tsx` - Date range and type filters

#### Dashboard Components
- `FinancialDashboard.tsx` - Main dashboard container
- `FinancialSummaryCards.tsx` - Cards showing totals, net income, ROI
- `IncomeExpenseChart.tsx` - Combined chart comparing income and expenses
- `DateRangePicker.tsx` - Reusable date range picker component
- `FinancialReportExport.tsx` - Export button and modal

#### Shared Components
- `CurrencyInput.tsx` - Input component for currency amounts
- `DatePicker.tsx` - Date picker component
- `Select.tsx` - Dropdown/select component for enums
- `ChartContainer.tsx` - Wrapper for chart components with loading/error states

### Data Validation Schemas

#### Valuation Schema (Zod)
```typescript
const valuationSchema = z.object({
  valuationDate: z.date(),
  estimatedValue: z.number().positive(),
  valuationType: z.nativeEnum(ValuationType),
  valuatedBy: z.string().optional(),
  notes: z.string().optional(),
});
```

#### Expense Schema (Zod)
```typescript
const expenseSchema = z.object({
  expenseDate: z.date(),
  amount: z.number().positive(),
  type: z.nativeEnum(ExpenseType),
  category: z.string().min(1),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
});
```

#### Income Schema (Zod)
```typescript
const incomeSchema = z.object({
  incomeDate: z.date(),
  amount: z.number().positive(),
  type: z.nativeEnum(IncomeType),
  source: z.string().optional(),
  description: z.string().optional(),
});
```

### Charting Library

Recommend using **Recharts** (React) or **Chart.js** with React wrapper:
- Line charts for value over time
- Bar charts for income vs expenses
- Pie charts for breakdowns by category/type
- Responsive design for mobile devices
- Interactive tooltips and legends

### Report Generation

- **PDF**: Use `puppeteer` or `pdfkit` to generate PDFs with charts
- **Excel**: Use `exceljs` or `xlsx` to generate Excel files with data and charts
- Include property information, date range, financial summaries, transaction lists, and charts

### Security & Authorization

- All endpoints require authentication (user must be logged in)
- Verify `accountId` matches user's account
- Verify `propertyId` belongs to user's account
- Prevent access to other accounts' financial data

### Performance Considerations

- Use database indexes for date and type filtering
- Implement pagination for large lists of transactions
- Cache dashboard data for frequently accessed properties
- Optimize chart data queries with aggregation at database level
- Consider materialized views for complex financial calculations

### Internationalization

- All UI text in Hebrew (RTL)
- Currency formatting: ₪ (Israeli Shekel)
- Date formatting: DD/MM/YYYY format
- Number formatting: Use locale-specific formatting

### Testing Requirements

- Unit tests for all API endpoints
- Unit tests for financial calculations (ROI, totals, averages)
- Integration tests for CRUD operations
- E2E tests for complete workflows (add expense, view dashboard, export report)
- Test date range filtering
- Test enum validation
- Test authorization (prevent cross-account access)
