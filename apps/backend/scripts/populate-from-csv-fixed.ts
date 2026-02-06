/**
 * Populate database from CSV - Fixed version with proper UUIDs
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const ACCOUNT_ID = '456fb3ba-2c72-4525-b3df-78980d07d8db';

// Generate UUIDs once at the start
const ownerIds = {
  yitzhak: randomUUID(),
  ilana: randomUUID(),
  liat: randomUUID(),
  michal: randomUUID(),
  aviad: randomUUID(),
  yitzhakPartnership: randomUUID(),
  yitzhakIlana: randomUUID(),
};

const bankIds = {
  leumi: randomUUID(),
  merkantil: randomUUID(),
  discount: randomUUID(),
  mashkanta: randomUUID(),
  german: randomUUID(),
};

const propertyIds = Array.from({ length: 33 }, () => randomUUID());

async function cleanDatabase() {
  console.log('🧹 Cleaning database...\n');
  
  await prisma.mortgagePayment.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.lease.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.mortgage.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.propertyOwnership.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.propertyIncome.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.propertyExpense.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.propertyValuation.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.plotInfo.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.unit.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.property.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.tenant.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.owner.deleteMany({ where: { accountId: ACCOUNT_ID } });
  await prisma.bankAccount.deleteMany({ where: { accountId: ACCOUNT_ID } });
  
  console.log('✅ Database cleaned\n');
}

async function createOwners() {
  console.log('👤 Creating owners...\n');
  
  const owners = [
    { id: ownerIds.yitzhak, name: 'יצחק נטוביץ', type: 'INDIVIDUAL' },
    { id: ownerIds.ilana, name: 'אילנה נטוביץ', type: 'INDIVIDUAL' },
    { id: ownerIds.liat, name: 'ליאת', type: 'INDIVIDUAL' },
    { id: ownerIds.michal, name: 'מיכל', type: 'INDIVIDUAL' },
    { id: ownerIds.aviad, name: 'אביעד', type: 'INDIVIDUAL' },
    { id: ownerIds.yitzhakPartnership, name: 'י. נטוביץ ושות', type: 'PARTNERSHIP' },
    { id: ownerIds.yitzhakIlana, name: 'יצחק ואילנה', type: 'PARTNERSHIP' },
  ];
  
  for (const owner of owners) {
    await prisma.owner.create({
      data: {
        id: owner.id,
        accountId: ACCOUNT_ID,
        name: owner.name,
        type: owner.type as any,
      },
    });
    console.log(`  ✅ ${owner.name}`);
  }
}

async function createBankAccounts() {
  console.log('\n🏦 Creating bank accounts...\n');
  
  const banks = [
    { id: bankIds.leumi, name: 'בנק לאומי' },
    { id: bankIds.merkantil, name: 'בנק מרכנתיל' },
    { id: bankIds.discount, name: 'בנק דיסקונט' },
    { id: bankIds.mashkanta, name: 'בנק למשכנתאות' },
    { id: bankIds.german, name: 'בנק גרמני' },
  ];
  
  for (const bank of banks) {
    await prisma.bankAccount.create({
      data: {
        id: bank.id,
        accountId: ACCOUNT_ID,
        bankName: bank.name,
        accountNumber: `IMPORTED`,
        accountType: 'CHECKING',
        isActive: true,
      },
    });
    console.log(`  ✅ ${bank.name}`);
  }
}

async function createProperties() {
  console.log('\n🏠 Creating properties...\n');
  
  const properties = [
    {
      idx: 1,
      address: 'לביא 6, רמת גן',
      type: 'RESIDENTIAL',
      status: 'IN_CONSTRUCTION',
      city: 'רמת גן',
      totalArea: 60,
      estimatedValue: 800000,
      gush: '6158',
      helka: '371-376',
      isMortgaged: false,
      notes: 'בהליכי פינוי בינוי מתקדמים חברת קרסו. 50% יצחק, 50% אריאלה לאובר',
    },
    {
      idx: 2,
      address: 'דרך המלך 11, גני תקווה - קומה 2',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'גני תקווה',
      totalArea: 90,
      estimatedValue: 2700000,
      gush: '6717',
      helka: '225',
      isMortgaged: true,
      notes: 'משועבדת ביחד עם נכס 8 ו-11 לטובת הלוואה של 6 מליון - בנק לאומי',
    },
    {
      idx: 3,
      address: 'הרברט סמואל, חדרה - מגרש',
      type: 'LAND',
      status: 'OWNED',
      city: 'חדרה',
      estimatedValue: 1200000,
      gush: '1036',
      helka: '181+60',
      isMortgaged: false,
      notes: '1/6 ממגרש. שותפים: יבולים, שוקי שרון, זיו שמור',
    },
    {
      idx: 4,
      address: 'שאול חרנם 10, פתח תקווה - דירה 45',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      totalArea: 140,
      estimatedValue: 4000000,
      gush: '6393',
      helka: '314/45',
      isMortgaged: true,
      notes: 'דירת פנטהאוס 140 מ"ר + מרפסת 50 מ"ר. משועבדת 1,400,000 במרכנתיל',
    },
    {
      idx: 5,
      address: 'שאול חרנם 10, פתח תקווה - דירה 47',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      totalArea: 90,
      estimatedValue: 3000000,
      gush: '6393',
      helka: '314/47',
      isMortgaged: false,
      notes: 'דירת פנטהאוס 90 מ"ר + מרפסת 50 מ"ר',
    },
    {
      idx: 6,
      address: 'שאול חרנם 10, פתח תקווה - דירה 6',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      estimatedValue: 1000000,
      gush: '6393',
      helka: '314/6',
      isMortgaged: false,
      notes: '36% ליאת, 64% צביקה נטוביץ. שווי מלא: 3 מליון',
    },
    {
      idx: 7,
      address: 'הרואה 295, רמת גן',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'רמת גן',
      estimatedValue: 2700000,
      gush: '6144',
      helka: '409/2',
      isMortgaged: true,
      notes: 'דירה 4 חדרים, דירת קרקע. משועבדת 400,000 בלאומי',
    },
    {
      idx: 8,
      address: 'מנדלי 7, תל אביב',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'תל אביב',
      estimatedValue: 3000000,
      gush: '6905',
      helka: '39/17+39/16',
      isMortgaged: true,
      notes: '2 דירות בנות 1 חדר. משועבדות ללאומי (חלק מ-6 מליון)',
    },
    {
      idx: 10,
      address: 'מגדל ב.ס.ר 3 קומה 26, גבעתיים',
      type: 'COMMERCIAL',
      status: 'OWNED',
      city: 'גבעתיים',
      totalArea: 210,
      estimatedValue: 3000000,
      isMortgaged: true,
      notes: 'חצי משרד - 210 מ"ר. יחידה 103+105. משועבד 700,000 בבנק למשכנתאות',
    },
    {
      idx: 11,
      address: 'טבנקין 22, גבעתיים',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'גבעתיים',
      totalArea: 280,
      estimatedValue: 8000000,
      gush: '6156',
      helka: '559/21',
      isMortgaged: true,
      notes: 'דירת גג 2 קומות. משועבדת כחלק מהלוואת 6 מליון',
    },
    {
      idx: 12,
      address: 'הפלמח 50, ירושלים',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'ירושלים',
      estimatedValue: 700000,
      gush: '63732',
      helka: '330',
      isMortgaged: true,
      notes: '1/4 דירה. משועבדת 300,000 בבנק למשכנתאות',
    },
    {
      idx: 13,
      address: 'בר-כוכבא 34, רמת גן',
      type: 'RESIDENTIAL',
      status: 'SOLD',
      city: 'רמת גן',
      estimatedValue: 2800000,
      gush: '1650,1652',
      helka: '34',
      isMortgaged: false,
      notes: 'דירה חדשה 4 חדרים. נמכר ב-3,250,000',
    },
    {
      idx: 14,
      address: 'קרקע חקלאית, ראשון לציון',
      type: 'LAND',
      status: 'OWNED',
      city: 'ראשון לציון',
      landArea: 3000,
      estimatedValue: 2700000,
      gush: '3943',
      helka: '10',
      isMortgaged: false,
      notes: '3 דונם. ליוסי וצביקה יש חלקים נוספים',
    },
    {
      idx: 15,
      address: 'קרקע חקלאית, רחובות',
      type: 'LAND',
      status: 'OWNED',
      city: 'רחובות',
      landArea: 10000,
      estimatedValue: 5000000,
      gush: '3689',
      helka: '24',
      isMortgaged: false,
      notes: '10 דונם',
    },
    {
      idx: 16,
      address: 'קרקע לבניה, חדרה',
      type: 'LAND',
      status: 'IN_CONSTRUCTION',
      city: 'חדרה',
      estimatedValue: 2800000,
      gush: '10026',
      helka: '46',
      isMortgaged: false,
      notes: 'יחד עם עוזיאל ויבולים. קרקע ל-7 יח"ד',
    },
    {
      idx: 17,
      address: 'בניין לייפציג, גרמניה',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      country: 'Germany',
      city: 'לייפציג',
      estimatedValue: 1800000,
      isMortgaged: true,
      notes: '4 דירות בחברת איילי. הלוואה 100,000 אירו (350,000 ₪)',
    },
    {
      idx: 18,
      address: 'דימפל, לייפציג - השקעה',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      country: 'Germany',
      city: 'לייפציג',
      estimatedValue: 600000,
      isMortgaged: false,
      notes: 'השקעה באפ-הולדינג. 33% מהרווחים. 1/8 נכס',
    },
    {
      idx: 19,
      address: 'לימבורגר, לייפציג - השקעה',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      country: 'Germany',
      city: 'לייפציג',
      estimatedValue: 600000,
      isMortgaged: false,
      notes: 'השקעה באפ-הולדינג',
    },
    {
      idx: 20,
      address: 'גלפי - השקעה',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      country: 'Germany',
      estimatedValue: 1500000,
      isMortgaged: false,
      notes: 'השקעה באפ-הולדינג. 1.5M ל-36 חודשים, ריבית 7%. 38% מהרווחים',
    },
    {
      idx: 21,
      address: 'מוצקין 22, רעננה',
      type: 'LAND',
      status: 'IN_CONSTRUCTION',
      city: 'רעננה',
      estimatedValue: 5000000,
      gush: '6580',
      helka: '329',
      isMortgaged: true,
      notes: '20% מהחלקה. שותפים: הנדלר, וייס, צביקה. 2 דירות',
    },
    {
      idx: 22,
      address: 'שלום עליכם 6, רמת גן',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'רמת גן',
      estimatedValue: 1800000,
      gush: '6142',
      helka: '228/6',
      isMortgaged: true,
      notes: 'דירת 3.5 חדרים. משכנתא 300,000',
    },
    {
      idx: 23,
      address: 'פטרסון 3, יד אליהו',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'תל אביב',
      estimatedValue: 1500000,
      isMortgaged: true,
      notes: 'דירת 2 חדרים. משכנתא 174,000 מדיסקונט',
    },
    {
      idx: 24,
      address: 'הפלמח 9, פתח תקווה',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      estimatedValue: 3000000,
      isMortgaged: true,
      notes: '50% משתי דירות. שותף: משה בורשטיין. משכנתא 750,000',
    },
    {
      idx: 25,
      address: 'אלנבי 85 - מחסן',
      type: 'COMMERCIAL',
      status: 'OWNED',
      totalArea: 7,
      estimatedValue: 300000,
      gush: '6937',
      helka: '14',
      isMortgaged: false,
      notes: 'מחסן 7 מטר, תת חלקה 3',
    },
    {
      idx: 26,
      address: 'אלנבי 85 - דירה',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      totalArea: 85,
      estimatedValue: 2600000,
      gush: '6937',
      helka: '14',
      isMortgaged: false,
      notes: '2/3 מדירה. 85 מטר. תמא 38. חלק אביעד: 27.40%',
    },
    {
      idx: 27,
      address: 'מורדות הכרמל',
      type: 'LAND',
      status: 'OWNED',
      city: 'חיפה',
      estimatedValue: 800000,
      gush: '10879',
      helka: '63',
      isMortgaged: false,
      notes: 'חלק מהקרקע',
    },
    {
      idx: 28,
      address: 'מניות - נטו דיור בע"מ',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      estimatedValue: 147200,
      isMortgaged: false,
      notes: 'תיק 6459. 7.32% מהחברה',
    },
    {
      idx: 29,
      address: 'שאול חרנם 6',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      estimatedValue: 7000000,
      isMortgaged: true,
      notes: 'משכנתא 2 מליון - מרכנתיל',
    },
    {
      idx: 30,
      address: 'הרצל 57',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      estimatedValue: 1000000,
      isMortgaged: false,
      notes: '50% מדירת 3 חדרים',
    },
    {
      idx: 31,
      address: 'גבעת שמואל - מגרשים 51+56 (י. נטוביץ ושות)',
      type: 'LAND',
      status: 'OWNED',
      city: 'גבעת שמואל',
      estimatedValue: 1408000,
      gush: 'N/A',
      helka: '51+56',
      isMortgaged: true,
      notes: '1.128% בעלות. משכנתא: 869,660. החזר: 10,714.67',
    },
    {
      idx: 32,
      address: 'גבעת שמואל - מגרשים 51+56 (ליאת)',
      type: 'LAND',
      status: 'OWNED',
      city: 'גבעת שמואל',
      estimatedValue: 3825800,
      gush: 'N/A',
      helka: '51+56',
      isMortgaged: true,
      notes: '3.478% בעלות. משכנתא: 1,355,787. החזר: 7,408.67',
    },
  ];
  
  for (const prop of properties) {
    await prisma.property.create({
      data: {
        id: propertyIds[prop.idx],
        accountId: ACCOUNT_ID,
        address: prop.address,
        type: prop.type as any,
        status: prop.status as any,
        country: prop.country || 'Israel',
        city: prop.city,
        totalArea: prop.totalArea,
        landArea: prop.landArea,
        estimatedValue: prop.estimatedValue,
        gush: prop.gush,
        helka: prop.helka,
        isMortgaged: prop.isMortgaged,
        notes: prop.notes,
      },
    });
    console.log(`  ✅ [${prop.idx}] ${prop.address.substring(0, 45)}`);
  }
}

async function createOwnerships() {
  console.log('\n🤝 Creating ownerships...\n');
  
  const ownerships = [
    { propIdx: 1, ownerId: ownerIds.yitzhak, percentage: 50, type: 'PARTIAL' },
    { propIdx: 2, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 3, ownerId: ownerIds.yitzhak, percentage: 16.67, type: 'PARTNERSHIP' },
    { propIdx: 4, ownerId: ownerIds.yitzhakIlana, percentage: 100, type: 'PARTNERSHIP' },
    { propIdx: 5, ownerId: ownerIds.liat, percentage: 100, type: 'FULL' },
    { propIdx: 6, ownerId: ownerIds.liat, percentage: 36, type: 'PARTIAL' },
    { propIdx: 7, ownerId: ownerIds.ilana, percentage: 100, type: 'FULL' },
    { propIdx: 8, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 10, ownerId: ownerIds.yitzhakPartnership, percentage: 50, type: 'PARTNERSHIP' },
    { propIdx: 11, ownerId: ownerIds.yitzhakIlana, percentage: 100, type: 'PARTNERSHIP' },
    { propIdx: 12, ownerId: ownerIds.yitzhak, percentage: 25, type: 'PARTIAL' },
    { propIdx: 13, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 14, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 15, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 16, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 17, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 18, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 19, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 20, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 21, ownerId: ownerIds.ilana, percentage: 20, type: 'PARTNERSHIP' },
    { propIdx: 22, ownerId: ownerIds.liat, percentage: 100, type: 'FULL' },
    { propIdx: 23, ownerId: ownerIds.michal, percentage: 100, type: 'FULL' },
    { propIdx: 24, ownerId: ownerIds.aviad, percentage: 100, type: 'FULL' },
    { propIdx: 25, ownerId: ownerIds.aviad, percentage: 100, type: 'FULL' },
    { propIdx: 26, ownerId: ownerIds.aviad, percentage: 67, type: 'PARTIAL' },
    { propIdx: 27, ownerId: ownerIds.liat, percentage: 100, type: 'FULL' },
    { propIdx: 28, ownerId: ownerIds.yitzhak, percentage: 100, type: 'FULL' },
    { propIdx: 29, ownerId: ownerIds.aviad, percentage: 100, type: 'FULL' },
    { propIdx: 30, ownerId: ownerIds.ilana, percentage: 50, type: 'PARTIAL' },
    { propIdx: 31, ownerId: ownerIds.yitzhakPartnership, percentage: 1.128, type: 'PARTNERSHIP' },
    { propIdx: 32, ownerId: ownerIds.liat, percentage: 3.478, type: 'PARTIAL' },
  ];
  
  for (const ownership of ownerships) {
    await prisma.propertyOwnership.create({
      data: {
        accountId: ACCOUNT_ID,
        propertyId: propertyIds[ownership.propIdx],
        ownerId: ownership.ownerId,
        ownershipPercentage: ownership.percentage,
        ownershipType: ownership.type as any,
        startDate: new Date('2021-12-14'),
      },
    });
  }
  
  console.log(`  ✅ Created ${ownerships.length} ownerships`);
}

async function createMortgages() {
  console.log('\n💰 Creating mortgages...\n');
  
  const mortgages = [
    // The 6M Leumi loan across 3 properties (2, 8, 11)
    {
      propIdx: 2,
      bank: 'בנק לאומי',
      loanAmount: 2000000,
      interestRate: 3.5,
      monthlyPayment: 19000,
      bankAccountId: bankIds.leumi,
      linkedPropIndexes: [2, 8, 11],
      notes: 'חלק מהלוואה של 6 מליון (החזר כולל: 57,000 ₪)',
    },
    {
      propIdx: 4,
      bank: 'בנק מרכנתיל',
      loanAmount: 1400000,
      monthlyPayment: 8000,
      bankAccountId: bankIds.merkantil,
      linkedPropIndexes: [4],
    },
    {
      propIdx: 7,
      bank: 'בנק לאומי',
      loanAmount: 400000,
      monthlyPayment: 3000,
      bankAccountId: bankIds.leumi,
      linkedPropIndexes: [7],
    },
    {
      propIdx: 8,
      bank: 'בנק לאומי',
      loanAmount: 2000000,
      interestRate: 3.5,
      monthlyPayment: 19000,
      bankAccountId: bankIds.leumi,
      linkedPropIndexes: [2, 8, 11],
      notes: 'חלק מהלוואה של 6 מליון',
    },
    {
      propIdx: 10,
      bank: 'בנק למשכנתאות',
      loanAmount: 700000,
      monthlyPayment: 5000,
      bankAccountId: bankIds.mashkanta,
      linkedPropIndexes: [10],
    },
    {
      propIdx: 11,
      bank: 'בנק לאומי',
      loanAmount: 2000000,
      interestRate: 3.5,
      monthlyPayment: 19000,
      bankAccountId: bankIds.leumi,
      linkedPropIndexes: [2, 8, 11],
      notes: 'חלק מהלוואה של 6 מליון',
    },
    {
      propIdx: 12,
      bank: 'בנק למשכנתאות',
      loanAmount: 300000,
      monthlyPayment: 2500,
      bankAccountId: bankIds.mashkanta,
      linkedPropIndexes: [12],
    },
    {
      propIdx: 17,
      bank: 'בנק גרמני',
      loanAmount: 350000,
      bankAccountId: bankIds.german,
      linkedPropIndexes: [17],
      notes: 'הלוואה של 100,000 אירו',
    },
    {
      propIdx: 21,
      bank: 'בנק לאומי',
      loanAmount: 1500000,
      bankAccountId: bankIds.leumi,
      linkedPropIndexes: [21],
      notes: 'צריך 800,000 למיסים',
    },
    {
      propIdx: 22,
      bank: 'בנק',
      loanAmount: 300000,
      monthlyPayment: 2500,
      linkedPropIndexes: [22],
    },
    {
      propIdx: 23,
      bank: 'בנק דיסקונט',
      loanAmount: 174000,
      monthlyPayment: 1500,
      bankAccountId: bankIds.discount,
      linkedPropIndexes: [23],
    },
    {
      propIdx: 24,
      bank: 'בנק',
      loanAmount: 750000,
      monthlyPayment: 5000,
      linkedPropIndexes: [24],
    },
    {
      propIdx: 29,
      bank: 'בנק מרכנתיל',
      loanAmount: 2000000,
      monthlyPayment: 15000,
      bankAccountId: bankIds.merkantil,
      linkedPropIndexes: [29],
      notes: 'משכנתא 2 מליון',
    },
    {
      propIdx: 31,
      bank: 'בנק',
      loanAmount: 869660,
      monthlyPayment: 10714.67,
      linkedPropIndexes: [31],
      notes: 'החזר: 10,714.67',
    },
    {
      propIdx: 32,
      bank: 'בנק',
      loanAmount: 1355787,
      monthlyPayment: 7408.67,
      linkedPropIndexes: [32],
      notes: 'החזר: 7,408.67',
    },
  ];
  
  for (const mortgage of mortgages) {
    const linkedProperties = mortgage.linkedPropIndexes.map(idx => propertyIds[idx]);
    
    await prisma.mortgage.create({
      data: {
        accountId: ACCOUNT_ID,
        propertyId: propertyIds[mortgage.propIdx],
        bank: mortgage.bank,
        loanAmount: mortgage.loanAmount,
        interestRate: mortgage.interestRate,
        monthlyPayment: mortgage.monthlyPayment,
        bankAccountId: mortgage.bankAccountId,
        startDate: new Date('2021-01-01'),
        status: 'ACTIVE',
        linkedProperties: linkedProperties,
        notes: mortgage.notes,
      },
    });
    console.log(`  ✅ [${mortgage.propIdx}] ${mortgage.bank} - ₪${mortgage.loanAmount.toLocaleString()}`);
  }
}

async function createPlotInfo() {
  console.log('\n📋 Creating plot info...\n');
  
  const plots = [
    { idx: 1, gush: '6158', chelka: '371-376' },
    { idx: 2, gush: '6717', chelka: '225' },
    { idx: 3, gush: '1036', chelka: '181+60' },
    { idx: 4, gush: '6393', chelka: '314/45' },
    { idx: 5, gush: '6393', chelka: '314/47' },
    { idx: 6, gush: '6393', chelka: '314/6' },
    { idx: 7, gush: '6144', chelka: '409/2' },
    { idx: 8, gush: '6905', chelka: '39/17+39/16' },
    { idx: 11, gush: '6156', chelka: '559/21' },
    { idx: 12, gush: '63732', chelka: '330' },
    { idx: 13, gush: '1650,1652', chelka: '34' },
    { idx: 14, gush: '3943', chelka: '10' },
    { idx: 15, gush: '3689', chelka: '24' },
    { idx: 16, gush: '10026', chelka: '46' },
    { idx: 21, gush: '6580', chelka: '329' },
    { idx: 22, gush: '6142', chelka: '228/6' },
    { idx: 25, gush: '6937', chelka: '14' },
    { idx: 26, gush: '6937', chelka: '14' },
    { idx: 27, gush: '10879', chelka: '63' },
  ];
  
  for (const plot of plots) {
    await prisma.plotInfo.create({
      data: {
        accountId: ACCOUNT_ID,
        propertyId: propertyIds[plot.idx],
        gush: plot.gush,
        chelka: plot.chelka,
      },
    });
  }
  
  console.log(`  ✅ Created ${plots.length} plot info records`);
}

async function showStatistics() {
  console.log('\n\n📊 Final Statistics:\n');
  
  const propertiesCount = await prisma.property.count({ where: { accountId: ACCOUNT_ID } });
  const ownersCount = await prisma.owner.count({ where: { accountId: ACCOUNT_ID } });
  const ownershipsCount = await prisma.propertyOwnership.count({ where: { accountId: ACCOUNT_ID } });
  const mortgagesCount = await prisma.mortgage.count({ where: { accountId: ACCOUNT_ID } });
  const plotInfoCount = await prisma.plotInfo.count({ where: { accountId: ACCOUNT_ID } });
  const bankAccountsCount = await prisma.bankAccount.count({ where: { accountId: ACCOUNT_ID } });
  
  console.log(`  Properties:       ${propertiesCount}`);
  console.log(`  Owners:           ${ownersCount}`);
  console.log(`  Ownerships:       ${ownershipsCount}`);
  console.log(`  Mortgages:        ${mortgagesCount}`);
  console.log(`  Plot Info:        ${plotInfoCount}`);
  console.log(`  Bank Accounts:    ${bankAccountsCount}`);
  
  const totalValue = await prisma.property.aggregate({
    where: { accountId: ACCOUNT_ID },
    _sum: { estimatedValue: true },
  });
  
  const totalDebt = await prisma.mortgage.aggregate({
    where: { accountId: ACCOUNT_ID },
    _sum: { loanAmount: true },
  });
  
  console.log(`\n💰 Financial Summary:\n`);
  console.log(`  Total Value: ₪${(Number(totalValue._sum.estimatedValue) || 0).toLocaleString()}`);
  console.log(`  Total Debt:  ₪${(Number(totalDebt._sum.loanAmount) || 0).toLocaleString()}`);
  console.log(`  Net Equity:  ₪${((Number(totalValue._sum.estimatedValue) || 0) - (Number(totalDebt._sum.loanAmount) || 0)).toLocaleString()}`);
  
  // By owner
  const byOwner = await prisma.owner.findMany({
    where: { accountId: ACCOUNT_ID },
    include: {
      ownerships: {
        include: {
          property: true,
        },
      },
    },
  });
  
  console.log(`\n👥 Properties by Owner:\n`);
  for (const owner of byOwner) {
    const totalValue = owner.ownerships.reduce((sum, o) => {
      return sum + (Number(o.property.estimatedValue) || 0) * (Number(o.ownershipPercentage) / 100);
    }, 0);
    
    console.log(`  ${owner.name.padEnd(25)} ${owner.ownerships.length} props  ₪${Math.round(totalValue).toLocaleString()}`);
  }
}

async function main() {
  try {
    console.log('🚀 Database Population with Proper UUIDs\n');
    console.log(`Account ID: ${ACCOUNT_ID}\n`);
    
    await cleanDatabase();
    await createOwners();
    await createBankAccounts();
    await createProperties();
    await createOwnerships();
    await createMortgages();
    await createPlotInfo();
    await showStatistics();
    
    console.log('\n\n🎉 Complete! Refresh browser to see data.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
