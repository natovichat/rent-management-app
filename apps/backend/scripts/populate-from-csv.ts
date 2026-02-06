/**
 * Populate database from CSV - Manual SQL execution
 * 
 * This script executes hand-crafted SQL to populate the database
 * from the unstructured CSV file.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCOUNT_ID = '456fb3ba-2c72-4525-b3df-78980d07d8db';

async function cleanDatabase() {
  console.log('🧹 Cleaning database...\n');
  
  // Delete in correct order (respecting foreign keys)
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
    { id: 'owner-yitzhak', name: 'יצחק נטוביץ', type: 'INDIVIDUAL' },
    { id: 'owner-ilana', name: 'אילנה נטוביץ', type: 'INDIVIDUAL' },
    { id: 'owner-liat', name: 'ליאת', type: 'INDIVIDUAL' },
    { id: 'owner-michal', name: 'מיכל', type: 'INDIVIDUAL' },
    { id: 'owner-aviad', name: 'אביעד', type: 'INDIVIDUAL' },
    { id: 'owner-yitzhak-partnership', name: 'י. נטוביץ ושות', type: 'PARTNERSHIP' },
    { id: 'owner-yitzhak-ilana', name: 'יצחק ואילנה', type: 'PARTNERSHIP' },
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
    { id: 'bank-leumi', name: 'בנק לאומי' },
    { id: 'bank-merkantil', name: 'בנק מרכנתיל' },
    { id: 'bank-discount', name: 'בנק דיסקונט' },
    { id: 'bank-mashkanta', name: 'בנק למשכנתאות' },
    { id: 'bank-german', name: 'בנק גרמני' },
  ];
  
  for (const bank of banks) {
    await prisma.bankAccount.create({
      data: {
        id: bank.id,
        accountId: ACCOUNT_ID,
        bankName: bank.name,
        accountNumber: `IMPORTED-${bank.id.toUpperCase()}`,
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
      id: 'prop-01',
      address: 'לביא 6, רמת גן',
      type: 'RESIDENTIAL',
      status: 'IN_CONSTRUCTION',
      city: 'רמת גן',
      totalArea: 60,
      estimatedValue: 800000,
      gush: '6158',
      helka: '371-376',
      isMortgaged: false,
      notes: 'בהליכי פינוי בינוי מתקדמים חברת קרסו. דירה 60 מטר שתוגדל ל-100 מטר. 50% בעלות יצחק, 50% אריאלה לאובר',
    },
    {
      id: 'prop-02',
      address: 'דרך המלך 11, גני תקווה - קומה 2',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'גני תקווה',
      totalArea: 90,
      estimatedValue: 2700000,
      gush: '6717',
      helka: '225',
      isMortgaged: true,
      notes: 'דירה חדשה 90 מ"ר, תת חלקה 15. משועבדת ביחד עם נכס 8 ו-11 לטובת הלוואה של 6 מליון - בנק לאומי',
    },
    {
      id: 'prop-03',
      address: 'הרברט סמואל, חדרה - מגרש',
      type: 'LAND',
      status: 'OWNED',
      city: 'חדרה',
      estimatedValue: 1200000,
      gush: '1036',
      helka: '181+60',
      isMortgaged: false,
      notes: '1/6 ממגרש (16.67%). שותפים: יבולים, שוקי שרון, זיו שמור (0509733355). חלקה 60: 1/6 מדירה/מחסן בקומת קרקע. חלקה 181: 1/6 מגרש',
    },
    {
      id: 'prop-04',
      address: 'שאול חרנם 10, פתח תקווה - דירה 45',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      totalArea: 140,
      estimatedValue: 4000000,
      gush: '6393',
      helka: '314/45',
      isMortgaged: true,
      notes: 'דירת פנטהאוס 140 מ"ר + מרפסת 50 מ"ר. משועבדת 1,400,000 ₪ בבנק מרכנתיל. בעלות משותפת: יצחק + אילנה',
    },
    {
      id: 'prop-05',
      address: 'שאול חרנם 10, פתח תקווה - דירה 47',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      totalArea: 90,
      estimatedValue: 3000000,
      gush: '6393',
      helka: '314/47',
      isMortgaged: false,
      notes: 'דירת פנטהאוס 90 מ"ר + מרפסת 50 מ"ר. לא משועבדת. בעלות: ליאת',
    },
    {
      id: 'prop-06',
      address: 'שאול חרנם 10, פתח תקווה - דירה 6',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      estimatedValue: 1000000,
      gush: '6393',
      helka: '314/6',
      isMortgaged: false,
      notes: '36% בעלות ליאת (יחד עם צביקה נטוביץ 64%). שווי דירה מלא: 3 מליון. חלק ליאת: 972,000 ₪',
    },
    {
      id: 'prop-07',
      address: 'הרואה 295, רמת גן',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'רמת גן',
      estimatedValue: 2700000,
      gush: '6144',
      helka: '409/2',
      isMortgaged: true,
      notes: 'דירה 4 חדרים, דירת קרקע. משועבדת 400,000 ₪ בבנק לאומי. בעלות: אילנה',
    },
    {
      id: 'prop-08',
      address: 'מנדלי 7, תל אביב',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'תל אביב',
      estimatedValue: 3000000,
      gush: '6905',
      helka: '39/17+39/16',
      isMortgaged: true,
      notes: '2 דירות בנות 1 חדר. משועבדות ללאומי כחלק מהלוואה הגדולה של 6 מליון (ביחד עם נכסים 2 ו-11)',
    },
    {
      id: 'prop-10',
      address: 'מגדל ב.ס.ר 3 קומה 26, גבעתיים',
      type: 'COMMERCIAL',
      status: 'OWNED',
      city: 'גבעתיים',
      totalArea: 210,
      estimatedValue: 3000000,
      isMortgaged: true,
      notes: 'חצי משרד - 210 מ"ר מתוך 420 (+ מרפסת 40 מ"ר). יחידה 103+105. משועבד 700,000 ₪ בבנק למשכנתאות. שותפות עם יוסי גבילי',
    },
    {
      id: 'prop-11',
      address: 'טבנקין 22, גבעתיים',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'גבעתיים',
      totalArea: 280,
      estimatedValue: 8000000,
      gush: '6156',
      helka: '559/21',
      isMortgaged: true,
      notes: 'דירת גג 2 קומות, 280 מ"ר + 150 מ"ר מרפסת. משועבדת כחלק מהלוואת 6 מליון (ביחד עם נכסים 2 ו-8). בעלות: יצחק + אילנה',
    },
    {
      id: 'prop-12',
      address: 'הפלמח 50, ירושלים',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'ירושלים',
      estimatedValue: 700000,
      gush: '63732',
      helka: '330',
      isMortgaged: true,
      notes: '1/4 דירה (25%). המגרש 730 מ"ר עם 4 דירות. 1/4 של ליאת בפועל + 1/2 אילן אשר. משועבדת 300,000 ₪ בבנק למשכנתאות',
    },
    {
      id: 'prop-13',
      address: 'בר-כוכבא 34, רמת גן',
      type: 'RESIDENTIAL',
      status: 'SOLD',
      city: 'רמת גן',
      estimatedValue: 2800000,
      gush: '1650,1652',
      helka: '34',
      isMortgaged: false,
      notes: 'דירה חדשה בת 4 חדרים. נמכר אך לא הסתיים ב-3,250,000 ₪. לא משועבדת',
    },
    {
      id: 'prop-14',
      address: 'קרקע חקלאית, ראשון לציון',
      type: 'LAND',
      status: 'OWNED',
      city: 'ראשון לציון',
      landArea: 3000,
      estimatedValue: 2700000,
      gush: '3943',
      helka: '10',
      isMortgaged: false,
      notes: '3 דונם קרקע חקלאית. ליוסי וצביקה יש חלקים נוספים. לא משועבדת',
    },
    {
      id: 'prop-15',
      address: 'קרקע חקלאית, רחובות',
      type: 'LAND',
      status: 'OWNED',
      city: 'רחובות',
      landArea: 10000,
      estimatedValue: 5000000,
      gush: '3689',
      helka: '24',
      isMortgaged: false,
      notes: '10 דונם קרקע חקלאית. לא משועבדת',
    },
    {
      id: 'prop-16',
      address: 'קרקע לבניה, חדרה',
      type: 'LAND',
      status: 'IN_CONSTRUCTION',
      city: 'חדרה',
      estimatedValue: 2800000,
      gush: '10026',
      helka: '46',
      isMortgaged: false,
      notes: 'קרקע לבניה - שנתיים-שלוש עד התחלת בניה. יחד עם עוזיאל ויבולים. קרקע ל-7 יחידות דיור',
    },
    {
      id: 'prop-17',
      address: 'בניין לייפציג, גרמניה',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      country: 'Germany',
      city: 'לייפציג',
      estimatedValue: 1800000,
      isMortgaged: true,
      notes: '4 דירות בבעלות חברת איילי. הלוואה 100,000 אירו (350,000 ₪). משועבד מבנק גרמני',
    },
    {
      id: 'prop-18',
      address: 'דימפל, לייפציג - השקעה',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      country: 'Germany',
      city: 'לייפציג',
      estimatedValue: 600000,
      isMortgaged: false,
      notes: 'השקעה באפ-הולדינג. 33% מהרווחים של הניהול. 1/8 נכס. יניב שפיץ: 054-3120178',
    },
    {
      id: 'prop-19',
      address: 'לימבורגר, לייפציג - השקעה',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      country: 'Germany',
      city: 'לייפציג',
      estimatedValue: 600000,
      isMortgaged: false,
      notes: 'השקעה באפ-הולדינג (חלק מהשותפות)',
    },
    {
      id: 'prop-20',
      address: 'גלפי - השקעה',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      country: 'Germany',
      estimatedValue: 1500000,
      isMortgaged: false,
      notes: 'השקעה באפ-הולדינג. שתי דירות (מיכל גרה שם). תיק 226/206. הלוואה: 1.5M ל-36 חודשים, ריבית 7%. תחילת החזר: 16.11.2025. 38% מהרווחים',
    },
    {
      id: 'prop-21',
      address: 'מוצקין 22, רעננה',
      type: 'LAND',
      status: 'IN_CONSTRUCTION',
      city: 'רעננה',
      estimatedValue: 5000000,
      gush: '6580',
      helka: '329',
      isMortgaged: true,
      notes: '20% מהחלקה. שותפים: אברהם הנדלר, איציק וייס, צביקה. קומבינציה עם קבלן. התר בניה תוך חודשיים. 2 דירות',
    },
    {
      id: 'prop-22',
      address: 'שלום עליכם 6, רמת גן',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'רמת גן',
      estimatedValue: 1800000,
      gush: '6142',
      helka: '228/6',
      isMortgaged: true,
      notes: 'דירת 3.5 חדרים. משכנתא 300,000 ₪. בעלות: ליאת',
    },
    {
      id: 'prop-23',
      address: 'פטרסון 3, יד אליהו',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'תל אביב',
      estimatedValue: 1500000,
      isMortgaged: true,
      notes: 'דירת 2 חדרים. משכנתא מדיסקונט 174,000 ₪. בעלות: מיכל',
    },
    {
      id: 'prop-24',
      address: 'הפלמח 9, פתח תקווה',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      estimatedValue: 3000000,
      isMortgaged: true,
      notes: '50% משתי דירות (דופלקס ו-3 חדרים). שותפות עם משה בורשטיין (800 אבא, 280 אביעד). משכנתא 750,000 ₪',
    },
    {
      id: 'prop-25',
      address: 'אלנבי 85 - מחסן',
      type: 'COMMERCIAL',
      status: 'OWNED',
      totalArea: 7,
      estimatedValue: 300000,
      gush: '6937',
      helka: '14',
      isMortgaged: false,
      notes: 'מחסן 7 מטר, תת חלקה 3. בעלות: אביעד. דמי שכירות: 1,000 ₪',
    },
    {
      id: 'prop-26',
      address: 'אלנבי 85 - דירה',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      totalArea: 85,
      estimatedValue: 2600000,
      gush: '6937',
      helka: '14',
      isMortgaged: false,
      notes: '2/3 מדירה. 85 מטר. תמא 38. חלק אביעד: 27.40%. שולם: 2,371,905 ₪. דמי שכירות: 5,000 ₪',
    },
    {
      id: 'prop-27',
      address: 'מורדות הכרמל',
      type: 'LAND',
      status: 'OWNED',
      city: 'חיפה',
      estimatedValue: 800000,
      gush: '10879',
      helka: '63',
      isMortgaged: false,
      notes: 'חלק מהקרקע. יש לבדוק שווי. בעלות: ליאת',
    },
    {
      id: 'prop-28',
      address: 'מניות - נטו דיור בע"מ',
      type: 'COMMERCIAL',
      status: 'INVESTMENT',
      estimatedValue: 147200,
      isMortgaged: false,
      notes: 'מספר תיק 6459. 7.32% מהחברה. כולל: דירה בלוד (1.6 מליון) + פבריגט',
    },
    {
      id: 'prop-29',
      address: 'שאול חרנם 6',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      city: 'פתח תקווה',
      estimatedValue: 7000000,
      isMortgaged: true,
      notes: 'משכנתא 2 מליון ₪ - בנק מרכנתיל דיסקונט. בעלות: אביעד',
    },
    {
      id: 'prop-30',
      address: 'הרצל 57',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      estimatedValue: 1000000,
      isMortgaged: false,
      notes: '50% מדירת 3 חדרים. בעלות: אילנה',
    },
    {
      id: 'prop-31',
      address: 'גבעת שמואל - מגרשים 51+56 (פרוייקט)',
      type: 'LAND',
      status: 'OWNED',
      city: 'גבעת שמואל',
      estimatedValue: 1408000,
      isMortgaged: true,
      notes: '1.128% בעלות. משכנתא: 869,660 ₪. החזר חודשי: 10,714.67 ₪',
    },
    {
      id: 'prop-32',
      address: 'גבעת שמואל - מגרשים 51+56 (פרוייקט)',
      type: 'LAND',
      status: 'OWNED',
      city: 'גבעת שמואל',
      estimatedValue: 3825800,
      isMortgaged: true,
      notes: '3.478% בעלות. משכנתא: 1,355,787 ₪. החזר חודשי: 7,408.67 ₪',
    },
  ];
  
  for (const prop of properties) {
    await prisma.property.create({
      data: {
        id: prop.id,
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
    console.log(`  ✅ ${prop.address.substring(0, 50)}`);
  }
}

async function createOwnerships() {
  console.log('\n🤝 Creating ownerships...\n');
  
  const ownerships = [
    { propertyId: 'prop-01', ownerId: 'owner-yitzhak', percentage: 50, type: 'PARTIAL' },
    { propertyId: 'prop-02', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-03', ownerId: 'owner-yitzhak', percentage: 16.67, type: 'PARTNERSHIP' },
    { propertyId: 'prop-04', ownerId: 'owner-yitzhak-ilana', percentage: 100, type: 'PARTNERSHIP' },
    { propertyId: 'prop-05', ownerId: 'owner-liat', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-06', ownerId: 'owner-liat', percentage: 36, type: 'PARTIAL' },
    { propertyId: 'prop-07', ownerId: 'owner-ilana', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-08', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-10', ownerId: 'owner-yitzhak-partnership', percentage: 50, type: 'PARTNERSHIP' },
    { propertyId: 'prop-11', ownerId: 'owner-yitzhak-ilana', percentage: 100, type: 'PARTNERSHIP' },
    { propertyId: 'prop-12', ownerId: 'owner-yitzhak', percentage: 25, type: 'PARTIAL' },
    { propertyId: 'prop-13', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-14', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-15', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-16', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-17', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-18', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-19', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-20', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-21', ownerId: 'owner-ilana', percentage: 20, type: 'PARTNERSHIP' },
    { propertyId: 'prop-22', ownerId: 'owner-liat', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-23', ownerId: 'owner-michal', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-24', ownerId: 'owner-aviad', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-25', ownerId: 'owner-aviad', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-26', ownerId: 'owner-aviad', percentage: 67, type: 'PARTIAL' },
    { propertyId: 'prop-27', ownerId: 'owner-liat', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-28', ownerId: 'owner-yitzhak', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-29', ownerId: 'owner-aviad', percentage: 100, type: 'FULL' },
    { propertyId: 'prop-30', ownerId: 'owner-ilana', percentage: 50, type: 'PARTIAL' },
    { propertyId: 'prop-31', ownerId: 'owner-yitzhak-partnership', percentage: 1.128, type: 'PARTNERSHIP' },
    { propertyId: 'prop-32', ownerId: 'owner-liat', percentage: 3.478, type: 'PARTIAL' },
  ];
  
  for (const ownership of ownerships) {
    await prisma.propertyOwnership.create({
      data: {
        accountId: ACCOUNT_ID,
        propertyId: ownership.propertyId,
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
      propertyId: 'prop-02',
      bank: 'בנק לאומי',
      loanAmount: 2000000,
      interestRate: 3.5,
      monthlyPayment: 19000,
      bankAccountId: 'bank-leumi',
      linkedProperties: ['prop-02', 'prop-08', 'prop-11'],
      notes: 'חלק מהלוואה של 6 מליון (החזר כולל: 57,000 ₪)',
    },
    {
      propertyId: 'prop-04',
      bank: 'בנק מרכנתיל',
      loanAmount: 1400000,
      monthlyPayment: 8000,
      bankAccountId: 'bank-merkantil',
      linkedProperties: ['prop-04'],
    },
    {
      propertyId: 'prop-07',
      bank: 'בנק לאומי',
      loanAmount: 400000,
      monthlyPayment: 3000,
      bankAccountId: 'bank-leumi',
      linkedProperties: ['prop-07'],
    },
    {
      propertyId: 'prop-08',
      bank: 'בנק לאומי',
      loanAmount: 2000000,
      interestRate: 3.5,
      monthlyPayment: 19000,
      bankAccountId: 'bank-leumi',
      linkedProperties: ['prop-02', 'prop-08', 'prop-11'],
      notes: 'חלק מהלוואה של 6 מליון (משותף עם נכסים 2 ו-11)',
    },
    {
      propertyId: 'prop-10',
      bank: 'בנק למשכנתאות',
      loanAmount: 700000,
      monthlyPayment: 5000,
      bankAccountId: 'bank-mashkanta',
      linkedProperties: ['prop-10'],
    },
    {
      propertyId: 'prop-11',
      bank: 'בנק לאומי',
      loanAmount: 2000000,
      interestRate: 3.5,
      monthlyPayment: 19000,
      bankAccountId: 'bank-leumi',
      linkedProperties: ['prop-02', 'prop-08', 'prop-11'],
      notes: 'חלק מהלוואה של 6 מליון (משותף עם נכסים 2 ו-8)',
    },
    {
      propertyId: 'prop-12',
      bank: 'בנק למשכנתאות',
      loanAmount: 300000,
      monthlyPayment: 2500,
      bankAccountId: 'bank-mashkanta',
      linkedProperties: ['prop-12'],
    },
    {
      propertyId: 'prop-17',
      bank: 'בנק גרמני',
      loanAmount: 350000,
      bankAccountId: 'bank-german',
      linkedProperties: ['prop-17'],
      notes: 'הלוואה של 100,000 אירו',
    },
    {
      propertyId: 'prop-21',
      bank: 'בנק לאומי',
      loanAmount: 1500000,
      bankAccountId: 'bank-leumi',
      linkedProperties: ['prop-21'],
      notes: 'צריך הלוואה 800,000 למיסים (משוער)',
    },
    {
      propertyId: 'prop-22',
      bank: 'בנק',
      loanAmount: 300000,
      monthlyPayment: 2500,
      linkedProperties: ['prop-22'],
    },
    {
      propertyId: 'prop-23',
      bank: 'בנק דיסקונט',
      loanAmount: 174000,
      monthlyPayment: 1500,
      bankAccountId: 'bank-discount',
      linkedProperties: ['prop-23'],
    },
    {
      propertyId: 'prop-24',
      bank: 'בנק',
      loanAmount: 750000,
      monthlyPayment: 5000,
      linkedProperties: ['prop-24'],
    },
    {
      propertyId: 'prop-29',
      bank: 'בנק מרכנתיל',
      loanAmount: 2000000,
      monthlyPayment: 15000,
      bankAccountId: 'bank-merkantil',
      linkedProperties: ['prop-29'],
      notes: 'משכנתא 2 מליון - מרכנתיל דיסקונט',
    },
    {
      propertyId: 'prop-31',
      bank: 'בנק',
      loanAmount: 869660,
      monthlyPayment: 10714.67,
      linkedProperties: ['prop-31'],
      notes: 'החזר חודשי: 10,714.67 ₪',
    },
    {
      propertyId: 'prop-32',
      bank: 'בנק',
      loanAmount: 1355787,
      monthlyPayment: 7408.67,
      linkedProperties: ['prop-32'],
      notes: 'החזר חודשי: 7,408.67 ₪',
    },
  ];
  
  for (const mortgage of mortgages) {
    await prisma.mortgage.create({
      data: {
        accountId: ACCOUNT_ID,
        propertyId: mortgage.propertyId,
        bank: mortgage.bank,
        loanAmount: mortgage.loanAmount,
        interestRate: mortgage.interestRate,
        monthlyPayment: mortgage.monthlyPayment,
        bankAccountId: mortgage.bankAccountId,
        startDate: new Date('2021-01-01'),
        status: 'ACTIVE',
        linkedProperties: mortgage.linkedProperties,
        notes: mortgage.notes,
      },
    });
    console.log(`  ✅ ${mortgage.bank} - ₪${mortgage.loanAmount.toLocaleString()}`);
  }
}

async function createPlotInfo() {
  console.log('\n📋 Creating plot info...\n');
  
  const plots = [
    { propertyId: 'prop-01', gush: '6158', chelka: '371-376' },
    { propertyId: 'prop-02', gush: '6717', chelka: '225' },
    { propertyId: 'prop-03', gush: '1036', chelka: '181+60' },
    { propertyId: 'prop-04', gush: '6393', chelka: '314/45' },
    { propertyId: 'prop-05', gush: '6393', chelka: '314/47' },
    { propertyId: 'prop-06', gush: '6393', chelka: '314/6' },
    { propertyId: 'prop-07', gush: '6144', chelka: '409/2' },
    { propertyId: 'prop-08', gush: '6905', chelka: '39/17+39/16' },
    { propertyId: 'prop-11', gush: '6156', chelka: '559/21' },
    { propertyId: 'prop-12', gush: '63732', chelka: '330' },
    { propertyId: 'prop-13', gush: '1650,1652', chelka: '34' },
    { propertyId: 'prop-14', gush: '3943', chelka: '10' },
    { propertyId: 'prop-15', gush: '3689', chelka: '24' },
    { propertyId: 'prop-16', gush: '10026', chelka: '46' },
    { propertyId: 'prop-21', gush: '6580', chelka: '329' },
    { propertyId: 'prop-22', gush: '6142', chelka: '228/6' },
    { propertyId: 'prop-25', gush: '6937', chelka: '14' },
    { propertyId: 'prop-26', gush: '6937', chelka: '14' },
    { propertyId: 'prop-27', gush: '10879', chelka: '63' },
  ];
  
  for (const plot of plots) {
    await prisma.plotInfo.create({
      data: {
        accountId: ACCOUNT_ID,
        propertyId: plot.propertyId,
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
  console.log(`  Total Estimated Value: ₪${(Number(totalValue._sum.estimatedValue) || 0).toLocaleString()}`);
  console.log(`  Total Mortgage Debt:   ₪${(Number(totalDebt._sum.loanAmount) || 0).toLocaleString()}`);
  console.log(`  Net Equity:            ₪${((Number(totalValue._sum.estimatedValue) || 0) - (Number(totalDebt._sum.loanAmount) || 0)).toLocaleString()}`);
  
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
    
    console.log(`  ${owner.name.padEnd(25)} ${owner.ownerships.length} properties  ₪${totalValue.toLocaleString()}`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting database population...\n');
    
    await cleanDatabase();
    await createOwners();
    await createBankAccounts();
    await createProperties();
    await createOwnerships();
    await createMortgages();
    await createPlotInfo();
    await showStatistics();
    
    console.log('\n\n🎉 Done!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
