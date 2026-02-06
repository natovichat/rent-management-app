/**
 * US1.1 Property Creation - Edge Case Integration Tests
 * Engineer 3: Edge Case Integration Testing
 * 
 * Tests edge cases and boundary conditions across the full stack.
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { PropertyType, PropertyStatus } from '@prisma/client';

describe('US1.1 - Engineer 3: Edge Case Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;

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

    const testAccount = await prisma.account.create({
      data: { name: 'Edge Case Test Account' },
    });
    testAccountId = testAccount.id;
  });

  afterAll(async () => {
    await prisma.property.deleteMany({ where: { accountId: testAccountId } });
    await prisma.account.deleteMany({ where: { id: testAccountId } });
    await app.close();
  });

  describe('TC-EDGE-001: Very long address (500 characters)', () => {
    it('should handle very long address correctly', async () => {
      const longAddress = 'רחוב '.repeat(100) + '10, תל אביב'; // ~500 characters
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({ address: longAddress })
        .expect(201);

      expect(response.body.address).toBe(longAddress);
      expect(response.body.address.length).toBeGreaterThan(400);
    });
  });

  describe('TC-EDGE-002: Very large numbers', () => {
    it('should handle very large estimatedValue', async () => {
      const largeValue = 999999999999; // 1 trillion
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          estimatedValue: largeValue,
        })
        .expect(201);

      expect(response.body.estimatedValue).toBe(largeValue);
    });

    it('should handle very large totalArea', async () => {
      const largeArea = 999999999.99;
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          totalArea: largeArea,
        })
        .expect(201);

      expect(response.body.totalArea).toBe(largeArea);
    });
  });

  describe('TC-EDGE-003: Decimal precision', () => {
    it('should save totalArea with 0.01 precision', async () => {
      const preciseArea = 0.01;
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          totalArea: preciseArea,
        })
        .expect(201);

      expect(response.body.totalArea).toBe(preciseArea);
    });

    it('should save estimatedValue with decimal precision', async () => {
      const preciseValue = 1234567.89;
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          estimatedValue: preciseValue,
        })
        .expect(201);

      expect(response.body.estimatedValue).toBe(preciseValue);
    });
  });

  describe('TC-EDGE-004: Future dates', () => {
    it('should accept future lastValuationDate', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          lastValuationDate: futureDate.toISOString(),
        })
        .expect(201);

      expect(new Date(response.body.lastValuationDate)).toEqual(futureDate);
    });
  });

  describe('TC-EDGE-005: Very old dates', () => {
    it('should accept very old acquisitionDate', async () => {
      const oldDate = '1900-01-01T00:00:00.000Z';
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          acquisitionDate: oldDate,
        })
        .expect(201);

      expect(response.body.acquisitionDate).toBeDefined();
    });
  });

  describe('TC-EDGE-006: Special characters in address', () => {
    it('should handle Hebrew characters', async () => {
      const hebrewAddress = 'רחוב הרצל 10, תל אביב';
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({ address: hebrewAddress })
        .expect(201);

      expect(response.body.address).toBe(hebrewAddress);
    });

    it('should handle numbers and punctuation', async () => {
      const complexAddress = 'רחוב הרצל 10/12, קומה 3, דירה 5, תל אביב 12345';
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({ address: complexAddress })
        .expect(201);

      expect(response.body.address).toBe(complexAddress);
    });
  });

  describe('TC-EDGE-007: landArea = totalArea (exact match)', () => {
    it('should accept when landArea equals totalArea', async () => {
      const area = 100.0;
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          landArea: area,
          totalArea: area,
        })
        .expect(201);

      expect(response.body.landArea).toBe(area);
      expect(response.body.totalArea).toBe(area);
    });
  });

  describe('TC-EDGE-008: acquisitionDate = saleDate (exact match)', () => {
    it('should accept when acquisitionDate equals saleDate', async () => {
      const sameDate = '2020-01-15T00:00:00.000Z';
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          acquisitionDate: sameDate,
          saleDate: sameDate,
        })
        .expect(201);

      expect(response.body.acquisitionDate).toBeDefined();
      expect(response.body.saleDate).toBeDefined();
    });
  });

  describe('TC-EDGE-009: Percentage edge cases', () => {
    it('should accept percentage 0.01', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          sharedOwnershipPercentage: 0.01,
        })
        .expect(201);

      expect(response.body.sharedOwnershipPercentage).toBe(0.01);
    });

    it('should accept percentage 100.00', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          sharedOwnershipPercentage: 100.0,
        })
        .expect(201);

      expect(response.body.sharedOwnershipPercentage).toBe(100.0);
    });

    it('should reject percentage 100.01', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          sharedOwnershipPercentage: 100.01,
        })
        .expect(400);
    });
  });

  describe('TC-EDGE-010: Empty string vs null vs undefined', () => {
    it('should handle empty string for optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          fileNumber: '',
          notes: '',
        })
        .expect(201);

      // Empty strings should be converted to null or handled appropriately
      expect(response.body.address).toBe('Test Address');
    });

    it('should handle null for optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          fileNumber: null,
        })
        .expect(201);

      expect(response.body.fileNumber).toBeNull();
    });

    it('should handle undefined (omitted) optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          // fileNumber omitted
        })
        .expect(201);

      expect(response.body.fileNumber).toBeNull();
    });
  });

  describe('TC-EDGE-011: Construction year boundaries', () => {
    it('should accept minimum construction year (1800)', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          constructionYear: 1800,
        })
        .expect(201);

      expect(response.body.constructionYear).toBe(1800);
    });

    it('should accept maximum construction year (2100)', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          constructionYear: 2100,
        })
        .expect(201);

      expect(response.body.constructionYear).toBe(2100);
    });

    it('should reject construction year < 1800', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          constructionYear: 1799,
        })
        .expect(400);
    });

    it('should reject construction year > 2100', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          constructionYear: 2101,
        })
        .expect(400);
    });
  });

  describe('TC-EDGE-012: Zero values', () => {
    it('should accept zero for floors', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          floors: 0,
        })
        .expect(201);

      expect(response.body.floors).toBe(0);
    });

    it('should accept zero for totalUnits', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          totalUnits: 0,
        })
        .expect(201);

      expect(response.body.totalUnits).toBe(0);
    });

    it('should accept zero for parkingSpaces', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          parkingSpaces: 0,
        })
        .expect(201);

      expect(response.body.parkingSpaces).toBe(0);
    });
  });

  describe('TC-EDGE-013: Boolean edge cases', () => {
    it('should accept true for isMortgaged', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          isMortgaged: true,
        })
        .expect(201);

      expect(response.body.isMortgaged).toBe(true);
    });

    it('should accept false for isMortgaged', async () => {
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'Test Address',
          isMortgaged: false,
        })
        .expect(201);

      expect(response.body.isMortgaged).toBe(false);
    });
  });
});
