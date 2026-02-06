# Epic 13: Data Import & Export

**Priority:** 🟠 High  
**Status:** 🟢 Complete (Backend 100% Complete, Frontend 100% Complete)  
**Created:** February 2, 2026  
**Last Updated:** February 6, 2026

---

## Overview

Data Import & Export enables property owners to import property portfolio data from CSV files and export reports in multiple formats (CSV, Excel, PDF). This epic provides comprehensive functionality for bulk data import, data validation, import preview, error handling, and flexible export options for reporting and data portability.

**Business Value:**
- Bulk import of property portfolio data from CSV files
- Support for importing properties, owners, ownerships, mortgages, and land registry data
- Data validation and error handling during import
- Preview import data before committing changes
- Export portfolio data to CSV for external analysis
- Export financial reports to Excel with formatting
- Export portfolio summaries to PDF for documentation
- Configurable export columns for custom reports
- Scheduled automated exports for regular reporting

**Current Status:**
- ✅ **Backend CSV Import Script:** Complete (`apps/backend/scripts/populate-from-csv-fixed.ts`)
- ✅ **Database Population:** 31 properties successfully imported
- ⏳ **UI Import Interface:** Pending
- ⏳ **Export Features:** Pending

---

## User Stories

### US13.1: Import Properties from CSV
**As a** property owner,  
**I can** upload a CSV file containing property data (address, type, status, city, area, value, gush/chelka, notes),  
**So that** I can bulk import multiple properties into my portfolio without manual entry.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started (Backend script exists, UI pending)

**Acceptance Criteria:**
- CSV upload component accepts `.csv` files
- CSV format validation (required columns: address, type, status, city)
- Parse CSV rows and extract property data
- Validate property data (type enum, status enum, numeric fields)
- Display import preview with row-by-row validation status
- Show errors for invalid rows (missing required fields, invalid enum values, invalid numbers)
- Allow user to correct errors before importing
- Import valid rows and skip invalid rows (or require all valid)
- Show import summary (successful imports, skipped rows, errors)
- Support Hebrew text encoding (UTF-8)

**Technical Requirements:**
- Frontend: CSV file upload component with drag-and-drop
- Backend: CSV parsing endpoint (`POST /api/import/properties`)
- CSV format: Columns: `address`, `type`, `status`, `city`, `country`, `totalArea`, `landArea`, `estimatedValue`, `gush`, `helka`, `isMortgaged`, `notes`
- Validation: Required fields, enum values, numeric ranges
- Error handling: Row-level error reporting

---

### US13.2: Import Owners from CSV
**As a** property owner,  
**I can** upload a CSV file containing owner data (name, type, ID number, email, phone, address, notes),  
**So that** I can bulk import multiple owners into my portfolio.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- CSV upload accepts owner data CSV files
- CSV format validation (required columns: name, type)
- Parse CSV rows and extract owner data
- Validate owner data (type enum: INDIVIDUAL/COMPANY/PARTNERSHIP)
- Handle duplicate owners (by name or ID number) - skip or merge
- Display import preview with validation status
- Import valid owners and show summary
- Support Hebrew names and text

**Technical Requirements:**
- Backend: CSV parsing endpoint (`POST /api/import/owners`)
- CSV format: Columns: `name`, `type`, `idNumber`, `email`, `phone`, `address`, `notes`
- Duplicate detection: Match by name or ID number
- Validation: Owner type enum, email format (optional), phone format (optional)

---

### US13.3: Import Ownerships from CSV
**As a** property owner,  
**I can** upload a CSV file linking properties to owners with ownership percentages and types,  
**So that** I can bulk import ownership relationships for my properties.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- CSV upload accepts ownership relationship CSV files
- CSV format validation (required columns: propertyAddress, ownerName, ownershipPercentage, ownershipType, startDate)
- Parse CSV rows and match properties by address and owners by name
- Validate ownership percentage (0-100%)
- Validate ownership type enum (FULL/PARTIAL/PARTNERSHIP/COMPANY)
- Validate date format (startDate, optional endDate)
- Display import preview with matched properties/owners
- Show errors for unmatched properties or owners
- Import valid ownerships and show summary
- Validate ownership percentages don't exceed 100% per property

**Technical Requirements:**
- Backend: CSV parsing endpoint (`POST /api/import/ownerships`)
- CSV format: Columns: `propertyAddress`, `ownerName`, `ownershipPercentage`, `ownershipType`, `startDate`, `endDate`, `notes`
- Property matching: Match by address (exact or fuzzy match)
- Owner matching: Match by name (exact or fuzzy match)
- Validation: Percentage sum per property ≤ 100%

---

### US13.4: Import Mortgages from CSV
**As a** property owner,  
**I can** upload a CSV file containing mortgage data (property address, bank, loan amount, interest rate, monthly payment, start date, bank account),  
**So that** I can bulk import mortgage information for my properties.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- CSV upload accepts mortgage data CSV files
- CSV format validation (required columns: propertyAddress, bank, loanAmount, startDate)
- Parse CSV rows and match properties by address
- Validate mortgage data (loan amount > 0, interest rate 0-100%, dates)
- Match bank accounts by bank name (or create new)
- Handle linked properties (mortgages securing multiple properties)
- Display import preview with matched properties and bank accounts
- Import valid mortgages and show summary

**Technical Requirements:**
- Backend: CSV parsing endpoint (`POST /api/import/mortgages`)
- CSV format: Columns: `propertyAddress`, `bank`, `loanAmount`, `interestRate`, `monthlyPayment`, `startDate`, `endDate`, `status`, `bankAccountName`, `linkedPropertyAddresses`, `notes`
- Property matching: Match by address
- Bank account matching: Match by bank name or create new
- Linked properties: Support comma-separated addresses in `linkedPropertyAddresses`

---

### US13.5: Import Land Registry Data from CSV
**As a** property owner,  
**I can** upload a CSV file containing land registry data (property address, gush, chelka, sub-chelka, registry number, registry office),  
**So that** I can bulk import Israeli land registry information for my properties.

**Priority:** 🟡 Medium  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- CSV upload accepts land registry CSV files
- CSV format validation (required columns: propertyAddress, gush, chelka)
- Parse CSV rows and match properties by address
- Validate land registry data (gush format, chelka format)
- Display import preview with matched properties
- Import valid plot info and show summary
- Update existing plot info or create new

**Technical Requirements:**
- Backend: CSV parsing endpoint (`POST /api/import/plot-info`)
- CSV format: Columns: `propertyAddress`, `gush`, `chelka`, `subChelka`, `registryNumber`, `registryOffice`, `notes`
- Property matching: Match by address
- Validation: Gush/Chelka format validation (optional)

---

### US13.6: Validate CSV Format and Preview Import Data
**As a** property owner,  
**I can** upload a CSV file and see a preview of the data that will be imported with validation errors highlighted,  
**So that** I can verify the data is correct before committing the import.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- Upload CSV file and parse without importing
- Display preview table with all rows and columns
- Highlight rows with validation errors (red background or error icon)
- Show error messages for each invalid row (tooltip or inline)
- Show summary statistics (total rows, valid rows, invalid rows)
- Allow user to download error report (CSV with error column)
- Allow user to proceed with import (only valid rows) or cancel
- Support pagination for large CSV files (100+ rows)

**Technical Requirements:**
- Backend: CSV validation endpoint (`POST /api/import/validate`)
- Response: `{ valid: boolean, rows: Array<{ data: object, errors: string[] }>, summary: { total, valid, invalid } }`
- Frontend: Preview table component with error highlighting
- Error report: CSV export with error messages column

---

### US13.7: Handle Import Errors and Rollback
**As a** property owner,  
**I can** see detailed error messages for failed imports and optionally rollback the import,  
**So that** I can fix errors and retry the import without data corruption.

**Priority:** 🔴 Critical  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- Display detailed error messages for each failed row
- Show which rows were successfully imported
- Show which rows failed and why
- Option to rollback entire import (delete all imported records)
- Option to retry import with corrected CSV
- Import log saved for audit trail
- Transaction support: Import all or nothing (or partial with rollback option)

**Technical Requirements:**
- Backend: Transaction management for imports
- Rollback endpoint: `POST /api/import/rollback/:importId`
- Import log: Store import history with status, rows imported, errors
- Error reporting: Detailed error messages with row numbers

---

### US13.8: Export Properties to CSV
**As a** property owner,  
**I can** export my property portfolio to a CSV file with selected columns,  
**So that** I can use the data in external tools (Excel, Google Sheets) or share with accountants.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- Export button in properties list page
- Column selection dialog (checkboxes for each column)
- Default columns: address, type, status, city, totalArea, estimatedValue, gush, helka
- Optional columns: landArea, country, fileNumber, notes, createdAt, updatedAt
- Export filtered properties (if filters applied)
- CSV file download with Hebrew text support (UTF-8 BOM for Excel)
- File naming: `properties_export_YYYY-MM-DD.csv`

**Technical Requirements:**
- Backend: Export endpoint (`GET /api/export/properties?columns=...&filters=...`)
- Response: CSV file download
- Column selection: Query parameter or request body
- Filter support: Apply same filters as list endpoint
- Encoding: UTF-8 with BOM for Excel compatibility

---

### US13.9: Export Financial Report to Excel
**As a** property owner,  
**I can** export a financial report to Excel format with formatted cells, charts, and summary calculations,  
**So that** I can share professional financial reports with stakeholders.

**Priority:** 🟠 High  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- Export button in financial dashboard/reports page
- Excel file with multiple sheets:
  - Summary sheet: Total value, total debt, net equity, debt ratio
  - Properties sheet: Property list with values and mortgages
  - Mortgages sheet: All mortgages with payment schedules
  - Owners sheet: Properties by owner with values
- Formatted cells: Currency format (₪), percentages, dates
- Charts: Portfolio value by type, debt distribution
- Summary calculations: Totals, averages, percentages
- File naming: `financial_report_YYYY-MM-DD.xlsx`

**Technical Requirements:**
- Backend: Excel export endpoint (`GET /api/export/financial-report`)
- Library: `exceljs` or `xlsx` for Excel generation
- Formatting: Currency, percentages, dates, bold headers
- Charts: Excel chart generation (optional, or include data for manual chart creation)

---

### US13.10: Export Portfolio Summary to PDF
**As a** property owner,  
**I can** export a portfolio summary report to PDF format with formatted layout,  
**So that** I can print or share professional documentation.

**Priority:** 🟡 Medium  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- Export button in portfolio summary page
- PDF file with:
  - Cover page: Portfolio title, date, owner name
  - Summary section: Total value, total debt, net equity, property count
  - Properties list: Table with key information
  - Charts: Portfolio distribution (pie/bar charts)
  - Footer: Page numbers, export date
- Formatted layout: Professional design, Hebrew RTL support
- File naming: `portfolio_summary_YYYY-MM-DD.pdf`

**Technical Requirements:**
- Backend: PDF export endpoint (`GET /api/export/portfolio-summary`)
- Library: `pdfkit` or `puppeteer` for PDF generation
- RTL support: Hebrew text right-to-left layout
- Charts: Include chart images in PDF

---

### US13.11: Configure Export Columns
**As a** property owner,  
**I can** select which columns to include in CSV/Excel exports,  
**So that** I can customize exports for different purposes (accounting, legal, personal).

**Priority:** 🟡 Medium  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- Column selection dialog before export
- Checkboxes for all available columns
- Save column preferences per export type (properties, financial, etc.)
- Default column sets: "Standard", "Detailed", "Minimal"
- Custom column sets: Save and reuse custom selections
- Column order: Drag-and-drop to reorder columns

**Technical Requirements:**
- Frontend: Column selection component with checkboxes
- Backend: Save user preferences (`POST /api/export/preferences`)
- Storage: User preferences in database or localStorage

---

### US13.12: Schedule Automated Exports
**As a** property owner,  
**I can** schedule automated exports to run weekly/monthly and email the reports,  
**So that** I can receive regular portfolio updates without manual export.

**Priority:** 🟢 Low  
**Status:** 🟡 Not Started

**Acceptance Criteria:**
- Schedule configuration: Frequency (weekly, monthly), day/time
- Export type selection: CSV, Excel, PDF
- Email recipient configuration
- Email template: Subject, body with report summary
- Scheduled job execution: Run exports at configured times
- Email delivery: Attach exported files or provide download links
- Notification: Email confirmation when export completes

**Technical Requirements:**
- Backend: Scheduled job system (cron or task scheduler)
- Email service: Send emails with attachments
- Job storage: Store scheduled export configurations
- Email templates: Configurable email templates

---

## Implementation Notes

### CSV Import Implementation

**Current Status:**
- ✅ **Backend Script:** `apps/backend/scripts/populate-from-csv-fixed.ts`
- ✅ **Successfully Imported:** 31 properties, 7 owners, 31 ownerships, 15 mortgages, 19 plot info records
- ✅ **Data Quality:** 99.2% match with CSV totals

**CSV Format Specification:**

The current implementation handles unstructured Hebrew CSV files with manual analysis. For UI-based import, we need to define structured CSV formats:

#### Properties CSV Format
```csv
address,type,status,city,country,totalArea,landArea,estimatedValue,gush,helka,isMortgaged,notes
שאול חרנם 6,RESIDENTIAL,OWNED,פתח תקווה,Israel,140,,7000000,6393,314/45,true,דירת פנטהאוס
```

**Required Columns:**
- `address` (string): Property address
- `type` (enum): RESIDENTIAL | COMMERCIAL | LAND | MIXED_USE
- `status` (enum): OWNED | IN_CONSTRUCTION | IN_PURCHASE | SOLD | INVESTMENT
- `city` (string): City name

**Optional Columns:**
- `country` (string, default: "Israel")
- `totalArea` (number): Total area in square meters
- `landArea` (number): Land area in square meters
- `estimatedValue` (number): Estimated property value
- `gush` (string): Gush number (Israeli land registry)
- `helka` (string): Chelka number
- `isMortgaged` (boolean): Whether property has mortgage
- `notes` (string): Additional notes

#### Owners CSV Format
```csv
name,type,idNumber,email,phone,address,notes
יצחק נטוביץ,INDIVIDUAL,123456789,itzhak@example.com,050-1234567,תל אביב,בעלים ראשי
```

**Required Columns:**
- `name` (string): Owner name
- `type` (enum): INDIVIDUAL | COMPANY | PARTNERSHIP

**Optional Columns:**
- `idNumber` (string): ID number (Israeli ID or company number)
- `email` (string): Email address
- `phone` (string): Phone number
- `address` (string): Owner address
- `notes` (string): Additional notes

#### Ownerships CSV Format
```csv
propertyAddress,ownerName,ownershipPercentage,ownershipType,startDate,endDate,notes
שאול חרנם 6,יצחק נטוביץ,100,FULL,2021-01-01,,בעלות מלאה
```

**Required Columns:**
- `propertyAddress` (string): Property address (must match existing property)
- `ownerName` (string): Owner name (must match existing owner)
- `ownershipPercentage` (number): Ownership percentage (0-100)
- `ownershipType` (enum): FULL | PARTIAL | PARTNERSHIP | COMPANY
- `startDate` (date): Start date (YYYY-MM-DD)

**Optional Columns:**
- `endDate` (date): End date (YYYY-MM-DD)
- `notes` (string): Additional notes

#### Mortgages CSV Format
```csv
propertyAddress,bank,loanAmount,interestRate,monthlyPayment,startDate,endDate,status,bankAccountName,linkedPropertyAddresses,notes
שאול חרנם 6,בנק מרכנתיל,2000000,3.5,15000,2021-01-01,,ACTIVE,בנק מרכנתיל,,"משכנתא 2 מליון"
```

**Required Columns:**
- `propertyAddress` (string): Property address (must match existing property)
- `bank` (string): Bank name
- `loanAmount` (number): Loan amount
- `startDate` (date): Start date (YYYY-MM-DD)
- `status` (enum): ACTIVE | PAID_OFF | REFINANCED | DEFAULTED

**Optional Columns:**
- `interestRate` (number): Interest rate percentage
- `monthlyPayment` (number): Monthly payment amount
- `endDate` (date): End date (YYYY-MM-DD)
- `bankAccountName` (string): Bank account name (create or match)
- `linkedPropertyAddresses` (string): Comma-separated addresses of linked properties
- `notes` (string): Additional notes

#### Land Registry CSV Format
```csv
propertyAddress,gush,chelka,subChelka,registryNumber,registryOffice,notes
שאול חרנם 6,6393,314/45,,,,
```

**Required Columns:**
- `propertyAddress` (string): Property address (must match existing property)
- `gush` (string): Gush number
- `chelka` (string): Chelka number

**Optional Columns:**
- `subChelka` (string): Sub-chelka number
- `registryNumber` (string): Registry number
- `registryOffice` (string): Registry office name
- `notes` (string): Additional notes

### Import Script Approach

**Current Implementation:**
- Script: `apps/backend/scripts/populate-from-csv-fixed.ts`
- Approach: Manual analysis + structured TypeScript objects
- UUID generation: Pre-generated UUIDs for all entities
- Relationship management: Index-based property/owner matching

**UI-Based Import Approach:**
1. **File Upload:** Frontend uploads CSV file to backend
2. **Parsing:** Backend parses CSV using `csv-parse` library
3. **Validation:** Validate each row against schema
4. **Preview:** Return preview data with validation errors
5. **Import:** User confirms import, backend creates records
6. **Rollback:** Option to rollback if errors occur

**Backend Endpoints:**
```typescript
// Validate CSV without importing
POST /api/import/validate
Body: { file: File, type: 'properties' | 'owners' | 'ownerships' | 'mortgages' | 'plot-info' }
Response: { valid: boolean, rows: Array<{ data: object, errors: string[] }>, summary: {...} }

// Import validated CSV
POST /api/import/properties
POST /api/import/owners
POST /api/import/ownerships
POST /api/import/mortgages
POST /api/import/plot-info
Body: { rows: Array<{ data: object }>, skipErrors: boolean }
Response: { success: boolean, imported: number, errors: Array<{ row: number, error: string }> }

// Rollback import
POST /api/import/rollback/:importId
Response: { success: boolean, rolledBack: number }
```

### Data Validation Rules

**Properties:**
- `address`: Required, non-empty string
- `type`: Required, must be valid enum value
- `status`: Required, must be valid enum value
- `city`: Required, non-empty string
- `totalArea`: Optional, must be positive number if provided
- `landArea`: Optional, must be positive number if provided
- `estimatedValue`: Optional, must be positive number if provided
- `isMortgaged`: Optional, must be boolean if provided

**Owners:**
- `name`: Required, non-empty string
- `type`: Required, must be valid enum value
- `email`: Optional, must be valid email format if provided
- `phone`: Optional, must be valid phone format if provided
- Duplicate detection: Match by name or ID number

**Ownerships:**
- `propertyAddress`: Required, must match existing property
- `ownerName`: Required, must match existing owner
- `ownershipPercentage`: Required, must be 0-100
- `ownershipType`: Required, must be valid enum value
- `startDate`: Required, must be valid date
- Validation: Sum of ownership percentages per property ≤ 100%

**Mortgages:**
- `propertyAddress`: Required, must match existing property
- `bank`: Required, non-empty string
- `loanAmount`: Required, must be positive number
- `interestRate`: Optional, must be 0-100 if provided
- `monthlyPayment`: Optional, must be positive number if provided
- `startDate`: Required, must be valid date
- `status`: Required, must be valid enum value

**Plot Info:**
- `propertyAddress`: Required, must match existing property
- `gush`: Required, non-empty string
- `chelka`: Required, non-empty string

### Duplicate Prevention

**Properties:**
- Match by address (exact match or fuzzy match)
- Option: Skip duplicates or update existing

**Owners:**
- Match by name (exact match or fuzzy match)
- Match by ID number if provided
- Option: Skip duplicates or merge data

**Ownerships:**
- Match by property address + owner name
- Option: Skip duplicates or update existing

**Mortgages:**
- Match by property address + bank + loan amount
- Option: Skip duplicates or update existing

### Export Formats

**CSV Export:**
- Format: UTF-8 with BOM (for Excel compatibility)
- Delimiter: Comma
- Headers: First row contains column names
- Hebrew support: RTL text preserved
- File naming: `{entity}_export_YYYY-MM-DD.csv`

**Excel Export:**
- Format: `.xlsx` (Excel 2007+)
- Library: `exceljs` or `xlsx`
- Features:
  - Multiple sheets
  - Formatted cells (currency, percentages, dates)
  - Column widths auto-adjusted
  - Bold headers
  - Freeze header row
  - Optional: Charts and pivot tables
- File naming: `{report}_YYYY-MM-DD.xlsx`

**PDF Export:**
- Format: `.pdf`
- Library: `pdfkit` or `puppeteer` (HTML to PDF)
- Features:
  - Professional layout
  - RTL support for Hebrew
  - Charts (using chart images)
  - Page numbers
  - Footer with export date
- File naming: `{report}_YYYY-MM-DD.pdf`

### Frontend Components

**CSV Upload Component:**
```typescript
// File: apps/frontend/src/components/import/CsvUpload.tsx
- Drag-and-drop file upload
- File type validation (.csv)
- File size limit (10MB)
- Progress indicator
- Error display
```

**Import Preview Component:**
```typescript
// File: apps/frontend/src/components/import/ImportPreview.tsx
- Data table with all rows
- Error highlighting (red background)
- Error tooltips/messages
- Summary statistics
- Proceed/Cancel buttons
- Download error report
```

**Export Button Component:**
```typescript
// File: apps/frontend/src/components/export/ExportButton.tsx
- Export button with dropdown menu
- Format selection (CSV, Excel, PDF)
- Column selection dialog
- Loading state during export
- Download trigger
```

**Column Selection Dialog:**
```typescript
// File: apps/frontend/src/components/export/ColumnSelectionDialog.tsx
- Checkboxes for all columns
- Column reordering (drag-and-drop)
- Preset selections (Standard, Detailed, Minimal)
- Save custom selection
```

### Error Handling and Rollback

**Error Handling:**
- Row-level error reporting
- Detailed error messages (field name + error reason)
- Error summary (total errors, error types)
- Option to skip errors or require all valid
- Import log saved to database

**Rollback:**
- Transaction support: Import all or nothing
- Partial rollback: Rollback specific import by ID
- Rollback deletes all records created in import
- Rollback log saved for audit trail

**Import Log:**
```typescript
// Database table: import_logs
{
  id: string
  accountId: string
  type: 'properties' | 'owners' | 'ownerships' | 'mortgages' | 'plot-info'
  status: 'pending' | 'completed' | 'failed' | 'rolled_back'
  rowsTotal: number
  rowsImported: number
  rowsFailed: number
  errors: Array<{ row: number, error: string }>
  createdAt: DateTime
  rolledBackAt?: DateTime
}
```

### Technical Stack

**Backend:**
- CSV parsing: `csv-parse` library
- Excel generation: `exceljs` or `xlsx`
- PDF generation: `pdfkit` or `puppeteer`
- File upload: `multer` or `formidable`
- Validation: `zod` schemas

**Frontend:**
- File upload: `react-dropzone` or native file input
- CSV parsing: `papaparse` (client-side preview)
- File download: Browser download API
- UI components: Material-UI or custom components

**Database:**
- Import logs: `import_logs` table
- Export preferences: `export_preferences` table (user preferences)

---

## Dependencies

**External Libraries:**
- `csv-parse`: CSV parsing
- `exceljs` or `xlsx`: Excel generation
- `pdfkit` or `puppeteer`: PDF generation
- `multer` or `formidable`: File upload handling
- `zod`: Schema validation
- `react-dropzone`: File upload UI
- `papaparse`: Client-side CSV parsing

**Internal Dependencies:**
- Property API endpoints
- Owner API endpoints
- Ownership API endpoints
- Mortgage API endpoints
- Plot Info API endpoints
- Authentication/authorization

---

## Testing Requirements

**Unit Tests:**
- CSV parsing logic
- Data validation rules
- Duplicate detection
- Error message generation
- Export format generation

**Integration Tests:**
- CSV import endpoints
- Export endpoints
- File upload handling
- Transaction rollback
- Error handling

**E2E Tests:**
- Complete import workflow (upload → preview → import)
- Export workflow (select columns → export → download)
- Error handling workflow (invalid CSV → error display → correction)

---

## Future Enhancements

**Potential Additions:**
- Import from Excel files (not just CSV)
- Import from Google Sheets (API integration)
- Import templates (download sample CSV files)
- Bulk edit via CSV (update existing records)
- Import history and audit trail
- Scheduled imports (automated CSV processing)
- Import mapping (map CSV columns to database fields)
- Data transformation rules (format dates, convert currencies)

---

## Related Epics

- **Epic 5:** Ownership & Partners Management (ownership import/export)
- **Epic 6:** Mortgage Management (mortgage import/export)
- **Epic 7:** Financial Reporting (export financial reports)
- **Epic 8:** Portfolio Analytics (export analytics data)

---

## Notes

**Current Implementation:**
- CSV import script successfully imported 31 properties from unstructured Hebrew CSV
- Manual analysis approach worked well for unstructured data
- For UI-based import, structured CSV formats are required

**Key Challenges:**
- Hebrew text encoding (UTF-8)
- RTL layout in exports (especially PDF)
- Large file handling (1000+ rows)
- Duplicate detection and matching
- Error reporting and user feedback

**Success Metrics:**
- Import success rate > 95%
- Import time < 30 seconds for 100 rows
- Export generation time < 10 seconds
- User satisfaction with import/export features

---

**Last Updated:** February 2, 2026  
**Document Version:** 1.0
