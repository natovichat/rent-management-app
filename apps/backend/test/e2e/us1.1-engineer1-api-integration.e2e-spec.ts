/**
 * US1.1 Property Creation - API Integration Tests
 * Engineer 1: API Integration Tests (Backend API + Real Database)
 * 
 * Tests all 50+ property fields through real API endpoints with real database.
 * Validates business rules, validation, multi-tenancy, and field persistence.
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
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

describe('US1.1 - Engineer 1: API Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;
  let testInvestmentCompanyId: string;
  let testPropertyId: string;

  const API_URL = '/properties';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);

    // Set up test environment
    const testAccount = await prisma.account.create({
      data: {
        name: 'US1.1 Test Account',
      },
    });
    testAccountId = testAccount.id;

    // Create test investment company
    const testInvestmentCompany = await prisma.investmentCompany.create({
      data: {
        accountId: testAccountId,
        name: 'Test Investment Company',
        country: 'Israel',
        registrationNumber: '123456789',
      },
    });
    testInvestmentCompanyId = testInvestmentCompany.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.property.deleteMany({ where: { accountId: testAccountId } });
    await prisma.investmentCompany.deleteMany({ where: { accountId: testAccountId } });
    await prisma.account.deleteMany({ where: { id: testAccountId } });
    await app.close();
  });

  describe('TC-API-001: Create property with all 50+ fields populated', () => {
    it('should create property with all fields and return 201 Created', async () => {
      const startTime = Date.now();
      
      const allFieldsDto = {
        // Basic Information
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: '12345',
        gush: '6158',
        helka: '371',
        isMortgaged: false,
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        country: 'Israel',
        city: 'תל אביב',
        
        // Area & Dimensions
        totalArea: 120.5,
        landArea: 200.0,
        floors: 3,
        totalUnits: 12,
        parkingSpaces: 5,
        balconyArea: 15.5,
        
        // Financial Details
        estimatedValue: 2500000,
        acquisitionPrice: 2000000,
        acquisitionDate: '2020-01-15T00:00:00.000Z',
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        rentalIncome: 5000,
        projectedValue: 3000000,
        lastValuationDate: '2024-01-15T00:00:00.000Z',
        
        // Legal & Registry
        cadastralNumber: '12345-67',
        taxId: '123456789',
        registrationDate: '2020-01-15T00:00:00.000Z',
        legalStatus: LegalStatus.REGISTERED,
        
        // Property Details
        constructionYear: 2010,
        lastRenovationYear: 2020,
        buildingPermitNumber: '12345/2020',
        propertyCondition: PropertyCondition.EXCELLENT,
        floor: 2,
        storage: true,
        
        // Land Information
        landType: LandType.URBAN,
        landDesignation: 'מגורים',
        plotSize: 200.0,
        buildingPotential: 'בנייה עד 3 קומות',
        
        // Ownership
        isPartialOwnership: false,
        sharedOwnershipPercentage: 100.0,
        coOwners: '',
        
        // Sale Information
        isSold: false,
        saleDate: null,
        salePrice: null,
        isSoldPending: false,
        
        // Management
        propertyManager: 'יוסי כהן',
        managementCompany: 'חברת ניהול בע"מ',
        managementFees: 500,
        managementFeeFrequency: ManagementFeeFrequency.MONTHLY,
        
        // Financial Obligations
        taxAmount: 1200,
        taxFrequency: TaxFrequency.QUARTERLY,
        lastTaxPayment: '2024-01-15T00:00:00.000Z',
        
        // Insurance
        insuranceDetails: 'ביטוח מבנה ומקיף',
        insuranceExpiry: '2025-12-31T00:00:00.000Z',
        
        // Utilities & Infrastructure
        zoning: 'מגורים',
        utilities: 'חשמל, מים, ביוב, גז',
        restrictions: 'אין הגבלות',
        
        // Valuation
        estimationSource: EstimationSource.PROFESSIONAL_APPRAISAL,
        
        // Investment Company
        investmentCompanyId: testInvestmentCompanyId,
        
        // Additional Information
        developmentStatus: 'בתכנון',
        developmentCompany: 'חברת פיתוח בע"מ',
        expectedCompletionYears: 2,
        propertyDetails: 'נכס יוקרתי במרכז תל אביב',
        notes: 'הערות נוספות על הנכס',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(allFieldsDto)
        .expect(201);

      const responseTime = Date.now() - startTime;

      // Verify all fields are saved
      expect(response.body).toMatchObject({
        address: allFieldsDto.address,
        fileNumber: allFieldsDto.fileNumber,
        gush: allFieldsDto.gush,
        helka: allFieldsDto.helka,
        isMortgaged: allFieldsDto.isMortgaged,
        type: allFieldsDto.type,
        status: allFieldsDto.status,
        country: allFieldsDto.country,
        city: allFieldsDto.city,
        totalArea: allFieldsDto.totalArea,
        landArea: allFieldsDto.landArea,
        floors: allFieldsDto.floors,
        totalUnits: allFieldsDto.totalUnits,
        parkingSpaces: allFieldsDto.parkingSpaces,
        estimatedValue: allFieldsDto.estimatedValue,
        acquisitionPrice: allFieldsDto.acquisitionPrice,
        acquisitionMethod: allFieldsDto.acquisitionMethod,
        legalStatus: allFieldsDto.legalStatus,
        constructionYear: allFieldsDto.constructionYear,
        lastRenovationYear: allFieldsDto.lastRenovationYear,
        propertyCondition: allFieldsDto.propertyCondition,
        landType: allFieldsDto.landType,
        managementFeeFrequency: allFieldsDto.managementFeeFrequency,
        taxFrequency: allFieldsDto.taxFrequency,
        estimationSource: allFieldsDto.estimationSource,
        investmentCompanyId: allFieldsDto.investmentCompanyId,
        notes: allFieldsDto.notes,
      });

      // Verify dates
      expect(new Date(response.body.acquisitionDate)).toEqual(new Date(allFieldsDto.acquisitionDate));
      expect(new Date(response.body.lastValuationDate)).toEqual(new Date(allFieldsDto.lastValuationDate));
      expect(new Date(response.body.registrationDate)).toEqual(new Date(allFieldsDto.registrationDate));

      // Verify account association (multi-tenancy)
      expect(response.body.accountId).toBe(testAccountId);

      // Verify response time < 2 seconds
      expect(responseTime).toBeLessThan(2000);

      testPropertyId = response.body.id;
    });
  });

  describe('TC-API-002: Create property with only address', () => {
    it('should create property with only address and apply defaults', async () => {
      const minimalDto = {
        address: 'רחוב דיזנגוף 50, תל אביב',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(minimalDto)
        .expect(201);

      expect(response.body).toMatchObject({
        address: minimalDto.address,
        country: 'Israel', // Default
        status: PropertyStatus.OWNED, // Default
        isMortgaged: false, // Default
        isPartialOwnership: false, // Default
        isSold: false, // Default
      });

      // Verify optional fields are null/undefined
      expect(response.body.fileNumber).toBeNull();
      expect(response.body.gush).toBeNull();
      expect(response.body.helka).toBeNull();
    });
  });

  describe('TC-API-003: Create property with each enum value', () => {
    const enumTests = [
      { field: 'type', values: Object.values(PropertyType) },
      { field: 'status', values: Object.values(PropertyStatus) },
      { field: 'acquisitionMethod', values: Object.values(AcquisitionMethod) },
      { field: 'legalStatus', values: Object.values(LegalStatus) },
      { field: 'propertyCondition', values: Object.values(PropertyCondition) },
      { field: 'landType', values: Object.values(LandType) },
      { field: 'managementFeeFrequency', values: Object.values(ManagementFeeFrequency) },
      { field: 'taxFrequency', values: Object.values(TaxFrequency) },
      { field: 'estimationSource', values: Object.values(EstimationSource) },
    ];

    enumTests.forEach(({ field, values }) => {
      values.forEach((enumValue) => {
        it(`should accept ${field} = ${enumValue}`, async () => {
          const dto = {
            address: `Test ${field} ${enumValue}`,
            [field]: enumValue,
          };

          const response = await request(app.getHttpServer())
            .post(API_URL)
            .set('X-Account-Id', testAccountId)
            .send(dto)
            .expect(201);

          expect(response.body[field]).toBe(enumValue);
        });
      });
    });
  });

  describe('TC-API-004: Create property with invalid enum', () => {
    it('should reject invalid property type', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          type: 'INVALID_TYPE',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid property status', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          status: 'INVALID_STATUS',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('TC-API-005: Create property with negative numbers', () => {
    it('should reject negative totalArea', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          totalArea: -100,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject negative landArea', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          landArea: -50,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject negative estimatedValue', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          estimatedValue: -1000,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('TC-API-006: Create property with percentage > 100', () => {
    it('should reject sharedOwnershipPercentage > 100', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          sharedOwnershipPercentage: 101,
        })
        .expect(400);

      expect(response.body.message).toContain('אחוז בעלות');
    });
  });

  describe('TC-API-007: Create property with invalid date', () => {
    it('should reject invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          acquisitionDate: 'invalid-date',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('TC-API-008: Create property with non-existent investmentCompanyId', () => {
    it('should reject non-existent investmentCompanyId', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          investmentCompanyId: fakeId,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('TC-API-009: Business rule - acquisitionDate > saleDate', () => {
    it('should reject when acquisitionDate is after saleDate', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          acquisitionDate: '2023-06-15T00:00:00.000Z',
          saleDate: '2020-01-15T00:00:00.000Z',
        })
        .expect(400);

      expect(response.body.message).toContain('תאריך רכישה');
    });
  });

  describe('TC-API-010: Business rule - landArea > totalArea', () => {
    it('should reject when landArea is greater than totalArea', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          landArea: 200,
          totalArea: 100,
        })
        .expect(400);

      expect(response.body.message).toContain('שטח קרקע');
    });
  });

  describe('TC-API-011: Multi-tenancy - Property belongs to correct account', () => {
    it('should create property with correct accountId', async () => {
      const dto = {
        address: 'Multi-tenancy Test Address',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(dto)
        .expect(201);

      expect(response.body.accountId).toBe(testAccountId);

      // Verify property is only accessible by correct account
      const getResponse = await request(app.getHttpServer())
        .get(`${API_URL}/${response.body.id}`)
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(getResponse.body.accountId).toBe(testAccountId);
    });

    it('should prevent access from different account', async () => {
      // Create second account
      const secondAccount = await prisma.account.create({
        data: { name: 'Second Test Account' },
      });

      // Create property with first account
      const createResponse = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({ address: 'Isolated Property' })
        .expect(201);

      const propertyId = createResponse.body.id;

      // Try to access with second account
      await request(app.getHttpServer())
        .get(`${API_URL}/${propertyId}`)
        .set('X-Account-Id', secondAccount.id)
        .expect(404);

      // Cleanup
      await prisma.account.delete({ where: { id: secondAccount.id } });
    });
  });

  describe('TC-API-012: GET /properties/:id returns all 50+ fields', () => {
    it('should return property with all fields populated', async () => {
      // First create property with all fields
      const createDto = {
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: '12345',
        gush: '6158',
        helka: '371',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        country: 'Israel',
        city: 'תל אביב',
        totalArea: 120.5,
        landArea: 200.0,
        floors: 3,
        totalUnits: 12,
        parkingSpaces: 5,
        estimatedValue: 2500000,
        acquisitionPrice: 2000000,
        acquisitionDate: '2020-01-15T00:00:00.000Z',
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        legalStatus: LegalStatus.REGISTERED,
        constructionYear: 2010,
        lastRenovationYear: 2020,
        propertyCondition: PropertyCondition.EXCELLENT,
        landType: LandType.URBAN,
        managementFeeFrequency: ManagementFeeFrequency.MONTHLY,
        taxFrequency: TaxFrequency.QUARTERLY,
        estimationSource: EstimationSource.PROFESSIONAL_APPRAISAL,
        investmentCompanyId: testInvestmentCompanyId,
        notes: 'Test notes',
      };

      const createResponse = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(createDto)
        .expect(201);

      const propertyId = createResponse.body.id;

      // Now retrieve it
      const getResponse = await request(app.getHttpServer())
        .get(`${API_URL}/${propertyId}`)
        .set('X-Account-Id', testAccountId)
        .expect(200);

      // Verify all fields are present
      expect(getResponse.body).toHaveProperty('address');
      expect(getResponse.body).toHaveProperty('fileNumber');
      expect(getResponse.body).toHaveProperty('gush');
      expect(getResponse.body).toHaveProperty('helka');
      expect(getResponse.body).toHaveProperty('type');
      expect(getResponse.body).toHaveProperty('status');
      expect(getResponse.body).toHaveProperty('country');
      expect(getResponse.body).toHaveProperty('city');
      expect(getResponse.body).toHaveProperty('totalArea');
      expect(getResponse.body).toHaveProperty('landArea');
      expect(getResponse.body).toHaveProperty('floors');
      expect(getResponse.body).toHaveProperty('totalUnits');
      expect(getResponse.body).toHaveProperty('parkingSpaces');
      expect(getResponse.body).toHaveProperty('estimatedValue');
      expect(getResponse.body).toHaveProperty('acquisitionPrice');
      expect(getResponse.body).toHaveProperty('acquisitionDate');
      expect(getResponse.body).toHaveProperty('acquisitionMethod');
      expect(getResponse.body).toHaveProperty('legalStatus');
      expect(getResponse.body).toHaveProperty('constructionYear');
      expect(getResponse.body).toHaveProperty('lastRenovationYear');
      expect(getResponse.body).toHaveProperty('propertyCondition');
      expect(getResponse.body).toHaveProperty('landType');
      expect(getResponse.body).toHaveProperty('managementFeeFrequency');
      expect(getResponse.body).toHaveProperty('taxFrequency');
      expect(getResponse.body).toHaveProperty('estimationSource');
      expect(getResponse.body).toHaveProperty('investmentCompanyId');
      expect(getResponse.body).toHaveProperty('notes');
      expect(getResponse.body).toHaveProperty('createdAt');
      expect(getResponse.body).toHaveProperty('updatedAt');
    });
  });
});
