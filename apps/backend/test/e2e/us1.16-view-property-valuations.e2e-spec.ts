/**
 * US1.16 View Property Valuations - E2E Tests
 * 
 * Tests viewing property valuations:
 * - View valuations list for a property
 * - View latest valuation
 * - Valuations ordered by date (newest first)
 * - Multi-tenancy (account isolation)
 * - Empty state when no valuations
 * - Valuation details display
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { ValuationType } from '@prisma/client';

describe('US1.16 - View Property Valuations E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;
  let otherAccountId: string;
  let testPropertyId: string;
  let otherPropertyId: string;

  const API_BASE = '/valuations';
  // Hardcoded account ID matching backend controller
  const HARDCODED_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

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

    // Use hardcoded account ID to match backend
    testAccountId = HARDCODED_ACCOUNT_ID;

    // Create other account for multi-tenancy tests
    const otherAccount = await prisma.account.create({
      data: { name: 'US1.16 Other Account' },
    });
    otherAccountId = otherAccount.id;

    // Ensure hardcoded account exists
    await prisma.account.upsert({
      where: { id: HARDCODED_ACCOUNT_ID },
      create: {
        id: HARDCODED_ACCOUNT_ID,
        name: 'US1.16 Valuations Test Account',
      },
      update: {},
    });

    // Create test properties
    const testProperty = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'VAL-TEST-001',
      },
    });
    testPropertyId = testProperty.id;

    const otherProperty = await prisma.property.create({
      data: {
        accountId: otherAccountId,
        address: 'רחוב דיזנגוף 50, תל אביב',
        fileNumber: 'VAL-TEST-002',
      },
    });
    otherPropertyId = otherProperty.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.propertyValuation.deleteMany({
      where: {
        accountId: { in: [testAccountId, otherAccountId] },
      },
    });
    await prisma.property.deleteMany({
      where: {
        accountId: { in: [testAccountId, otherAccountId] },
      },
    });
    await prisma.account.deleteMany({
      where: {
        id: { in: [testAccountId, otherAccountId] },
      },
    });
    await app.close();
  });

  describe('TC-E2E-1.16-001: View valuations list for property', () => {
    beforeEach(async () => {
      // Cleanup valuations before each test
      await prisma.propertyValuation.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should return empty array when property has no valuations', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_BASE}/property/${testPropertyId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all valuations for property ordered by date descending', async () => {
      // Create valuations with different dates
      const valuation1 = await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2023-01-15'),
          estimatedValue: 1000000,
          valuationType: ValuationType.MARKET,
          notes: 'First valuation',
        },
      });

      const valuation2 = await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2024-01-15'),
          estimatedValue: 1200000,
          valuationType: ValuationType.APPRAISAL,
          notes: 'Second valuation',
        },
      });

      const valuation3 = await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2023-06-15'),
          estimatedValue: 1100000,
          valuationType: ValuationType.TAX,
          notes: 'Third valuation',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`${API_BASE}/property/${testPropertyId}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      // Should be ordered by date descending (newest first)
      expect(response.body[0].id).toBe(valuation2.id); // 2024-01-15 (newest)
      expect(response.body[1].id).toBe(valuation3.id); // 2023-06-15
      expect(response.body[2].id).toBe(valuation1.id); // 2023-01-15 (oldest)

      // Verify structure
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('propertyId', testPropertyId);
      expect(response.body[0]).toHaveProperty('accountId', testAccountId);
      expect(response.body[0]).toHaveProperty('valuationDate');
      expect(response.body[0]).toHaveProperty('estimatedValue');
      expect(response.body[0]).toHaveProperty('valuationType');
      expect(response.body[0]).toHaveProperty('notes');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('property');
    });
  });

  describe('TC-E2E-1.16-002: View latest valuation', () => {
    beforeEach(async () => {
      // Cleanup valuations before each test
      await prisma.propertyValuation.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should return 404 when property has no valuations', async () => {
      await request(app.getHttpServer())
        .get(`${API_BASE}/property/${testPropertyId}/latest`)
        .expect(404);
    });

    it('should return the most recent valuation', async () => {
      // Create valuations
      const oldValuation = await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2023-01-15'),
          estimatedValue: 1000000,
          valuationType: ValuationType.MARKET,
        },
      });

      const latestValuation = await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2024-01-15'),
          estimatedValue: 1200000,
          valuationType: ValuationType.APPRAISAL,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`${API_BASE}/property/${testPropertyId}/latest`)
        .expect(200);

      expect(response.body.id).toBe(latestValuation.id);
      // Decimal values are returned as strings from Prisma
      expect(Number(response.body.estimatedValue)).toBe(1200000);
      expect(response.body.valuationType).toBe(ValuationType.APPRAISAL);
    });
  });

  describe('TC-E2E-1.16-003: Multi-tenancy - account isolation', () => {
    beforeEach(async () => {
      // Cleanup valuations before each test
      await prisma.propertyValuation.deleteMany({
        where: {
          propertyId: { in: [testPropertyId, otherPropertyId] },
        },
      });
    });

    it('should not return valuations from other account', async () => {
      // Create valuation for other account's property
      const otherValuation = await prisma.propertyValuation.create({
        data: {
          propertyId: otherPropertyId,
          accountId: otherAccountId,
          valuationDate: new Date('2024-01-15'),
          estimatedValue: 2000000,
          valuationType: ValuationType.MARKET,
        },
      });

      // Create valuation for test account
      const testValuation = await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2024-01-15'),
          estimatedValue: 1000000,
          valuationType: ValuationType.MARKET,
        },
      });

      // Request valuations for test property
      const response = await request(app.getHttpServer())
        .get(`${API_BASE}/property/${testPropertyId}`)
        .expect(200);

      // Should only return test account's valuation
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(testValuation.id);
      expect(response.body[0].accountId).toBe(testAccountId);
    });

    it('should return 404 when requesting valuations for property from other account', async () => {
      await request(app.getHttpServer())
        .get(`${API_BASE}/property/${otherPropertyId}`)
        .expect(404); // Property not found for this account
    });
  });

  describe('TC-E2E-1.16-004: Valuation details display', () => {
    beforeEach(async () => {
      // Cleanup valuations before each test
      await prisma.propertyValuation.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should include all valuation fields in response', async () => {
      const valuation = await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2024-01-15'),
          estimatedValue: 1500000,
          valuationType: ValuationType.MARKET,
          valuatedBy: 'Certified Appraiser',
          notes: 'Property valuation notes',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`${API_BASE}/property/${testPropertyId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      const val = response.body[0];

      expect(val.id).toBe(valuation.id);
      expect(val.propertyId).toBe(testPropertyId);
      expect(val.accountId).toBe(testAccountId);
      // Decimal values are returned as strings from Prisma
      expect(Number(val.estimatedValue)).toBe(1500000);
      expect(val.valuationType).toBe(ValuationType.MARKET);
      expect(val.valuatedBy).toBe('Certified Appraiser');
      expect(val.notes).toBe('Property valuation notes');
      expect(val).toHaveProperty('valuationDate');
      expect(val).toHaveProperty('createdAt');
      expect(val).toHaveProperty('property');
    });
  });

  describe('TC-E2E-1.16-005: All valuation types supported', () => {
    beforeEach(async () => {
      // Cleanup valuations before each test
      await prisma.propertyValuation.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should return valuations with all valuation types', async () => {
      const types = [
        ValuationType.MARKET,
        ValuationType.PURCHASE,
        ValuationType.TAX,
        ValuationType.APPRAISAL,
      ];

      const valuations = await Promise.all(
        types.map((type, index) =>
          prisma.propertyValuation.create({
            data: {
              propertyId: testPropertyId,
              accountId: testAccountId,
              valuationDate: new Date(`2024-0${index + 1}-15`),
              estimatedValue: 1000000 + index * 100000,
              valuationType: type,
            },
          }),
        ),
      );

      const response = await request(app.getHttpServer())
        .get(`${API_BASE}/property/${testPropertyId}`)
        .expect(200);

      expect(response.body).toHaveLength(4);
      const returnedTypes = response.body.map((v: any) => v.valuationType);
      types.forEach((type) => {
        expect(returnedTypes).toContain(type);
      });
    });
  });

  describe('TC-E2E-1.16-006: Invalid property ID', () => {
    it('should return 404 for non-existent property', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000999';
      await request(app.getHttpServer())
        .get(`${API_BASE}/property/${fakeId}`)
        .expect(404);
    });
  });
});
