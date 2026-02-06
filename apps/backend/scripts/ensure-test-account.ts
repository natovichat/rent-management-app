/**
 * Script to ensure test account exists in database
 * Run with: npx ts-node apps/backend/scripts/ensure-test-account.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🔍 Checking for test account...');

  // Check if account exists
  const existingAccount = await prisma.account.findUnique({
    where: { id: TEST_ACCOUNT_ID },
  });

  if (existingAccount) {
    console.log('✅ Test account already exists:', existingAccount.name);
    console.log('   ID:', existingAccount.id);
    console.log('   Status:', existingAccount.status);
  } else {
    console.log('📝 Creating test account...');
    
    const account = await prisma.account.create({
      data: {
        id: TEST_ACCOUNT_ID,
        name: 'Test Account',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Test account created:', account.name);
    console.log('   ID:', account.id);
    console.log('   Status:', account.status);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
