import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { PrismaService } from '../../database/prisma.service';
import { PropertyType, PropertyStatus, OwnerType, MortgageStatus } from '@prisma/client';

export interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface PreviewRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: ValidationError[];
  valid: boolean;
}

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate ownerships CSV and return preview.
   */
  async validateOwnershipsCsv(
    accountId: string,
    fileBuffer: Buffer,
  ): Promise<{
    valid: boolean;
    rows: PreviewRow[];
    summary: { total: number; valid: number; invalid: number };
  }> {
    try {
      const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      if (records.length === 0) {
        return {
          valid: false,
          rows: [],
          summary: { total: 0, valid: 0, invalid: 0 },
        };
      }

      const previewRows: PreviewRow[] = records.map((record: any, index: number) => {
        const rowNumber = index + 2;
        const errors: ValidationError[] = [];

        // Validate required fields
        if (!record.propertyAddress) {
          errors.push({ row: rowNumber, field: 'propertyAddress', message: 'Property address is required' });
        }
        if (!record.ownerName) {
          errors.push({ row: rowNumber, field: 'ownerName', message: 'Owner name is required' });
        }
        if (!record.ownershipPercentage) {
          errors.push({ row: rowNumber, field: 'ownershipPercentage', message: 'Ownership percentage is required' });
        } else {
          const percentage = parseFloat(record.ownershipPercentage);
          if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            errors.push({ row: rowNumber, field: 'ownershipPercentage', message: 'Ownership percentage must be between 0 and 100' });
          }
        }
        if (!record.ownershipType) {
          errors.push({ row: rowNumber, field: 'ownershipType', message: 'Ownership type is required' });
        }
        if (!record.startDate) {
          errors.push({ row: rowNumber, field: 'startDate', message: 'Start date is required' });
        }

        // Check if property exists
        if (record.propertyAddress) {
          // Will be checked during import
        }

        // Check if owner exists
        if (record.ownerName) {
          // Will be checked during import
        }

        return {
          rowNumber,
          data: record,
          errors,
          valid: errors.length === 0,
        };
      });

      const validCount = previewRows.filter((r) => r.valid).length;
      const invalidCount = previewRows.filter((r) => !r.valid).length;

      return {
        valid: invalidCount === 0,
        rows: previewRows,
        summary: {
          total: records.length,
          valid: validCount,
          invalid: invalidCount,
        },
      };
    } catch (error: any) {
      return {
        valid: false,
        rows: [],
        summary: { total: 0, valid: 0, invalid: 0 },
      };
    }
  }

  /**
   * Import ownerships from CSV.
   */
  async importOwnershipsFromCsv(
    accountId: string,
    fileBuffer: Buffer,
    skipErrors: boolean = true,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < records.length; i++) {
      const record = records[i] as any;
      const rowNumber = i + 2;

      try {
        // Find property
        const property = await this.prisma.property.findFirst({
          where: {
            accountId,
            address: record.propertyAddress?.trim(),
          },
        });

        if (!property) {
          throw new Error(`Property not found: ${record.propertyAddress}`);
        }

        // Find owner
        const owner = await this.prisma.owner.findFirst({
          where: {
            accountId,
            name: record.ownerName?.trim(),
          },
        });

        if (!owner) {
          throw new Error(`Owner not found: ${record.ownerName}`);
        }

        // Validate percentage
        const percentage = parseFloat(record.ownershipPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          throw new Error('Ownership percentage must be between 0 and 100');
        }

        // Check existing ownership
        const existing = await this.prisma.propertyOwnership.findFirst({
          where: {
            propertyId: property.id,
            ownerId: owner.id,
          },
        });

        if (existing) {
          throw new Error('Ownership already exists');
        }

        // Create ownership
        await this.prisma.propertyOwnership.create({
          data: {
            accountId: property.accountId,
            propertyId: property.id,
            ownerId: owner.id,
            ownershipPercentage: percentage,
            ownershipType: record.ownershipType,
            startDate: new Date(record.startDate),
            endDate: record.endDate ? new Date(record.endDate) : null,
            notes: record.notes?.trim() || null,
          },
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Validate mortgages CSV and return preview.
   */
  async validateMortgagesCsv(
    accountId: string,
    fileBuffer: Buffer,
  ): Promise<{
    valid: boolean;
    rows: PreviewRow[];
    summary: { total: number; valid: number; invalid: number };
  }> {
    try {
      const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      if (records.length === 0) {
        return {
          valid: false,
          rows: [],
          summary: { total: 0, valid: 0, invalid: 0 },
        };
      }

      const previewRows: PreviewRow[] = records.map((record: any, index: number) => {
        const rowNumber = index + 2;
        const errors: ValidationError[] = [];

        if (!record.propertyAddress) {
          errors.push({ row: rowNumber, field: 'propertyAddress', message: 'Property address is required' });
        }
        if (!record.bank) {
          errors.push({ row: rowNumber, field: 'bank', message: 'Bank is required' });
        }
        if (!record.loanAmount) {
          errors.push({ row: rowNumber, field: 'loanAmount', message: 'Loan amount is required' });
        } else {
          const amount = parseFloat(record.loanAmount);
          if (isNaN(amount) || amount <= 0) {
            errors.push({ row: rowNumber, field: 'loanAmount', message: 'Loan amount must be positive' });
          }
        }
        if (!record.startDate) {
          errors.push({ row: rowNumber, field: 'startDate', message: 'Start date is required' });
        }
        if (!record.status) {
          errors.push({ row: rowNumber, field: 'status', message: 'Status is required' });
        } else {
          const validStatuses = Object.values(MortgageStatus);
          if (!validStatuses.includes(record.status as MortgageStatus)) {
            errors.push({ row: rowNumber, field: 'status', message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
          }
        }

        return {
          rowNumber,
          data: record,
          errors,
          valid: errors.length === 0,
        };
      });

      const validCount = previewRows.filter((r) => r.valid).length;
      const invalidCount = previewRows.filter((r) => !r.valid).length;

      return {
        valid: invalidCount === 0,
        rows: previewRows,
        summary: {
          total: records.length,
          valid: validCount,
          invalid: invalidCount,
        },
      };
    } catch (error: any) {
      return {
        valid: false,
        rows: [],
        summary: { total: 0, valid: 0, invalid: 0 },
      };
    }
  }

  /**
   * Import mortgages from CSV.
   */
  async importMortgagesFromCsv(
    accountId: string,
    fileBuffer: Buffer,
    skipErrors: boolean = true,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < records.length; i++) {
      const record = records[i] as any;
      const rowNumber = i + 2;

      try {
        // Find property
        const property = await this.prisma.property.findFirst({
          where: {
            accountId,
            address: record.propertyAddress?.trim(),
          },
        });

        if (!property) {
          throw new Error(`Property not found: ${record.propertyAddress}`);
        }

        // Create mortgage (BankAccount creation removed - not needed for import)
        await this.prisma.mortgage.create({
          data: {
            accountId: property.accountId,
            propertyId: property.id,
            bank: record.bank.trim(),
            loanAmount: parseFloat(record.loanAmount),
            interestRate: record.interestRate ? parseFloat(record.interestRate) : null,
            monthlyPayment: record.monthlyPayment ? parseFloat(record.monthlyPayment) : null,
            startDate: new Date(record.startDate),
            endDate: record.endDate ? new Date(record.endDate) : null,
            status: record.status as MortgageStatus,
            notes: record.notes?.trim() || null,
          },
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Validate plot info CSV and return preview.
   */
  async validatePlotInfoCsv(
    accountId: string,
    fileBuffer: Buffer,
  ): Promise<{
    valid: boolean;
    rows: PreviewRow[];
    summary: { total: number; valid: number; invalid: number };
  }> {
    try {
      const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      if (records.length === 0) {
        return {
          valid: false,
          rows: [],
          summary: { total: 0, valid: 0, invalid: 0 },
        };
      }

      const previewRows: PreviewRow[] = records.map((record: any, index: number) => {
        const rowNumber = index + 2;
        const errors: ValidationError[] = [];

        if (!record.propertyAddress) {
          errors.push({ row: rowNumber, field: 'propertyAddress', message: 'Property address is required' });
        }
        if (!record.gush) {
          errors.push({ row: rowNumber, field: 'gush', message: 'Gush is required' });
        }
        if (!record.chelka) {
          errors.push({ row: rowNumber, field: 'chelka', message: 'Chelka is required' });
        }

        return {
          rowNumber,
          data: record,
          errors,
          valid: errors.length === 0,
        };
      });

      const validCount = previewRows.filter((r) => r.valid).length;
      const invalidCount = previewRows.filter((r) => !r.valid).length;

      return {
        valid: invalidCount === 0,
        rows: previewRows,
        summary: {
          total: records.length,
          valid: validCount,
          invalid: invalidCount,
        },
      };
    } catch (error: any) {
      return {
        valid: false,
        rows: [],
        summary: { total: 0, valid: 0, invalid: 0 },
      };
    }
  }

  /**
   * Import plot info from CSV.
   */
  async importPlotInfoFromCsv(
    accountId: string,
    fileBuffer: Buffer,
    skipErrors: boolean = true,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < records.length; i++) {
      const record = records[i] as any;
      const rowNumber = i + 2;

      try {
        // Find property
        const property = await this.prisma.property.findFirst({
          where: {
            accountId,
            address: record.propertyAddress?.trim(),
          },
        });

        if (!property) {
          throw new Error(`Property not found: ${record.propertyAddress}`);
        }

        // Update or create plot info
        const existingPlotInfo = await this.prisma.plotInfo.findUnique({
          where: { propertyId: property.id },
        });

        if (existingPlotInfo) {
          await this.prisma.plotInfo.update({
            where: { propertyId: property.id },
            data: {
              gush: record.gush.trim(),
              chelka: record.chelka.trim(),
              subChelka: record.subChelka?.trim() || null,
              registryNumber: record.registryNumber?.trim() || null,
              registryOffice: record.registryOffice?.trim() || null,
              notes: record.notes?.trim() || null,
            },
          });
        } else {
          await this.prisma.plotInfo.create({
            data: {
              accountId: property.accountId,
              propertyId: property.id,
              gush: record.gush.trim(),
              chelka: record.chelka.trim(),
              subChelka: record.subChelka?.trim() || null,
              registryNumber: record.registryNumber?.trim() || null,
              registryOffice: record.registryOffice?.trim() || null,
              notes: record.notes?.trim() || null,
            },
          });
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    return results;
  }
}
