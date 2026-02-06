#!/usr/bin/env ts-node

/**
 * Database Reset Script
 * 
 * Clears ALL data from the database and creates a fresh test account.
 * 
 * Usage:
 *   npm run db:reset
 *   # or directly:
 *   ts-node scripts/reset-database.ts
 * 
 * Warning: This will DELETE ALL DATA!
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');

  try {
    // Step 1: Delete all data (in correct order due to foreign key constraints)
    console.log('🗑️  Deleting all data...\n');

    // Delete notifications first (has FK to leases and account)
    await prisma.notification.deleteMany();
    console.log('  ✓ Deleted notifications');

    // Delete mortgage payments (has FK to mortgages)
    await prisma.mortgagePayment.deleteMany();
    console.log('  ✓ Deleted mortgage payments');

    // Delete leases (has FK to units, tenants, account)
    await prisma.lease.deleteMany();
    console.log('  ✓ Deleted leases');

    // Delete tenants (has FK to account)
    await prisma.tenant.deleteMany();
    console.log('  ✓ Deleted tenants');

    // Delete units (has FK to properties)
    await prisma.unit.deleteMany();
    console.log('  ✓ Deleted units');

    // Delete mortgages (has FK to properties and bank accounts)
    await prisma.mortgage.deleteMany();
    console.log('  ✓ Deleted mortgages');

    // Delete property-related data
    await prisma.propertyIncome.deleteMany();
    await prisma.propertyExpense.deleteMany();
    await prisma.propertyValuation.deleteMany();
    console.log('  ✓ Deleted property financial records');

    // Delete property ownership (has FK to properties and owners)
    await prisma.propertyOwnership.deleteMany();
    console.log('  ✓ Deleted property ownerships');

    // Delete plot info (has FK to properties)
    await prisma.plotInfo.deleteMany();
    console.log('  ✓ Deleted plot info');

    // Delete properties (has FK to account and investment companies)
    await prisma.property.deleteMany();
    console.log('  ✓ Deleted properties');

    // Delete owners (has FK to account)
    await prisma.owner.deleteMany();
    console.log('  ✓ Deleted owners');

    // Delete bank accounts (has FK to account)
    await prisma.bankAccount.deleteMany();
    console.log('  ✓ Deleted bank accounts');

    // Delete investment companies (has FK to account)
    await prisma.investmentCompany.deleteMany();
    console.log('  ✓ Deleted investment companies');

    // Delete users (has FK to account)
    await prisma.user.deleteMany();
    console.log('  ✓ Deleted users');

    // Finally, delete accounts
    await prisma.account.deleteMany();
    console.log('  ✓ Deleted accounts');

    console.log('\n✅ All data deleted successfully\n');

    // Step 2: Create test account
    console.log('🔨 Creating test account...\n');

    const testAccount = await prisma.account.create({
      data: {
        name: 'Test Account',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Test account created:');
    console.log(`   ID: ${testAccount.id}`);
    console.log(`   Name: ${testAccount.name}`);
    console.log(`   Status: ${testAccount.status}`);
    console.log(`   Created: ${testAccount.createdAt.toISOString()}\n`);

    // Step 3: Create test user for the account
    console.log('🔨 Creating test user...\n');

    const testUser = await prisma.user.create({
      data: {
        accountId: testAccount.id,
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'test-google-id-' + Date.now(),
        role: 'OWNER',
      },
    });

    console.log('✅ Test user created:');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   Account ID: ${testUser.accountId}\n`);

    // Step 4: Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database reset complete!\n');
    console.log('Test Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Account ID:  ${testAccount.id}`);
    console.log(`Account Name: ${testAccount.name}`);
    console.log(`User Email:   ${testUser.email}`);
    console.log(`User ID:      ${testUser.id}`);
    console.log(`Google ID:    ${testUser.googleId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 You can now use this account for testing.');
    console.log('💡 Use the Account ID in your API requests.\n');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetDatabase()
  .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
