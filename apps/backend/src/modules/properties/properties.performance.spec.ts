/**
 * Performance Integration Tests for Property Creation
 * Engineer 4: Performance Integration Testing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../../database/prisma.service';

describe('PropertiesService Performance Tests', () => {
  let service: PropertiesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: {
            property: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('Performance Benchmarks', () => {
    const mockAccountId = 'test-account-id';

    it('should create property within acceptable time (< 100ms)', async () => {
      const dto = {
        address: 'Test Address',
        fileNumber: '12345',
      };

      (prismaService.property.create as jest.Mock).mockResolvedValue({
        id: 'property-1',
        ...dto,
        accountId: mockAccountId,
        _count: { units: 0 },
      });

      const startTime = Date.now();
      await service.create(mockAccountId, dto);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete in < 100ms
      console.log(`Property creation took ${duration}ms`);
    });

    it('should handle multiple property creations efficiently', async () => {
      const properties = Array.from({ length: 10 }, (_, i) => ({
        address: `Test Address ${i}`,
        fileNumber: `1234${i}`,
      }));

      (prismaService.property.create as jest.Mock).mockImplementation((args) =>
        Promise.resolve({
          id: `property-${args.data.fileNumber}`,
          ...args.data,
          _count: { units: 0 },
        }),
      );

      const startTime = Date.now();
      const promises = properties.map((dto) => service.create(mockAccountId, dto));
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // 10 properties should complete in < 500ms
      console.log(`10 property creations took ${duration}ms (avg: ${duration / 10}ms per property)`);
    });

    it('should query properties list efficiently', async () => {
      const mockProperties = Array.from({ length: 100 }, (_, i) => ({
        id: `property-${i}`,
        address: `Test Address ${i}`,
        accountId: mockAccountId,
        _count: { units: 0 },
      }));

      (prismaService.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prismaService.property.count as jest.Mock).mockResolvedValue(100);

      const startTime = Date.now();
      await service.findAll(mockAccountId);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // Querying 100 properties should be < 200ms
      console.log(`Querying 100 properties took ${duration}ms`);
    });
  });
});
