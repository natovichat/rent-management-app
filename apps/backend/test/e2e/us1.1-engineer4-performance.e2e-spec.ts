/**
 * US1.1 Property Creation - Performance & Cross-Browser Integration Tests
 * Engineer 4: Performance & Cross-Browser Integration Testing
 * 
 * Tests performance metrics, response times, and load handling.
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { PropertyType, PropertyStatus } from '@prisma/client';

describe('US1.1 - Engineer 4: Performance & Integration Tests', () => {
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
      data: { name: 'Performance Test Account' },
    });
    testAccountId = testAccount.id;
  });

  afterAll(async () => {
    await prisma.property.deleteMany({ where: { accountId: testAccountId } });
    await prisma.account.deleteMany({ where: { id: testAccountId } });
    await app.close();
  });

  describe('TC-PERF-001: Form render time with 50+ fields', () => {
    it('should measure API response time for property creation', async () => {
      const dto = {
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
        notes: 'Test notes',
      };

      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(dto)
        .expect(201);

      const responseTime = Date.now() - startTime;

      // Target: < 2 seconds
      expect(responseTime).toBeLessThan(2000);
      
      expect(response.body).toBeDefined();
    });
  });

  describe('TC-PERF-002: Form validation performance', () => {
    it('should validate form quickly', async () => {
      const invalidDto = {
        address: '', // Invalid - empty
        totalArea: -100, // Invalid - negative
        estimatedValue: -1000, // Invalid - negative
      };

      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(invalidDto)
        .expect(400);

      const validationTime = Date.now() - startTime;

      // Target: < 500ms
      expect(validationTime).toBeLessThan(500);
    });
  });

  describe('TC-PERF-003: API response time (create with all fields)', () => {
    it('should create property with all fields within 2 seconds', async () => {
      const allFieldsDto = {
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
        notes: 'Test notes with all fields',
      };

      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(allFieldsDto)
        .expect(201);

      const responseTime = Date.now() - startTime;

      // Target: < 2 seconds
      expect(responseTime).toBeLessThan(2000);
      expect(response.body).toBeDefined();
    });
  });

  describe('TC-PERF-004: Multiple concurrent requests', () => {
    it('should handle multiple concurrent property creations', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        address: `Test Address ${i}`,
        fileNumber: `12345-${i}`,
      }));

      const startTime = Date.now();

      const promises = requests.map((dto) =>
        request(app.getHttpServer())
          .post(API_URL)
          .set('X-Account-Id', testAccountId)
          .send(dto)
      );

      const responses = await Promise.all(promises);

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / requests.length;

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // Average response time should be reasonable
      expect(avgTime).toBeLessThan(3000);
    });
  });

  describe('TC-PERF-005: GET property with all fields', () => {
    it('should retrieve property quickly', async () => {
      // Create property first
      const createResponse = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send({
          address: 'רחוב הרצל 10, תל אביב',
          fileNumber: '12345',
          gush: '6158',
          helka: '371',
          type: PropertyType.RESIDENTIAL,
          status: PropertyStatus.OWNED,
          totalArea: 120.5,
          estimatedValue: 2500000,
        })
        .expect(201);

      const propertyId = createResponse.body.id;

      // Measure GET time
      const startTime = Date.now();
      
      const getResponse = await request(app.getHttpServer())
        .get(`${API_URL}/${propertyId}`)
        .set('X-Account-Id', testAccountId)
        .expect(200);

      const getTime = Date.now() - startTime;

      // Target: < 1 second
      expect(getTime).toBeLessThan(1000);
      expect(getResponse.body).toBeDefined();
    });
  });

  describe('TC-PERF-006: Large payload handling', () => {
    it('should handle large property payload efficiently', async () => {
      const largeDto = {
        address: 'רחוב הרצל 10, תל אביב',
        notes: 'A'.repeat(10000), // 10KB of notes
        propertyDetails: 'B'.repeat(5000), // 5KB of details
      };

      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('X-Account-Id', testAccountId)
        .send(largeDto)
        .expect(201);

      const responseTime = Date.now() - startTime;

      // Should still be fast even with large payload
      expect(responseTime).toBeLessThan(2000);
      expect(response.body.notes).toBe(largeDto.notes);
    });
  });

  describe('TC-PERF-007: Database query performance', () => {
    it('should list properties efficiently', async () => {
      // Create multiple properties first
      const createPromises = Array.from({ length: 20 }, (_, i) =>
        request(app.getHttpServer())
          .post(API_URL)
          .set('X-Account-Id', testAccountId)
          .send({ address: `Test Address ${i}` })
      );

      await Promise.all(createPromises);

      // Measure list query time
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .set('X-Account-Id', testAccountId)
        .query({ page: 1, limit: 10 })
        .expect(200);

      const queryTime = Date.now() - startTime;

      // Target: < 1 second for paginated list
      expect(queryTime).toBeLessThan(1000);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });
});
