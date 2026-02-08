/**
 * Hebrew labels for table columns
 * Maps field names to their Hebrew display names
 */
export const COLUMN_LABELS: Record<string, string> = {
  // Common fields
  id: 'מזהה',
  createdAt: 'תאריך יצירה',
  updatedAt: 'תאריך עדכון',
  accountId: 'מזהה חשבון',
  notes: 'הערות',
  actions: 'פעולות',

  // Property fields - Basic Information
  address: 'כתובת',
  fileNumber: 'מספר תיק',
  type: 'סוג',
  status: 'סטטוס',
  country: 'מדינה',
  city: 'עיר',

  // Property fields - Area & Dimensions
  totalArea: 'שטח כולל (מ"ר)',
  landArea: 'שטח קרקע (מ"ר)',
  floors: 'מספר קומות',
  totalUnits: 'מספר יחידות',
  parkingSpaces: 'מקומות חניה',
  balconyArea: 'שטח מרפסת (מ"ר)',

  // Property fields - Financial
  estimatedValue: 'שווי משוער (₪)',
  acquisitionPrice: 'מחיר רכישה (₪)',
  acquisitionDate: 'תאריך רכישה',
  acquisitionMethod: 'שיטת רכישה',
  rentalIncome: 'הכנסה משכירות (₪)',
  projectedValue: 'שווי צפוי (₪)',

  // Property fields - Legal & Registry
  gush: 'גוש',
  helka: 'חלקה',
  gushHelka: 'גוש/חלקה',
  cadastralNumber: 'מספר קדסטרלי',
  taxId: 'מספר זהות מס',
  registrationDate: 'תאריך רישום',
  legalStatus: 'סטטוס משפטי',

  // Property fields - Property Details
  constructionYear: 'שנת בנייה',
  lastRenovationYear: 'שנת שיפוץ אחרונה',
  buildingPermitNumber: 'מספר היתר בנייה',
  propertyCondition: 'מצב הנכס',
  floor: 'קומה',
  storage: 'מחסן',

  // Property fields - Land Information
  landType: 'סוג קרקע',
  landDesignation: 'ייעוד קרקע',
  plotSize: 'גודל חלקה (מ"ר)',
  buildingPotential: 'פוטנציאל בנייה',

  // Property fields - Ownership
  isPartialOwnership: 'בעלות חלקית',
  sharedOwnershipPercentage: 'אחוז בעלות משותפת (%)',
  coOwners: 'שותפים',
  isMortgaged: 'משועבד',

  // Property fields - Sale Information
  isSold: 'נמכר',
  saleDate: 'תאריך מכירה',
  salePrice: 'מחיר מכירה (₪)',

  // Property fields - Management
  propertyManager: 'מנהל נכס',
  managementCompany: 'חברת ניהול',
  managementFees: 'דמי ניהול (₪)',
  managementFeeFrequency: 'תדירות דמי ניהול',

  // Property fields - Financial Obligations
  taxAmount: 'סכום מס (₪)',
  taxFrequency: 'תדירות תשלום מס',
  lastTaxPayment: 'תאריך תשלום מס אחרון',

  // Property fields - Insurance
  insuranceDetails: 'פרטי ביטוח',
  insuranceExpiry: 'תפוגת ביטוח',

  // Property fields - Utilities & Infrastructure
  zoning: 'ייעוד (תכנון)',
  utilities: 'תשתיות',
  restrictions: 'הגבלות',

  // Property fields - Valuation
  lastValuationDate: 'תאריך הערכה אחרונה',
  estimationSource: 'מקור הערכת שווי',

  // Property fields - Investment Company
  investmentCompanyId: 'חברת השקעה',
  investmentCompany: 'חברת השקעה',

  // Tenant fields
  name: 'שם',
  email: 'אימייל',
  phone: 'טלפון',
  idNumber: 'מספר תעודת זהות',
  dateOfBirth: 'תאריך לידה',

  // Lease fields
  unitId: 'יחידת דיור',
  unit: 'יחידת דיור',
  tenantId: 'דייר',
  tenant: 'דייר',
  startDate: 'תאריך התחלה',
  endDate: 'תאריך סיום',
  monthlyRent: 'שכר דירה חודשי (₪)',
  paymentTo: 'פרטי תשלום',
  depositAmount: 'סכום פיקדון (₪)',
  securityDeposit: 'פיקדון בטחון (₪)',

  // Unit fields
  propertyId: 'נכס',
  property: 'נכס',
  apartmentNumber: 'מספר דירה',
  roomCount: 'מספר חדרים',
  area: 'שטח (מ"ר)',
  unitType: 'סוג יחידה',
  bedrooms: 'חדרי שינה',
  bathrooms: 'חדרי רחצה',
  storageArea: 'שטח מחסן (מ"ר)',
  hasElevator: 'מעלית',
  hasParking: 'חניה',
  parkingSpots: 'מקומות חניה',
  furnishingStatus: 'סטטוס ריהוט',
  condition: 'מצב',
  occupancyStatus: 'סטטוס תפוסה',
  isOccupied: 'תפוס',
  entryDate: 'תאריך כניסה',
  lastRenovationDate: 'תאריך שיפוץ אחרון',
  currentRent: 'שכירות נוכחית (₪)',
  marketRent: 'שכירות שוק (₪)',

  // Expense fields
  description: 'תיאור',
  amount: 'סכום (₪)',
  date: 'תאריך',
  category: 'קטגוריה',
  propertyIdExpense: 'נכס',
  unitIdExpense: 'יחידה',
  vendor: 'ספק',
  receipt: 'קבלה',
  paymentMethod: 'אמצעי תשלום',

  // Income fields
  source: 'מקור',
  reference: 'אסמכתא',
  paidBy: 'שולם על ידי',
  bankAccountId: 'חשבון בנק',

  // Owner fields
  contactPerson: 'איש קשר',
  companyName: 'שם חברה',
  taxNumber: 'מספר עוסק',

  // Ownership fields
  ownerId: 'בעלים',
  owner: 'בעלים',
  percentage: 'אחוז בעלות (%)',
  ownershipType: 'סוג בעלות',

  // Bank Account fields
  bankName: 'שם בנק',
  branchNumber: 'מספר סניף',
  accountNumber: 'מספר חשבון',
  accountType: 'סוג חשבון',
  accountHolder: 'בעל החשבון',
  iban: 'IBAN',
  swiftCode: 'קוד SWIFT',
  balance: 'יתרה (₪)',
  currency: 'מטבע',
  isActive: 'פעיל',
  lastSync: 'סנכרון אחרון',

  // Mortgage fields
  bankNameMortgage: 'בנק',
  originalAmount: 'סכום מקורי (₪)',
  currentBalance: 'יתרה נוכחית (₪)',
  interestRate: 'ריבית (%)',
  monthlyPayment: 'תשלום חודשי (₪)',
  mortgageStartDate: 'תאריך תחילה',
  mortgageEndDate: 'תאריך סיום',
  mortgageType: 'סוג משכנתא',
  track: 'מסלול',
  linkedPropertyId: 'נכס משועבד',
  linkedProperty: 'נכס משועבד',
  linkedUnitId: 'יחידה משועבדת',
  linkedUnit: 'יחידה משועבדת',
};

/**
 * Group definitions for column organization
 * Maps entity types to their groupings
 */
export const COLUMN_GROUPS: Record<string, Array<{ label: string; fields: string[] }>> = {
  properties: [
    {
      label: 'מידע בסיסי',
      fields: ['address', 'fileNumber', 'type', 'status', 'country', 'city'],
    },
    {
      label: 'שטחים ומידות',
      fields: ['totalArea', 'landArea', 'floors', 'totalUnits', 'parkingSpaces', 'balconyArea'],
    },
    {
      label: 'פרטים פיננסיים',
      fields: [
        'estimatedValue',
        'acquisitionPrice',
        'acquisitionDate',
        'acquisitionMethod',
        'rentalIncome',
        'projectedValue',
      ],
    },
    {
      label: 'משפטי ורישום',
      fields: ['gush', 'helka', 'cadastralNumber', 'taxId', 'registrationDate', 'legalStatus'],
    },
    {
      label: 'פרטי הנכס',
      fields: [
        'constructionYear',
        'lastRenovationYear',
        'buildingPermitNumber',
        'propertyCondition',
        'floor',
        'storage',
      ],
    },
    {
      label: 'מידע על הקרקע',
      fields: ['landType', 'landDesignation', 'plotSize', 'buildingPotential'],
    },
    {
      label: 'בעלות',
      fields: ['isPartialOwnership', 'sharedOwnershipPercentage', 'coOwners', 'isMortgaged'],
    },
    {
      label: 'מידע מכירה',
      fields: ['isSold', 'saleDate', 'salePrice'],
    },
    {
      label: 'ניהול',
      fields: ['propertyManager', 'managementCompany', 'managementFees', 'managementFeeFrequency'],
    },
    {
      label: 'התחייבויות פיננסיות',
      fields: ['taxAmount', 'taxFrequency', 'lastTaxPayment'],
    },
    {
      label: 'ביטוח',
      fields: ['insuranceDetails', 'insuranceExpiry'],
    },
    {
      label: 'תשתיות ושירותים',
      fields: ['zoning', 'utilities', 'restrictions'],
    },
    {
      label: 'הערכת שווי',
      fields: ['lastValuationDate', 'estimationSource'],
    },
    {
      label: 'חברת השקעה',
      fields: ['investmentCompanyId'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
  tenants: [
    {
      label: 'מידע אישי',
      fields: ['name', 'email', 'phone', 'idNumber', 'dateOfBirth'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
  leases: [
    {
      label: 'מידע בסיסי',
      fields: ['unit', 'tenant', 'startDate', 'endDate'],
    },
    {
      label: 'פרטים פיננסיים',
      fields: ['monthlyRent', 'depositAmount', 'securityDeposit', 'paymentTo'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
  units: [
    {
      label: 'מידע בסיסי',
      fields: ['property', 'apartmentNumber', 'floor', 'roomCount', 'unitType'],
    },
    {
      label: 'שטחים',
      fields: ['area', 'balconyArea', 'storageArea'],
    },
    {
      label: 'פרטי היחידה',
      fields: ['bedrooms', 'bathrooms', 'hasElevator', 'hasParking', 'parkingSpots'],
    },
    {
      label: 'מצב ותפוסה',
      fields: [
        'furnishingStatus',
        'condition',
        'occupancyStatus',
        'isOccupied',
        'entryDate',
        'lastRenovationDate',
      ],
    },
    {
      label: 'פרטים פיננסיים',
      fields: ['currentRent', 'marketRent'],
    },
    {
      label: 'כללי',
      fields: ['utilities', 'notes', 'createdAt', 'updatedAt'],
    },
  ],
  expenses: [
    {
      label: 'מידע בסיסי',
      fields: ['description', 'amount', 'date', 'category'],
    },
    {
      label: 'פרטים נוספים',
      fields: ['propertyIdExpense', 'unitIdExpense', 'vendor', 'receipt', 'paymentMethod'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
  income: [
    {
      label: 'מידע בסיסי',
      fields: ['description', 'amount', 'date', 'source'],
    },
    {
      label: 'פרטים נוספים',
      fields: ['reference', 'paidBy', 'bankAccountId'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
  owners: [
    {
      label: 'מידע אישי',
      fields: ['name', 'email', 'phone', 'contactPerson'],
    },
    {
      label: 'פרטי חברה',
      fields: ['companyName', 'taxNumber'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
  ownerships: [
    {
      label: 'מידע בסיסי',
      fields: ['property', 'owner', 'percentage', 'ownershipType'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
  bankAccounts: [
    {
      label: 'מידע בסיסי',
      fields: ['bankName', 'branchNumber', 'accountNumber', 'accountType', 'accountHolder'],
    },
    {
      label: 'פרטים בינלאומיים',
      fields: ['iban', 'swiftCode'],
    },
    {
      label: 'פרטים פיננסיים',
      fields: ['balance', 'currency'],
    },
    {
      label: 'כללי',
      fields: ['isActive', 'lastSync', 'notes', 'createdAt', 'updatedAt'],
    },
  ],
  mortgages: [
    {
      label: 'מידע בסיסי',
      fields: ['bankNameMortgage', 'mortgageType', 'track'],
    },
    {
      label: 'פרטים פיננסיים',
      fields: [
        'originalAmount',
        'currentBalance',
        'interestRate',
        'monthlyPayment',
        'mortgageStartDate',
        'mortgageEndDate',
      ],
    },
    {
      label: 'נכסים משועבדים',
      fields: ['linkedProperty', 'linkedUnit'],
    },
    {
      label: 'כללי',
      fields: ['notes', 'createdAt', 'updatedAt'],
    },
  ],
};
