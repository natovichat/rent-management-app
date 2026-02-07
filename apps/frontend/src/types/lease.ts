/**
 * Lease-related types for frontend
 * These mirror the Prisma schema enums without requiring @prisma/client
 */

export enum LeaseStatus {
  FUTURE = 'FUTURE',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export type LeaseStatusType = keyof typeof LeaseStatus;
