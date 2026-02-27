# Data Migration Roadmap

**Purpose**: Structured plan for migrating unstructured property data into the database

---

## Migration Overview

### Data Sources

| Source File | Content | Priority | Complexity |
|-------------|---------|----------|------------|
| `רשימת נכסים איציק (2).html` | Property list with values, mortgages | 🔴 Critical | High |
| `existing_unstructure_data2/*.html` | Additional property data | 🟠 High | High |
| `הלווואה.html` | Loan/mortgage details | 🟠 High | Medium |
| `שכירות.html` | Lease information | 🟡 Medium | Medium |

### Expected Data Volume

| Entity | Estimated Records | Source |
|--------|-------------------|--------|
| Properties | ~25-30 | Property lists |
| Owners | ~10 | Family members + entities |
| PropertyOwnership | ~30-40 | Ownership links |
| Partners | ~10-15 | Co-owners mentioned |
| Mortgages | ~10-15 | Loan data |
| InvestmentCompany | ~3-5 | Investment holdings |
| PlotInfo | ~25-30 | Land registry (one per property) |
| PropertyValuation | ~25-30 | Initial valuations |
| Units | ~30-50 | Multi-unit properties |
| Tenants | ~10-20 | From lease file |
| Leases | ~10-20 | From lease file |

**Total Estimated Records**: ~200-250 records to migrate

---

## Migration Phases

### ✅ Phase 1: Schema Enhancement (BEFORE IMPORT)

**Timeline**: 1-2 days  
**Prerequisites**: Entity documentation review

**Tasks**:
1. Review all entity documentation files
2. Decide which additional fields to implement
3. Create Prisma schema migrations:
   - Add fields to Property
   - Add fields to Mortgage
   - Add fields to InvestmentCompany
   - Add fields to Owner, Unit, Lease
   - **Create Partner entity** (recommended)
4. Run migrations
5. Update backend DTOs and validators
6. Update frontend types

**Exit Criteria**: Database schema ready to receive all data

---

### 🎯 Phase 2: Owner/Entity Creation (FIRST IMPORT)

**Timeline**: 1 day  
**Prerequisites**: Phase 1 complete

**Tasks**:
1. **Create Owner Records** (manual or scripted)
   - יצחק נטוביץ
   - אילנה נטוביץ
   - ליאת נטוביץ
   - אביעד נטוביץ
   - מיכל נטוביץ
   - Joint entities: "י. נטוביץ ושות'"

2. **Create Investment Companies**
   - אפ-הולדינג (with profit shares)
   - חברת איילי בע"מ (German holdings)
   - יבולים partnership

3. **Create Partner Records**
   - אריאלה לאובר
   - צביקה נטוביץ
   - משה בורשטיין
   - שוקי שרון
   - זיו שמור
   - Others identified in data

**Exit Criteria**: All owner/partner entities created

---

### 🏠 Phase 3: Property Import (CORE DATA)

**Timeline**: 2-3 days  
**Prerequisites**: Phase 2 complete

**Tasks**:
1. **Parse Property List HTML**
   - Extract all ~25 properties
   - Parse: address, gush/chelka, value, owner

2. **Create Property Records**
   - Address (required)
   - Gush/Helka
   - Property type (infer from description)
   - Status (owned, in_construction, etc.)
   - Estimated value
   - Mortgage flag

3. **Create PlotInfo Records**
   - Link to each property
   - Store detailed gush/chelka
   - Handle multiple parcels

4. **Create PropertyOwnership Links**
   - Link Owner → Property
   - Set ownership percentages
   - Handle joint ownership

5. **Create PropertyPartner Links** (if Partner entity)
   - Link informal partners
   - Store share percentages

**Data Quality Checks**:
- All properties have addresses ✓
- Gush/Chelka extracted ✓
- Ownership percentages sum to 100% (where possible) ⚠️
- All owners linked ✓

**Exit Criteria**: All properties imported with ownership structure

---

### 💰 Phase 4: Financial Data Import

**Timeline**: 2 days  
**Prerequisites**: Phase 3 complete

**Tasks**:
1. **Create BankAccount Records**
   - לאומי account(s)
   - מרכנתיל account(s)
   - דיסקונט account(s)
   - German bank account(s)

2. **Import Mortgages**
   - Extract mortgage amounts
   - Link to bank accounts
   - Handle multi-property mortgages:
     - 6M loan → properties 2, 8, 11
   - Foreign currency mortgages
   - Special loans (profit-sharing)

3. **Create PropertyValuation Records**
   - One valuation per property
   - Date: 2021-12-14 (document date)
   - Type: MARKET
   - Add projected values where available

**Data Quality Checks**:
- Mortgage amounts match data ✓
- Multi-property links correct ✓
- Total mortgage debt matches summary (15,699,447 ₪) ✓
- All properties have initial valuation ✓

**Exit Criteria**: All financial data imported

---

### 🏢 Phase 5: Unit & Lease Import

**Timeline**: 2-3 days  
**Prerequisites**: Phase 4 complete

**Tasks**:
1. **Create Units**
   - Multi-unit properties (e.g., 2 apartments at מנדלי 7)
   - Office units (e.g., 103+105)
   - Storage units (e.g., מחסן אלנבי 85)

2. **Parse Lease File** (`שכירות.html`)
   - Extract tenant information
   - Extract lease terms

3. **Create Tenant Records**
   - From lease file
   - Link to units

4. **Create Lease Records**
   - Start/end dates
   - Monthly rent
   - Link tenant to unit

**Exit Criteria**: All units and active leases imported

---

### 📊 Phase 6: Validation & Cleanup

**Timeline**: 1-2 days  
**Prerequisites**: Phase 5 complete

**Tasks**:
1. **Data Validation**
   - Run validation queries
   - Check totals against summary
   - Verify relationships

2. **Edge Case Handling**
   - Properties with missing data
   - Unclear ownership percentages
   - Unresolved co-owner mentions

3. **Data Quality Report**
   - Completeness metrics
   - Issues found
   - Manual review needed list

4. **Cleanup**
   - Remove duplicate records
   - Standardize naming (bank names, cities)
   - Fix data entry errors

**Exit Criteria**: Data validated, quality report generated

---

## Technical Implementation

### Parsing Strategy

#### Option 1: Manual HTML Parsing
```python
from bs4 import BeautifulSoup
import pandas as pd

# Parse HTML table
with open('רשימת נכסים איציק (2).html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
    table = soup.find('table', class_='waffle')
    
# Extract rows
rows = []
for tr in table.find_all('tr'):
    cells = [td.get_text(strip=True) for td in tr.find_all('td')]
    if cells:
        rows.append(cells)

# Convert to DataFrame for easier processing
df = pd.DataFrame(rows)
```

#### Option 2: Copy to Google Sheets → Export as CSV
1. Open HTML in browser
2. Copy table data
3. Paste into Google Sheets
4. Clean up and organize
5. Export as CSV
6. Parse CSV (easier than HTML)

#### Option 3: Use Existing CSV (if available)
If data exported from original source as CSV:
```python
import pandas as pd
df = pd.read_csv('properties.csv', encoding='utf-8')
```

### Data Transformation Pipeline

```python
# 1. Extract raw data
raw_properties = parse_html_table('properties.html')

# 2. Transform to entity records
properties = transform_properties(raw_properties)
owners = extract_owners(raw_properties)
mortgages = extract_mortgages(raw_properties)
partners = extract_partners(raw_properties)

# 3. Create database records
for owner in owners:
    db.create_owner(owner)

for property in properties:
    db.create_property(property)
    create_plot_info(property)
    create_ownership_links(property)
    
for mortgage in mortgages:
    db.create_mortgage(mortgage)
    link_properties(mortgage)
```

---

## Field Mapping Reference

### Property List Columns → Database Fields

| HTML Column | Database Field | Transformation |
|-------------|----------------|----------------|
| בעלות (column A) | → Owner.name | Parse owner name |
| כתובת (column B) | → Property.address | Extract clean address |
| שווי (column C) | → Property.estimatedValue | Parse number, remove formatting |
| גוש חלקה | → PlotInfo.gush, chelka | Parse "גוש X חלקה Y" |
| משועבד | → Property.isMortgaged | Parse boolean |
| משכנתא סכום | → Mortgage.loanAmount | Parse number |
| החזר חודשי | → Mortgage.monthlyPayment | Parse number |
| דמי שכירות | → Property.rentalIncome OR Lease.monthlyRent | Parse number |

### Text Parsing Patterns

#### Ownership Percentage
```python
import re

text = "50% מזכויות בדירה"
match = re.search(r'(\d+)%', text)
if match:
    percentage = float(match.group(1))
    # percentage = 50.0
```

#### Gush/Chelka
```python
text = "גוש 6158 חלקות 371-376"
gush = re.search(r'גוש (\d+)', text).group(1)  # "6158"
chelka = re.search(r'חלק[הות] ([\d\-\/,\s]+)', text).group(1)  # "371-376"
```

#### Co-Owner Names
```python
text = "50% אחרים זה אריאלה לאובר"
match = re.search(r'אחרים זה (.+)', text)
if match:
    co_owner = match.group(1)  # "אריאלה לאובר"
```

#### Mortgage Amount
```python
text = "משועבדת 1,400,000 ₪ בבנק מרכנתיל"
amount_match = re.search(r'([\d,]+)\s*₪', text)
if amount_match:
    amount = float(amount_match.group(1).replace(',', ''))
    # amount = 1400000.0

bank_match = re.search(r'בבנק (.+?)(?:\s|$)', text)
if bank_match:
    bank = bank_match.group(1)  # "מרכנתיל"
```

---

## Data Quality Considerations

### High Confidence Data ✅
- Property addresses (clear and complete)
- Gush/Chelka (well-formatted)
- Property values (numeric, clear)
- Mortgage amounts (numeric, clear)
- Owner names (consistent)

### Medium Confidence Data ⚠️
- Ownership percentages (some inferred)
- Property types (need to infer)
- Co-owner details (text parsing needed)
- Development timelines (estimates)

### Low Confidence Data ⚠️
- Units (not detailed in property list)
- Lease details (need separate file)
- Tenant information (need separate file)
- Payment history (not documented)

### Missing Data ❌
- Property purchase dates (not in files)
- Detailed area measurements (some properties)
- Complete unit lists (multi-unit properties)
- Historical expense/income (except current rent)

---

## Validation Queries

After migration, run these queries:

### 1. Ownership Validation
```sql
-- Check that ownership percentages sum to ~100% per property
SELECT 
  p.address,
  SUM(po.ownership_percentage) as total_ownership
FROM properties p
LEFT JOIN property_ownerships po ON p.id = po.property_id
WHERE po.end_date IS NULL
GROUP BY p.id, p.address
HAVING SUM(po.ownership_percentage) NOT BETWEEN 99 AND 101;
```

### 2. Mortgage Validation
```sql
-- Verify total mortgages match data (15,699,447 ₪)
SELECT SUM(loan_amount) as total_mortgages
FROM mortgages
WHERE status = 'ACTIVE';
-- Expected: 15,699,447
```

### 3. Property Value Validation
```sql
-- Verify total property value matches data (75,681,000 ₪)
SELECT SUM(estimated_value) as total_value
FROM properties;
-- Expected: ~75,681,000
```

### 4. Linked Mortgage Validation
```sql
-- Check 6M mortgage links to properties 2, 8, 11
SELECT 
  m.loan_amount,
  m.bank,
  array_length(m.linked_properties, 1) as num_linked
FROM mortgages m
WHERE m.loan_amount = 6000000;
-- Expected: 1 record with 3 linked properties
```

### 5. Missing Critical Data
```sql
-- Properties without gush/chelka
SELECT address FROM properties WHERE gush IS NULL;

-- Properties without owner
SELECT p.address 
FROM properties p
LEFT JOIN property_ownerships po ON p.id = po.property_id
WHERE po.id IS NULL;

-- Mortgaged properties without mortgage record
SELECT address 
FROM properties 
WHERE is_mortgaged = true
  AND id NOT IN (SELECT property_id FROM mortgages WHERE status = 'ACTIVE');
```

---

## Risk Assessment

### Low Risk ✅
- Property addresses (high quality, clear)
- Gush/Chelka (well-structured, minimal parsing)
- Values (numeric, clear formatting)
- Owner names (consistent across data)

### Medium Risk ⚠️
- Ownership percentages (some need calculation)
- Property type inference (need business rules)
- Multi-property mortgages (complex linking)
- Co-owner parsing (text extraction)

### High Risk 🔴
- Historical data reconstruction (dates missing)
- Units without explicit data (need to infer)
- Lease information (separate file, may be incomplete)
- Currency conversions (exchange rates over time)

---

## Mitigation Strategies

### For Medium Risk Items
1. **Ownership Percentages**
   - Calculate from available data
   - Flag uncertain percentages for review
   - Allow manual adjustment

2. **Property Type Inference**
   - Keywords: דירה → RESIDENTIAL, משרד → COMMERCIAL, קרקע → LAND
   - Manual review for edge cases
   - Default to RESIDENTIAL if unclear

3. **Multi-Property Mortgages**
   - Carefully parse linked property mentions
   - Cross-reference property numbers
   - Validate totals

### For High Risk Items
1. **Missing Dates**
   - Use document date (2021-12-14) as baseline
   - Estimate based on context
   - Mark as estimated in notes

2. **Incomplete Units**
   - Create minimal unit records
   - Mark for additional data collection
   - Can enhance later

3. **Foreign Currency**
   - Use exchange rates from document date
   - Document rate used
   - Update if significant changes

---

## Success Metrics

### Completeness Targets

| Entity | Target | Definition |
|--------|--------|------------|
| Properties | 100% | All properties from list imported |
| Owners | 100% | All mentioned owners created |
| PropertyOwnership | 90%+ | Most ownership links created |
| Mortgages | 95%+ | All mortgages with clear amounts |
| PlotInfo | 95%+ | All properties with gush/chelka |
| PropertyValuation | 100% | All properties have initial valuation |
| Partners | 80%+ | Main co-owners tracked |
| InvestmentCompany | 100% | All investment companies |

### Quality Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Ownership totals | 90%+ sum to ~100% | Validation query |
| Mortgage totals | Match data (15.7M ₪) | SUM query |
| Property value | Match data (75.7M ₪) | SUM query |
| Missing critical fields | < 10% | Count NULL in key fields |
| Data validation errors | < 5% | Validation script |

---

## Post-Migration Activities

### 1. Manual Review (1-2 days)
- Review imported data in UI
- Verify property details
- Check ownership structure
- Validate financial totals

### 2. Data Enrichment (Ongoing)
- Add missing unit details
- Import lease information
- Add property photos
- Collect expense history

### 3. User Training
- Demo imported data
- Explain entity relationships
- Show how to update/maintain
- Training on new features

---

## Rollback Plan

### If Migration Issues Occur

1. **Database Backup**
   - Take backup before migration
   - Store in safe location
   - Document backup timestamp

2. **Rollback Procedure**
   ```sql
   -- Restore from backup
   psql database_name < backup_2026-02-02.sql
   ```

3. **Incremental Import**
   - Import in batches (5-10 properties at a time)
   - Validate after each batch
   - Easier to identify and fix issues

---

## Tools & Scripts

### Recommended Tools

1. **BeautifulSoup** (Python) - HTML parsing
2. **Pandas** - Data manipulation
3. **Prisma Client** - Database operations
4. **Regular Expressions** - Text extraction

### Script Structure

```
scripts/
└── data-migration/
    ├── 01_parse_html.py          # Parse HTML to JSON
    ├── 02_transform_data.py      # Transform to DB format
    ├── 03_import_owners.py       # Import owners
    ├── 04_import_properties.py   # Import properties
    ├── 05_import_mortgages.py    # Import mortgages
    ├── 06_validate_data.py       # Validation checks
    └── utils/
        ├── parsers.py            # Parsing utilities
        ├── validators.py         # Validation functions
        └── db_helpers.py         # Database utilities
```

---

## Timeline Summary

| Phase | Duration | Dependencies | Effort |
|-------|----------|--------------|--------|
| Phase 1: Schema | 1-2 days | Documentation review | Dev work |
| Phase 2: Owners | 1 day | Phase 1 | Data entry |
| Phase 3: Properties | 2-3 days | Phase 2 | Script + QA |
| Phase 4: Financial | 2 days | Phase 3 | Script + QA |
| Phase 5: Units/Leases | 2-3 days | Phase 4 | Script + QA |
| Phase 6: Validation | 1-2 days | Phase 5 | QA work |

**Total Estimated Time**: 9-13 days (2-3 weeks with buffer)

---

## Next Steps

1. ✅ **Review entity documentation** - Understand all entities
2. ⬜ **Decide on additional fields** - Which fields to implement
3. ⬜ **Create schema migrations** - Add fields to database
4. ⬜ **Build parsing scripts** - Extract data from HTML
5. ⬜ **Run Phase 2-6 migrations** - Import data incrementally
6. ⬜ **Validate and cleanup** - Ensure data quality

---

## Questions to Resolve

### Schema Decisions
- [ ] Implement Partner entity or use Owner for all?
- [ ] Add all recommended fields or subset?
- [ ] Create separate StorageUnit entity or use Unit?
- [ ] Add DevelopmentProject entity now or later?

### Data Decisions
- [ ] How to handle unclear ownership percentages?
- [ ] What to do with properties that sum to <100% ownership?
- [ ] How to track informal co-owners (text vs entities)?
- [ ] Foreign currency: store in original or ILS?

### Process Decisions
- [ ] Manual import or scripted?
- [ ] Import all at once or incrementally?
- [ ] User involved in validation or automated?
- [ ] Timeframe: urgent or phased over weeks?

---

**Last Updated**: February 2, 2026  
**Status**: Ready for implementation planning  
**Estimated Effort**: 9-13 days (2-3 weeks with buffer)  
**Data Volume**: ~200-250 records across 13+ entities
