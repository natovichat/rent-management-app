import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PropertyType,
  PropertyStatus,
  AcquisitionMethod,
  LegalStatus,
  PropertyCondition,
  LandType,
  ManagementFeeFrequency,
  TaxFrequency,
  EstimationSource,
} from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Account ID (for multi-account support)',
    example: '00000000-0000-0000-0000-000000000001',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiProperty({
    description: 'כתובת הנכס',
    example: 'רחוב הרצל 10, תל אביב',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'מספר תיק',
    example: '12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileNumber?: string;

  @ApiProperty({
    description: 'גוש',
    example: '6158',
    required: false,
  })
  @IsString()
  @IsOptional()
  gush?: string;

  @ApiProperty({
    description: 'חלקה',
    example: '371',
    required: false,
  })
  @IsString()
  @IsOptional()
  helka?: string;

  @ApiProperty({
    description: 'האם הנכס משועבד',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isMortgaged?: boolean;

  @ApiProperty({
    description: 'סוג הנכס',
    enum: PropertyType,
    required: false,
  })
  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;

  @ApiProperty({
    description: 'סטטוס הנכס',
    enum: PropertyStatus,
    required: false,
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiProperty({
    description: 'מדינה',
    example: 'Israel',
    required: false,
    default: 'Israel',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'עיר',
    example: 'תל אביב',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'שטח כולל (מ"ר)',
    example: 120.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalArea?: number;

  @ApiProperty({
    description: 'שטח קרקע (מ"ר)',
    example: 200.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  landArea?: number;

  @ApiProperty({
    description: 'שווי משוער (₪)',
    example: 2500000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  estimatedValue?: number;

  @ApiProperty({
    description: 'תאריך הערכת שווי אחרונה',
    example: '2024-01-15T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  lastValuationDate?: string;

  @ApiProperty({
    description: 'מזהה חברת השקעה',
    example: 'uuid-string',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  investmentCompanyId?: string;

  @ApiProperty({
    description: 'הערות',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  // Area & Dimensions
  @ApiProperty({
    description: 'מספר קומות',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  floors?: number;

  @ApiProperty({
    description: 'מספר יחידות כולל',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  totalUnits?: number;

  @ApiProperty({
    description: 'מספר מקומות חניה',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  parkingSpaces?: number;

  // Financial
  @ApiProperty({
    description: 'מחיר רכישה (₪)',
    example: 2000000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  acquisitionPrice?: number;

  @ApiProperty({
    description: 'תאריך רכישה',
    example: '2020-01-15T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  acquisitionDate?: string;

  @ApiProperty({
    description: 'שיטת רכישה',
    enum: AcquisitionMethod,
    required: false,
  })
  @IsEnum(AcquisitionMethod, {
    message: 'שיטת רכישה חייבת להיות אחת מהערכים: PURCHASE, INHERITANCE, GIFT, EXCHANGE, OTHER',
  })
  @IsOptional()
  acquisitionMethod?: AcquisitionMethod;

  @ApiProperty({
    description: 'הכנסה משכירות (₪ לחודש)',
    example: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rentalIncome?: number;

  @ApiProperty({
    description: 'שווי צפוי (₪)',
    example: 3000000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  projectedValue?: number;

  // Legal & Registry
  @ApiProperty({
    description: 'מספר קדסטרלי',
    example: '12345-67',
    required: false,
  })
  @IsString()
  @IsOptional()
  cadastralNumber?: string;

  @ApiProperty({
    description: 'מספר זהות מס',
    example: '123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    description: 'תאריך רישום',
    example: '2020-01-15T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  registrationDate?: string;

  @ApiProperty({
    description: 'סטטוס משפטי',
    enum: LegalStatus,
    required: false,
  })
  @IsEnum(LegalStatus, {
    message: 'סטטוס משפטי חייב להיות אחד מהערכים: REGISTERED, IN_REGISTRATION, DISPUTED, CLEAR',
  })
  @IsOptional()
  legalStatus?: LegalStatus;

  // Property Details
  @ApiProperty({
    description: 'שנת בנייה',
    example: 2010,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  @Type(() => Number)
  constructionYear?: number;

  @ApiProperty({
    description: 'שנת שיפוץ אחרונה',
    example: 2020,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  @Type(() => Number)
  lastRenovationYear?: number;

  @ApiProperty({
    description: 'מספר היתר בנייה',
    example: '12345/2020',
    required: false,
  })
  @IsString()
  @IsOptional()
  buildingPermitNumber?: string;

  @ApiProperty({
    description: 'מצב הנכס',
    enum: PropertyCondition,
    required: false,
  })
  @IsEnum(PropertyCondition, {
    message: 'מצב הנכס חייב להיות אחד מהערכים: EXCELLENT, GOOD, FAIR, NEEDS_RENOVATION',
  })
  @IsOptional()
  propertyCondition?: PropertyCondition;

  // Land Information
  @ApiProperty({
    description: 'סוג קרקע',
    enum: LandType,
    required: false,
  })
  @IsEnum(LandType, {
    message: 'סוג קרקע חייב להיות אחד מהערכים: URBAN, AGRICULTURAL, INDUSTRIAL, MIXED',
  })
  @IsOptional()
  landType?: LandType;

  @ApiProperty({
    description: 'ייעוד קרקע',
    example: 'מגורים',
    required: false,
  })
  @IsString()
  @IsOptional()
  landDesignation?: string;

  // Ownership
  @ApiProperty({
    description: 'האם בעלות חלקית',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPartialOwnership?: boolean;

  @ApiProperty({
    description: 'אחוז בעלות משותפת (0-100)',
    example: 50.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  sharedOwnershipPercentage?: number;

  // Sale Information
  @ApiProperty({
    description: 'האם נמכר',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSold?: boolean;

  @ApiProperty({
    description: 'תאריך מכירה',
    example: '2023-06-15T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  saleDate?: string;

  @ApiProperty({
    description: 'מחיר מכירה (₪)',
    example: 3000000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  salePrice?: number;

  // Management
  @ApiProperty({
    description: 'מנהל נכס',
    example: 'יוסי כהן',
    required: false,
  })
  @IsString()
  @IsOptional()
  propertyManager?: string;

  @ApiProperty({
    description: 'חברת ניהול',
    example: 'חברת ניהול בע"מ',
    required: false,
  })
  @IsString()
  @IsOptional()
  managementCompany?: string;

  @ApiProperty({
    description: 'דמי ניהול (₪)',
    example: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  managementFees?: number;

  @ApiProperty({
    description: 'תדירות תשלום דמי ניהול',
    enum: ManagementFeeFrequency,
    required: false,
  })
  @IsEnum(ManagementFeeFrequency, {
    message: 'תדירות תשלום דמי ניהול חייבת להיות אחת מהערכים: MONTHLY, QUARTERLY, ANNUAL',
  })
  @IsOptional()
  managementFeeFrequency?: ManagementFeeFrequency;

  // Financial Obligations
  @ApiProperty({
    description: 'סכום מס (₪)',
    example: 1200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxAmount?: number;

  @ApiProperty({
    description: 'תדירות תשלום מס',
    enum: TaxFrequency,
    required: false,
  })
  @IsEnum(TaxFrequency, {
    message: 'תדירות תשלום מס חייבת להיות אחת מהערכים: MONTHLY, QUARTERLY, ANNUAL',
  })
  @IsOptional()
  taxFrequency?: TaxFrequency;

  @ApiProperty({
    description: 'תאריך תשלום מס אחרון',
    example: '2024-01-15T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  lastTaxPayment?: string;

  // Insurance
  @ApiProperty({
    description: 'פרטי ביטוח',
    example: 'ביטוח מבנה ומקיף',
    required: false,
  })
  @IsString()
  @IsOptional()
  insuranceDetails?: string;

  @ApiProperty({
    description: 'תאריך תפוגת ביטוח',
    example: '2025-12-31T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  // Utilities & Infrastructure
  @ApiProperty({
    description: 'ייעוד (תכנון)',
    example: 'מגורים',
    required: false,
  })
  @IsString()
  @IsOptional()
  zoning?: string;

  @ApiProperty({
    description: 'תשתיות',
    example: 'חשמל, מים, ביוב, גז',
    required: false,
  })
  @IsString()
  @IsOptional()
  utilities?: string;

  @ApiProperty({
    description: 'הגבלות',
    example: 'אין הגבלות',
    required: false,
  })
  @IsString()
  @IsOptional()
  restrictions?: string;

  // Valuation
  @ApiProperty({
    description: 'מקור הערכת שווי',
    enum: EstimationSource,
    required: false,
  })
  @IsEnum(EstimationSource, {
    message: 'מקור הערכת שווי חייב להיות אחד מהערכים: PROFESSIONAL_APPRAISAL, MARKET_ESTIMATE, TAX_ASSESSMENT, OWNER_ESTIMATE',
  })
  @IsOptional()
  estimationSource?: EstimationSource;
}
