const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      name: true,
      status: true,
    }
  });
  
  console.log('=== Accounts in database ===');
  accounts.forEach(acc => {
    console.log(`ID: ${acc.id}`);
    console.log(`Name: ${acc.name}`);
    console.log(`Status: ${acc.status}`);
    console.log('---');
  });
  console.log(`Total: ${accounts.length} accounts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
