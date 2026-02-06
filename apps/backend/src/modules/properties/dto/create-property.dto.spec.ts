import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePropertyDto } from './create-property.dto';
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

describe('CreatePropertyDto', () => {
  let dto: CreatePropertyDto;

  beforeEach(() => {
    dto = new CreatePropertyDto();
  });

  describe('Required Fields', () => {
    it('should fail validation when address is missing', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'address')).toBe(true);
    });

    it('should pass validation when address is provided', async () => {
      dto.address = 'Test Address';
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'address')).toHaveLength(0);
    });
  });

  describe('Optional Fields', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should accept all optional fields', async () => {
      dto.fileNumber = '12345';
      dto.gush = '6158';
      dto.helka = '371';
      dto.isMortgaged = true;
      dto.type = PropertyType.RESIDENTIAL;
      dto.status = PropertyStatus.OWNED;
      dto.country = 'Israel';
      dto.city = 'Tel Aviv';
      dto.totalArea = 120.5;
      dto.landArea = 200.0;
      dto.estimatedValue = 2500000;
      dto.lastValuationDate = '2024-01-15T00:00:00.000Z';
      dto.notes = 'Test notes';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Numeric Fields Validation', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should reject negative totalArea', async () => {
      dto.totalArea = -10;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'totalArea')).toBe(true);
    });

    it('should reject negative landArea', async () => {
      dto.landArea = -10;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'landArea')).toBe(true);
    });

    it('should reject negative estimatedValue', async () => {
      dto.estimatedValue = -1000;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'estimatedValue')).toBe(true);
    });

    it('should reject negative floors', async () => {
      dto.floors = -1;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'floors')).toBe(true);
    });

    it('should reject negative totalUnits', async () => {
      dto.totalUnits = -1;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'totalUnits')).toBe(true);
    });

    it('should reject negative parkingSpaces', async () => {
      dto.parkingSpaces = -1;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'parkingSpaces')).toBe(true);
    });

    it('should reject negative acquisitionPrice', async () => {
      dto.acquisitionPrice = -1000;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'acquisitionPrice')).toBe(true);
    });

    it('should reject negative salePrice', async () => {
      dto.salePrice = -1000;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'salePrice')).toBe(true);
    });

    it('should reject negative managementFees', async () => {
      dto.managementFees = -100;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'managementFees')).toBe(true);
    });

    it('should reject negative taxAmount', async () => {
      dto.taxAmount = -100;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'taxAmount')).toBe(true);
    });
  });

  describe('Percentage Fields Validation', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should reject sharedOwnershipPercentage < 0', async () => {
      dto.sharedOwnershipPercentage = -1;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'sharedOwnershipPercentage')).toBe(true);
    });

    it('should reject sharedOwnershipPercentage > 100', async () => {
      dto.sharedOwnershipPercentage = 101;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'sharedOwnershipPercentage')).toBe(true);
    });

    it('should accept sharedOwnershipPercentage between 0 and 100', async () => {
      dto.sharedOwnershipPercentage = 50.5;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'sharedOwnershipPercentage')).toHaveLength(0);
    });
  });

  describe('Year Fields Validation', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should reject constructionYear < 1800', async () => {
      dto.constructionYear = 1799;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'constructionYear')).toBe(true);
    });

    it('should reject constructionYear > 2100', async () => {
      dto.constructionYear = 2101;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'constructionYear')).toBe(true);
    });

    it('should accept valid constructionYear', async () => {
      dto.constructionYear = 2010;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'constructionYear')).toHaveLength(0);
    });

    it('should reject lastRenovationYear < 1800', async () => {
      dto.lastRenovationYear = 1799;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'lastRenovationYear')).toBe(true);
    });

    it('should reject lastRenovationYear > 2100', async () => {
      dto.lastRenovationYear = 2101;
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'lastRenovationYear')).toBe(true);
    });
  });

  describe('Enum Fields Validation', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should accept valid PropertyType', async () => {
      dto.type = PropertyType.RESIDENTIAL;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'type')).toHaveLength(0);
    });

    it('should accept valid PropertyStatus', async () => {
      dto.status = PropertyStatus.OWNED;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'status')).toHaveLength(0);
    });

    it('should accept valid AcquisitionMethod', async () => {
      dto.acquisitionMethod = AcquisitionMethod.PURCHASE;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'acquisitionMethod')).toHaveLength(0);
    });

    it('should accept valid LegalStatus', async () => {
      dto.legalStatus = LegalStatus.REGISTERED;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'legalStatus')).toHaveLength(0);
    });

    it('should accept valid PropertyCondition', async () => {
      dto.propertyCondition = PropertyCondition.EXCELLENT;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'propertyCondition')).toHaveLength(0);
    });

    it('should accept valid LandType', async () => {
      dto.landType = LandType.URBAN;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'landType')).toHaveLength(0);
    });

    it('should accept valid ManagementFeeFrequency', async () => {
      dto.managementFeeFrequency = ManagementFeeFrequency.MONTHLY;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'managementFeeFrequency')).toHaveLength(0);
    });

    it('should accept valid TaxFrequency', async () => {
      dto.taxFrequency = TaxFrequency.QUARTERLY;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'taxFrequency')).toHaveLength(0);
    });

    it('should accept valid EstimationSource', async () => {
      dto.estimationSource = EstimationSource.PROFESSIONAL_APPRAISAL;
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'estimationSource')).toHaveLength(0);
    });
  });

  describe('Date Fields Validation', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should accept valid ISO date strings', async () => {
      dto.acquisitionDate = '2020-01-15T00:00:00.000Z';
      dto.saleDate = '2023-06-15T00:00:00.000Z';
      dto.registrationDate = '2020-01-15T00:00:00.000Z';
      dto.lastTaxPayment = '2024-01-15T00:00:00.000Z';
      dto.insuranceExpiry = '2025-12-31T00:00:00.000Z';
      dto.lastValuationDate = '2024-01-15T00:00:00.000Z';

      const errors = await validate(dto);
      expect(errors.filter((e) => e.constraints?.isDateString)).toHaveLength(0);
    });

    it('should reject invalid date strings', async () => {
      dto.acquisitionDate = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'acquisitionDate')).toBe(true);
    });
  });

  describe('Boolean Fields', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should accept boolean values', async () => {
      dto.isMortgaged = true;
      dto.isPartialOwnership = false;
      dto.isSold = true;

      const errors = await validate(dto);
      expect(errors.filter((e) => 
        ['isMortgaged', 'isPartialOwnership', 'isSold'].includes(e.property)
      )).toHaveLength(0);
    });
  });

  describe('String Fields', () => {
    beforeEach(() => {
      dto.address = 'Test Address';
    });

    it('should accept all string fields', async () => {
      dto.fileNumber = '12345';
      dto.gush = '6158';
      dto.helka = '371';
      dto.cadastralNumber = '12345-67';
      dto.taxId = '123456789';
      dto.buildingPermitNumber = '12345/2020';
      dto.landDesignation = 'מגורים';
      dto.propertyManager = 'יוסי כהן';
      dto.managementCompany = 'חברת ניהול בע"מ';
      dto.insuranceDetails = 'ביטוח מבנה ומקיף';
      dto.zoning = 'מגורים';
      dto.utilities = 'חשמל, מים, ביוב, גז';
      dto.restrictions = 'אין הגבלות';
      dto.notes = 'Test notes';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Complete Property Creation', () => {
    it('should accept all fields together', async () => {
      const completeDto = plainToInstance(CreatePropertyDto, {
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: '12345',
        gush: '6158',
        helka: '371',
        isMortgaged: false,
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        country: 'Israel',
        city: 'תל אביב',
        totalArea: 120.5,
        landArea: 200.0,
        estimatedValue: 2500000,
        lastValuationDate: '2024-01-15T00:00:00.000Z',
        floors: 3,
        totalUnits: 12,
        parkingSpaces: 5,
        acquisitionPrice: 2000000,
        acquisitionDate: '2020-01-15T00:00:00.000Z',
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        cadastralNumber: '12345-67',
        taxId: '123456789',
        registrationDate: '2020-01-15T00:00:00.000Z',
        legalStatus: LegalStatus.REGISTERED,
        constructionYear: 2010,
        lastRenovationYear: 2020,
        buildingPermitNumber: '12345/2020',
        propertyCondition: PropertyCondition.EXCELLENT,
        landType: LandType.URBAN,
        landDesignation: 'מגורים',
        isPartialOwnership: false,
        sharedOwnershipPercentage: 50.5,
        isSold: false,
        propertyManager: 'יוסי כהן',
        managementCompany: 'חברת ניהול בע"מ',
        managementFees: 500,
        managementFeeFrequency: ManagementFeeFrequency.MONTHLY,
        taxAmount: 1200,
        taxFrequency: TaxFrequency.QUARTERLY,
        lastTaxPayment: '2024-01-15T00:00:00.000Z',
        insuranceDetails: 'ביטוח מבנה ומקיף',
        insuranceExpiry: '2025-12-31T00:00:00.000Z',
        zoning: 'מגורים',
        utilities: 'חשמל, מים, ביוב, גז',
        restrictions: 'אין הגבלות',
        estimationSource: EstimationSource.PROFESSIONAL_APPRAISAL,
        notes: 'Test notes',
      });

      const errors = await validate(completeDto);
      expect(errors).toHaveLength(0);
    });
  });
});
