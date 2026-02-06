# Database Reset Task Changes

## Summary

The `db:reset:force` task has been updated to reset ONLY the test account data instead of wiping the entire database.

## What Changed

### Before
```bash
npm run db:reset:force
```
- ❌ Deleted ALL database data (all accounts)
- ❌ Dropped and recreated entire database schema using Prisma migrate reset
- ❌ Any real user accounts were lost

### After
```bash
npm run db:reset:force
```
- ✅ Deletes ONLY test account (`test-account-1`) data
- ✅ Preserves all other accounts and their data
- ✅ Keeps database schema intact
- ✅ Recreates test account as **clean and empty** (no data)

```bash
npm run db:reset:with-seed
```
- ✅ Same as above, PLUS populates with sample data

## Implementation Details

### New Script: `scripts/reset-test-account.ts`

A specialized script that:

1. **Targets Only Test Account**: Uses specific account ID (`test-account-1`)
2. **Respects Foreign Keys**: Deletes in correct order to avoid constraint violations
3. **Preserves Other Data**: Only touches test account data
4. **Recreates Test Account**: Creates fresh `test-account-1` after cleanup
5. **Handles Edge Cases**: Cleans up orphaned test users from previous runs
6. **Runs Seed Script**: Populates test account with sample data

### Updated Files

1. **Root package.json**:
   ```json
   "db:reset:force": "cd apps/backend && npx ts-node ../../scripts/reset-test-account.ts && npx ts-node prisma/seed.ts"
   ```

2. **Backend package.json**:
   ```json
   "db:reset:force": "ts-node ../../scripts/reset-test-account.ts && ts-node prisma/seed.ts"
   ```

### Deletion Order

The script deletes data in this order (respects foreign key constraints):

1. Notifications → (FK to leases)
2. Mortgage Payments → (FK to mortgages)
3. Leases → (FK to units, tenants)
4. Tenants
5. Units → (FK to properties)
6. Mortgages → (FK to properties, bank accounts)
7. Property Income, Expenses, Valuations → (FK to properties)
8. Property Ownerships → (FK to properties, owners)
9. Plot Info → (FK to properties)
10. Properties → (FK to account, investment companies)
11. Owners
12. Bank Accounts
13. Investment Companies
14. Users → (FK to account)
15. Account (test-account-1)

## Usage

### Two Commands Available

#### 1. Reset to Clean Empty Account
```bash
npm run db:reset:force
```
- Deletes all test account data
- Creates fresh empty test account
- **No sample data** - account is completely clean

#### 2. Reset and Populate with Sample Data
```bash
npm run db:reset:with-seed
```
- Deletes all test account data
- Creates fresh test account
- **Populates with sample data** (properties, tenants, leases, etc.)

### From Backend Directory
```bash
cd apps/backend
npm run db:reset:force        # Clean empty account
npm run db:reset:with-seed    # With sample data
```

### Direct Script Execution
```bash
# Clean empty account
ts-node scripts/reset-test-account.ts

# With sample data
ts-node scripts/reset-test-account.ts && npx ts-node apps/backend/prisma/seed.ts
```

## Output Example

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
✅ Test account created: test-account-1

🔨 Creating test user...
✅ Test user created: test@example.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Test account reset complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Test account is now clean and ready.
💡 Other accounts were not affected.

✅ 2 other account(s) preserved:
   - Production Account (abc-123): 5 users, 25 properties
   - Demo Account (xyz-789): 1 users, 3 properties
```

## Benefits

### For Development
- ✅ Quick reset of test data without affecting other accounts
- ✅ Faster than full database reset (no schema recreation)
- ✅ Safe to run anytime without data loss

### For Testing
- ✅ E2E tests can reset test account before each run
- ✅ Multiple developers can have their own accounts
- ✅ Test account always starts in known state

### For Production-like Environments
- ✅ Can reset test account without affecting demo/staging accounts
- ✅ Safe to use in environments with real user data
- ✅ No accidental data loss

## Safety Features

1. **Specific Account ID**: Only targets `test-account-1`
2. **Detailed Logging**: Shows exactly what's being deleted
3. **Preserved Accounts Report**: Lists accounts that were not affected
4. **Orphan Cleanup**: Handles edge cases from previous runs
5. **Transaction Safety**: Uses Prisma's transaction handling

## Migration Notes

### First Run After Update

If you had data from the old reset script, the first run will:
- Create the new test account with ID `test-account-1`
- Clean up the orphaned test user from the old account
- Show the old account (with UUID) as "preserved"

### Cleaning Up Old Test Accounts

To remove old test accounts created by the previous script:

```sql
-- Find accounts created by old script (with UUID IDs)
SELECT * FROM accounts WHERE id != 'test-account-1';

-- Delete specific account (replace with actual ID)
DELETE FROM accounts WHERE id = 'your-old-account-uuid';
```

Or use the old script once:
```bash
ts-node scripts/reset-database.ts  # ⚠️ DELETES ALL DATA
```

Then use the new script going forward:
```bash
npm run db:reset:force  # ✅ Only resets test account
```

## Old Script

The old `scripts/reset-database.ts` script is still available but **NOT used** by npm scripts.

**⚠️ Warning**: This script deletes ALL accounts and data. Use with extreme caution!

If you need to completely wipe the database:
```bash
ts-node scripts/reset-database.ts  # Manual execution only
```

## Test Account Credentials

After running `db:reset:force`, you can use these credentials for testing:

```
Account ID: test-account-1
User Email: test@example.com
User Name:  Test User
Role:       OWNER
```

## Future Enhancements

Potential improvements:
- [ ] Add flag to reset multiple test accounts
- [ ] Support for custom test account IDs
- [ ] Interactive mode to select which account to reset
- [ ] Backup test account before reset
- [ ] Reset to specific test data scenario

## Questions?

See:
- [`scripts/README.md`](../scripts/README.md) - Detailed script documentation
- [`scripts/reset-test-account.ts`](../scripts/reset-test-account.ts) - Implementation
- [`apps/backend/prisma/seed.ts`](../apps/backend/prisma/seed.ts) - Test data seeding

---

**Last Updated**: February 4, 2026
**Changed By**: Database Management Update
**Reason**: Enable safe test account reset without affecting other accounts
