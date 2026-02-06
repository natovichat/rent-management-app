/**
 * US1.12 Add Plot Information - E2E Tests
 * 
 * Tests plot information CRUD operations:
 * - Add plot info to property
 * - Get plot info for property
 * - Update plot info
 * - Delete plot info
 * - Validation and error handling
 * - Multi-tenancy (account isolation)
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('US1.12 - Plot Information E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;
  let otherAccountId: string;
  let testPropertyId: string;
  let otherPropertyId: string;

  const API_BASE = '/properties';
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
      data: { name: 'US1.12 Other Account' },
    });
    otherAccountId = otherAccount.id;

    // Ensure hardcoded account exists
    await prisma.account.upsert({
      where: { id: HARDCODED_ACCOUNT_ID },
      create: {
        id: HARDCODED_ACCOUNT_ID,
        name: 'US1.12 Plot Info Test Account',
      },
      update: {},
    });

    // Create test properties
    const testProperty = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'PLOT-TEST-001',
      },
    });
    testPropertyId = testProperty.id;

    const otherProperty = await prisma.property.create({
      data: {
        accountId: otherAccountId,
        address: 'רחוב דיזנגוף 50, תל אביב',
        fileNumber: 'PLOT-TEST-002',
      },
    });
    otherPropertyId = otherProperty.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.plotInfo.deleteMany({
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
      where: { id: { in: [testAccountId, otherAccountId] } },
    });
    await app.close();
  });

  describe('TC-E2E-1.12-001: Add Plot Info to Property', () => {
    it('should create plot info with all fields', async () => {
      // Create a fresh property for this test
      const property = await prisma.property.create({
        data: {
          accountId: testAccountId,
          address: 'רחוב הרצל 20, תל אביב',
          fileNumber: 'PLOT-TEST-ALL-FIELDS',
        },
      });

      const plotData = {
        gush: '6393',
        chelka: '314',
        subChelka: '45',
        registryNumber: 'REG-12345',
        registryOffice: 'תל אביב',
        notes: 'Test plot information',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_BASE}/${property.id}/plot-info`)
        .send(plotData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        propertyId: property.id,
        accountId: testAccountId,
        gush: plotData.gush,
        chelka: plotData.chelka,
        subChelka: plotData.subChelka,
        registryNumber: plotData.registryNumber,
        registryOffice: plotData.registryOffice,
        notes: plotData.notes,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify in database
      const plotInfo = await prisma.plotInfo.findUnique({
        where: { propertyId: property.id },
      });
      expect(plotInfo).toMatchObject(plotData);

      // Cleanup
      await prisma.plotInfo.delete({ where: { propertyId: property.id } });
      await prisma.property.delete({ where: { id: property.id } });
    });

    it('should create plot info with minimal fields (gush and chelka only)', async () => {
      // Create a fresh property for this test
      const property = await prisma.property.create({
        data: {
          accountId: testAccountId,
          address: 'רחוב הרצל 30, תל אביב',
          fileNumber: 'PLOT-TEST-MINIMAL',
        },
      });

      const plotData = {
        gush: '6158',
        chelka: '371',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_BASE}/${property.id}/plot-info`)
        .send(plotData)
        .expect(201);

      expect(response.body).toMatchObject({
        gush: plotData.gush,
        chelka: plotData.chelka,
      });

      // Cleanup
      await prisma.plotInfo.delete({ where: { propertyId: property.id } });
      await prisma.property.delete({ where: { id: property.id } });
    });

    it('should fail if property does not exist', async () => {
      const fakePropertyId = '00000000-0000-0000-0000-000000000000';
      const plotData = {
        gush: '1234',
        chelka: '567',
      };

      await request(app.getHttpServer())
        .post(`${API_BASE}/${fakePropertyId}/plot-info`)
        .send(plotData)
        .expect(404);
    });

    it('should fail if plot info already exists for property', async () => {
      // Create a fresh property for this test
      const property = await prisma.property.create({
        data: {
          accountId: testAccountId,
          address: 'רחוב הרצל 40, תל אביב',
          fileNumber: 'PLOT-TEST-DUPLICATE',
        },
      });

      // First create plot info
      await request(app.getHttpServer())
        .post(`${API_BASE}/${property.id}/plot-info`)
        .send({ gush: '1111', chelka: '222' })
        .expect(201);

      // Try to create again - should fail
      await request(app.getHttpServer())
        .post(`${API_BASE}/${property.id}/plot-info`)
        .send({ gush: '9999', chelka: '888' })
        .expect(409); // Conflict

      // Cleanup
      await prisma.plotInfo.delete({ where: { propertyId: property.id } });
      await prisma.property.delete({ where: { id: property.id } });
    });
  });

  describe('TC-E2E-1.12-002: Get Plot Info for Property', () => {
    beforeEach(async () => {
      // Create plot info for test
      await prisma.plotInfo.upsert({
        where: { propertyId: testPropertyId },
        create: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          gush: '6393',
          chelka: '314',
          subChelka: '45',
          registryOffice: 'תל אביב',
        },
        update: {
          gush: '6393',
          chelka: '314',
          subChelka: '45',
          registryOffice: 'תל אביב',
        },
      });
    });

    it('should get plot info for property', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_BASE}/${testPropertyId}/plot-info`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        propertyId: testPropertyId,
        accountId: testAccountId,
        gush: '6393',
        chelka: '314',
        subChelka: '45',
        registryOffice: 'תל אביב',
      });
    });

    it('should return 404 if plot info does not exist', async () => {
      // Create property without plot info
      const newProperty = await prisma.property.create({
        data: {
          accountId: testAccountId,
          address: 'רחוב חדש 1',
          fileNumber: 'NO-PLOT-001',
        },
      });

      await request(app.getHttpServer())
        .get(`${API_BASE}/${newProperty.id}/plot-info`)
        .expect(404);

      // Cleanup
      await prisma.property.delete({ where: { id: newProperty.id } });
    });

    it('should return 404 if property does not exist', async () => {
      const fakePropertyId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`${API_BASE}/${fakePropertyId}/plot-info`)
        .expect(404);
    });
  });

  describe('TC-E2E-1.12-003: Update Plot Info', () => {
    let plotInfoId: string;

    beforeEach(async () => {
      const plotInfo = await prisma.plotInfo.upsert({
        where: { propertyId: testPropertyId },
        create: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          gush: '1111',
          chelka: '222',
        },
        update: {
          gush: '1111',
          chelka: '222',
        },
      });
      plotInfoId = plotInfo.id;
    });

    it('should update plot info with new values', async () => {
      const updateData = {
        gush: '9999',
        chelka: '888',
        subChelka: '77',
        registryOffice: 'ירושלים',
        notes: 'Updated notes',
      };

      const response = await request(app.getHttpServer())
        .put(`/plot-info/${plotInfoId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updateData);

      // Verify in database
      const updated = await prisma.plotInfo.findUnique({
        where: { id: plotInfoId },
      });
      expect(updated).toMatchObject(updateData);
    });

    it('should update only provided fields (partial update)', async () => {
      const updateData = {
        notes: 'Only notes updated',
      };

      const response = await request(app.getHttpServer())
        .put(`/plot-info/${plotInfoId}`)
        .send(updateData)
        .expect(200);

      // Should keep existing values
      expect(response.body.gush).toBe('1111');
      expect(response.body.chelka).toBe('222');
      expect(response.body.notes).toBe(updateData.notes);
    });

    it('should fail if plot info does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .put(`/plot-info/${fakeId}`)
        .send({ gush: '1234' })
        .expect(404);
    });
  });

  describe('TC-E2E-1.12-004: Delete Plot Info', () => {
    let plotInfoId: string;

    beforeEach(async () => {
      const plotInfo = await prisma.plotInfo.upsert({
        where: { propertyId: testPropertyId },
        create: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          gush: '5555',
          chelka: '666',
        },
        update: {
          gush: '5555',
          chelka: '666',
        },
      });
      plotInfoId = plotInfo.id;
    });

    it('should delete plot info', async () => {
      await request(app.getHttpServer())
        .delete(`/plot-info/${plotInfoId}`)
        .expect(200);

      // Verify deleted
      const deleted = await prisma.plotInfo.findUnique({
        where: { id: plotInfoId },
      });
      expect(deleted).toBeNull();
    });

    it('should fail if plot info does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .delete(`/plot-info/${fakeId}`)
        .expect(404);
    });
  });

  describe('TC-E2E-1.12-005: Multi-Tenancy (Account Isolation)', () => {
    let otherPlotInfoId: string;

    beforeEach(async () => {
      // Create plot info for other account's property
      const plotInfo = await prisma.plotInfo.create({
        data: {
          accountId: otherAccountId,
          propertyId: otherPropertyId,
          gush: 'OTHER-123',
          chelka: 'OTHER-456',
        },
      });
      otherPlotInfoId = plotInfo.id;
    });

    afterEach(async () => {
      await prisma.plotInfo.deleteMany({
        where: { accountId: otherAccountId },
      });
    });

    it('should not allow accessing other account plot info via property endpoint', async () => {
      // Try to get plot info for other account's property
      // This should fail with 404 or 403 (depending on implementation)
      await request(app.getHttpServer())
        .get(`${API_BASE}/${otherPropertyId}/plot-info`)
        .expect(404); // Property not found for this account
    });

    it('should not allow updating other account plot info', async () => {
      await request(app.getHttpServer())
        .put(`/plot-info/${otherPlotInfoId}`)
        .send({ gush: 'HACKED' })
        .expect(404); // Plot info not found for this account
    });

    it('should not allow deleting other account plot info', async () => {
      await request(app.getHttpServer())
        .delete(`/plot-info/${otherPlotInfoId}`)
        .expect(404); // Plot info not found for this account
    });
  });

  describe('TC-E2E-1.12-006: Validation Tests', () => {
    it('should accept valid gush and chelka formats', async () => {
      const validFormats = [
        { gush: '1234', chelka: '567' },
        { gush: '1234-5678', chelka: '371-376' }, // Range
        { gush: '1234,5678', chelka: '181, 60' }, // Multiple
      ];

      for (const format of validFormats) {
        // Create temporary property for each test
        const tempProperty = await prisma.property.create({
          data: {
            accountId: testAccountId,
            address: `Test ${format.gush}`,
            fileNumber: `TEMP-${format.gush}`,
          },
        });

        const response = await request(app.getHttpServer())
          .post(`${API_BASE}/${tempProperty.id}/plot-info`)
          .send(format)
          .expect(201);

        expect(response.body).toMatchObject(format);

        // Cleanup
        await prisma.plotInfo.delete({ where: { propertyId: tempProperty.id } });
        await prisma.property.delete({ where: { id: tempProperty.id } });
      }
    });

    it('should accept empty optional fields', async () => {
      const tempProperty = await prisma.property.create({
        data: {
          accountId: testAccountId,
          address: 'Test Empty Fields',
          fileNumber: 'EMPTY-001',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`${API_BASE}/${tempProperty.id}/plot-info`)
        .send({}) // Empty object - all optional
        .expect(201);

      expect(response.body).toMatchObject({
        gush: null,
        chelka: null,
        subChelka: null,
        registryNumber: null,
        registryOffice: null,
        notes: null,
      });

      // Cleanup
      await prisma.plotInfo.delete({ where: { propertyId: tempProperty.id } });
      await prisma.property.delete({ where: { id: tempProperty.id } });
    });
  });
});
