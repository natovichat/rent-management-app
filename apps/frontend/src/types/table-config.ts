/**
 * Valid entity types for table configuration
 */
export const ENTITY_TYPES = [
  'properties',
  'tenants',
  'leases',
  'units',
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
  tenants: 'דיירים',
  leases: 'שכירויות',
  units: 'יחידות',
  expenses: 'הוצאות',
  income: 'הכנסות',
  owners: 'בעלים',
  ownerships: 'בעלויות',
  bankAccounts: 'חשבונות בנק',
  mortgages: 'משכנתאות',
};

/**
 * Column configuration
 */
export interface ColumnConfig {
  field: string;
  visible: boolean;
  order: number;
  required: boolean;
}

/**
 * Table configuration
 */
export interface TableConfiguration {
  id: string;
  entityType: EntityType;
  columns: ColumnConfig[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Update table configuration DTO
 */
export interface UpdateTableConfigDto {
  entityType: EntityType;
  columns: ColumnConfig[];
}
