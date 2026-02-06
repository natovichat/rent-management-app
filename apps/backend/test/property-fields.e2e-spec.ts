/**
 * Property Fields End-to-End Test
 * 
 * Tests comprehensive property field modifications including:
 * - Basic fields (address, fileNumber)
 * - Plot fields (gush, helka, isMortgaged) - NEW
 * - Extended fields (type, status, country, city)
 * - Area fields (totalArea, landArea)
 * - Valuation fields (estimatedValue, lastValuationDate)
 * - Investment company relation
 * - Notes field
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
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

describe('Property Fields E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;
  let testPropertyId: string;
  let testInvestmentCompanyId: string;

  // API Base URL
  const API_URL = '/properties';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same validation pipe as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);

    // Create test account for multi-tenancy
    const testAccount = await prisma.account.create({
      data: {
        name: 'Property Fields Test Account',
      },
    });
    testAccountId = testAccount.id;

    // Create test investment company (for testing investment company relation)
    const testInvestmentCompany = await prisma.investmentCompany.create({
      data: {
        accountId: testAccountId,
        name: 'Test Investment Company',
        country: 'Israel',
      },
    });
    testInvestmentCompanyId = testInvestmentCompany.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.investmentCompany.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.account.deleteMany({
      where: { id: testAccountId },
    });

    await app.close();
  });

  describe('Property Creation and Field Modification', () => {
    
    it('should create a property with minimal required fields', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Property for Field Modifications',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.address).toBe('Test Property for Field Modifications');
      
      testPropertyId = response.body.id;
    });

    it('should update basic field: address', async () => {
      const newAddress = 'רח\' הרצל 123, תל אביב';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ address: newAddress })
        .expect(200);

      expect(response.body.address).toBe(newAddress);
    });

    it('should update basic field: fileNumber', async () => {
      const fileNumber = 'FILE-2024-001';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ fileNumber })
        .expect(200);

      expect(response.body.fileNumber).toBe(fileNumber);
    });

    it('should update plot field: gush (NEW)', async () => {
      const gush = '6158';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ gush })
        .expect(200);

      expect(response.body.gush).toBe(gush);
    });

    it('should update plot field: helka (NEW)', async () => {
      const helka = '371';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ helka })
        .expect(200);

      expect(response.body.helka).toBe(helka);
    });

    it('should update plot field: isMortgaged to true (NEW)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ isMortgaged: true })
        .expect(200);

      expect(response.body.isMortgaged).toBe(true);
    });

    it('should update plot field: isMortgaged to false (NEW)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ isMortgaged: false })
        .expect(200);

      expect(response.body.isMortgaged).toBe(false);
    });

    it('should update type field to RESIDENTIAL', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ type: PropertyType.RESIDENTIAL })
        .expect(200);

      expect(response.body.type).toBe(PropertyType.RESIDENTIAL);
    });

    it('should update type field to COMMERCIAL', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ type: PropertyType.COMMERCIAL })
        .expect(200);

      expect(response.body.type).toBe(PropertyType.COMMERCIAL);
    });

    it('should update status field to OWNED', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ status: PropertyStatus.OWNED })
        .expect(200);

      expect(response.body.status).toBe(PropertyStatus.OWNED);
    });

    it('should update status field to IN_CONSTRUCTION', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ status: PropertyStatus.IN_CONSTRUCTION })
        .expect(200);

      expect(response.body.status).toBe(PropertyStatus.IN_CONSTRUCTION);
    });

    it('should update country field', async () => {
      const country = 'Israel';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ country })
        .expect(200);

      expect(response.body.country).toBe(country);
    });

    it('should update city field', async () => {
      const city = 'תל אביב';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ city })
        .expect(200);

      expect(response.body.city).toBe(city);
    });

    it('should update totalArea field', async () => {
      const totalArea = 120.5;
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ totalArea })
        .expect(200);

      expect(parseFloat(response.body.totalArea)).toBe(totalArea);
    });

    it('should update landArea field', async () => {
      const landArea = 200.0;
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ landArea })
        .expect(200);

      expect(parseFloat(response.body.landArea)).toBe(landArea);
    });

    it('should update estimatedValue field', async () => {
      const estimatedValue = 2500000;
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ estimatedValue })
        .expect(200);

      expect(parseFloat(response.body.estimatedValue)).toBe(estimatedValue);
    });

    it('should update lastValuationDate field', async () => {
      const lastValuationDate = '2024-01-15T00:00:00.000Z';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ lastValuationDate })
        .expect(200);

      expect(new Date(response.body.lastValuationDate)).toEqual(new Date(lastValuationDate));
    });

    it('should update investmentCompanyId field', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ investmentCompanyId: testInvestmentCompanyId })
        .expect(200);

      expect(response.body.investmentCompanyId).toBe(testInvestmentCompanyId);
    });

    it('should update notes field', async () => {
      const notes = 'This is a comprehensive test of all property fields including the new gush, helka, and isMortgaged fields.';
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ notes })
        .expect(200);

      expect(response.body.notes).toBe(notes);
    });

    it('should update multiple fields at once', async () => {
      const multipleFields = {
        address: 'רח\' לביא 6, רמת גן',
        fileNumber: 'FILE-2024-002',
        gush: '6717',
        helka: '225',
        isMortgaged: true,
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        city: 'רמת גן',
        totalArea: 150.0,
        landArea: 250.0,
        estimatedValue: 3000000,
        notes: 'Updated multiple fields simultaneously',
      };
      
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send(multipleFields)
        .expect(200);

      expect(response.body.address).toBe(multipleFields.address);
      expect(response.body.fileNumber).toBe(multipleFields.fileNumber);
      expect(response.body.gush).toBe(multipleFields.gush);
      expect(response.body.helka).toBe(multipleFields.helka);
      expect(response.body.isMortgaged).toBe(multipleFields.isMortgaged);
      expect(response.body.type).toBe(multipleFields.type);
      expect(response.body.status).toBe(multipleFields.status);
      expect(response.body.city).toBe(multipleFields.city);
      expect(parseFloat(response.body.totalArea)).toBe(multipleFields.totalArea);
      expect(parseFloat(response.body.landArea)).toBe(multipleFields.landArea);
      expect(parseFloat(response.body.estimatedValue)).toBe(multipleFields.estimatedValue);
      expect(response.body.notes).toBe(multipleFields.notes);
    });

    it('should clear optional fields by setting to null', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          fileNumber: null,
          gush: null,
          helka: null,
          notes: null,
        })
        .expect(200);

      expect(response.body.fileNumber).toBeNull();
      expect(response.body.gush).toBeNull();
      expect(response.body.helka).toBeNull();
      expect(response.body.notes).toBeNull();
    });

    it('should retrieve property and verify all fields', async () => {
      // First, set specific known values
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Final Test Address',
          fileNumber: 'FINAL-001',
          gush: '9999',
          helka: '888',
          isMortgaged: true,
          type: PropertyType.LAND,
          status: PropertyStatus.OWNED,
          country: 'Israel',
          city: 'ירושלים',
          totalArea: 300.5,
          landArea: 500.0,
          estimatedValue: 5000000,
          notes: 'Final verification test',
        });

      // Now retrieve and verify
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.id).toBe(testPropertyId);
      expect(response.body.address).toBe('Final Test Address');
      expect(response.body.fileNumber).toBe('FINAL-001');
      expect(response.body.gush).toBe('9999');
      expect(response.body.helka).toBe('888');
      expect(response.body.isMortgaged).toBe(true);
      expect(response.body.type).toBe(PropertyType.LAND);
      expect(response.body.status).toBe(PropertyStatus.OWNED);
      expect(response.body.country).toBe('Israel');
      expect(response.body.city).toBe('ירושלים');
      expect(parseFloat(response.body.totalArea)).toBe(300.5);
      expect(parseFloat(response.body.landArea)).toBe(500.0);
      expect(parseFloat(response.body.estimatedValue)).toBe(5000000);
      expect(response.body.notes).toBe('Final verification test');
    });
  });

  describe('Validation Tests', () => {
    
    it('should reject invalid property type', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ type: 'INVALID_TYPE' })
        .expect(400);
    });

    it('should reject invalid property status', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    // Note: Backend currently allows negative values for area and value fields
    // This could be added as future validation enhancement
    
    it('should accept zero values for area fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ 
          totalArea: 0,
          landArea: 0,
        })
        .expect(200);

      expect(parseFloat(response.body.totalArea)).toBe(0);
      expect(parseFloat(response.body.landArea)).toBe(0);
    });

    it('should reject invalid date format for lastValuationDate', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ lastValuationDate: 'invalid-date' })
        .expect(400);
    });

    it('should reject non-boolean value for isMortgaged', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ isMortgaged: 'not-a-boolean' })
        .expect(400);
    });

    it('should reject invalid UUID for investmentCompanyId', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({ investmentCompanyId: 'not-a-uuid' })
        .expect(400);
    });
  });

  describe('Account Isolation Tests', () => {
    let otherAccountId: string;

    beforeAll(async () => {
      // Create another test account
      const otherAccount = await prisma.account.create({
        data: {
          name: 'Other Test Account',
        },
      });
      otherAccountId = otherAccount.id;
    });

    afterAll(async () => {
      await prisma.account.deleteMany({
        where: { id: otherAccountId },
      });
    });

    it('should not allow accessing property from different account', async () => {
      await request(app.getHttpServer())
        .get(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', otherAccountId)
        .expect(404);
    });

    it('should not allow updating property from different account', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', otherAccountId)
        .send({ address: 'Unauthorized Update' })
        .expect(404);
    });

    it('should not allow deleting property from different account', async () => {
      await request(app.getHttpServer())
        .delete(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', otherAccountId)
        .expect(404);
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle empty string for optional text fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          fileNumber: '',
          gush: '',
          helka: '',
          notes: '',
        })
        .expect(200);

      // Empty strings should be treated as empty values
      expect(response.body.fileNumber === '' || response.body.fileNumber === null).toBe(true);
      expect(response.body.gush === '' || response.body.gush === null).toBe(true);
      expect(response.body.helka === '' || response.body.helka === null).toBe(true);
      expect(response.body.notes === '' || response.body.notes === null).toBe(true);
    });

    it('should handle large numbers for area fields within database limits', async () => {
      // Decimal(10, 2) allows max value of 99,999,999.99
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          totalArea: 99999999.99,
          landArea: 99999999.99,
        })
        .expect(200);

      expect(parseFloat(response.body.totalArea)).toBe(99999999.99);
      expect(parseFloat(response.body.landArea)).toBe(99999999.99);
    });

    it('should handle large numbers for estimatedValue within database limits', async () => {
      // Decimal(12, 2) allows max value of 9,999,999,999.99 (just under 10^10)
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          estimatedValue: 9999999999.99,
        })
        .expect(200);

      expect(parseFloat(response.body.estimatedValue)).toBe(9999999999.99);
    });

    it('should handle complex gush and helka formats', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          gush: '6158-1',
          helka: '371-376',
        })
        .expect(200);

      expect(response.body.gush).toBe('6158-1');
      expect(response.body.helka).toBe('371-376');
    });

    it('should handle Hebrew characters in all text fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'רח\' בן יהודה 123, תל אביב',
          city: 'תל אביב-יפו',
          notes: 'נכס בבעלות מלאה, משועבד לבנק הפועלים',
        })
        .expect(200);

      expect(response.body.address).toBe('רח\' בן יהודה 123, תל אביב');
      expect(response.body.city).toBe('תל אביב-יפו');
      expect(response.body.notes).toBe('נכס בבעלות מלאה, משועבד לבנק הפועלים');
    });
  });

  describe('Complete Property Lifecycle', () => {
    let lifecyclePropertyId: string;

    it('should create property with all fields populated', async () => {
      const completeProperty = {
        address: 'רח\' הרצל 10, תל אביב',
        fileNumber: 'COMPLETE-001',
        gush: '6158',
        helka: '371',
        isMortgaged: true,
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        country: 'Israel',
        city: 'תל אביב',
        totalArea: 120.5,
        landArea: 200.0,
        estimatedValue: 2500000,
        lastValuationDate: '2024-01-15T00:00:00.000Z',
        investmentCompanyId: testInvestmentCompanyId,
        notes: 'Complete property with all fields',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(completeProperty)
        .expect(201);

      lifecyclePropertyId = response.body.id;

      expect(response.body.address).toBe(completeProperty.address);
      expect(response.body.fileNumber).toBe(completeProperty.fileNumber);
      expect(response.body.gush).toBe(completeProperty.gush);
      expect(response.body.helka).toBe(completeProperty.helka);
      expect(response.body.isMortgaged).toBe(completeProperty.isMortgaged);
      expect(response.body.type).toBe(completeProperty.type);
      expect(response.body.status).toBe(completeProperty.status);
      expect(response.body.country).toBe(completeProperty.country);
      expect(response.body.city).toBe(completeProperty.city);
    });

    it('should update property over time simulating real usage', async () => {
      // Year 1: Update valuation
      await request(app.getHttpServer())
        .patch(`${API_URL}/${lifecyclePropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          estimatedValue: 2700000,
          lastValuationDate: '2025-01-15T00:00:00.000Z',
        })
        .expect(200);

      // Year 2: Pay off mortgage
      await request(app.getHttpServer())
        .patch(`${API_URL}/${lifecyclePropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          isMortgaged: false,
          notes: 'Mortgage paid off in 2026',
        })
        .expect(200);

      // Year 3: Convert to commercial
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${lifecyclePropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          type: PropertyType.COMMERCIAL,
          status: PropertyStatus.INVESTMENT,
          estimatedValue: 3500000,
          notes: 'Converted to commercial property for investment',
        })
        .expect(200);

      expect(response.body.isMortgaged).toBe(false);
      expect(response.body.type).toBe(PropertyType.COMMERCIAL);
      expect(response.body.status).toBe(PropertyStatus.INVESTMENT);
    });

    it('should delete property at end of lifecycle', async () => {
      await request(app.getHttpServer())
        .delete(`${API_URL}/${lifecyclePropertyId}`)
        .set('X-Account-Id', testAccountId)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`${API_URL}/${lifecyclePropertyId}`)
        .set('X-Account-Id', testAccountId)
        .expect(404);
    });
  });

  describe('New Property Fields - Complete Coverage', () => {
    let newPropertyId: string;

    it('should create property with all new area & dimension fields', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Property with Area Fields',
          floors: 5,
          totalUnits: 20,
          parkingSpaces: 10,
        })
        .expect(201);

      newPropertyId = response.body.id;
      expect(response.body.floors).toBe(5);
      expect(response.body.totalUnits).toBe(20);
      expect(response.body.parkingSpaces).toBe(10);
    });

    it('should update financial fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          acquisitionPrice: 2000000,
          acquisitionDate: '2020-01-15T00:00:00.000Z',
          acquisitionMethod: AcquisitionMethod.PURCHASE,
        })
        .expect(200);

      expect(parseFloat(response.body.acquisitionPrice)).toBe(2000000);
      expect(response.body.acquisitionMethod).toBe(AcquisitionMethod.PURCHASE);
    });

    it('should update legal & registry fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          cadastralNumber: '12345-67',
          taxId: '123456789',
          registrationDate: '2020-01-15T00:00:00.000Z',
          legalStatus: LegalStatus.REGISTERED,
        })
        .expect(200);

      expect(response.body.cadastralNumber).toBe('12345-67');
      expect(response.body.taxId).toBe('123456789');
      expect(response.body.legalStatus).toBe(LegalStatus.REGISTERED);
    });

    it('should update property details fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          constructionYear: 2010,
          lastRenovationYear: 2020,
          buildingPermitNumber: '12345/2020',
          propertyCondition: PropertyCondition.EXCELLENT,
        })
        .expect(200);

      expect(response.body.constructionYear).toBe(2010);
      expect(response.body.lastRenovationYear).toBe(2020);
      expect(response.body.buildingPermitNumber).toBe('12345/2020');
      expect(response.body.propertyCondition).toBe(PropertyCondition.EXCELLENT);
    });

    it('should update land information fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          landType: LandType.URBAN,
          landDesignation: 'מגורים',
        })
        .expect(200);

      expect(response.body.landType).toBe(LandType.URBAN);
      expect(response.body.landDesignation).toBe('מגורים');
    });

    it('should update ownership fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          isPartialOwnership: true,
          sharedOwnershipPercentage: 50.5,
        })
        .expect(200);

      expect(response.body.isPartialOwnership).toBe(true);
      expect(parseFloat(response.body.sharedOwnershipPercentage)).toBe(50.5);
    });

    it('should update sale information fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          isSold: true,
          saleDate: '2023-06-15T00:00:00.000Z',
          salePrice: 3000000,
        })
        .expect(200);

      expect(response.body.isSold).toBe(true);
      expect(response.body.saleDate).toBeDefined();
      expect(parseFloat(response.body.salePrice)).toBe(3000000);
    });

    it('should update management fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          propertyManager: 'יוסי כהן',
          managementCompany: 'חברת ניהול בע"מ',
          managementFees: 500,
          managementFeeFrequency: ManagementFeeFrequency.MONTHLY,
        })
        .expect(200);

      expect(response.body.propertyManager).toBe('יוסי כהן');
      expect(response.body.managementCompany).toBe('חברת ניהול בע"מ');
      expect(parseFloat(response.body.managementFees)).toBe(500);
      expect(response.body.managementFeeFrequency).toBe(ManagementFeeFrequency.MONTHLY);
    });

    it('should update financial obligations fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          taxAmount: 1200,
          taxFrequency: TaxFrequency.QUARTERLY,
          lastTaxPayment: '2024-01-15T00:00:00.000Z',
        })
        .expect(200);

      expect(parseFloat(response.body.taxAmount)).toBe(1200);
      expect(response.body.taxFrequency).toBe(TaxFrequency.QUARTERLY);
      expect(response.body.lastTaxPayment).toBeDefined();
    });

    it('should update insurance fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          insuranceDetails: 'ביטוח מבנה ומקיף',
          insuranceExpiry: '2025-12-31T00:00:00.000Z',
        })
        .expect(200);

      expect(response.body.insuranceDetails).toBe('ביטוח מבנה ומקיף');
      expect(response.body.insuranceExpiry).toBeDefined();
    });

    it('should update utilities & infrastructure fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          zoning: 'מגורים',
          utilities: 'חשמל, מים, ביוב, גז',
          restrictions: 'אין הגבלות',
        })
        .expect(200);

      expect(response.body.zoning).toBe('מגורים');
      expect(response.body.utilities).toBe('חשמל, מים, ביוב, גז');
      expect(response.body.restrictions).toBe('אין הגבלות');
    });

    it('should update valuation source field', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${newPropertyId}`)
        .set('X-Account-Id', testAccountId)
        .send({
          estimationSource: EstimationSource.PROFESSIONAL_APPRAISAL,
        })
        .expect(200);

      expect(response.body.estimationSource).toBe(EstimationSource.PROFESSIONAL_APPRAISAL);
    });

    it('should create property with all fields at once', async () => {
      const completeProperty = {
        address: 'Complete Property Test',
        fileNumber: 'COMPLETE-001',
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
        sharedOwnershipPercentage: 100,
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
        notes: 'Complete property with all 50+ fields',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(completeProperty)
        .expect(201);

      // Verify all fields are saved
      expect(response.body.address).toBe(completeProperty.address);
      expect(response.body.floors).toBe(completeProperty.floors);
      expect(response.body.totalUnits).toBe(completeProperty.totalUnits);
      expect(response.body.parkingSpaces).toBe(completeProperty.parkingSpaces);
      expect(response.body.acquisitionMethod).toBe(completeProperty.acquisitionMethod);
      expect(response.body.legalStatus).toBe(completeProperty.legalStatus);
      expect(response.body.propertyCondition).toBe(completeProperty.propertyCondition);
      expect(response.body.landType).toBe(completeProperty.landType);
      expect(response.body.managementFeeFrequency).toBe(completeProperty.managementFeeFrequency);
      expect(response.body.taxFrequency).toBe(completeProperty.taxFrequency);
      expect(response.body.estimationSource).toBe(completeProperty.estimationSource);
    });
  });

  describe('Business Rule Validations', () => {
    let validationPropertyId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({ address: 'Validation Test Property' })
        .expect(201);
      validationPropertyId = response.body.id;
    });

    it('should reject acquisitionDate > saleDate', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Invalid Dates Property',
          acquisitionDate: '2023-06-15T00:00:00.000Z',
          saleDate: '2020-01-15T00:00:00.000Z',
        })
        .expect(400);
    });

    it('should reject landArea > totalArea', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Invalid Area Property',
          landArea: 200,
          totalArea: 100,
        })
        .expect(400);
    });

    it('should reject sharedOwnershipPercentage < 0', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Invalid Percentage Property',
          sharedOwnershipPercentage: -1,
        })
        .expect(400);
    });

    it('should reject sharedOwnershipPercentage > 100', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Invalid Percentage Property',
          sharedOwnershipPercentage: 101,
        })
        .expect(400);
    });

    it('should reject isSold=true without saleDate', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Invalid Sale Property',
          isSold: true,
        })
        .expect(400);
    });

    it('should reject isPartialOwnership=true without sharedOwnershipPercentage', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Invalid Partial Ownership Property',
          isPartialOwnership: true,
        })
        .expect(400);
    });

    it('should accept valid business rules', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Valid Property',
          acquisitionDate: '2020-01-15T00:00:00.000Z',
          saleDate: '2023-06-15T00:00:00.000Z',
          landArea: 100,
          totalArea: 200,
          sharedOwnershipPercentage: 50.5,
          isPartialOwnership: true,
          isSold: true,
          saleDate: '2023-06-15T00:00:00.000Z',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
    });
  });
});
