import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCOUNT_TO_DELETE = 'test-account-1';

async function main() {
  console.log('🗑️  Deleting Account 2 and all its data...\n');
  
  try {
    // Delete in correct order to respect foreign key constraints
    
    console.log('Deleting mortgage payments...');
    const mortgagePayments = await prisma.mortgagePayment.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${mortgagePayments.count} mortgage payments\n`);
    
    console.log('Deleting leases...');
    const leases = await prisma.lease.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${leases.count} leases\n`);
    
    console.log('Deleting mortgages...');
    const mortgages = await prisma.mortgage.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${mortgages.count} mortgages\n`);
    
    console.log('Deleting property ownerships...');
    const ownerships = await prisma.propertyOwnership.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${ownerships.count} ownerships\n`);
    
    console.log('Deleting plot infos...');
    const plotInfos = await prisma.plotInfo.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${plotInfos.count} plot infos\n`);
    
    console.log('Deleting units...');
    const units = await prisma.unit.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${units.count} units\n`);
    
    console.log('Deleting properties...');
    const properties = await prisma.property.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${properties.count} properties\n`);
    
    console.log('Deleting tenants...');
    const tenants = await prisma.tenant.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${tenants.count} tenants\n`);
    
    console.log('Deleting owners...');
    const owners = await prisma.owner.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${owners.count} owners\n`);
    
    console.log('Deleting bank accounts...');
    const bankAccounts = await prisma.bankAccount.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${bankAccounts.count} bank accounts\n`);
    
    console.log('Deleting notifications...');
    const notifications = await prisma.notification.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${notifications.count} notifications\n`);
    
    console.log('Deleting investment companies...');
    const companies = await prisma.investmentCompany.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${companies.count} investment companies\n`);
    
    console.log('Deleting users...');
    const users = await prisma.user.deleteMany({
      where: { accountId: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted ${users.count} users\n`);
    
    console.log('Deleting the account itself...');
    const account = await prisma.account.delete({
      where: { id: ACCOUNT_TO_DELETE }
    });
    console.log(`✅ Deleted account: ${account.name}\n`);
    
    console.log('🎉 Successfully deleted Account 2 and all its data!');
    console.log('\n📊 Summary:');
    console.log(`  - Mortgage Payments: ${mortgagePayments.count}`);
    console.log(`  - Leases: ${leases.count}`);
    console.log(`  - Mortgages: ${mortgages.count}`);
    console.log(`  - Ownerships: ${ownerships.count}`);
    console.log(`  - Plot Infos: ${plotInfos.count}`);
    console.log(`  - Units: ${units.count}`);
    console.log(`  - Properties: ${properties.count}`);
    console.log(`  - Tenants: ${tenants.count}`);
    console.log(`  - Owners: ${owners.count}`);
    console.log(`  - Bank Accounts: ${bankAccounts.count}`);
    console.log(`  - Notifications: ${notifications.count}`);
    console.log(`  - Investment Companies: ${companies.count}`);
    console.log(`  - Users: ${users.count}`);
    
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
