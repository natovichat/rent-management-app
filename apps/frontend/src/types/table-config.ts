/**
 * Valid entity types for table configuration
 */
export const ENTITY_TYPES = [
  'properties',
  'leases',
  'expenses',
  'income',
  'owners',
  'ownerships',
  'bankAccounts',
  'mortgages',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

/**
 * Entity display names (Hebrew)
 */
export const ENTITY_DISPLAY_NAMES: Record<EntityType, string> = {
  properties: 'נכסים',
  leases: 'שכירויות',
  expenses: 'הוצאות',
  income: 'הכנסות',
  owners: 'בעלים',
  ownerships: 'בעלויות',
  bankAccounts: 'חשבונות בנק',
  mortgages: 'משכנתאות',
};

/**
 * Column configuration
 * NEW STRUCTURE: Matches backend response format
 */
export interface ColumnConfig {
  field: string;
  visible: boolean;
  order: number;
}

/**
 * Table configuration
 * NEW STRUCTURE: Each column is a separate database row
 */
export interface TableConfiguration {
  tableName: string;
  columns: ColumnConfig[];
}

/**
 * Update table configuration DTO
 */
export interface UpdateTableConfigDto {
  entityType: EntityType;
  columns: ColumnConfig[];
}
