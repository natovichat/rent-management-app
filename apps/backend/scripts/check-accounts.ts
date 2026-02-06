import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all accounts
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  console.log('📊 Accounts in database:\n');
  
  for (const account of accounts) {
    const propertiesCount = await prisma.property.count({
      where: { accountId: account.id }
    });
    
    const ownersCount = await prisma.owner.count({
      where: { accountId: account.id }
    });
    
    const mortgagesCount = await prisma.mortgage.count({
      where: { accountId: account.id }
    });
    
    const users = await prisma.user.findMany({
      where: { accountId: account.id },
      select: { email: true }
    });
    
    console.log(`Account ID: ${account.id}`);
    console.log(`  Name: ${account.name}`);
    console.log(`  Status: ${account.status}`);
    console.log(`  Users: ${users.map(u => u.email).join(', ') || 'None'}`);
    console.log(`  Properties: ${propertiesCount}`);
    console.log(`  Owners: ${ownersCount}`);
    console.log(`  Mortgages: ${mortgagesCount}`);
    console.log('');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
