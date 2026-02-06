import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test account
  const account = await prisma.account.upsert({
    where: { id: 'test-account-1' },
    update: {},
    create: {
      id: 'test-account-1',
      name: 'Test Account',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created account:', account.name);

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      googleId: 'test-google-id',
      role: 'OWNER',
      accountId: account.id,
    },
  });
  console.log('✅ Created user:', user.email);

  // Create test properties with Phase 4 fields
  const property1 = await prisma.property.upsert({
    where: { id: 'property-1' },
    update: {},
    create: {
      id: 'property-1',
      accountId: account.id,
      address: 'רחוב הרצל 10, תל אביב',
      fileNumber: 'PROP-001',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      country: 'Israel',
      city: 'תל אביב',
      totalArea: 120.5,
      landArea: 150.0,
      estimatedValue: 2500000,
    },
  });
  console.log('✅ Created property 1:', property1.address);

  const property2 = await prisma.property.upsert({
    where: { id: 'property-2' },
    update: {},
    create: {
      id: 'property-2',
      accountId: account.id,
      address: 'רחוב רוטשילד 45, תל אביב',
      fileNumber: 'PROP-002',
      type: 'COMMERCIAL',
      status: 'OWNED',
      country: 'Israel',
      city: 'תל אביב',
      totalArea: 200.0,
      estimatedValue: 4500000,
    },
  });
  console.log('✅ Created property 2:', property2.address);

  // Create test owners
  const owner1 = await prisma.owner.upsert({
    where: { id: 'owner-1' },
    update: {},
    create: {
      id: 'owner-1',
      accountId: account.id,
      name: 'יוסי כהן',
      type: 'INDIVIDUAL',
      email: 'yossi@example.com',
      phone: '050-1234567',
      idNumber: '123456789',
    },
  });
  console.log('✅ Created owner 1:', owner1.name);

  const owner2 = await prisma.owner.upsert({
    where: { id: 'owner-2' },
    update: {},
    create: {
      id: 'owner-2',
      accountId: account.id,
      name: 'שרה לוי',
      type: 'INDIVIDUAL',
      email: 'sara@example.com',
      phone: '052-7654321',
    },
  });
  console.log('✅ Created owner 2:', owner2.name);

  // Create ownerships (50% each = 100%)
  const ownership1 = await prisma.propertyOwnership.upsert({
    where: { id: 'ownership-1' },
    update: {},
    create: {
      id: 'ownership-1',
      propertyId: property1.id,
      ownerId: owner1.id,
      accountId: account.id,
      ownershipPercentage: 50.0,
      ownershipType: 'FULL',
      startDate: new Date('2020-01-01'),
    },
  });
  console.log('✅ Created ownership 1: 50%');

  const ownership2 = await prisma.propertyOwnership.upsert({
    where: { id: 'ownership-2' },
    update: {},
    create: {
      id: 'ownership-2',
      propertyId: property1.id,
      ownerId: owner2.id,
      accountId: account.id,
      ownershipPercentage: 50.0,
      ownershipType: 'FULL',
      startDate: new Date('2020-01-01'),
    },
  });
  console.log('✅ Created ownership 2: 50%');

  // Create mortgage
  const mortgage = await prisma.mortgage.upsert({
    where: { id: 'mortgage-1' },
    update: {},
    create: {
      id: 'mortgage-1',
      propertyId: property1.id,
      accountId: account.id,
      bank: 'בנק הפועלים',
      loanAmount: 1500000,
      interestRate: 3.5,
      monthlyPayment: 6500,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2040-01-01'),
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created mortgage:', mortgage.bank);

  // Create mortgage payments
  await prisma.mortgagePayment.createMany({
    data: [
      {
        mortgageId: mortgage.id,
        accountId: account.id,
        paymentDate: new Date('2024-01-01'),
        amount: 6500,
        principal: 2500,
        interest: 4000,
      },
      {
        mortgageId: mortgage.id,
        accountId: account.id,
        paymentDate: new Date('2024-02-01'),
        amount: 6500,
        principal: 2550,
        interest: 3950,
      },
      {
        mortgageId: mortgage.id,
        accountId: account.id,
        paymentDate: new Date('2024-03-01'),
        amount: 6500,
        principal: 2600,
        interest: 3900,
      },
    ],
  });
  console.log('✅ Created 3 mortgage payments');

  // Create valuations
  await prisma.propertyValuation.createMany({
    data: [
      {
        propertyId: property1.id,
        accountId: account.id,
        valuationDate: new Date('2020-01-01'),
        estimatedValue: 2000000,
        valuationType: 'APPRAISAL',
        notes: 'הערכה ראשונית',
      },
      {
        propertyId: property1.id,
        accountId: account.id,
        valuationDate: new Date('2022-01-01'),
        estimatedValue: 2300000,
        valuationType: 'MARKET',
        notes: 'הערכת שוק',
      },
      {
        propertyId: property1.id,
        accountId: account.id,
        valuationDate: new Date('2024-01-01'),
        estimatedValue: 2500000,
        valuationType: 'MARKET',
        notes: 'הערכה עדכנית',
      },
    ],
  });
  console.log('✅ Created 3 valuations');

  // Create expenses
  await prisma.propertyExpense.createMany({
    data: [
      {
        propertyId: property1.id,
        accountId: account.id,
        expenseDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'MAINTENANCE',
        category: 'תיקונים',
        description: 'תיקון צנרת',
      },
      {
        propertyId: property1.id,
        accountId: account.id,
        expenseDate: new Date('2024-02-10'),
        amount: 3000,
        type: 'TAX',
        category: 'מסים',
        description: 'ארנונה',
      },
      {
        propertyId: property1.id,
        accountId: account.id,
        expenseDate: new Date('2024-03-05'),
        amount: 1500,
        type: 'INSURANCE',
        category: 'ביטוח',
        description: 'ביטוח דירה',
      },
    ],
  });
  console.log('✅ Created 3 expenses');

  // Create income
  await prisma.propertyIncome.createMany({
    data: [
      {
        propertyId: property1.id,
        accountId: account.id,
        incomeDate: new Date('2024-01-01'),
        amount: 8000,
        type: 'RENT',
        description: 'שכר דירה חודשי',
      },
      {
        propertyId: property1.id,
        accountId: account.id,
        incomeDate: new Date('2024-02-01'),
        amount: 8000,
        type: 'RENT',
        description: 'שכר דירה חודשי',
      },
      {
        propertyId: property1.id,
        accountId: account.id,
        incomeDate: new Date('2024-03-01'),
        amount: 8000,
        type: 'RENT',
        description: 'שכר דירה חודשי',
      },
    ],
  });
  console.log('✅ Created 3 income records');

  // Create plot info for Israeli property
  const plotInfo = await prisma.plotInfo.upsert({
    where: { propertyId: property1.id },
    update: {},
    create: {
      propertyId: property1.id,
      accountId: account.id,
      gush: '6543',
      chelka: '123',
      subChelka: 'א',
      registryOffice: 'תל אביב',
    },
  });
  console.log('✅ Created plot info:', `גוש ${plotInfo.gush} חלקה ${plotInfo.chelka}`);

  // Create units
  const unit1 = await prisma.unit.upsert({
    where: { id: 'unit-1' },
    update: {},
    create: {
      id: 'unit-1',
      propertyId: property1.id,
      accountId: account.id,
      apartmentNumber: 'דירה 1',
      floor: 2,
      roomCount: 3,
    },
  });
  console.log('✅ Created unit 1:', unit1.apartmentNumber);

  const unit2 = await prisma.unit.upsert({
    where: { id: 'unit-2' },
    update: {},
    create: {
      id: 'unit-2',
      propertyId: property1.id,
      accountId: account.id,
      apartmentNumber: 'דירה 2',
      floor: 3,
      roomCount: 4,
    },
  });
  console.log('✅ Created unit 2:', unit2.apartmentNumber);

  // Create tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { id: 'tenant-1' },
    update: {},
    create: {
      id: 'tenant-1',
      accountId: account.id,
      name: 'דוד מזרחי',
      email: 'david@example.com',
      phone: '054-1111111',
    },
  });
  console.log('✅ Created tenant 1:', tenant1.name);

  const tenant2 = await prisma.tenant.upsert({
    where: { id: 'tenant-2' },
    update: {},
    create: {
      id: 'tenant-2',
      accountId: account.id,
      name: 'רחל אברהם',
      email: 'rachel@example.com',
      phone: '053-2222222',
    },
  });
  console.log('✅ Created tenant 2:', tenant2.name);

  // Create leases
  await prisma.lease.createMany({
    data: [
      {
        unitId: unit1.id,
        tenantId: tenant1.id,
        accountId: account.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        monthlyRent: 4000,
        paymentTo: 'יוסי כהן',
        status: 'ACTIVE',
      },
      {
        unitId: unit2.id,
        tenantId: tenant2.id,
        accountId: account.id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-02-01'),
        monthlyRent: 5000,
        paymentTo: 'שרה לוי',
        status: 'ACTIVE',
      },
    ],
  });
  console.log('✅ Created 2 leases');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 1 Account');
  console.log('- 1 User');
  console.log('- 2 Properties (with Phase 4 fields)');
  console.log('- 2 Owners');
  console.log('- 2 Ownerships (50% + 50% = 100%)');
  console.log('- 1 Mortgage with 3 payments');
  console.log('- 3 Valuations');
  console.log('- 3 Expenses');
  console.log('- 3 Income records');
  console.log('- 1 Plot Info (Gush/Chelka)');
  console.log('- 2 Units');
  console.log('- 2 Tenants');
  console.log('- 2 Leases');
  console.log('\n🔑 Test credentials:');
  console.log('Email: test@example.com');
  console.log('Account ID: test-account-1');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
