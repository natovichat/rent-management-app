import { api } from '@/lib/api';

export type NotificationType = 'LEASE_EXPIRING' | 'LEASE_EXPIRED';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface Notification {
  id: string;
  accountId: string;
  leaseId: string;
  type: NotificationType;
  daysBeforeExpiration: number;
  sentAt: string | null;
  status: NotificationStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
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
    endDate: string;
  };
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  leaseId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface NotificationListResponse {
  data: Notification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const notificationsApi = {
  /**
   * Get all notifications with optional filters
   */
  getAll: async (filters: NotificationFilters = {}): Promise<NotificationListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.leaseId) params.append('leaseId', filters.leaseId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const response = await api.get<NotificationListResponse>(`/notifications?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single notification by ID
   */
  getById: async (id: string): Promise<Notification> => {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Get upcoming notifications (PENDING status)
   */
  getUpcoming: async (): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>('/notifications/upcoming');
    return response.data;
  },

  /**
   * Generate notifications for expiring leases
   */
  generate: async (): Promise<{ message: string; createdCount: number }> => {
    const response = await api.post<{ message: string; createdCount: number }>('/notifications/generate');
    return response.data;
  },

  /**
   * Process pending notifications (send emails)
   */
  process: async (): Promise<{ processed: number; sent: number; failed: number }> => {
    const response = await api.post<{ processed: number; sent: number; failed: number }>('/notifications/process');
    return response.data;
  },

  /**
   * Retry sending a failed notification
   */
  retry: async (id: string): Promise<Notification> => {
    const response = await api.post<Notification>(`/notifications/${id}/retry`);
    return response.data;
  },

  /**
   * Bulk retry multiple failed notifications
   */
  retryBulk: async (ids: string[]): Promise<{ retried: number; result: any }> => {
    const response = await api.post<{ retried: number; result: any }>('/notifications/retry-bulk', { ids });
    return response.data;
  },

  /**
   * Get notification settings for account
   */
  getSettings: async (): Promise<{ id: string; accountId: string; daysBeforeExpiration: number[]; createdAt: string; updatedAt: string }> => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  /**
   * Update notification settings for account
   */
  updateSettings: async (daysBeforeExpiration: number[]): Promise<{ id: string; accountId: string; daysBeforeExpiration: number[]; createdAt: string; updatedAt: string }> => {
    const response = await api.post('/notifications/settings', { daysBeforeExpiration });
    return response.data;
  },
};
