#!/usr/bin/env ts-node

/**
 * Clear All Data Script
 * Deletes all entities except users, in the correct order to respect FK constraints.
 *
 * Usage:
 *   cd apps/backend && npx ts-node prisma/seeds/clear-all-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAll() {
  console.log('🗑️  Starting data cleanup (preserving users)...\n');

  // 1. PropertyEvent - must go first (references RentalAgreement, BankAccount, Property)
  const deletedEvents = await prisma.propertyEvent.deleteMany({});
  console.log(`✅ PropertyEvent: deleted ${deletedEvents.count}`);

  // 2. RentalAgreement (references Property, Person)
  const deletedRentals = await prisma.rentalAgreement.deleteMany({});
  console.log(`✅ RentalAgreement: deleted ${deletedRentals.count}`);

  // 3. Ownership (references Property, Person)
  const deletedOwnerships = await prisma.ownership.deleteMany({});
  console.log(`✅ Ownership: deleted ${deletedOwnerships.count}`);

  // 4. Mortgage (references Property, BankAccount, Person)
  const deletedMortgages = await prisma.mortgage.deleteMany({});
  console.log(`✅ Mortgage: deleted ${deletedMortgages.count}`);

  // 5. PlanningProcessState (cascade from Property, but explicit)
  const deletedPlanning = await prisma.planningProcessState.deleteMany({});
  console.log(`✅ PlanningProcessState: deleted ${deletedPlanning.count}`);

  // 6. UtilityInfo (cascade from Property, but explicit)
  const deletedUtility = await prisma.utilityInfo.deleteMany({});
  console.log(`✅ UtilityInfo: deleted ${deletedUtility.count}`);

  // 7. Property
  const deletedProperties = await prisma.property.deleteMany({});
  console.log(`✅ Property: deleted ${deletedProperties.count}`);

  // 8. BankAccount
  const deletedBankAccounts = await prisma.bankAccount.deleteMany({});
  console.log(`✅ BankAccount: deleted ${deletedBankAccounts.count}`);

  // 9. Person
  const deletedPersons = await prisma.person.deleteMany({});
  console.log(`✅ Person: deleted ${deletedPersons.count}`);

  console.log('\n🎉 All data cleared successfully (users preserved)!');
}

clearAll()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
