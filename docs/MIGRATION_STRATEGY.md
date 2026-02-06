# Database Migration Strategy - Property Portfolio Enhancement

## Overview

This document outlines the strategy for migrating from the MVP rent management schema to the enhanced property portfolio management schema. The migration is designed to be **backward compatible** and can be executed in phases without breaking existing functionality.

## Current State (MVP Schema)

- Account & Users (Authentication)
- Properties (basic: address, file number, notes)
- Units
- Tenants
- Leases
- Notifications

## Target State (Enhanced Portfolio Schema)

**Existing + New:**
- Enhanced Property model (type, status, country, area, valuation)
- Plot Information (Gush/Chelka)
- Ownership Structure (multi-owner support)
- Mortgage Management
- Financial Tracking (valuations, income, expenses)
- Investment Companies

---

## Migration Phases

### Phase 1: Enhance Property Model (No Breaking Changes)

**Objective**: Add new optional fields to Property model

**Steps**:

1. Create migration file: `20260202000001_enhance_property_model.sql`

```sql
-- Add new columns to properties table (all nullable for backward compatibility)
ALTER TABLE properties
  ADD COLUMN type VARCHAR(50),
  ADD COLUMN status VARCHAR(50) DEFAULT 'OWNED',
  ADD COLUMN country VARCHAR(100) DEFAULT 'Israel',
  ADD COLUMN city VARCHAR(100),
  ADD COLUMN total_area DECIMAL(10, 2),
  ADD COLUMN land_area DECIMAL(10, 2),
  ADD COLUMN estimated_value DECIMAL(12, 2),
  ADD COLUMN last_valuation_date TIMESTAMP,
  ADD COLUMN investment_company_id UUID;

-- Create indexes for new fields
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_country ON properties(country);
CREATE INDEX idx_properties_investment_company_id ON properties(investment_company_id);

-- Add check constraints for enums (optional, for data integrity)
ALTER TABLE properties
  ADD CONSTRAINT chk_property_type 
    CHECK (type IS NULL OR type IN ('RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED_USE'));

ALTER TABLE properties
  ADD CONSTRAINT chk_property_status 
    CHECK (status IS NULL OR status IN ('OWNED', 'IN_CONSTRUCTION', 'IN_PURCHASE', 'SOLD', 'INVESTMENT'));
```

**Prisma Migrate Command**:
```bash
npx prisma migrate dev --name enhance_property_model
```

**Backward Compatibility**: ✅ 
- All new fields are nullable
- Existing queries continue to work
- Default values provided where appropriate
- No foreign key constraints yet (added in Phase 2)

**Testing**:
```typescript
// Existing code should still work
const property = await prisma.property.create({
  data: {
    accountId: 'account-123',
    address: 'רחוב הרצל 10',
    fileNumber: '12345'
  }
});

// New code can use enhanced fields
const enhancedProperty = await prisma.property.create({
  data: {
    accountId: 'account-123',
    address: 'רחוב דרך המלך 11',
    type: 'RESIDENTIAL',
    status: 'OWNED',
    country: 'Israel',
    city: 'גני תקווה',
    totalArea: 90,
    estimatedValue: 2700000
  }
});
```

---

### Phase 2: Add Plot Information (Gush/Chelka)

**Objective**: Add plot/parcel tracking for Israeli properties

**Steps**:

1. Create migration file: `20260202000002_add_plot_info.sql`

```sql
-- Create plot_info table
CREATE TABLE plot_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE,
  account_id UUID NOT NULL,
  gush VARCHAR(50),
  chelka VARCHAR(50),
  sub_chelka VARCHAR(50),
  registry_number VARCHAR(100),
  registry_office VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_plot_info_property 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_plot_info_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_plot_info_account_id ON plot_info(account_id);
CREATE INDEX idx_plot_info_gush_chelka ON plot_info(gush, chelka);

-- Create trigger for updated_at
CREATE TRIGGER update_plot_info_updated_at
  BEFORE UPDATE ON plot_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Prisma Migrate Command**:
```bash
npx prisma migrate dev --name add_plot_info
```

**Backward Compatibility**: ✅ 
- New table, doesn't affect existing functionality
- Optional relationship (Property can exist without PlotInfo)

---

### Phase 3: Add Ownership Structure

**Objective**: Enable multi-owner property tracking

**Steps**:

1. Create migration file: `20260202000003_add_ownership_structure.sql`

```sql
-- Create owners table
CREATE TABLE owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  id_number VARCHAR(50),
  type VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_owners_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_owner_type 
    CHECK (type IN ('INDIVIDUAL', 'COMPANY', 'PARTNERSHIP'))
);

-- Create property_ownerships junction table
CREATE TABLE property_ownerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  account_id UUID NOT NULL,
  ownership_percentage DECIMAL(5, 2) NOT NULL,
  ownership_type VARCHAR(50) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_property_ownerships_property 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_property_ownerships_owner 
    FOREIGN KEY (owner_id) 
    REFERENCES owners(id) 
    ON DELETE RESTRICT,
    
  CONSTRAINT fk_property_ownerships_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_ownership_type 
    CHECK (ownership_type IN ('FULL', 'PARTIAL', 'PARTNERSHIP', 'COMPANY')),
    
  CONSTRAINT chk_ownership_percentage 
    CHECK (ownership_percentage > 0 AND ownership_percentage <= 100)
);

-- Create indexes
CREATE INDEX idx_owners_account_id ON owners(account_id);
CREATE INDEX idx_owners_name ON owners(name);
CREATE INDEX idx_property_ownerships_property_id ON property_ownerships(property_id);
CREATE INDEX idx_property_ownerships_owner_id ON property_ownerships(owner_id);
CREATE INDEX idx_property_ownerships_account_id ON property_ownerships(account_id);

-- Create triggers
CREATE TRIGGER update_owners_updated_at
  BEFORE UPDATE ON owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_ownerships_updated_at
  BEFORE UPDATE ON property_ownerships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Prisma Migrate Command**:
```bash
npx prisma migrate dev --name add_ownership_structure
```

**Backward Compatibility**: ✅ 
- New tables, no impact on existing functionality
- Properties can exist without ownership records
- Can gradually add ownership data

**Data Migration** (Optional):
```sql
-- Create default ownership for all existing properties
-- Run this after confirming which user/owner to assign
INSERT INTO owners (account_id, name, type, created_at, updated_at)
SELECT DISTINCT 
  p.account_id,
  a.name,
  'INDIVIDUAL',
  NOW(),
  NOW()
FROM properties p
JOIN accounts a ON p.account_id = a.id
WHERE NOT EXISTS (
  SELECT 1 FROM owners o WHERE o.account_id = p.account_id
);

-- Create 100% ownership for all properties
-- Adjust this based on actual ownership data
INSERT INTO property_ownerships (
  property_id,
  owner_id,
  account_id,
  ownership_percentage,
  ownership_type,
  start_date,
  created_at,
  updated_at
)
SELECT 
  p.id,
  o.id,
  p.account_id,
  100.00,
  'FULL',
  p.created_at,
  NOW(),
  NOW()
FROM properties p
JOIN owners o ON p.account_id = o.account_id
WHERE NOT EXISTS (
  SELECT 1 FROM property_ownerships po 
  WHERE po.property_id = p.id
);
```

---

### Phase 4: Add Mortgage Management

**Objective**: Track mortgages and loan payments

**Steps**:

1. Create migration file: `20260202000004_add_mortgage_management.sql`

```sql
-- Create mortgages table
CREATE TABLE mortgages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  account_id UUID NOT NULL,
  bank VARCHAR(255) NOT NULL,
  loan_amount DECIMAL(12, 2) NOT NULL,
  interest_rate DECIMAL(5, 2),
  monthly_payment DECIMAL(10, 2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status VARCHAR(50) NOT NULL,
  linked_properties TEXT[], -- Array of property IDs
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_mortgages_property 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE RESTRICT,
    
  CONSTRAINT fk_mortgages_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_mortgage_status 
    CHECK (status IN ('ACTIVE', 'PAID_OFF', 'REFINANCED', 'DEFAULTED')),
    
  CONSTRAINT chk_loan_amount 
    CHECK (loan_amount > 0)
);

-- Create mortgage_payments table
CREATE TABLE mortgage_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_id UUID NOT NULL,
  account_id UUID NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  principal DECIMAL(10, 2),
  interest DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_mortgage_payments_mortgage 
    FOREIGN KEY (mortgage_id) 
    REFERENCES mortgages(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_mortgage_payments_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_payment_amount 
    CHECK (amount > 0)
);

-- Create indexes
CREATE INDEX idx_mortgages_property_id ON mortgages(property_id);
CREATE INDEX idx_mortgages_account_id ON mortgages(account_id);
CREATE INDEX idx_mortgages_status ON mortgages(status);
CREATE INDEX idx_mortgages_bank ON mortgages(bank);
CREATE INDEX idx_mortgage_payments_mortgage_id ON mortgage_payments(mortgage_id);
CREATE INDEX idx_mortgage_payments_account_id ON mortgage_payments(account_id);
CREATE INDEX idx_mortgage_payments_payment_date ON mortgage_payments(payment_date);

-- Create triggers
CREATE TRIGGER update_mortgages_updated_at
  BEFORE UPDATE ON mortgages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key to properties table (from Phase 1)
ALTER TABLE properties
  ADD CONSTRAINT fk_properties_investment_company
    FOREIGN KEY (investment_company_id)
    REFERENCES investment_companies(id)
    ON DELETE SET NULL;
```

**Prisma Migrate Command**:
```bash
npx prisma migrate dev --name add_mortgage_management
```

**Backward Compatibility**: ✅ 
- New tables, no impact on existing functionality

---

### Phase 5: Add Financial Tracking

**Objective**: Track property valuations, income, and expenses

**Steps**:

1. Create migration file: `20260202000005_add_financial_tracking.sql`

```sql
-- Create property_valuations table
CREATE TABLE property_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  account_id UUID NOT NULL,
  valuation_date TIMESTAMP NOT NULL,
  estimated_value DECIMAL(12, 2) NOT NULL,
  valuation_type VARCHAR(50) NOT NULL,
  valuated_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_property_valuations_property 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_property_valuations_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_valuation_type 
    CHECK (valuation_type IN ('MARKET', 'PURCHASE', 'TAX', 'APPRAISAL')),
    
  CONSTRAINT chk_estimated_value 
    CHECK (estimated_value > 0)
);

-- Create property_expenses table
CREATE TABLE property_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  account_id UUID NOT NULL,
  expense_date TIMESTAMP NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  payment_method VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_property_expenses_property 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_property_expenses_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_expense_type 
    CHECK (type IN ('MAINTENANCE', 'TAX', 'INSURANCE', 'UTILITIES', 'RENOVATION', 'LEGAL', 'OTHER')),
    
  CONSTRAINT chk_expense_amount 
    CHECK (amount > 0)
);

-- Create property_income table
CREATE TABLE property_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  account_id UUID NOT NULL,
  income_date TIMESTAMP NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  source VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_property_income_property 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_property_income_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_income_type 
    CHECK (type IN ('RENT', 'SALE', 'CAPITAL_GAIN', 'OTHER')),
    
  CONSTRAINT chk_income_amount 
    CHECK (amount > 0)
);

-- Create indexes
CREATE INDEX idx_property_valuations_property_id ON property_valuations(property_id);
CREATE INDEX idx_property_valuations_account_id ON property_valuations(account_id);
CREATE INDEX idx_property_valuations_valuation_date ON property_valuations(valuation_date);

CREATE INDEX idx_property_expenses_property_id ON property_expenses(property_id);
CREATE INDEX idx_property_expenses_account_id ON property_expenses(account_id);
CREATE INDEX idx_property_expenses_expense_date ON property_expenses(expense_date);
CREATE INDEX idx_property_expenses_type ON property_expenses(type);

CREATE INDEX idx_property_income_property_id ON property_income(property_id);
CREATE INDEX idx_property_income_account_id ON property_income(account_id);
CREATE INDEX idx_property_income_income_date ON property_income(income_date);
CREATE INDEX idx_property_income_type ON property_income(type);
```

**Prisma Migrate Command**:
```bash
npx prisma migrate dev --name add_financial_tracking
```

**Backward Compatibility**: ✅ 
- New tables, no impact on existing functionality

---

### Phase 6: Add Investment Companies

**Objective**: Track investment company holdings

**Steps**:

1. Create migration file: `20260202000006_add_investment_companies.sql`

```sql
-- Create investment_companies table
CREATE TABLE investment_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Israel',
  investment_amount DECIMAL(12, 2),
  ownership_percentage DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_investment_companies_account 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT chk_ownership_percentage 
    CHECK (ownership_percentage IS NULL OR (ownership_percentage > 0 AND ownership_percentage <= 100))
);

-- Create indexes
CREATE INDEX idx_investment_companies_account_id ON investment_companies(account_id);
CREATE INDEX idx_investment_companies_name ON investment_companies(name);

-- Create trigger
CREATE TRIGGER update_investment_companies_updated_at
  BEFORE UPDATE ON investment_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Prisma Migrate Command**:
```bash
npx prisma migrate dev --name add_investment_companies
```

**Backward Compatibility**: ✅ 
- New table, no impact on existing functionality

---

## Migration Execution Plan

### Development Environment

```bash
# 1. Backup current database
pg_dump -h localhost -U postgres -d rent_app_dev > backup_$(date +%Y%m%d).sql

# 2. Run migrations one by one
npx prisma migrate dev --name enhance_property_model
npx prisma migrate dev --name add_plot_info
npx prisma migrate dev --name add_ownership_structure
npx prisma migrate dev --name add_mortgage_management
npx prisma migrate dev --name add_financial_tracking
npx prisma migrate dev --name add_investment_companies

# 3. Generate Prisma Client
npx prisma generate

# 4. Run tests
npm run test

# 5. If all tests pass, continue. If not, rollback:
psql -h localhost -U postgres -d rent_app_dev < backup_YYYYMMDD.sql
```

### Production Environment

```bash
# 1. Create full backup
pg_dump -h prod-host -U postgres -d rent_app_prod > prod_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test on staging first
# Apply all migrations to staging
npx prisma migrate deploy

# 3. Run smoke tests on staging
npm run test:e2e

# 4. Schedule maintenance window (2 hours)
# - Notify users
# - Put application in maintenance mode
# - Apply migrations to production

# 5. Apply to production
npx prisma migrate deploy

# 6. Generate Prisma Client
npx prisma generate

# 7. Restart application services
pm2 restart all

# 8. Verify production
# - Run health checks
# - Test critical user flows
# - Monitor error logs

# 9. Remove maintenance mode
# - Re-enable application
# - Notify users
```

---

## Rollback Plan

If issues occur during migration:

### Immediate Rollback (< 5 minutes after migration)

```bash
# 1. Put application in maintenance mode
# 2. Restore from backup
psql -h host -U postgres -d dbname < backup_file.sql
# 3. Restart application with old code
# 4. Verify functionality
```

### Selective Rollback (specific migration)

```bash
# Use Prisma migrate resolve
npx prisma migrate resolve --rolled-back migration_name

# Or manually rollback specific changes
# Example: Remove new tables
DROP TABLE IF EXISTS property_valuations CASCADE;
DROP TABLE IF EXISTS property_expenses CASCADE;
DROP TABLE IF EXISTS property_income CASCADE;
```

---

## Testing Strategy

### Before Each Migration Phase

```typescript
// Test existing functionality still works
describe('Backward Compatibility Tests', () => {
  it('should create property with old schema', async () => {
    const property = await prisma.property.create({
      data: {
        accountId: 'test-account',
        address: 'Test Address'
      }
    });
    expect(property).toBeDefined();
    expect(property.address).toBe('Test Address');
  });

  it('should query properties without new fields', async () => {
    const properties = await prisma.property.findMany({
      where: { accountId: 'test-account' }
    });
    expect(properties).toBeDefined();
  });
});
```

### After Each Migration Phase

```typescript
// Test new functionality works
describe('Enhanced Features Tests', () => {
  it('should create property with new fields', async () => {
    const property = await prisma.property.create({
      data: {
        accountId: 'test-account',
        address: 'Test Address',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        totalArea: 100,
        estimatedValue: 500000
      }
    });
    expect(property.type).toBe('RESIDENTIAL');
    expect(property.estimatedValue).toBe(500000);
  });
});
```

---

## Data Import Strategy

After completing migrations, import data from the PDF:

### 1. Prepare Import Script

```typescript
// scripts/import-portfolio-data.ts
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importProperties(accountId: string, csvPath: string) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });

  for (const record of records) {
    // Create property
    const property = await prisma.property.create({
      data: {
        accountId,
        address: record.address,
        type: record.type,
        status: record.status,
        city: record.city,
        totalArea: parseFloat(record.totalArea),
        estimatedValue: parseFloat(record.estimatedValue),
      }
    });

    // Create plot info if available
    if (record.gush) {
      await prisma.plotInfo.create({
        data: {
          propertyId: property.id,
          accountId,
          gush: record.gush,
          chelka: record.chelka,
          subChelka: record.subChelka
        }
      });
    }

    // Create ownership
    const owner = await prisma.owner.upsert({
      where: { id: record.ownerId || 'new' },
      create: {
        accountId,
        name: record.ownerName,
        type: 'INDIVIDUAL'
      },
      update: {}
    });

    await prisma.propertyOwnership.create({
      data: {
        propertyId: property.id,
        ownerId: owner.id,
        accountId,
        ownershipPercentage: parseFloat(record.ownershipPercentage),
        ownershipType: 'FULL',
        startDate: new Date(record.acquisitionDate)
      }
    });

    // Create mortgage if exists
    if (record.mortgageAmount) {
      await prisma.mortgage.create({
        data: {
          propertyId: property.id,
          accountId,
          bank: record.bank,
          loanAmount: parseFloat(record.mortgageAmount),
          monthlyPayment: parseFloat(record.monthlyPayment),
          startDate: new Date(record.mortgageStartDate),
          status: 'ACTIVE',
          linkedProperties: []
        }
      });
    }
  }
}

// Run import
importProperties('account-id', './data/properties.csv')
  .then(() => console.log('Import completed'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 2. CSV Format Template

```csv
address,type,status,city,totalArea,estimatedValue,gush,chelka,ownerName,ownershipPercentage,acquisitionDate,bank,mortgageAmount,monthlyPayment,mortgageStartDate
"רחוב דרך המלך 11, גני תקווה",RESIDENTIAL,OWNED,גני תקווה,90,2700000,6717,225,יצחק נטוביץ,100,2020-01-01,לאומי,6000000,57000,2020-01-01
```

---

## Validation Queries

After migration, run these queries to validate data integrity:

```sql
-- Check ownership percentages sum to 100% per property
SELECT 
  property_id,
  SUM(ownership_percentage) as total_percentage
FROM property_ownerships
WHERE end_date IS NULL
GROUP BY property_id
HAVING SUM(ownership_percentage) <> 100;

-- Check for orphaned records
SELECT COUNT(*) FROM plot_info 
WHERE property_id NOT IN (SELECT id FROM properties);

SELECT COUNT(*) FROM mortgages 
WHERE property_id NOT IN (SELECT id FROM properties);

-- Verify all new tables have accountId
SELECT 'plot_info' as table_name, COUNT(*) as records_without_account
FROM plot_info WHERE account_id IS NULL
UNION ALL
SELECT 'owners', COUNT(*) FROM owners WHERE account_id IS NULL
UNION ALL
SELECT 'property_ownerships', COUNT(*) FROM property_ownerships WHERE account_id IS NULL
UNION ALL
SELECT 'mortgages', COUNT(*) FROM mortgages WHERE account_id IS NULL;
```

---

## Summary

✅ **Backward Compatible**: Existing functionality preserved throughout migration  
✅ **Phased Approach**: Can be executed incrementally  
✅ **Rollback Safe**: Clear rollback procedures for each phase  
✅ **Tested**: Comprehensive testing strategy  
✅ **Data Import**: Scripts ready for portfolio data import  
✅ **Validated**: Validation queries to ensure data integrity  

**Estimated Total Migration Time**: 2-4 hours (including testing)  
**Recommended Execution**: During low-traffic period or scheduled maintenance window
