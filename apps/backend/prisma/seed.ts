import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for 8-entity model...');

  // ============================================
  // 1. Person (5-7 people) - mortgages and tenants
  // ============================================
  const persons = await Promise.all([
    prisma.person.create({ data: { name: 'יוסי כהן', idNumber: '123456789', email: 'yossi.cohen@example.com', phone: '050-1234567', notes: 'בעל משכנתא' } }),
    prisma.person.create({ data: { name: 'שרה לוי', idNumber: '234567890', email: 'sara.levi@example.com', phone: '052-7654321', notes: 'משלמת משכנתא' } }),
    prisma.person.create({ data: { name: 'דוד מזרחי', idNumber: '345678901', email: 'david.mizrahi@example.com', phone: '054-1112223', notes: 'דייר' } }),
    prisma.person.create({ data: { name: 'רחל אברהם', idNumber: '456789012', email: 'rachel.avraham@example.com', phone: '053-3334445', notes: 'דיירת' } }),
    prisma.person.create({ data: { name: 'משה ליפשיץ', idNumber: '567890123', email: 'moshe.lifshitz@example.com', phone: '050-5556667', notes: 'בעל משכנתא ודירה' } }),
    prisma.person.create({ data: { name: 'מרים גולדשטיין', idNumber: '678901234', email: 'miriam.goldstein@example.com', phone: '052-7778889', notes: 'דיירת' } }),
    prisma.person.create({ data: { name: 'אברהם ישראלי', idNumber: '789012345', email: 'avraham.israeli@example.com', phone: '054-9990001', notes: 'משלם הלוואה' } }),
  ]);
  console.log('✅ Created 7 persons');

  // ============================================
  // 2. Owner (3-4 owners) - INDIVIDUAL and COMPANY
  // ============================================
  const owners = await Promise.all([
    prisma.owner.create({ data: { name: 'יוסי כהן', idNumber: '123456789', type: 'INDIVIDUAL', email: 'yossi@example.com', phone: '050-1234567', address: 'רחוב הרצל 10, תל אביב', notes: 'בעלים פרטי' } }),
    prisma.owner.create({ data: { name: 'שרה לוי', idNumber: '234567890', type: 'INDIVIDUAL', email: 'sara@example.com', phone: '052-7654321', address: 'רחוב דיזנגוף 5, תל אביב', notes: 'בעלים פרטית' } }),
    prisma.owner.create({ data: { name: 'החברה להשקעות נדלן בע"מ', idNumber: '513456789', type: 'COMPANY', email: 'contact@realestate-inv.co.il', phone: '03-1234567', address: 'רחוב רוטשילד 30, תל אביב', notes: 'חברת השקעות' } }),
    prisma.owner.create({ data: { name: 'משה ליפשיץ', idNumber: '567890123', type: 'INDIVIDUAL', email: 'moshe@example.com', phone: '050-5556667', address: 'רחוב בן יהודה 15, ירושלים', notes: 'בעלים יחיד' } }),
  ]);
  console.log('✅ Created 4 owners');

  // ============================================
  // 3. BankAccount (3-4 accounts)
  // ============================================
  const bankAccounts = await Promise.all([
    prisma.bankAccount.create({ data: { bankName: 'בנק הפועלים', branchNumber: '661', accountNumber: '12-345-678901', accountType: 'TRUST_ACCOUNT', accountHolder: 'יוסי כהן', notes: 'חשבון נאמנות להשקעות', isActive: true } }),
    prisma.bankAccount.create({ data: { bankName: 'בנק לאומי', branchNumber: '888', accountNumber: '98-765-432100', accountType: 'PERSONAL_CHECKING', accountHolder: 'שרה לוי', notes: 'חשבון עו"ש', isActive: true } }),
    prisma.bankAccount.create({ data: { bankName: 'בנק דיסקונט', branchNumber: '112', accountNumber: '11-222-333444', accountType: 'PERSONAL_SAVINGS', accountHolder: 'משה ליפשיץ', notes: 'חשבון חסכון', isActive: true } }),
    prisma.bankAccount.create({ data: { bankName: 'בנק מזרחי טפחות', branchNumber: '445', accountNumber: '55-666-777888', accountType: 'BUSINESS', accountHolder: 'החברה להשקעות נדלן', notes: 'חשבון עסקי', isActive: true } }),
  ]);
  console.log('✅ Created 4 bank accounts');

  // ============================================
  // 4. Property (5-6 properties) - complete data
  // ============================================
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'TLV-001',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        country: 'Israel',
        city: 'תל אביב',
        totalArea: 120.5,
        landArea: 150.0,
        estimatedValue: 2500000,
        lastValuationDate: new Date('2024-01-15'),
        gush: '6543',
        helka: '123',
        isMortgaged: true,
        floors: 4,
        totalUnits: 2,
        parkingSpaces: 1,
        balconySizeSqm: 12.5,
        storageSizeSqm: 8.0,
        parkingType: 'REGULAR',
        purchasePrice: 2000000,
        purchaseDate: new Date('2020-06-15'),
        acquisitionMethod: 'PURCHASE',
        estimatedRent: 8500,
        rentalIncome: 8000,
        projectedValue: 2600000,
        saleProjectedTax: 156000,
        constructionYear: 1995,
        lastRenovationYear: 2022,
        propertyCondition: 'GOOD',
        landType: 'URBAN',
        isPartialOwnership: false,
        propertyManager: 'מנהל נכסים תל אביב',
        managementFees: 500,
        managementFeeFrequency: 'MONTHLY',
        taxAmount: 800,
        taxFrequency: 'MONTHLY',
        notes: 'דירת מגורים מרווחת',
      },
    }),
    prisma.property.create({
      data: {
        address: 'רחוב רוטשילד 45, תל אביב',
        fileNumber: 'TLV-002',
        type: 'COMMERCIAL',
        status: 'OWNED',
        country: 'Israel',
        city: 'תל אביב',
        totalArea: 200.0,
        landArea: 180.0,
        estimatedValue: 4500000,
        lastValuationDate: new Date('2024-02-01'),
        gush: '6544',
        helka: '45',
        isMortgaged: true,
        floors: 2,
        totalUnits: 1,
        parkingSpaces: 2,
        balconySizeSqm: 20.0,
        storageSizeSqm: 15.0,
        parkingType: 'CONSECUTIVE',
        purchasePrice: 3800000,
        purchaseDate: new Date('2019-03-20'),
        acquisitionMethod: 'PURCHASE',
        estimatedRent: 18000,
        rentalIncome: 17500,
        projectedValue: 4800000,
        saleProjectedTax: 288000,
        constructionYear: 1988,
        propertyCondition: 'FAIR',
        landType: 'URBAN',
        isPartialOwnership: false,
        notes: 'משרדים במרכז תל אביב',
      },
    }),
    prisma.property.create({
      data: {
        address: 'רחוב דיזנגוף 88, תל אביב',
        fileNumber: 'TLV-003',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        country: 'Israel',
        city: 'תל אביב',
        totalArea: 95.0,
        landArea: 0,
        estimatedValue: 1800000,
        gush: '6545',
        helka: '78',
        isMortgaged: false,
        floors: 3,
        totalUnits: 1,
        parkingSpaces: 0,
        balconySizeSqm: 8.0,
        storageSizeSqm: 4.0,
        parkingType: 'REGULAR',
        purchasePrice: 1500000,
        purchaseDate: new Date('2021-11-01'),
        acquisitionMethod: 'PURCHASE',
        estimatedRent: 5500,
        rentalIncome: 5300,
        constructionYear: 2010,
        propertyCondition: 'EXCELLENT',
        landType: 'URBAN',
        isPartialOwnership: false,
        notes: 'דירת 3 חדרים',
      },
    }),
    prisma.property.create({
      data: {
        address: 'רחוב בן יהודה 15, ירושלים',
        fileNumber: 'JLM-001',
        type: 'RESIDENTIAL',
        status: 'IN_CONSTRUCTION',
        country: 'Israel',
        city: 'ירושלים',
        totalArea: 0,
        landArea: 250.0,
        estimatedValue: 3200000,
        gush: '1234',
        helka: '56',
        isMortgaged: true,
        floors: 5,
        totalUnits: 4,
        parkingSpaces: 4,
        balconySizeSqm: 0,
        storageSizeSqm: 0,
        parkingType: 'REGULAR',
        purchasePrice: 2800000,
        purchaseDate: new Date('2022-05-10'),
        acquisitionMethod: 'PURCHASE',
        estimatedRent: 22000,
        constructionYear: 0,
        propertyCondition: 'NEEDS_RENOVATION',
        landType: 'URBAN',
        isPartialOwnership: false,
        notes: 'בניין בבנייה',
      },
    }),
    prisma.property.create({
      data: {
        address: 'רחוב הנביאים 33, חיפה',
        fileNumber: 'HAI-001',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        country: 'Israel',
        city: 'חיפה',
        totalArea: 85.0,
        landArea: 120.0,
        estimatedValue: 1400000,
        lastValuationDate: new Date('2023-09-01'),
        gush: '7890',
        helka: '12',
        isMortgaged: false,
        floors: 2,
        totalUnits: 1,
        parkingSpaces: 1,
        balconySizeSqm: 6.0,
        storageSizeSqm: 3.0,
        parkingType: 'REGULAR',
        purchasePrice: 1200000,
        purchaseDate: new Date('2018-08-15'),
        acquisitionMethod: 'INHERITANCE',
        estimatedRent: 4200,
        rentalIncome: 4000,
        constructionYear: 1975,
        lastRenovationYear: 2019,
        propertyCondition: 'GOOD',
        landType: 'URBAN',
        isPartialOwnership: true,
        sharedOwnershipPercentage: 50,
        notes: 'דירת מגורים - מחצית בשותפות',
      },
    }),
    prisma.property.create({
      data: {
        address: 'שדרות רוטשילד 100, רמת גן',
        fileNumber: 'RG-001',
        type: 'MIXED_USE',
        status: 'INVESTMENT',
        country: 'Israel',
        city: 'רמת גן',
        totalArea: 300.0,
        landArea: 350.0,
        estimatedValue: 5500000,
        lastValuationDate: new Date('2024-03-01'),
        gush: '9012',
        helka: '34',
        isMortgaged: true,
        floors: 6,
        totalUnits: 6,
        parkingSpaces: 6,
        balconySizeSqm: 60.0,
        storageSizeSqm: 30.0,
        parkingType: 'CONSECUTIVE',
        purchasePrice: 4800000,
        purchaseDate: new Date('2017-01-20'),
        acquisitionMethod: 'PURCHASE',
        estimatedRent: 28000,
        rentalIncome: 26500,
        projectedValue: 6000000,
        saleProjectedTax: 360000,
        constructionYear: 1992,
        lastRenovationYear: 2020,
        propertyCondition: 'GOOD',
        landType: 'URBAN',
        isPartialOwnership: false,
        managementCompany: 'מנהלת נכסים בע"מ',
        managementFees: 2000,
        managementFeeFrequency: 'MONTHLY',
        notes: 'בניין משולב מגורים ומסחר',
      },
    }),
  ]);
  console.log('✅ Created 6 properties');

  // ============================================
  // 5. PlanningProcessState (2-3 states) - 1:1 with some properties
  // ============================================
  await prisma.planningProcessState.create({
    data: {
      propertyId: properties[3].id, // Jerusalem - IN_CONSTRUCTION
      stateType: 'תוכנית בניין עיר',
      developerName: 'חברת הבנייה ירושלים בע"מ',
      projectedSizeAfter: '450 מ"ר',
      lastUpdateDate: new Date('2024-01-15'),
      notes: 'בשלב אישור הוועדה המקומית',
    },
  });
  await prisma.planningProcessState.create({
    data: {
      propertyId: properties[5].id, // Ramat Gan - INVESTMENT
      stateType: 'היתר בניה',
      developerName: 'קבוצת הנדסה',
      projectedSizeAfter: '320 מ"ר',
      lastUpdateDate: new Date('2023-06-20'),
      notes: 'הרחבת מרפסות מאושרת',
    },
  });
  await prisma.planningProcessState.create({
    data: {
      propertyId: properties[1].id, // Rothschild commercial
      stateType: 'שינוי ייעוד',
      developerName: null,
      projectedSizeAfter: '220 מ"ר',
      lastUpdateDate: new Date('2024-02-28'),
      notes: 'בדיקה לשינוי ייעוד לקומה 2',
    },
  });
  console.log('✅ Created 3 planning process states');

  // ============================================
  // 6. UtilityInfo (all properties)
  // ============================================
  await Promise.all([
    prisma.utilityInfo.create({ data: { propertyId: properties[0].id, vaadBayitName: 'ועד בית הרצל 10', waterMeterNumber: 'WM-001-2020', electricityMeterNumber: 'EM-001-2020', arnonaAccountNumber: 'ARN-TLV-12345', electricityAccountNumber: 'IEC-987654', waterAccountNumber: 'MEK-456789', notes: 'כל החשבונות פעילים' } }),
    prisma.utilityInfo.create({ data: { propertyId: properties[1].id, vaadBayitName: 'ועד בית רוטשילד 45', waterMeterNumber: 'WM-002-2019', electricityMeterNumber: 'EM-002-2019', arnonaAccountNumber: 'ARN-TLV-23456', electricityAccountNumber: 'IEC-876543', waterAccountNumber: 'MEK-345678', notes: 'חשבון עסקי' } }),
    prisma.utilityInfo.create({ data: { propertyId: properties[2].id, vaadBayitName: 'ועד בית דיזנגוף 88', waterMeterNumber: 'WM-003-2021', electricityMeterNumber: 'EM-003-2021', arnonaAccountNumber: 'ARN-TLV-34567', electricityAccountNumber: 'IEC-765432', waterAccountNumber: 'MEK-234567', notes: null } }),
    prisma.utilityInfo.create({ data: { propertyId: properties[3].id, vaadBayitName: null, waterMeterNumber: null, electricityMeterNumber: null, arnonaAccountNumber: 'ARN-JLM-45678', electricityAccountNumber: null, waterAccountNumber: null, notes: 'חשבונות יופעלו עם סיום הבנייה' } }),
    prisma.utilityInfo.create({ data: { propertyId: properties[4].id, vaadBayitName: 'ועד בית הנביאים 33', waterMeterNumber: 'WM-005-2018', electricityMeterNumber: 'EM-005-2018', arnonaAccountNumber: 'ARN-HAI-56789', electricityAccountNumber: 'IEC-543210', waterAccountNumber: 'MEK-123456', notes: 'דירה בחיפה' } }),
    prisma.utilityInfo.create({ data: { propertyId: properties[5].id, vaadBayitName: 'ועד בית רוטשילד 100 רמת גן', waterMeterNumber: 'WM-006-2017', electricityMeterNumber: 'EM-006-2017', arnonaAccountNumber: 'ARN-RG-67890', electricityAccountNumber: 'IEC-432109', waterAccountNumber: 'MEK-012345', notes: 'בניין משולב' } }),
  ]);
  console.log('✅ Created 6 utility info records (all properties)');

  // ============================================
  // 7. Ownership (7-10 ownerships) - Owner ↔ Property
  // ============================================
  await Promise.all([
    prisma.ownership.create({ data: { propertyId: properties[0].id, ownerId: owners[0].id, ownershipPercentage: 50, ownershipType: 'REAL', managementFee: 250, familyDivision: false, startDate: new Date('2020-06-15'), notes: 'שותפות עם שרה' } }),
    prisma.ownership.create({ data: { propertyId: properties[0].id, ownerId: owners[1].id, ownershipPercentage: 50, ownershipType: 'REAL', managementFee: 250, familyDivision: false, startDate: new Date('2020-06-15'), notes: 'שותפות עם יוסי' } }),
    prisma.ownership.create({ data: { propertyId: properties[1].id, ownerId: owners[2].id, ownershipPercentage: 100, ownershipType: 'REAL', managementFee: 800, familyDivision: false, startDate: new Date('2019-03-20'), notes: 'בעלות מלאה של החברה' } }),
    prisma.ownership.create({ data: { propertyId: properties[2].id, ownerId: owners[1].id, ownershipPercentage: 100, ownershipType: 'REAL', managementFee: 200, familyDivision: false, startDate: new Date('2021-11-01'), notes: 'דירה בשותפות משפחתית' } }),
    prisma.ownership.create({ data: { propertyId: properties[3].id, ownerId: owners[3].id, ownershipPercentage: 100, ownershipType: 'REAL', managementFee: 0, familyDivision: false, startDate: new Date('2022-05-10'), notes: 'בניין בבנייה' } }),
    prisma.ownership.create({ data: { propertyId: properties[4].id, ownerId: owners[0].id, ownershipPercentage: 50, ownershipType: 'REAL', managementFee: 100, familyDivision: true, startDate: new Date('2018-08-15'), notes: 'חלוקה משפחתית - חצי מהדירה' } }),
    prisma.ownership.create({ data: { propertyId: properties[4].id, ownerId: owners[1].id, ownershipPercentage: 50, ownershipType: 'REAL', managementFee: 100, familyDivision: true, startDate: new Date('2018-08-15'), notes: 'חלוקה משפחתית - חצי מהדירה' } }),
    prisma.ownership.create({ data: { propertyId: properties[5].id, ownerId: owners[2].id, ownershipPercentage: 70, ownershipType: 'REAL', managementFee: 1400, familyDivision: false, startDate: new Date('2017-01-20'), notes: 'שותפות עם משה' } }),
    prisma.ownership.create({ data: { propertyId: properties[5].id, ownerId: owners[3].id, ownershipPercentage: 30, ownershipType: 'LEGAL', managementFee: 600, familyDivision: false, startDate: new Date('2017-01-20'), notes: 'בעלות משפטית' } }),
  ]);
  console.log('✅ Created 9 ownerships');

  // ============================================
  // 8. Mortgage (3-4) - some with mortgageOwnerId, some without (loan)
  // ============================================
  const mortgages = await Promise.all([
    prisma.mortgage.create({
      data: {
        propertyId: properties[0].id,
        bank: 'בנק הפועלים',
        loanAmount: 1500000,
        interestRate: 3.5,
        monthlyPayment: 6500,
        earlyRepaymentPenalty: 25000,
        bankAccountId: bankAccounts[0].id,
        mortgageOwnerId: persons[0].id,
        payerId: persons[1].id,
        startDate: new Date('2020-06-15'),
        endDate: new Date('2040-06-15'),
        status: 'ACTIVE',
        linkedProperties: [properties[0].id],
        notes: 'משכנתא ראשית - יוסי בעלים, שרה משלמת',
      },
    }),
    prisma.mortgage.create({
      data: {
        propertyId: properties[1].id,
        bank: 'בנק לאומי',
        loanAmount: 2000000,
        interestRate: 4.2,
        monthlyPayment: 9800,
        earlyRepaymentPenalty: 45000,
        bankAccountId: bankAccounts[3].id,
        mortgageOwnerId: null, // Company owns - no Person
        payerId: persons[0].id,
        startDate: new Date('2019-03-20'),
        endDate: new Date('2039-03-20'),
        status: 'ACTIVE',
        linkedProperties: [properties[1].id],
        notes: 'משכנתא עסקית',
      },
    }),
    prisma.mortgage.create({
      data: {
        propertyId: null, // Loan - not tied to property
        bank: 'בנק דיסקונט',
        loanAmount: 300000,
        interestRate: 8.5,
        monthlyPayment: 3500,
        earlyRepaymentPenalty: 5000,
        bankAccountId: bankAccounts[2].id,
        mortgageOwnerId: null, // Loan - no mortgage owner
        payerId: persons[6].id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2033-01-01'),
        status: 'ACTIVE',
        linkedProperties: [],
        notes: 'הלוואה פרטית - לא קשורה לנכס',
      },
    }),
    prisma.mortgage.create({
      data: {
        propertyId: properties[3].id,
        bank: 'בנק מזרחי טפחות',
        loanAmount: 2200000,
        interestRate: 3.8,
        monthlyPayment: 10500,
        earlyRepaymentPenalty: 35000,
        bankAccountId: bankAccounts[2].id,
        mortgageOwnerId: persons[4].id,
        payerId: persons[4].id,
        startDate: new Date('2022-05-10'),
        endDate: new Date('2042-05-10'),
        status: 'ACTIVE',
        linkedProperties: [properties[3].id],
        notes: 'משכנתא לבנייה - משה בעלים ומשלם',
      },
    }),
  ]);
  console.log('✅ Created 4 mortgages (3 with property, 1 loan)');

  // ============================================
  // 9. RentalAgreement (4-5) - Property + Person tenant
  // ============================================
  const rentalAgreements = await Promise.all([
    prisma.rentalAgreement.create({
      data: {
        propertyId: properties[0].id,
        tenantId: persons[2].id,
        monthlyRent: 8000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        status: 'ACTIVE',
        hasExtensionOption: true,
        extensionUntilDate: new Date('2026-12-31'),
        extensionMonthlyRent: 8500,
        notes: 'דוד מזרחי - דירה ראשית',
      },
    }),
    prisma.rentalAgreement.create({
      data: {
        propertyId: properties[1].id,
        tenantId: persons[2].id,
        monthlyRent: 17500,
        startDate: new Date('2023-06-01'),
        endDate: new Date('2025-05-31'),
        status: 'ACTIVE',
        hasExtensionOption: false,
        notes: 'משרדים - דוד מזרחי',
      },
    }),
    prisma.rentalAgreement.create({
      data: {
        propertyId: properties[2].id,
        tenantId: persons[3].id,
        monthlyRent: 5300,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-01-31'),
        status: 'ACTIVE',
        hasExtensionOption: true,
        extensionUntilDate: new Date('2026-01-31'),
        extensionMonthlyRent: 5550,
        notes: 'רחל אברהם - דירת 3 חדרים',
      },
    }),
    prisma.rentalAgreement.create({
      data: {
        propertyId: properties[4].id,
        tenantId: persons[5].id,
        monthlyRent: 4000,
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-08-31'),
        status: 'EXPIRED',
        hasExtensionOption: false,
        notes: 'מרים גולדשטיין - חוזה שפג',
      },
    }),
    prisma.rentalAgreement.create({
      data: {
        propertyId: properties[5].id,
        tenantId: persons[3].id,
        monthlyRent: 12000,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2026-02-28'),
        status: 'FUTURE',
        hasExtensionOption: true,
        extensionUntilDate: new Date('2027-02-28'),
        extensionMonthlyRent: 12600,
        notes: 'רחל - דירה בבניין רמת גן',
      },
    }),
  ]);
  console.log('✅ Created 5 rental agreements');

  // ============================================
  // 10. PropertyEvent (10-15) - all 4 types
  // ============================================

  // PlanningProcessEvent (2-3)
  await prisma.propertyEvent.createMany({
    data: [
      { propertyId: properties[3].id, eventType: 'PlanningProcessEvent', eventDate: new Date('2024-01-10'), description: 'אישור תוכנית בניין עיר', planningStage: 'אישור הוועדה', developerName: 'חברת הבנייה ירושלים', projectedSizeAfter: '450 מ"ר' },
      { propertyId: properties[5].id, eventType: 'PlanningProcessEvent', eventDate: new Date('2023-06-15'), description: 'הרחבת מרפסות', planningStage: 'היתר מאושר', developerName: 'קבוצת הנדסה', projectedSizeAfter: '320 מ"ר' },
      { propertyId: properties[1].id, eventType: 'PlanningProcessEvent', eventDate: new Date('2024-02-20'), description: 'בדיקת שינוי ייעוד', planningStage: 'בבדיקה', developerName: null, projectedSizeAfter: '220 מ"ר' },
    ],
  });

  // PropertyDamageEvent (2-3) - separate from ExpenseEvent
  const damageEvent1 = await prisma.propertyEvent.create({
    data: {
      propertyId: properties[0].id,
      eventType: 'PropertyDamageEvent',
      eventDate: new Date('2024-03-01'),
      description: 'נזק לצנרת - הצפה בדירה',
      damageType: 'צנרת',
      estimatedDamageCost: 8500,
      estimatedValue: null,
    },
  });
  await prisma.propertyEvent.createMany({
    data: [
      { propertyId: properties[2].id, eventType: 'PropertyDamageEvent', eventDate: new Date('2024-01-15'), description: 'נזק למזגן', damageType: 'מערכות', estimatedDamageCost: 3200 },
      { propertyId: properties[4].id, eventType: 'PropertyDamageEvent', eventDate: new Date('2023-11-20'), description: 'סדק בקיר', damageType: 'מבנה', estimatedDamageCost: 5000 },
    ],
  });

  // ExpenseEvent (3-4) - one can link to damage for repair
  const expenseEvent1 = await prisma.propertyEvent.create({
    data: {
      propertyId: properties[0].id,
      eventType: 'ExpenseEvent',
      eventDate: new Date('2024-03-15'),
      description: 'תיקון צנרת לאחר נזק',
      expenseType: 'REPAIRS',
      amount: 8200,
      affectsPropertyValue: false,
      paidToAccountId: bankAccounts[0].id,
    },
  });
  await prisma.propertyEvent.createMany({
    data: [
      { propertyId: properties[0].id, eventType: 'ExpenseEvent', eventDate: new Date('2024-01-05'), description: 'ארנונה', expenseType: 'TAX', amount: 800, affectsPropertyValue: false },
      { propertyId: properties[0].id, eventType: 'ExpenseEvent', eventDate: new Date('2024-02-10'), description: 'ביטוח נכס', expenseType: 'INSURANCE', amount: 1200, affectsPropertyValue: false },
      { propertyId: properties[1].id, eventType: 'ExpenseEvent', eventDate: new Date('2024-01-20'), description: 'אגרת ועמ', expenseType: 'MANAGEMENT_FEE', amount: 600, affectsPropertyValue: false },
      { propertyId: properties[4].id, eventType: 'ExpenseEvent', eventDate: new Date('2023-12-01'), description: 'תיקון סדק בקיר', expenseType: 'REPAIRS', amount: 4800, affectsPropertyValue: true },
    ],
  });

  // Link PropertyDamageEvent to ExpenseEvent
  await prisma.propertyEvent.update({
    where: { id: damageEvent1.id },
    data: { expenseId: expenseEvent1.id },
  });

  // RentalPaymentRequestEvent (4-5)
  await prisma.propertyEvent.createMany({
    data: [
      { propertyId: properties[0].id, eventType: 'RentalPaymentRequestEvent', eventDate: new Date('2024-01-01'), rentalAgreementId: rentalAgreements[0].id, month: 1, year: 2024, amountDue: 8000, paymentDate: new Date('2024-01-05'), paymentStatus: 'PAID' },
      { propertyId: properties[0].id, eventType: 'RentalPaymentRequestEvent', eventDate: new Date('2024-02-01'), rentalAgreementId: rentalAgreements[0].id, month: 2, year: 2024, amountDue: 8000, paymentDate: new Date('2024-02-03'), paymentStatus: 'PAID' },
      { propertyId: properties[0].id, eventType: 'RentalPaymentRequestEvent', eventDate: new Date('2024-03-01'), rentalAgreementId: rentalAgreements[0].id, month: 3, year: 2024, amountDue: 8000, paymentDate: null, paymentStatus: 'PENDING' },
      { propertyId: properties[2].id, eventType: 'RentalPaymentRequestEvent', eventDate: new Date('2024-02-01'), rentalAgreementId: rentalAgreements[2].id, month: 2, year: 2024, amountDue: 5300, paymentDate: new Date('2024-02-10'), paymentStatus: 'PAID' },
      { propertyId: properties[2].id, eventType: 'RentalPaymentRequestEvent', eventDate: new Date('2024-03-01'), rentalAgreementId: rentalAgreements[2].id, month: 3, year: 2024, amountDue: 5300, paymentDate: new Date('2024-03-01'), paymentStatus: 'PAID' },
    ],
  });
  console.log('✅ Created 15 property events (Planning, Damage, Expense, RentalPayment)');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 7 Persons');
  console.log('- 4 Owners');
  console.log('- 4 Bank Accounts');
  console.log('- 6 Properties');
  console.log('- 3 Planning Process States');
  console.log('- 6 Utility Info records');
  console.log('- 9 Ownerships');
  console.log('- 4 Mortgages');
  console.log('- 5 Rental Agreements');
  console.log('- 15 Property Events');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
