import { PrismaClient, PersonType, BankAccountType, PropertyType, PropertyStatus, OwnershipType, MortgageStatus, RentalAgreementStatus, PropertyEventType, ExpenseEventType, RentalPaymentStatus, AcquisitionMethod, LegalStatus, PropertyCondition, EstimationSource, ManagementFeeFrequency, TaxFrequency } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed for rent management system...');

  // Clear existing data (order matters - relations)
  await prisma.propertyEvent.deleteMany();
  await prisma.rentalAgreement.deleteMany();
  await prisma.mortgage.deleteMany();
  await prisma.ownership.deleteMany();
  await prisma.utilityInfo.deleteMany();
  await prisma.planningProcessState.deleteMany();
  await prisma.property.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.person.deleteMany();
  console.log('🗑️  Cleared existing data');

  // ============================================
  // 1. PERSONS (8 people - individuals + companies)
  // ============================================
  const persons = await Promise.all([
    // Individuals - property owners
    prisma.person.create({
      data: {
        name: 'יוסי כהן',
        type: PersonType.INDIVIDUAL,
        idNumber: '123456789',
        email: 'yossi.cohen@example.com',
        phone: '050-1234567',
        address: 'רחוב הרצל 10, תל אביב',
        notes: 'בעל נכסים מרובים, מנוסה בהשקעות נדלן',
      },
    }),
    prisma.person.create({
      data: {
        name: 'שרה לוי',
        type: PersonType.INDIVIDUAL,
        idNumber: '234567890',
        email: 'sara.levi@example.com',
        phone: '052-7654321',
        address: 'רחוב דיזנגוף 5, תל אביב',
        notes: 'שותפה בנכס מסחרי',
      },
    }),
    prisma.person.create({
      data: {
        name: 'משה ליפשיץ',
        type: PersonType.INDIVIDUAL,
        idNumber: '567890123',
        email: 'moshe.lifshitz@example.com',
        phone: '050-5556667',
        address: 'רחוב בן יהודה 15, ירושלים',
        notes: 'משקיע נדלן בירושלים',
      },
    }),
    // Company
    prisma.person.create({
      data: {
        name: 'החברה להשקעות נדלן בע"מ',
        type: PersonType.COMPANY,
        idNumber: '513456789',
        email: 'contact@realestate-inv.co.il',
        phone: '03-1234567',
        address: 'רחוב רוטשילד 30, תל אביב',
        notes: 'חברת השקעות נדלן',
      },
    }),
    // Tenants
    prisma.person.create({
      data: {
        name: 'דוד מזרחי',
        type: PersonType.INDIVIDUAL,
        idNumber: '345678901',
        email: 'david.mizrahi@example.com',
        phone: '054-1112223',
        address: 'רחוב ויצמן 22, חיפה',
        notes: 'שוכר ותיק, משלם בזמן',
      },
    }),
    prisma.person.create({
      data: {
        name: 'רחל אברהם',
        type: PersonType.INDIVIDUAL,
        idNumber: '456789012',
        email: 'rachel.avraham@example.com',
        phone: '053-3334445',
        address: 'רחוב הנשיא 8, ראשון לציון',
        notes: 'שוכרת, חוזה מסתיים בקרוב',
      },
    }),
    prisma.person.create({
      data: {
        name: 'מרים גולדשטיין',
        type: PersonType.INDIVIDUAL,
        idNumber: '678901234',
        email: 'miriam.goldstein@example.com',
        phone: '052-7778889',
        address: 'רחוב אלנבי 60, תל אביב',
        notes: 'שוכרת נכס מסחרי',
      },
    }),
    prisma.person.create({
      data: {
        name: 'אברהם ישראלי',
        type: PersonType.INDIVIDUAL,
        idNumber: '789012345',
        email: 'avraham.israeli@example.com',
        phone: '054-9990001',
        address: 'שדרות ירושלים 45, תל אביב',
        notes: 'שוכר דירת גן',
      },
    }),
  ]);

  const [yossi, sara, moshe, company, david, rachel, miriam, avraham] = persons;
  console.log('✅ Created 8 persons');

  // ============================================
  // 2. BANK ACCOUNTS (4 accounts)
  // ============================================
  const bankAccounts = await Promise.all([
    prisma.bankAccount.create({
      data: {
        bankName: 'בנק הפועלים',
        branchNumber: '661',
        accountNumber: '12-345-678901',
        accountType: BankAccountType.TRUST_ACCOUNT,
        accountHolder: 'יוסי כהן',
        notes: 'חשבון נאמנות להשקעות נדלן',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        bankName: 'בנק לאומי',
        branchNumber: '888',
        accountNumber: '98-765-432100',
        accountType: BankAccountType.PERSONAL_CHECKING,
        accountHolder: 'שרה לוי',
        notes: 'חשבון עו"ש לגביית שכר דירה',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        bankName: 'בנק דיסקונט',
        branchNumber: '112',
        accountNumber: '11-222-333444',
        accountType: BankAccountType.PERSONAL_SAVINGS,
        accountHolder: 'משה ליפשיץ',
        notes: 'חשבון חסכון לפיקדונות שכירות',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        bankName: 'בנק מזרחי טפחות',
        branchNumber: '445',
        accountNumber: '55-666-777888',
        accountType: BankAccountType.BUSINESS,
        accountHolder: 'החברה להשקעות נדלן בע"מ',
        notes: 'חשבון עסקי לפעילות החברה',
        isActive: true,
      },
    }),
  ]);

  const [hapoalimAccount, leumiAccount, discountAccount, mizrahiAccount] = bankAccounts;
  console.log('✅ Created 4 bank accounts');

  // ============================================
  // 3. PROPERTIES (6 properties - various types)
  // ============================================
  const properties = await Promise.all([
    // Property 1: Residential apartment in Tel Aviv - owned, mortgaged
    prisma.property.create({
      data: {
        address: 'רחוב הרצל 10 דירה 4, תל אביב',
        fileNumber: 'TLV-2019-001',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        country: 'ישראל',
        city: 'תל אביב',
        totalArea: 85,
        estimatedValue: 3200000,
        lastValuationDate: new Date('2024-06-01'),
        gush: '6192',
        helka: '45',
        isMortgaged: true,
        floors: 6,
        totalUnits: 1,
        parkingSpaces: 1,
        parkingType: 'REGULAR',
        balconySizeSqm: 12,
        purchasePrice: 2400000,
        purchaseDate: new Date('2019-03-15'),
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        estimatedRent: 8500,
        rentalIncome: 8500,
        legalStatus: LegalStatus.REGISTERED,
        constructionYear: 1995,
        lastRenovationYear: 2020,
        propertyCondition: PropertyCondition.GOOD,
        isPartialOwnership: false,
        propertyManager: 'יוסי כהן',
        taxAmount: 3600,
        taxFrequency: TaxFrequency.ANNUAL,
        lastTaxPayment: new Date('2024-01-15'),
        insuranceDetails: 'פוליסה מס 12345 - כלל ביטוח',
        insuranceExpiry: new Date('2025-12-31'),
        estimationSource: EstimationSource.PROFESSIONAL_APPRAISAL,
        notes: 'דירת 4 חדרים, מצב טוב, מושכרת',
        utilityInfo: {
          create: {
            arnonaAccountNumber: 'TLV-ARN-12345',
            electricityAccountNumber: 'IEC-987654321',
            waterAccountNumber: 'WAT-TLV-55555',
            vaadBayitName: 'ועד הבית רחוב הרצל 10',
            electricityMeterNumber: 'METER-001',
            waterMeterNumber: 'WMETER-001',
          },
        },
      },
    }),

    // Property 2: Commercial space in Tel Aviv
    prisma.property.create({
      data: {
        address: 'רחוב אלנבי 50 חנות 2, תל אביב',
        fileNumber: 'TLV-2020-002',
        type: PropertyType.COMMERCIAL,
        status: PropertyStatus.OWNED,
        country: 'ישראל',
        city: 'תל אביב',
        totalArea: 120,
        estimatedValue: 5500000,
        lastValuationDate: new Date('2024-03-01'),
        gush: '6191',
        helka: '78',
        isMortgaged: true,
        floors: 1,
        purchasePrice: 4200000,
        purchaseDate: new Date('2020-07-01'),
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        estimatedRent: 18000,
        rentalIncome: 18000,
        legalStatus: LegalStatus.REGISTERED,
        constructionYear: 1985,
        lastRenovationYear: 2021,
        propertyCondition: PropertyCondition.EXCELLENT,
        isPartialOwnership: true,
        sharedOwnershipPercentage: 50,
        propertyManager: 'שרה לוי',
        taxAmount: 18000,
        taxFrequency: TaxFrequency.ANNUAL,
        insuranceDetails: 'פוליסה עסקית - מנורה מבטחים',
        insuranceExpiry: new Date('2025-06-30'),
        estimationSource: EstimationSource.MARKET_ESTIMATE,
        notes: 'נכס מסחרי מרכזי, בבעלות משותפת 50/50',
        utilityInfo: {
          create: {
            arnonaAccountNumber: 'TLV-COM-67890',
            electricityAccountNumber: 'IEC-111222333',
            electricityMeterNumber: 'METER-COM-001',
          },
        },
      },
    }),

    // Property 3: Apartment in Jerusalem - inherited
    prisma.property.create({
      data: {
        address: 'רחוב יפו 120 דירה 7, ירושלים',
        fileNumber: 'JRS-2015-003',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        country: 'ישראל',
        city: 'ירושלים',
        totalArea: 95,
        estimatedValue: 2800000,
        lastValuationDate: new Date('2023-12-01'),
        gush: '30001',
        helka: '12',
        isMortgaged: false,
        floors: 4,
        totalUnits: 1,
        parkingSpaces: 0,
        balconySizeSqm: 8,
        purchasePrice: 850000,
        purchaseDate: new Date('2015-06-20'),
        acquisitionMethod: AcquisitionMethod.INHERITANCE,
        estimatedRent: 7500,
        rentalIncome: 7200,
        legalStatus: LegalStatus.REGISTERED,
        constructionYear: 1972,
        lastRenovationYear: 2018,
        propertyCondition: PropertyCondition.GOOD,
        isPartialOwnership: false,
        propertyManager: 'משה ליפשיץ',
        managementCompany: 'ניהול נכסים ירושלים בע"מ',
        managementFees: 500,
        managementFeeFrequency: ManagementFeeFrequency.MONTHLY,
        taxAmount: 4200,
        taxFrequency: TaxFrequency.ANNUAL,
        estimationSource: EstimationSource.TAX_ASSESSMENT,
        notes: 'ירושה מהורים, מושכרת לסטודנטים',
        utilityInfo: {
          create: {
            arnonaAccountNumber: 'JRS-ARN-99999',
            electricityAccountNumber: 'IEC-555444333',
            waterAccountNumber: 'WAT-JRS-11111',
          },
        },
      },
    }),

    // Property 4: Land plot
    prisma.property.create({
      data: {
        address: 'גוש 7155 חלקה 3, ראשון לציון',
        fileNumber: 'RSL-2022-004',
        type: PropertyType.LAND,
        status: PropertyStatus.INVESTMENT,
        country: 'ישראל',
        city: 'ראשון לציון',
        landArea: 400,
        totalArea: 400,
        estimatedValue: 1800000,
        lastValuationDate: new Date('2024-01-01'),
        gush: '7155',
        helka: '3',
        isMortgaged: false,
        purchasePrice: 1200000,
        purchaseDate: new Date('2022-11-10'),
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        legalStatus: LegalStatus.REGISTERED,
        landType: 'URBAN',
        landDesignation: 'מגורים ג מ.ר. 260',
        isPartialOwnership: false,
        taxAmount: 2400,
        taxFrequency: TaxFrequency.ANNUAL,
        estimationSource: EstimationSource.PROFESSIONAL_APPRAISAL,
        notes: 'קרקע לבנייה עתידית, בהליכי תכנון',
        planningProcessState: {
          create: {
            stateType: 'תוכנית בנין עיר',
            developerName: 'בינוי ופיתוח ראשון בע"מ',
            projectedSizeAfter: '4 קומות, 12 יחידות דיור',
            lastUpdateDate: new Date('2024-09-01'),
            notes: 'ממתין לאישור ועדה מקומית',
          },
        },
      },
    }),

    // Property 5: Apartment under purchase
    prisma.property.create({
      data: {
        address: 'רחוב ביאליק 33 דירה 2, רמת גן',
        fileNumber: 'RG-2024-005',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.IN_PURCHASE,
        country: 'ישראל',
        city: 'רמת גן',
        totalArea: 72,
        estimatedValue: 2100000,
        gush: '6167',
        helka: '89',
        isMortgaged: true,
        floors: 3,
        totalUnits: 1,
        parkingSpaces: 1,
        balconySizeSqm: 6,
        purchasePrice: 2050000,
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        legalStatus: LegalStatus.IN_REGISTRATION,
        constructionYear: 2008,
        propertyCondition: PropertyCondition.GOOD,
        isPartialOwnership: false,
        estimationSource: EstimationSource.MARKET_ESTIMATE,
        notes: 'בתהליך רכישה, עסקה סגורה, ממתין לרישום',
      },
    }),

    // Property 6: Investment apartment - fully owned
    prisma.property.create({
      data: {
        address: 'שדרות בן גוריון 15 דירה 12, חיפה',
        fileNumber: 'HFA-2018-006',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        country: 'ישראל',
        city: 'חיפה',
        totalArea: 68,
        estimatedValue: 1650000,
        lastValuationDate: new Date('2024-04-01'),
        gush: '11001',
        helka: '34',
        isMortgaged: false,
        floors: 8,
        totalUnits: 1,
        parkingSpaces: 1,
        parkingType: 'CONSECUTIVE',
        balconySizeSqm: 10,
        storageSizeSqm: 5,
        purchasePrice: 950000,
        purchaseDate: new Date('2018-05-01'),
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        estimatedRent: 5500,
        rentalIncome: 5500,
        legalStatus: LegalStatus.REGISTERED,
        constructionYear: 2003,
        propertyCondition: PropertyCondition.EXCELLENT,
        isPartialOwnership: false,
        managementCompany: 'ניהול נכסים חיפה בע"מ',
        managementFees: 350,
        managementFeeFrequency: ManagementFeeFrequency.MONTHLY,
        taxAmount: 3000,
        taxFrequency: TaxFrequency.ANNUAL,
        estimationSource: EstimationSource.MARKET_ESTIMATE,
        notes: 'דירת 3 חדרים, תנאי ים, תשואה גבוהה',
        utilityInfo: {
          create: {
            arnonaAccountNumber: 'HFA-ARN-33333',
            electricityAccountNumber: 'IEC-777888999',
            waterAccountNumber: 'WAT-HFA-22222',
            vaadBayitName: 'ועד הבית שדרות בן גוריון 15',
            electricityMeterNumber: 'METER-HFA-001',
            waterMeterNumber: 'WMETER-HFA-001',
          },
        },
      },
    }),
  ]);

  const [herzlApartment, comercialAllenby, jerusalemApartment, landRishon, rishonPurchase, haifaApartment] = properties;
  console.log('✅ Created 6 properties');

  // ============================================
  // 4. OWNERSHIPS
  // ============================================
  await Promise.all([
    // Herzl apartment - yossi owns 100%
    prisma.ownership.create({
      data: {
        propertyId: herzlApartment.id,
        personId: yossi.id,
        ownershipPercentage: 100,
        ownershipType: OwnershipType.REAL,
        startDate: new Date('2019-03-15'),
        notes: 'בעלות מלאה',
      },
    }),
    // Commercial Allenby - yossi 50%, sara 50%
    prisma.ownership.create({
      data: {
        propertyId: comercialAllenby.id,
        personId: yossi.id,
        ownershipPercentage: 50,
        ownershipType: OwnershipType.REAL,
        startDate: new Date('2020-07-01'),
        notes: 'שותפות 50%',
      },
    }),
    prisma.ownership.create({
      data: {
        propertyId: comercialAllenby.id,
        personId: sara.id,
        ownershipPercentage: 50,
        ownershipType: OwnershipType.REAL,
        startDate: new Date('2020-07-01'),
        notes: 'שותפות 50%',
      },
    }),
    // Jerusalem apartment - moshe 100%
    prisma.ownership.create({
      data: {
        propertyId: jerusalemApartment.id,
        personId: moshe.id,
        ownershipPercentage: 100,
        ownershipType: OwnershipType.REAL,
        startDate: new Date('2015-06-20'),
        notes: 'ירושה מהורים',
      },
    }),
    // Land Rishon - company 100%
    prisma.ownership.create({
      data: {
        propertyId: landRishon.id,
        personId: company.id,
        ownershipPercentage: 100,
        ownershipType: OwnershipType.LEGAL,
        startDate: new Date('2022-11-10'),
        notes: 'בבעלות חברה',
      },
    }),
    // Rishon purchase - yossi 70%, moshe 30%
    prisma.ownership.create({
      data: {
        propertyId: rishonPurchase.id,
        personId: yossi.id,
        ownershipPercentage: 70,
        ownershipType: OwnershipType.REAL,
        startDate: new Date('2024-08-01'),
        notes: '70% מהנכס',
      },
    }),
    prisma.ownership.create({
      data: {
        propertyId: rishonPurchase.id,
        personId: moshe.id,
        ownershipPercentage: 30,
        ownershipType: OwnershipType.REAL,
        startDate: new Date('2024-08-01'),
        notes: '30% מהנכס',
      },
    }),
    // Haifa apartment - sara 100%
    prisma.ownership.create({
      data: {
        propertyId: haifaApartment.id,
        personId: sara.id,
        ownershipPercentage: 100,
        ownershipType: OwnershipType.REAL,
        startDate: new Date('2018-05-01'),
        notes: 'בעלות מלאה - נכס השקעה',
      },
    }),
  ]);
  console.log('✅ Created 8 ownerships');

  // ============================================
  // 5. MORTGAGES (4 mortgages)
  // ============================================
  const mortgages = await Promise.all([
    // Mortgage on Herzl apartment - active
    prisma.mortgage.create({
      data: {
        propertyId: herzlApartment.id,
        bank: 'בנק הפועלים',
        loanAmount: 1500000,
        interestRate: 3.25,
        monthlyPayment: 7200,
        earlyRepaymentPenalty: 15000,
        bankAccountId: hapoalimAccount.id,
        mortgageOwnerId: yossi.id,
        payerId: yossi.id,
        startDate: new Date('2019-04-01'),
        endDate: new Date('2049-04-01'),
        status: MortgageStatus.ACTIVE,
        linkedProperties: [herzlApartment.id],
        notes: 'משכנתא ראשונה לדירת תל אביב, ריבית פריים',
      },
    }),
    // Mortgage on commercial - active
    prisma.mortgage.create({
      data: {
        propertyId: comercialAllenby.id,
        bank: 'בנק לאומי',
        loanAmount: 2800000,
        interestRate: 4.1,
        monthlyPayment: 15500,
        bankAccountId: leumiAccount.id,
        mortgageOwnerId: sara.id,
        payerId: sara.id,
        startDate: new Date('2020-08-01'),
        endDate: new Date('2040-08-01'),
        status: MortgageStatus.ACTIVE,
        linkedProperties: [comercialAllenby.id],
        notes: 'משכנתא מסחרית לנכס אלנבי',
      },
    }),
    // Mortgage on Rishon purchase - active
    prisma.mortgage.create({
      data: {
        propertyId: rishonPurchase.id,
        bank: 'בנק מזרחי טפחות',
        loanAmount: 1200000,
        interestRate: 3.75,
        monthlyPayment: 6800,
        bankAccountId: mizrahiAccount.id,
        mortgageOwnerId: yossi.id,
        payerId: yossi.id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2054-09-01'),
        status: MortgageStatus.ACTIVE,
        linkedProperties: [rishonPurchase.id],
        notes: 'משכנתא לדירה חדשה ברמת גן',
      },
    }),
    // Personal loan - paid off
    prisma.mortgage.create({
      data: {
        propertyId: null, // personal loan, not property-specific
        bank: 'בנק דיסקונט',
        loanAmount: 300000,
        interestRate: 5.5,
        monthlyPayment: 0,
        bankAccountId: discountAccount.id,
        mortgageOwnerId: null,
        payerId: moshe.id,
        startDate: new Date('2018-01-01'),
        endDate: new Date('2023-12-31'),
        status: MortgageStatus.PAID_OFF,
        linkedProperties: [],
        notes: 'הלוואה אישית - שולמה במלואה',
      },
    }),
  ]);
  console.log('✅ Created 4 mortgages');

  // ============================================
  // 6. RENTAL AGREEMENTS (4 active + 1 expired)
  // ============================================
  const rentalAgreements = await Promise.all([
    // Herzl apartment - David active tenant
    prisma.rentalAgreement.create({
      data: {
        propertyId: herzlApartment.id,
        tenantId: david.id,
        monthlyRent: 8500,
        startDate: new Date('2023-07-01'),
        endDate: new Date('2025-06-30'),
        status: RentalAgreementStatus.ACTIVE,
        hasExtensionOption: true,
        extensionUntilDate: new Date('2026-06-30'),
        extensionMonthlyRent: 9000,
        notes: 'חוזה לשנתיים עם אופציה להארכה, כולל חניה',
      },
    }),
    // Commercial - Miriam active
    prisma.rentalAgreement.create({
      data: {
        propertyId: comercialAllenby.id,
        tenantId: miriam.id,
        monthlyRent: 18000,
        startDate: new Date('2022-01-01'),
        endDate: new Date('2026-12-31'),
        status: RentalAgreementStatus.ACTIVE,
        hasExtensionOption: false,
        notes: 'חוזה מסחרי לחנות, כולל VAT',
      },
    }),
    // Jerusalem apartment - Rachel active
    prisma.rentalAgreement.create({
      data: {
        propertyId: jerusalemApartment.id,
        tenantId: rachel.id,
        monthlyRent: 7200,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: RentalAgreementStatus.ACTIVE,
        hasExtensionOption: true,
        extensionUntilDate: new Date('2025-12-31'),
        extensionMonthlyRent: 7600,
        notes: 'חוזה שנתי, שוכרת סטודנטית',
      },
    }),
    // Haifa - Avraham active
    prisma.rentalAgreement.create({
      data: {
        propertyId: haifaApartment.id,
        tenantId: avraham.id,
        monthlyRent: 5500,
        startDate: new Date('2023-09-01'),
        endDate: new Date('2025-08-31'),
        status: RentalAgreementStatus.ACTIVE,
        hasExtensionOption: false,
        notes: 'חוזה דירת ים, כולל חניה צמודה',
      },
    }),
    // Jerusalem - old expired tenant
    prisma.rentalAgreement.create({
      data: {
        propertyId: jerusalemApartment.id,
        tenantId: david.id,
        monthlyRent: 6500,
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31'),
        status: RentalAgreementStatus.EXPIRED,
        hasExtensionOption: false,
        notes: 'חוזה שהסתיים - דייר קודם',
      },
    }),
  ]);

  const [herzlLease, commercialLease, jerusalemLease, haifaLease] = rentalAgreements;
  console.log('✅ Created 5 rental agreements (4 active, 1 expired)');

  // ============================================
  // 7. PROPERTY EVENTS (various types)
  // ============================================

  // --- EXPENSE EVENTS ---
  await prisma.propertyEvent.createMany({
    data: [
      // Herzl apartment expenses
      {
        propertyId: herzlApartment.id,
        eventType: PropertyEventType.ExpenseEvent,
        eventDate: new Date('2024-02-15'),
        description: 'תשלום ועד בית - פברואר 2024',
        expenseType: ExpenseEventType.MANAGEMENT_FEE,
        amount: 750,
        paidToAccountId: hapoalimAccount.id,
        affectsPropertyValue: false,
      },
      {
        propertyId: herzlApartment.id,
        eventType: PropertyEventType.ExpenseEvent,
        eventDate: new Date('2024-04-10'),
        description: 'תיקון ברז דולף בשירותים',
        expenseType: ExpenseEventType.REPAIRS,
        amount: 350,
        paidToAccountId: hapoalimAccount.id,
        affectsPropertyValue: false,
      },
      {
        propertyId: herzlApartment.id,
        eventType: PropertyEventType.ExpenseEvent,
        eventDate: new Date('2024-01-15'),
        description: 'ארנונה שנתית 2024',
        expenseType: ExpenseEventType.TAX,
        amount: 3600,
        paidToAccountId: hapoalimAccount.id,
        affectsPropertyValue: false,
      },
      // Commercial expenses
      {
        propertyId: comercialAllenby.id,
        eventType: PropertyEventType.ExpenseEvent,
        eventDate: new Date('2024-03-01'),
        description: 'ביטוח נכס מסחרי 2024',
        expenseType: ExpenseEventType.INSURANCE,
        amount: 8400,
        paidToAccountId: leumiAccount.id,
        affectsPropertyValue: false,
      },
      {
        propertyId: comercialAllenby.id,
        eventType: PropertyEventType.ExpenseEvent,
        eventDate: new Date('2024-05-20'),
        description: 'תחזוקת מזגנים ומערכת חשמל',
        expenseType: ExpenseEventType.MAINTENANCE,
        amount: 2200,
        paidToAccountId: leumiAccount.id,
        affectsPropertyValue: false,
      },
      // Jerusalem expenses
      {
        propertyId: jerusalemApartment.id,
        eventType: PropertyEventType.ExpenseEvent,
        eventDate: new Date('2024-06-01'),
        description: 'דמי ניהול - יוני 2024',
        expenseType: ExpenseEventType.MANAGEMENT_FEE,
        amount: 500,
        affectsPropertyValue: false,
      },
      // Haifa expenses
      {
        propertyId: haifaApartment.id,
        eventType: PropertyEventType.ExpenseEvent,
        eventDate: new Date('2024-07-15'),
        description: 'כיבוי ועד בית חיפה',
        expenseType: ExpenseEventType.UTILITIES,
        amount: 420,
        affectsPropertyValue: false,
      },
    ],
  });

  // --- DAMAGE EVENTS ---
  await prisma.propertyEvent.createMany({
    data: [
      {
        propertyId: herzlApartment.id,
        eventType: PropertyEventType.PropertyDamageEvent,
        eventDate: new Date('2024-01-20'),
        description: 'נזק מים מדירה עליונה - רטיבות בתקרת המטבח',
        damageType: 'נזק מים',
        estimatedDamageCost: 4500,
      },
      {
        propertyId: comercialAllenby.id,
        eventType: PropertyEventType.PropertyDamageEvent,
        eventDate: new Date('2023-11-05'),
        description: 'שבירת ויטרינה - פריצה ניסיון',
        damageType: 'נזק אחר',
        estimatedDamageCost: 3200,
      },
    ],
  });

  // --- PLANNING PROCESS EVENTS (for land) ---
  await prisma.propertyEvent.createMany({
    data: [
      {
        propertyId: landRishon.id,
        eventType: PropertyEventType.PlanningProcessEvent,
        eventDate: new Date('2023-06-01'),
        description: 'הגשת תוכנית לוועדה המקומית',
        planningStage: 'הגשה לוועדה',
        developerName: 'בינוי ופיתוח ראשון בע"מ',
        projectedSizeAfter: '4 קומות, 12 יחידות',
        estimatedValue: 12000000,
      },
      {
        propertyId: landRishon.id,
        eventType: PropertyEventType.PlanningProcessEvent,
        eventDate: new Date('2024-02-15'),
        description: 'דיון ראשוני בוועדה - הוחזר להשלמות',
        planningStage: 'דיון ראשוני',
        developerName: 'בינוי ופיתוח ראשון בע"מ',
        projectedSizeAfter: '4 קומות, 12 יחידות',
        estimatedValue: 12000000,
      },
    ],
  });

  // --- RENTAL PAYMENT REQUESTS ---
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Generate 6 months of rental payment requests for active leases
  const rentalPaymentEvents: Array<{
    propertyId: string;
    eventType: PropertyEventType;
    eventDate: Date;
    description: string;
    rentalAgreementId: string;
    month: number;
    year: number;
    amountDue: number;
    paymentDate: Date | null;
    paymentStatus: RentalPaymentStatus;
  }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, today.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const isPast = i > 0;
    const isRecent = i <= 1;

    // Herzl apartment
    rentalPaymentEvents.push({
      propertyId: herzlApartment.id,
      eventType: PropertyEventType.RentalPaymentRequestEvent,
      eventDate: new Date(year, month - 1, 1),
      description: `תשלום שכ"ד ${month}/${year} - רחוב הרצל`,
      rentalAgreementId: herzlLease.id,
      month,
      year,
      amountDue: 8500,
      paymentDate: isPast ? new Date(year, month - 1, Math.floor(Math.random() * 5) + 2) : null,
      paymentStatus: isPast ? RentalPaymentStatus.PAID : RentalPaymentStatus.PENDING,
    });

    // Jerusalem apartment
    rentalPaymentEvents.push({
      propertyId: jerusalemApartment.id,
      eventType: PropertyEventType.RentalPaymentRequestEvent,
      eventDate: new Date(year, month - 1, 1),
      description: `תשלום שכ"ד ${month}/${year} - ירושלים`,
      rentalAgreementId: jerusalemLease.id,
      month,
      year,
      amountDue: 7200,
      paymentDate: isPast ? new Date(year, month - 1, Math.floor(Math.random() * 5) + 3) : null,
      paymentStatus: isPast
        ? isRecent
          ? RentalPaymentStatus.OVERDUE
          : RentalPaymentStatus.PAID
        : RentalPaymentStatus.PENDING,
    });

    // Haifa apartment
    rentalPaymentEvents.push({
      propertyId: haifaApartment.id,
      eventType: PropertyEventType.RentalPaymentRequestEvent,
      eventDate: new Date(year, month - 1, 1),
      description: `תשלום שכ"ד ${month}/${year} - חיפה`,
      rentalAgreementId: haifaLease.id,
      month,
      year,
      amountDue: 5500,
      paymentDate: isPast ? new Date(year, month - 1, Math.floor(Math.random() * 3) + 1) : null,
      paymentStatus: isPast ? RentalPaymentStatus.PAID : RentalPaymentStatus.PENDING,
    });
  }

  // Insert rental payment events one by one to handle unique constraint
  for (const evt of rentalPaymentEvents) {
    await prisma.propertyEvent.upsert({
      where: {
        rentalAgreementId_month_year: {
          rentalAgreementId: evt.rentalAgreementId,
          month: evt.month,
          year: evt.year,
        },
      },
      create: evt,
      update: evt,
    });
  }

  console.log('✅ Created property events (expenses, damage, planning, rental payments)');

  // Summary
  const counts = {
    persons: await prisma.person.count(),
    bankAccounts: await prisma.bankAccount.count(),
    properties: await prisma.property.count(),
    ownerships: await prisma.ownership.count(),
    mortgages: await prisma.mortgage.count(),
    rentalAgreements: await prisma.rentalAgreement.count(),
    propertyEvents: await prisma.propertyEvent.count(),
  };

  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Summary:');
  Object.entries(counts).forEach(([key, count]) => {
    console.log(`   ${key}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
