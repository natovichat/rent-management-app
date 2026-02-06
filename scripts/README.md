# Database Scripts

## Reset Test Account (`reset-test-account.ts`)

### Purpose
Resets ONLY the test account data while preserving all other accounts in the database.

### What it does
1. **Deletes** all data associated with `test-account-1` (the test account):
   - Properties, units, tenants, leases
   - Owners, ownerships, mortgages
   - Financial records (income, expenses, valuations)
   - Investment companies, bank accounts
   - Users associated with the test account
   - The test account itself

2. **Preserves** all other accounts:
   - Real user accounts remain untouched
   - All their data stays intact

3. **Recreates** the test account:
   - Creates a fresh `test-account-1`
   - Creates the test user (`test@example.com`)
   - Account is **clean and empty** (no data)

### Usage

#### From project root:

**Clean empty account** (no data):
```bash
npm run db:reset:force
```

**With sample data** (properties, tenants, etc.):
```bash
npm run db:reset:with-seed
```

#### From backend directory:

**Clean empty account**:
```bash
npm run db:reset:force
```

**With sample data**:
```bash
npm run db:reset:with-seed
```

#### Direct execution:

**Clean empty account**:
```bash
ts-node scripts/reset-test-account.ts
```

**With sample data**:
```bash
ts-node scripts/reset-test-account.ts && npx ts-node apps/backend/prisma/seed.ts
```

### Output
The script provides detailed feedback:
- ✅ Number of records deleted per entity type
- ✅ Confirmation of test account recreation
- ✅ List of other accounts that were preserved

### Before and After

#### Before (Old `db:reset:force`):
- ❌ Deleted ALL database data
- ❌ Removed all accounts (including real ones)
- ❌ Dropped and recreated entire database schema
- ❌ Always added sample data

#### After (New `db:reset:force`):
- ✅ Deletes ONLY test account data
- ✅ Preserves all other accounts
- ✅ Keeps database schema intact
- ✅ Creates **clean empty** account (no data)
- ✅ Optional: Use `db:reset:with-seed` to add sample data

### Safety Features
- Uses specific account ID (`test-account-1`) to avoid accidental deletion
- Shows summary of what will be deleted before proceeding
- Reports preserved accounts after completion
- Respects foreign key constraints (deletes in correct order)

### Example Output
```
🔄 Starting test account reset...

🎯 Target: Account ID "test-account-1"

📊 Existing test account found:
   - 1 users
   - 2 properties
   - 2 tenants
   - 2 leases

🗑️  Deleting test account data...

   ✓ Deleted 0 notifications
   ✓ Deleted 3 mortgage payments
   ✓ Deleted 2 leases
   ✓ Deleted 2 tenants
   ✓ Deleted 2 units
   ✓ Deleted 1 mortgages
   ✓ Deleted 3 income records
   ✓ Deleted 3 expenses
   ✓ Deleted 3 valuations
   ✓ Deleted 2 property ownerships
   ✓ Deleted 1 plot info records
   ✓ Deleted 2 properties
   ✓ Deleted 2 owners
   ✓ Deleted 0 bank accounts
   ✓ Deleted 0 investment companies
   ✓ Deleted 1 users
   ✓ Deleted test account

✅ Test account data deleted successfully

🔨 Creating fresh test account...

✅ Test account created:
   ID: test-account-1
   Name: Test Account
   Status: ACTIVE

🔨 Creating test user...

✅ Test user created:
   Email: test@example.com
   Name: Test User
   Role: OWNER

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Test account reset complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Test account is now clean and ready.
💡 Other accounts were not affected.

✅ 2 other account(s) preserved:
   - Real User Account (abc-123-def): 3 users, 15 properties
   - Demo Account (xyz-789-uvw): 1 users, 5 properties
```

## Other Scripts

### `reset-database.ts` (Legacy - Not Used)
The original script that deleted ALL database data. Kept for reference but not used in npm scripts.

**⚠️ Warning**: This script deletes ALL accounts and data. Use with extreme caution!
