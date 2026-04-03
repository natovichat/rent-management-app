/** Enum types and interfaces for Firebase/Firestore data models */

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum PersonType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  PARTNERSHIP = 'PARTNERSHIP',
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  PARKING = 'PARKING',
  STORAGE = 'STORAGE',
  RESIDENTIAL = 'RESIDENTIAL',
  OTHER = 'OTHER',
}

export enum PropertyStatus {
  OWNED = 'OWNED',
  RENTED = 'RENTED',
  VACANT = 'VACANT',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD',
}

export enum OwnershipType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  SHARED = 'SHARED',
  TRUST = 'TRUST',
  REAL = 'REAL',
  NOMINEE = 'NOMINEE',
}

export enum MortgageStatus {
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  DEFAULT = 'DEFAULT',
  REFINANCED = 'REFINANCED',
}

export enum RentalStatus {
  ACTIVE = 'ACTIVE',
  FUTURE = 'FUTURE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum RenewalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RENEWED = 'RENEWED',
  NOT_RENEWED = 'NOT_RENEWED',
}

export enum PropertyEventType {
  PlanningProcessEvent = 'PlanningProcessEvent',
  PropertyDamageEvent = 'PropertyDamageEvent',
  ExpenseEvent = 'ExpenseEvent',
  RentalPaymentRequestEvent = 'RentalPaymentRequestEvent',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  LATE = 'LATE',
  PARTIAL = 'PARTIAL',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  BUSINESS = 'BUSINESS',
  MORTGAGE = 'MORTGAGE',
}

export enum RentalAgreementStatus {
  ACTIVE = 'ACTIVE',
  FUTURE = 'FUTURE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum RentalPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  LATE = 'LATE',
  PARTIAL = 'PARTIAL',
}

export enum ExpenseEventType {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSURANCE = 'INSURANCE',
  TAX = 'TAX',
  MANAGEMENT_FEE = 'MANAGEMENT_FEE',
  UTILITY = 'UTILITY',
  RENOVATION = 'RENOVATION',
  OTHER = 'OTHER',
}

export enum ParkingType {
  UNDERGROUND = 'UNDERGROUND',
  SURFACE = 'SURFACE',
  GARAGE = 'GARAGE',
  NONE = 'NONE',
}

export enum AcquisitionMethod {
  PURCHASE = 'PURCHASE',
  INHERITANCE = 'INHERITANCE',
  GIFT = 'GIFT',
  EXCHANGE = 'EXCHANGE',
  OTHER = 'OTHER',
}

export enum LegalStatus {
  REGISTERED = 'REGISTERED',
  UNREGISTERED = 'UNREGISTERED',
  IN_PROCESS = 'IN_PROCESS',
}

export enum PropertyCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  RENOVATION_NEEDED = 'RENOVATION_NEEDED',
}

export enum LandType {
  AGRICULTURAL = 'AGRICULTURAL',
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MIXED = 'MIXED',
  OTHER = 'OTHER',
}

export enum ManagementFeeFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export enum TaxFrequency {
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export enum EstimationSource {
  APPRAISER = 'APPRAISER',
  BROKER = 'BROKER',
  OWNER_ESTIMATE = 'OWNER_ESTIMATE',
  AUTOMATED = 'AUTOMATED',
  OTHER = 'OTHER',
}

/** Domain model interfaces */

export interface User {
  id: string;
  email: string;
  googleId?: string;
  name?: string;
  picture?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  name: string;
  type?: PersonType;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  bankName: string;
  branchNumber?: string;
  accountNumber: string;
  accountType?: string;
  accountHolder?: string;
  notes?: string;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  address: string;
  fileNumber?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  country?: string;
  city?: string;
  totalArea?: number;
  landArea?: number;
  estimatedValue?: number;
  lastValuationDate?: Date;
  gush?: string;
  helka?: string;
  isMortgaged?: boolean;
  floors?: number;
  totalUnits?: number;
  parkingSpaces?: number;
  balconySizeSqm?: number;
  storageSizeSqm?: number;
  parkingType?: string;
  purchasePrice?: number;
  purchaseDate?: Date;
  acquisitionMethod?: string;
  estimatedRent?: number;
  rentalIncome?: number;
  projectedValue?: number;
  saleProjectedTax?: number;
  cadastralNumber?: string;
  taxId?: string;
  registrationDate?: Date;
  legalStatus?: string;
  constructionYear?: number;
  lastRenovationYear?: number;
  buildingPermitNumber?: string;
  propertyCondition?: string;
  landType?: string;
  landDesignation?: string;
  isPartialOwnership?: boolean;
  sharedOwnershipPercentage?: number;
  isSold?: boolean;
  saleDate?: Date;
  salePrice?: number;
  propertyManager?: string;
  managementCompany?: string;
  managementFees?: number;
  managementFeeFrequency?: string;
  taxAmount?: number;
  taxFrequency?: string;
  lastTaxPayment?: Date;
  insuranceDetails?: string;
  insuranceExpiry?: Date;
  zoning?: string;
  utilities?: string;
  restrictions?: string;
  estimationSource?: string;
  notes?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Virtual populated fields
  planningProcessState?: PlanningProcessState;
  utilityInfo?: UtilityInfo;
}

export interface Ownership {
  id: string;
  propertyId: string;
  personId: string;
  ownershipPercentage: number;
  ownershipType: OwnershipType;
  startDate: Date;
  endDate?: Date;
  managementFee?: number;
  familyDivision: boolean;
  notes?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Virtual populated fields
  person?: Person;
  property?: Property;
}

export interface Mortgage {
  id: string;
  propertyId?: string;
  bankAccountId?: string;
  mortgageOwnerId?: string;
  payerId: string;
  bank: string;
  loanAmount: number;
  interestRate?: number;
  monthlyPayment?: number;
  startDate: Date;
  endDate?: Date;
  status: MortgageStatus;
  earlyRepaymentPenalty?: number;
  linkedProperties: string[];
  notes?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Virtual populated fields
  property?: Property;
  bankAccount?: BankAccount;
  mortgageOwner?: Person;
  payer?: Person;
}

export interface RentalAgreement {
  id: string;
  propertyId: string;
  tenantId: string;
  monthlyRent: number;
  startDate: Date;
  endDate: Date;
  status: RentalStatus | RentalAgreementStatus;
  renewalStatus?: RenewalStatus;
  hasExtensionOption: boolean;
  extensionUntilDate?: Date;
  extensionMonthlyRent?: number;
  notes?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Virtual populated fields
  property?: Property;
  tenant?: Person;
}

export interface PropertyEvent {
  id: string;
  propertyId: string;
  eventType: PropertyEventType;
  eventDate: Date;
  description?: string;
  // PlanningProcessEvent fields
  planningStage?: string;
  developerName?: string;
  projectedSizeAfter?: string | number;
  estimatedValue?: number;
  estimatedRent?: number;
  // PropertyDamageEvent fields
  damageType?: string;
  estimatedDamageCost?: number;
  expenseId?: string;
  // ExpenseEvent fields
  expenseType?: string;
  amount?: number;
  paidToAccountId?: string;
  affectsPropertyValue?: boolean;
  // RentalPaymentRequestEvent fields
  rentalAgreementId?: string;
  month?: number;
  year?: number;
  amountDue?: number;
  paymentDate?: Date;
  paymentStatus?: PaymentStatus | RentalPaymentStatus;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Virtual populated fields
  property?: Property;
  rentalAgreement?: RentalAgreement;
  paidToAccount?: BankAccount;
  linkedExpense?: PropertyEvent;
}

export interface PlanningProcessState {
  id: string;
  propertyId: string;
  stateType: string;
  lastUpdateDate: Date;
  developerName?: string;
  projectedSizeAfter?: string | number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UtilityInfo {
  id: string;
  propertyId: string;
  arnonaAccountNumber?: string;
  electricityAccountNumber?: string;
  waterAccountNumber?: string;
  vaadBayitName?: string;
  waterMeterNumber?: string;
  electricityMeterNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Paginated response */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
