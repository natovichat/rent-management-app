import { NotificationType, NotificationStatus } from '@prisma/client';

export class NotificationResponseDto {
  id: string;
  accountId: string;
  leaseId: string;
  type: NotificationType;
  daysBeforeExpiration: number;
  sentAt: Date | null;
  status: NotificationStatus;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional, populated when includeLease is true)
  lease?: {
    id: string;
    unit: {
      id: string;
      apartmentNumber: string;
      property: {
        id: string;
        address: string;
      };
    };
    tenant: {
      id: string;
      name: string;
    };
    endDate: Date;
  };
}
