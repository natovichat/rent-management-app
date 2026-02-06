/**
 * Epic 7: Bank Account Management - E2E Integration Tests
 * 
 * Tests all 7 user stories:
 * - US7.1: Create Bank Account
 * - US7.2: View Bank Accounts List
 * - US7.3: Edit Bank Account
 * - US7.4: Delete Bank Account with Validation
 * - US7.5: Activate/Deactivate Bank Account
 * - US7.6: Create Bank Account Inline from Mortgage Form (API level)
 * - US7.7: View Mortgages Using Bank Account
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 7: Bank Account Management E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  let testBankAccountId: string;
  let testBankAccount2Id: string;
  let testPropertyId: string;
  let testMortgageId: string;

  const API_URL = '/bank-accounts';

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

    // Ensure test account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: testAccountId },
    });
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: testAccountId,
          name: 'Epic 7 Bank Account Test Account',
        },
      });
    }

    // Create test property for mortgage tests
    const testProperty = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'PROP-BANK-001',
      },
    });
    testPropertyId = testProperty.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testMortgageId) {
      await prisma.mortgage.deleteMany({
        where: { id: testMortgageId },
      });
    }
    if (testPropertyId) {
      await prisma.property.deleteMany({
        where: { id: testPropertyId },
      });
    }
    if (testBankAccountId) {
      await prisma.bankAccount.deleteMany({
        where: { id: testBankAccountId },
      });
    }
    if (testBankAccount2Id) {
      await prisma.bankAccount.deleteMany({
        where: { id: testBankAccount2Id },
      });
    }
    await app.close();
  });

  describe('US7.1: Create Bank Account', () => {
    it('should create a bank account with required fields', async () => {
      // Use unique account number to avoid conflicts
      const uniqueId = Date.now();
      const createDto = {
        bankName: 'בנק הפועלים',
        accountNumber: `123456-${uniqueId}`,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.bankName).toBe(createDto.bankName);
      expect(response.body.accountNumber).toBe(createDto.accountNumber);
      expect(response.body.isActive).toBe(true);
      expect(response.body.accountId).toBe(testAccountId);

      testBankAccountId = response.body.id;
    });

    it('should create a bank account with all optional fields', async () => {
      // Use unique account number to avoid conflicts
      const uniqueId = Date.now();
      const createDto = {
        bankName: 'בנק לאומי',
        branchNumber: '689',
        accountNumber: `789012-${uniqueId}`,
        accountType: 'SAVINGS',
        accountHolder: 'יוסי כהן',
        notes: 'חשבון חיסכון',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(201);

      expect(response.body.bankName).toBe(createDto.bankName);
      expect(response.body.branchNumber).toBe(createDto.branchNumber);
      expect(response.body.accountNumber).toBe(createDto.accountNumber);
      expect(response.body.accountType).toBe(createDto.accountType);
      expect(response.body.accountHolder).toBe(createDto.accountHolder);
      expect(response.body.notes).toBe(createDto.notes);
      expect(response.body.isActive).toBe(true);

      testBankAccount2Id = response.body.id;
    });

    it('should prevent duplicate bank accounts (same bankName + accountNumber)', async () => {
      // First create the account
      const uniqueId = Date.now();
      const createDto = {
        bankName: 'בנק מזרחי',
        accountNumber: `dup-test-${uniqueId}`,
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(409);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .send({})
        .expect(400);
    });

    it('should validate bankName is required', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .send({ accountNumber: '123456' })
        .expect(400);
    });

    it('should validate accountNumber is required', async () => {
      await request(app.getHttpServer())
        .post(API_URL)
        .send({ bankName: 'בנק הפועלים' })
        .expect(400);
    });
  });

  describe('US7.2: View Bank Accounts List', () => {
    it('should return all bank accounts for the account', async () => {
      // Ensure we have at least one bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `list-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      const response = await request(app.getHttpServer())
        .get(API_URL)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // Verify all accounts belong to test account
      response.body.forEach((account: any) => {
        expect(account.accountId).toBe(testAccountId);
      });
    });

    it('should return only active accounts when activeOnly=true', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ activeOnly: true })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((account: any) => {
        expect(account.isActive).toBe(true);
      });
    });

    it('should return bank account by ID', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `get-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${testBankAccountId}`)
        .expect(200);

      expect(response.body.id).toBe(testBankAccountId);
      expect(response.body).toHaveProperty('bankName');
      expect(response.body).toHaveProperty('accountNumber');
    });

    it('should return 404 for non-existent bank account', async () => {
      await request(app.getHttpServer())
        .get(`${API_URL}/00000000-0000-0000-0000-000000000999`)
        .expect(404);
    });

    it('should return accounts ordered by bankName and createdAt', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .expect(200);

      // Verify ordering (should be alphabetical by bank name)
      const bankNames = response.body.map((a: any) => a.bankName);
      const sortedBankNames = [...bankNames].sort();
      expect(bankNames).toEqual(sortedBankNames);
    });
  });

  describe('US7.3: Edit Bank Account', () => {
    it('should update bank account details', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `edit-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      const uniqueId = Date.now();
      const updateDto = {
        bankName: 'בנק מזרחי',
        branchNumber: '123',
        accountNumber: `999888-${uniqueId}`,
        accountType: 'BUSINESS',
        accountHolder: 'דוד לוי',
        notes: 'עודכן',
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testBankAccountId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.bankName).toBe(updateDto.bankName);
      expect(response.body.branchNumber).toBe(updateDto.branchNumber);
      expect(response.body.accountNumber).toBe(updateDto.accountNumber);
      expect(response.body.accountType).toBe(updateDto.accountType);
      expect(response.body.accountHolder).toBe(updateDto.accountHolder);
      expect(response.body.notes).toBe(updateDto.notes);
    });

    it('should allow partial updates', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `partial-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      const updateDto = {
        notes: 'הערות חדשות',
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testBankAccountId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.notes).toBe(updateDto.notes);
      // Other fields should remain unchanged
      expect(response.body).toHaveProperty('bankName');
    });

    it('should prevent duplicate accounts after edit', async () => {
      // Ensure we have two bank accounts
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט1',
          accountNumber: `dup-edit-1-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      if (!testBankAccount2Id) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט2',
          accountNumber: `dup-edit-2-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccount2Id = createResponse.body.id;
      }

      // Get the account number from testBankAccount2Id
      const account2Response = await request(app.getHttpServer())
        .get(`${API_URL}/${testBankAccount2Id}`)
        .expect(200);

      // Try to update testBankAccountId to match testBankAccount2Id
      const updateDto = {
        bankName: account2Response.body.bankName,
        accountNumber: account2Response.body.accountNumber,
      };

      await request(app.getHttpServer())
        .patch(`${API_URL}/${testBankAccountId}`)
        .send(updateDto)
        .expect(409);
    });

    it('should return 404 for non-existent bank account', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/00000000-0000-0000-0000-000000000999`)
        .send({ bankName: 'Test' })
        .expect(404);
    });
  });

  describe('US7.4: Delete Bank Account with Validation', () => {
    it('should prevent deletion of bank account linked to mortgages', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `delete-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      // Create a mortgage linked to testBankAccountId
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק מזרחי',
          loanAmount: 1000000,
          interestRate: 3.5,
          monthlyPayment: 5000,
          startDate: new Date('2024-01-01'),
          status: 'ACTIVE',
          bankAccountId: testBankAccountId,
        },
      });
      testMortgageId = mortgage.id;

      // Try to delete the bank account
      const response = await request(app.getHttpServer())
        .delete(`${API_URL}/${testBankAccountId}`)
        .expect(409);

      expect(response.body.message).toContain('משכנתאות');
    });

    it('should delete bank account not linked to mortgages', async () => {
      // Delete testBankAccount2Id which has no mortgages
      await request(app.getHttpServer())
        .delete(`${API_URL}/${testBankAccount2Id}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`${API_URL}/${testBankAccount2Id}`)
        .expect(404);

      testBankAccount2Id = ''; // Mark as deleted
    });

    it('should return 404 for non-existent bank account', async () => {
      await request(app.getHttpServer())
        .delete(`${API_URL}/00000000-0000-0000-0000-000000000999`)
        .expect(404);
    });
  });

  describe('US7.5: Activate/Deactivate Bank Account', () => {
    it('should deactivate a bank account', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `deactivate-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testBankAccountId}/deactivate`)
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should activate a bank account', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `activate-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${testBankAccountId}/activate`)
        .expect(200);

      expect(response.body.isActive).toBe(true);
    });

    it('should filter inactive accounts from activeOnly query', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `filter-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      // Deactivate the account
      await request(app.getHttpServer())
        .patch(`${API_URL}/${testBankAccountId}/deactivate`)
        .expect(200);

      // Get active only accounts
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ activeOnly: true })
        .expect(200);

      // testBankAccountId should not be in the list
      const found = response.body.find((a: any) => a.id === testBankAccountId);
      expect(found).toBeUndefined();
    });

    it('should return 404 for non-existent bank account', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/00000000-0000-0000-0000-000000000999/deactivate`)
        .expect(404);
    });
  });

  describe('US7.6: Create Bank Account Inline from Mortgage Form', () => {
    it('should create bank account and be available for selection', async () => {
      // Create a new bank account via API (simulating inline creation)
      const createDto = {
        bankName: 'בנק דיסקונט',
        branchNumber: '456',
        accountNumber: '555666',
        accountType: 'CHECKING',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(201);

      const newBankAccountId = response.body.id;

      // Verify it's immediately available in active accounts list
      const listResponse = await request(app.getHttpServer())
        .get(API_URL)
        .query({ activeOnly: true })
        .expect(200);

      const found = listResponse.body.find((a: any) => a.id === newBankAccountId);
      expect(found).toBeDefined();
      expect(found.isActive).toBe(true);

      // Cleanup
      await prisma.bankAccount.delete({
        where: { id: newBankAccountId },
      });
    });
  });

  describe('US7.7: View Mortgages Using Bank Account', () => {
    it('should return mortgages linked to bank account', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `mortgage-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      // Create a mortgage linked to testBankAccountId if not exists
      if (!testMortgageId) {
        const mortgage = await prisma.mortgage.create({
          data: {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק טסט',
            loanAmount: 1000000,
            interestRate: 3.5,
            monthlyPayment: 5000,
            startDate: new Date('2024-01-01'),
            status: 'ACTIVE',
            bankAccountId: testBankAccountId,
          },
        });
        testMortgageId = mortgage.id;
      }

      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${testBankAccountId}/mortgages`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      // Verify mortgage structure
      const mortgage = response.body[0];
      expect(mortgage).toHaveProperty('id');
      expect(mortgage).toHaveProperty('bank');
      expect(mortgage).toHaveProperty('loanAmount');
      expect(mortgage).toHaveProperty('monthlyPayment');
      expect(mortgage).toHaveProperty('status');
      expect(mortgage).toHaveProperty('property');
      expect(mortgage.property).toHaveProperty('id');
      expect(mortgage.property).toHaveProperty('address');
    });

    it('should return empty array when no mortgages linked', async () => {
      // Create a bank account with no mortgages
      const bankAccount = await prisma.bankAccount.create({
        data: {
          accountId: testAccountId,
          bankName: 'בנק טסט',
          accountNumber: '999999',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${bankAccount.id}/mortgages`)
        .expect(200);

      expect(response.body).toEqual([]);

      // Cleanup
      await prisma.bankAccount.delete({
        where: { id: bankAccount.id },
      });
    });

    it('should return 404 for non-existent bank account', async () => {
      await request(app.getHttpServer())
        .get(`${API_URL}/00000000-0000-0000-0000-000000000999/mortgages`)
        .expect(404);
    });

    it('should only return mortgages for the same accountId', async () => {
      // Ensure we have a bank account
      if (!testBankAccountId) {
        const uniqueId = Date.now();
        const createDto = {
          bankName: 'בנק טסט',
          accountNumber: `security-test-${uniqueId}`,
        };
        const createResponse = await request(app.getHttpServer())
          .post(API_URL)
          .send(createDto)
          .expect(201);
        testBankAccountId = createResponse.body.id;
      }

      // Create another account
      const otherAccount = await prisma.account.create({
        data: {
          name: 'Other Account',
        },
      });

      // Create a bank account for other account
      const uniqueId = Date.now();
      const otherBankAccount = await prisma.bankAccount.create({
        data: {
          accountId: otherAccount.id,
          bankName: 'בנק אחר',
          accountNumber: `111222-${uniqueId}`,
        },
      });

      // Create a mortgage for other account
      const otherProperty = await prisma.property.create({
        data: {
          accountId: otherAccount.id,
          address: 'Other Property',
        },
      });

      await prisma.mortgage.create({
        data: {
          accountId: otherAccount.id,
          propertyId: otherProperty.id,
          bank: 'בנק אחר',
          loanAmount: 500000,
          interestRate: 2.5,
          monthlyPayment: 2500,
          startDate: new Date('2024-01-01'),
          status: 'ACTIVE',
          bankAccountId: otherBankAccount.id,
        },
      });

      // Query mortgages for testBankAccountId (should not see other account's mortgages)
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${testBankAccountId}/mortgages`)
        .expect(200);

      // Should only return mortgages for testAccountId
      response.body.forEach((mortgage: any) => {
        // Verify through property (indirect check)
        expect(mortgage.property.id).toBe(testPropertyId);
      });

      // Cleanup
      await prisma.mortgage.deleteMany({
        where: { accountId: otherAccount.id },
      });
      await prisma.property.deleteMany({
        where: { accountId: otherAccount.id },
      });
      await prisma.bankAccount.deleteMany({
        where: { accountId: otherAccount.id },
      });
      await prisma.account.delete({
        where: { id: otherAccount.id },
      });
    });
  });

  describe('Multi-tenancy Security', () => {
    it('should isolate bank accounts by accountId', async () => {
      // Create another account
      const otherAccount = await prisma.account.create({
        data: {
          name: 'Security Test Account',
        },
      });

      // Create bank account for other account
      const otherBankAccount = await prisma.bankAccount.create({
        data: {
          accountId: otherAccount.id,
          bankName: 'בנק אבטחה',
          accountNumber: '333444',
        },
      });

      // Query bank accounts for testAccountId
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .expect(200);

      // Should not see other account's bank account
      const found = response.body.find((a: any) => a.id === otherBankAccount.id);
      expect(found).toBeUndefined();

      // Cleanup
      await prisma.bankAccount.delete({
        where: { id: otherBankAccount.id },
      });
      await prisma.account.delete({
        where: { id: otherAccount.id },
      });
    });
  });
});
