#!/usr/bin/env ts-node

/**
 * Reset Test Account Script
 * 
 * Removes all data for the test account (test-account-1) and recreates it as clean.
 * Other accounts remain untouched.
 * 
 * Usage:
 *   npm run db:reset:force
 *   # or directly:
 *   ts-node scripts/reset-test-account.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_ACCOUNT_ID = 'test-account-1';
const TEST_USER_EMAIL = 'test@example.com';

async function resetTestAccount() {
  console.log('🔄 Starting test account reset...\n');
  console.log(`🎯 Target: Account ID "${TEST_ACCOUNT_ID}"\n`);

  try {
    // Step 1: Check if test account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: TEST_ACCOUNT_ID },
      include: {
        users: true,
        properties: true,
        tenants: true,
        leases: true,
      },
    });

    if (existingAccount) {
      console.log('📊 Existing test account found:');
      console.log(`   - ${existingAccount.users.length} users`);
      console.log(`   - ${existingAccount.properties.length} properties`);
      console.log(`   - ${existingAccount.tenants.length} tenants`);
      console.log(`   - ${existingAccount.leases.length} leases\n`);

      // Step 2: Delete all test account data (in correct order due to foreign key constraints)
      console.log('🗑️  Deleting test account data...\n');

      // Delete notifications (FK to leases)
      const deletedNotifications = await prisma.notification.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedNotifications.count} notifications`);

      // Delete mortgage payments (FK to mortgages)
      const deletedMortgagePayments = await prisma.mortgagePayment.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedMortgagePayments.count} mortgage payments`);

      // Delete leases (FK to units, tenants)
      const deletedLeases = await prisma.lease.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedLeases.count} leases`);

      // Delete tenants
      const deletedTenants = await prisma.tenant.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedTenants.count} tenants`);

      // Delete units (FK to properties)
      const deletedUnits = await prisma.unit.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedUnits.count} units`);

      // Delete mortgages (FK to properties and bank accounts)
      const deletedMortgages = await prisma.mortgage.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedMortgages.count} mortgages`);

      // Delete property-related financial data
      const deletedIncome = await prisma.propertyIncome.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      const deletedExpenses = await prisma.propertyExpense.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      const deletedValuations = await prisma.propertyValuation.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedIncome.count} income records`);
      console.log(`   ✓ Deleted ${deletedExpenses.count} expenses`);
      console.log(`   ✓ Deleted ${deletedValuations.count} valuations`);

      // Delete property ownership (FK to properties and owners)
      const deletedOwnerships = await prisma.propertyOwnership.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedOwnerships.count} property ownerships`);

      // Delete plot info (FK to properties)
      const deletedPlotInfo = await prisma.plotInfo.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedPlotInfo.count} plot info records`);

      // Delete properties (FK to account and investment companies)
      const deletedProperties = await prisma.property.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedProperties.count} properties`);

      // Delete owners
      const deletedOwners = await prisma.owner.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedOwners.count} owners`);

      // Delete bank accounts
      const deletedBankAccounts = await prisma.bankAccount.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedBankAccounts.count} bank accounts`);

      // Delete investment companies
      const deletedInvestmentCompanies = await prisma.investmentCompany.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedInvestmentCompanies.count} investment companies`);

      // Delete users (FK to account)
      const deletedUsers = await prisma.user.deleteMany({
        where: { accountId: TEST_ACCOUNT_ID },
      });
      console.log(`   ✓ Deleted ${deletedUsers.count} users`);

      // Delete the test account itself
      try {
        await prisma.account.delete({
          where: { id: TEST_ACCOUNT_ID },
        });
        console.log('   ✓ Deleted test account');
      } catch (error: any) {
        // Handle race condition: account might have been deleted by another concurrent call
        if (error.code === 'P2025') {
          console.log('   ℹ️  Test account already deleted (concurrent call)');
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      console.log('\n✅ Test account data deleted successfully\n');
    } else {
      console.log('ℹ️  Test account does not exist, creating fresh...\n');
    }

    // Step 3: Clean up any orphaned test users (from previous runs with different account IDs)
    const orphanedTestUser = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
    });

    if (orphanedTestUser && orphanedTestUser.accountId !== TEST_ACCOUNT_ID) {
      console.log('🧹 Cleaning up orphaned test user from previous run...\n');
      await prisma.user.delete({
        where: { email: TEST_USER_EMAIL },
      });
      console.log('   ✓ Deleted orphaned test user\n');
    }

    // Step 4: Create fresh test account
    console.log('🔨 Creating fresh test account...\n');

    // Check if account already exists (handle race condition)
    let testAccount = await prisma.account.findUnique({
      where: { id: TEST_ACCOUNT_ID },
    });

    if (!testAccount) {
      try {
        testAccount = await prisma.account.create({
          data: {
            id: TEST_ACCOUNT_ID,
            name: 'Test Account',
            status: 'ACTIVE',
          },
        });
        console.log('✅ Test account created:');
      } catch (error: any) {
        // Handle race condition: another concurrent call might have created it
        if (error.code === 'P2002') {
          testAccount = await prisma.account.findUnique({
            where: { id: TEST_ACCOUNT_ID },
          });
          console.log('✅ Test account retrieved (created by concurrent call):');
        } else {
          throw error;
        }
      }
    } else {
      console.log('✅ Test account already exists (from concurrent call):');
    }

    if (testAccount) {
      console.log(`   ID: ${testAccount.id}`);
      console.log(`   Name: ${testAccount.name}`);
      console.log(`   Status: ${testAccount.status}`);
      console.log(`   Created: ${testAccount.createdAt.toISOString()}\n`);
    }

    // Step 5: Create test user for the account
    console.log('🔨 Creating test user...\n');

    // Check if user already exists
    let testUser = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
    });

    if (!testUser) {
      try {
        testUser = await prisma.user.create({
          data: {
            accountId: testAccount!.id,
            email: TEST_USER_EMAIL,
            name: 'Test User',
            googleId: 'test-google-id',
            role: 'OWNER',
          },
        });
        console.log('✅ Test user created:');
      } catch (error: any) {
        // Handle race condition: another concurrent call might have created it
        if (error.code === 'P2002') {
          testUser = await prisma.user.findUnique({
            where: { email: TEST_USER_EMAIL },
          });
          console.log('✅ Test user retrieved (created by concurrent call):');
        } else {
          throw error;
        }
      }
    } else {
      // User exists, update to ensure correct accountId
      testUser = await prisma.user.update({
        where: { email: TEST_USER_EMAIL },
        data: {
          accountId: testAccount!.id,
          role: 'OWNER',
        },
      });
      console.log('✅ Test user updated (from concurrent call):');
    }

    if (testUser) {
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Role: ${testUser.role}`);
      console.log(`   Account ID: ${testUser.accountId}\n`);
    }

    // Step 6: Summary
    if (!testAccount || !testUser) {
      throw new Error('Failed to create test account or user');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Test account reset complete!\n');
    console.log('Test Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Account ID:   ${testAccount.id}`);
    console.log(`Account Name: ${testAccount.name}`);
    console.log(`User Email:   ${testUser.email}`);
    console.log(`User ID:      ${testUser.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Test account is now clean and empty.');
    console.log('💡 Run "npm run db:reset:with-seed" to populate with sample data.');
    console.log('💡 Other accounts were not affected.\n');

    // Check for other accounts
    const otherAccounts = await prisma.account.findMany({
      where: { id: { not: TEST_ACCOUNT_ID } },
      include: {
        users: true,
        properties: true,
      },
    });

    if (otherAccounts.length > 0) {
      console.log(`✅ ${otherAccounts.length} other account(s) preserved:`);
      otherAccounts.forEach((acc) => {
        console.log(`   - ${acc.name} (${acc.id}): ${acc.users.length} users, ${acc.properties.length} properties`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error resetting test account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetTestAccount()
  .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
