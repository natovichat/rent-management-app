import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../../database/prisma.service';
import { OwnerType } from '@prisma/client';

interface OwnerCsvRow {
  name: string;
  type?: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface PreviewRow {
  rowNumber: number;
  data: OwnerCsvRow;
  errors: ValidationError[];
  valid: boolean;
}

@Injectable()
export class OwnersCsvService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate example CSV template.
   */
  generateExampleCsv(): string {
    const exampleData = [
      {
        name: 'יצחק נטוביץ',
        type: 'INDIVIDUAL',
        idNumber: '123456789',
        email: 'itzhak@example.com',
        phone: '050-1234567',
        address: 'תל אביב',
        notes: 'בעלים ראשי',
      },
      {
        name: 'חברה בע"מ',
        type: 'COMPANY',
        idNumber: '515123456',
        email: 'company@example.com',
        phone: '',
        address: '',
        notes: '',
      },
    ];

    return stringify(exampleData, {
      header: true,
      columns: ['name', 'type', 'idNumber', 'email', 'phone', 'address', 'notes'],
      bom: true,
    });
  }

  /**
   * Validate a single CSV row.
   */
  private validateRow(record: OwnerCsvRow, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    if (!record.name || record.name.trim() === '') {
      errors.push({ row: rowNumber, field: 'name', message: 'Name is required' });
    }

    if (!record.type) {
      errors.push({ row: rowNumber, field: 'type', message: 'Type is required' });
    } else {
      // Validate type enum
      const validTypes = Object.values(OwnerType);
      if (!validTypes.includes(record.type as OwnerType)) {
        errors.push({
          row: rowNumber,
          field: 'type',
          message: `Invalid owner type: ${record.type}. Valid values: ${validTypes.join(', ')}`,
        });
      }
    }

    // Validate email format (optional)
    if (record.email && record.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Invalid email format',
        });
      }
    }

    return errors;
  }

  /**
   * Validate CSV format and return preview with row-level errors.
   */
  async validateCsvPreview(fileBuffer: Buffer): Promise<{
    valid: boolean;
    rows: PreviewRow[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
    };
  }> {
    try {
      const records: OwnerCsvRow[] = parse(fileBuffer, {
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

      // Check required columns
      const requiredColumns = ['name', 'type'];
      const firstRecord = records[0];
      const missingColumns: string[] = [];

      for (const col of requiredColumns) {
        if (!(col in firstRecord)) {
          missingColumns.push(col);
        }
      }

      if (missingColumns.length > 0) {
        return {
          valid: false,
          rows: [],
          summary: { total: records.length, valid: 0, invalid: records.length },
        };
      }

      // Validate each row
      const previewRows: PreviewRow[] = records.map((record, index) => {
        const rowNumber = index + 2;
        const errors = this.validateRow(record, rowNumber);
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
   * Import owners from CSV.
   */
  async importOwnersFromCsv(
    accountId: string,
    fileBuffer: Buffer,
    skipErrors: boolean = true,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let records: OwnerCsvRow[];

    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2;

      try {
        // Validate row
        const validationErrors = this.validateRow(record, rowNumber);
        if (validationErrors.length > 0 && !skipErrors) {
          throw new Error(validationErrors.map((e) => e.message).join('; '));
        }
        if (validationErrors.length > 0) {
          results.failed++;
          results.errors.push(
            `Row ${rowNumber}: ${validationErrors.map((e) => e.message).join('; ')}`,
          );
          continue;
        }

        // Check for duplicate (by name or ID number)
        const existing = await this.prisma.owner.findFirst({
          where: {
            accountId,
            OR: [
              { name: record.name.trim() },
              ...(record.idNumber
                ? [{ idNumber: record.idNumber.trim() }]
                : []),
            ],
          },
        });

        if (existing) {
          throw new Error(
            `Owner with name "${record.name}" or ID "${record.idNumber}" already exists`,
          );
        }

        // Create owner
        await this.prisma.owner.create({
          data: {
            accountId,
            name: record.name.trim(),
            type: record.type as OwnerType,
            idNumber: record.idNumber?.trim() || null,
            email: record.email?.trim() || null,
            phone: record.phone?.trim() || null,
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
}
