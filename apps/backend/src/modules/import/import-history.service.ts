import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ImportHistory {
  id: string;
  accountId: string;
  importType: 'properties' | 'owners' | 'ownerships' | 'mortgages' | 'plot-info';
  status: 'success' | 'partial' | 'failed';
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  createdAt: Date;
  importedRecordIds: string[]; // IDs of created records for rollback
}

@Injectable()
export class ImportHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Store import history (in-memory for now, can be moved to DB later).
   */
  private importHistory: Map<string, ImportHistory> = new Map();

  async createImportHistory(
    accountId: string,
    importType: ImportHistory['importType'],
    totalRows: number,
    successfulRows: number,
    failedRows: number,
    errors: string[],
    importedRecordIds: string[],
  ): Promise<string> {
    const id = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const status: ImportHistory['status'] =
      failedRows === 0 ? 'success' : successfulRows > 0 ? 'partial' : 'failed';

    const history: ImportHistory = {
      id,
      accountId,
      importType,
      status,
      totalRows,
      successfulRows,
      failedRows,
      errors,
      createdAt: new Date(),
      importedRecordIds,
    };

    this.importHistory.set(id, history);
    return id;
  }

  async getImportHistory(id: string): Promise<ImportHistory | null> {
    return this.importHistory.get(id) || null;
  }

  async getImportHistoryByAccount(
    accountId: string,
    importType?: ImportHistory['importType'],
  ): Promise<ImportHistory[]> {
    const all = Array.from(this.importHistory.values());
    return all.filter(
      (h) => h.accountId === accountId && (!importType || h.importType === importType),
    );
  }

  /**
   * Rollback an import by deleting all created records.
   */
  async rollbackImport(id: string): Promise<{ success: boolean; deletedCount: number }> {
    const history = await this.getImportHistory(id);
    if (!history) {
      throw new Error('Import history not found');
    }

    let deletedCount = 0;

    try {
      switch (history.importType) {
        case 'properties':
          await this.prisma.property.deleteMany({
            where: {
              id: { in: history.importedRecordIds },
            },
          });
          deletedCount = history.importedRecordIds.length;
          break;
        case 'owners':
          await this.prisma.owner.deleteMany({
            where: {
              id: { in: history.importedRecordIds },
            },
          });
          deletedCount = history.importedRecordIds.length;
          break;
        case 'ownerships':
          await this.prisma.propertyOwnership.deleteMany({
            where: {
              id: { in: history.importedRecordIds },
            },
          });
          deletedCount = history.importedRecordIds.length;
          break;
        case 'mortgages':
          await this.prisma.mortgage.deleteMany({
            where: {
              id: { in: history.importedRecordIds },
            },
          });
          deletedCount = history.importedRecordIds.length;
          break;
        case 'plot-info':
          await this.prisma.plotInfo.deleteMany({
            where: {
              propertyId: { in: history.importedRecordIds },
            },
          });
          deletedCount = history.importedRecordIds.length;
          break;
      }

      // Mark history as rolled back
      history.status = 'failed';
      this.importHistory.set(id, history);

      return { success: true, deletedCount };
    } catch (error: any) {
      throw new Error(`Rollback failed: ${error.message}`);
    }
  }
}
