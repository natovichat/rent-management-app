import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyType, PropertyStatus } from '@prisma/client';

interface PropertyCsvRow {
  address: string;
  type?: string;
  status?: string;
  city?: string;
  country?: string;
  totalArea?: string;
  landArea?: string;
  estimatedValue?: string;
  gush?: string;
  helka?: string;
  isMortgaged?: string;
  fileNumber?: string;
  notes?: string;
}

export interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface PreviewRow {
  rowNumber: number;
  data: PropertyCsvRow;
  errors: ValidationError[];
  valid: boolean;
}

/**
 * Service for CSV import/export of properties.
 */
@Injectable()
export class PropertiesCsvService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate example CSV template with all supported fields.
   */
  generateExampleCsv(): string {
    const exampleData = [
      {
        address: 'שאול חרנם 6',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        city: 'פתח תקווה',
        country: 'Israel',
        totalArea: '140',
        landArea: '100',
        estimatedValue: '7000000',
        gush: '6393',
        helka: '314/45',
        isMortgaged: 'true',
        notes: 'דירת פנטהאוס',
      },
      {
        address: 'רחוב הרצל 50',
        type: 'COMMERCIAL',
        status: 'INVESTMENT',
        city: 'תל אביב',
        country: 'Israel',
        totalArea: '200',
        landArea: '150',
        estimatedValue: '10000000',
        gush: '1234',
        helka: '567/89',
        isMortgaged: 'false',
        notes: 'משרדים',
      },
    ];

    return stringify(exampleData, {
      header: true,
      columns: ['address', 'type', 'status', 'city', 'country', 'totalArea', 'landArea', 'estimatedValue', 'gush', 'helka', 'isMortgaged', 'notes'],
      bom: true, // UTF-8 BOM for Excel
    });
  }

  /**
   * Export properties to CSV.
   * Exports all property fields with Hebrew column headers.
   */
  async exportPropertiesToCsv(accountId: string): Promise<string> {
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      select: {
        address: true,
        fileNumber: true,
        gush: true,
        helka: true,
        isMortgaged: true,
        type: true,
        status: true,
        country: true,
        city: true,
        totalArea: true,
        landArea: true,
        estimatedValue: true,
        lastValuationDate: true,
        notes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (properties.length === 0) {
      throw new BadRequestException('No properties to export');
    }

    // Map properties to CSV format with Hebrew headers
    const csvData = properties.map((prop) => ({
      'כתובת': prop.address || '',
      'מספר תיק': prop.fileNumber || '',
      'גוש': prop.gush || '',
      'חלקה': prop.helka || '',
      'משועבד': prop.isMortgaged ? 'כן' : 'לא',
      'סוג': prop.type || '',
      'סטטוס': prop.status || '',
      'מדינה': prop.country || '',
      'עיר': prop.city || '',
      'שטח כולל': prop.totalArea ? prop.totalArea.toString() : '',
      'שטח קרקע': prop.landArea ? prop.landArea.toString() : '',
      'שווי משוער': prop.estimatedValue ? prop.estimatedValue.toString() : '',
      'תאריך הערכת שווי': prop.lastValuationDate
        ? new Date(prop.lastValuationDate).toISOString().split('T')[0]
        : '',
      'הערות': prop.notes || '',
    }));

    // Define column order with Hebrew headers
    const columns = [
      'כתובת',
      'מספר תיק',
      'גוש',
      'חלקה',
      'משועבד',
      'סוג',
      'סטטוס',
      'מדינה',
      'עיר',
      'שטח כולל',
      'שטח קרקע',
      'שווי משוער',
      'תאריך הערכת שווי',
      'הערות',
    ];

    return stringify(csvData, {
      header: true,
      columns: columns,
      bom: true, // UTF-8 BOM for Excel
    });
  }

  /**
   * Import properties from CSV with full field support.
   */
  async importPropertiesFromCsv(
    accountId: string,
    fileBuffer: Buffer,
    skipErrors: boolean = true,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let records: PropertyCsvRow[];

    // Parse CSV
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true, // Handle UTF-8 BOM
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV: ${error.message}`,
      );
    }

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // +2 because: 1 for header, 1 for 0-index

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

        // Validate required fields
        if (!record.address || record.address.trim() === '') {
          throw new Error('Address is required');
        }

        // Check for duplicate within account
        const existing = await this.prisma.property.findFirst({
          where: {
            accountId,
            address: record.address.trim(),
          },
        });

        if (existing) {
          throw new Error('Property with this address already exists');
        }

        // Parse numeric fields
        const totalArea = record.totalArea ? parseFloat(record.totalArea) : null;
        const landArea = record.landArea ? parseFloat(record.landArea) : null;
        const estimatedValue = record.estimatedValue ? parseFloat(record.estimatedValue) : null;

        // Parse boolean field
        let isMortgaged = false;
        if (record.isMortgaged) {
          const lower = record.isMortgaged.toLowerCase();
          isMortgaged = lower === 'true' || lower === '1' || lower === 'yes';
        }

        // Create property with all fields
        await this.prisma.property.create({
          data: {
            accountId,
            address: record.address.trim(),
            type: record.type ? (record.type as PropertyType) : null,
            status: record.status ? (record.status as PropertyStatus) : null,
            city: record.city?.trim() || null,
            country: record.country?.trim() || 'Israel',
            totalArea: totalArea ? totalArea : null,
            landArea: landArea ? landArea : null,
            estimatedValue: estimatedValue ? estimatedValue : null,
            gush: record.gush?.trim() || null,
            helka: record.helka?.trim() || null,
            isMortgaged,
            fileNumber: record.fileNumber?.trim() || null,
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
   * Validate a single CSV row and return errors.
   */
  private validateRow(record: PropertyCsvRow, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    if (!record.address || record.address.trim() === '') {
      errors.push({ row: rowNumber, field: 'address', message: 'Address is required' });
    }

    // Validate type enum
    if (record.type) {
      const validTypes = Object.values(PropertyType);
      if (!validTypes.includes(record.type as PropertyType)) {
        errors.push({
          row: rowNumber,
          field: 'type',
          message: `Invalid property type: ${record.type}. Valid values: ${validTypes.join(', ')}`,
        });
      }
    }

    // Validate status enum
    if (record.status) {
      const validStatuses = Object.values(PropertyStatus);
      if (!validStatuses.includes(record.status as PropertyStatus)) {
        errors.push({
          row: rowNumber,
          field: 'status',
          message: `Invalid property status: ${record.status}. Valid values: ${validStatuses.join(', ')}`,
        });
      }
    }

    // Validate numeric fields (must be positive if provided)
    if (record.totalArea) {
      const area = parseFloat(record.totalArea);
      if (isNaN(area) || area < 0) {
        errors.push({
          row: rowNumber,
          field: 'totalArea',
          message: 'Total area must be a positive number',
        });
      }
    }

    if (record.landArea) {
      const area = parseFloat(record.landArea);
      if (isNaN(area) || area < 0) {
        errors.push({
          row: rowNumber,
          field: 'landArea',
          message: 'Land area must be a positive number',
        });
      }
    }

    if (record.estimatedValue) {
      const value = parseFloat(record.estimatedValue);
      if (isNaN(value) || value < 0) {
        errors.push({
          row: rowNumber,
          field: 'estimatedValue',
          message: 'Estimated value must be a positive number',
        });
      }
    }

    // Validate boolean field
    if (record.isMortgaged) {
      const lower = record.isMortgaged.toLowerCase();
      if (lower !== 'true' && lower !== 'false' && lower !== '1' && lower !== '0' && lower !== 'yes' && lower !== 'no') {
        errors.push({
          row: rowNumber,
          field: 'isMortgaged',
          message: 'isMortgaged must be true/false, 1/0, or yes/no',
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
      const records: PropertyCsvRow[] = parse(fileBuffer, {
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
      const requiredColumns = ['address', 'type', 'status', 'city'];
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
        const rowNumber = index + 2; // +2 because: 1 for header, 1 for 0-index
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
   * Validate CSV format without importing (legacy method for backward compatibility).
   */
  async validateCsv(fileBuffer: Buffer): Promise<{
    valid: boolean;
    recordCount: number;
    errors: string[];
  }> {
    const preview = await this.validateCsvPreview(fileBuffer);
    
    const errors: string[] = [];
    preview.rows.forEach((row) => {
      row.errors.forEach((error) => {
        errors.push(`Row ${error.row}${error.field ? ` (${error.field})` : ''}: ${error.message}`);
      });
    });

    return {
      valid: preview.valid,
      recordCount: preview.summary.total,
      errors,
    };
  }
}
