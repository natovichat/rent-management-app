import { api } from '../api';

// ─── Enums (match Prisma exactly) ─────────────────────────────────────────────

export type PropertyEventType =
  | 'PlanningProcessEvent'
  | 'PropertyDamageEvent'
  | 'ExpenseEvent'
  | 'RentalPaymentRequestEvent';

export type ExpenseEventType =
  | 'MANAGEMENT_FEE'
  | 'REPAIRS'
  | 'MAINTENANCE'
  | 'TAX'
  | 'INSURANCE'
  | 'UTILITIES'
  | 'OTHER';

export type RentalPaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

// ─── Core interface ────────────────────────────────────────────────────────────

export interface PropertyEvent {
  id: string;
  propertyId: string;
  eventType: PropertyEventType;
  eventDate: string;
  description?: string;
  createdAt: string;

  // PlanningProcessEvent fields
  planningStage?: string;
  developerName?: string;
  projectedSizeAfter?: string;

  // PropertyDamageEvent fields
  damageType?: string;
  estimatedDamageCost?: number | string;
  expenseId?: string;

  // ExpenseEvent fields
  expenseType?: ExpenseEventType;
  amount?: number | string;
  paidToAccountId?: string;
  affectsPropertyValue?: boolean;

  // RentalPaymentRequestEvent fields
  rentalAgreementId?: string;
  month?: number;
  year?: number;
  amountDue?: number | string;
  paymentDate?: string;
  paymentStatus?: RentalPaymentStatus;
}

// ─── Create DTOs ──────────────────────────────────────────────────────────────

export interface CreatePlanningProcessEventDto {
  eventDate: string;
  description?: string;
  planningStage?: string;
  developerName?: string;
  projectedSizeAfter?: string;
}

export interface CreatePropertyDamageEventDto {
  eventDate: string;
  description?: string;
  damageType?: string;
  estimatedDamageCost?: number;
  expenseId?: string;
}

export interface CreateExpenseEventDto {
  eventDate: string;
  description?: string;
  expenseType: ExpenseEventType;
  amount: number;
  paidToAccountId?: string;
  affectsPropertyValue?: boolean;
}

export interface CreateRentalPaymentRequestEventDto {
  eventDate: string;
  description?: string;
  rentalAgreementId: string;
  month: number;
  year: number;
  amountDue: number;
  paymentDate?: string;
  paymentStatus?: RentalPaymentStatus;
}

export interface PropertyEventsResponse {
  data: PropertyEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── API service ──────────────────────────────────────────────────────────────

export const propertyEventsApi = {
  getPropertyEvents: async (
    propertyId: string,
    page = 1,
    limit = 20,
    eventType?: PropertyEventType,
  ): Promise<PropertyEventsResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (eventType) params.append('eventType', eventType);
    const response = await api.get<PropertyEventsResponse>(
      `/properties/${propertyId}/events?${params}`,
    );
    return response.data;
  },

  getPropertyEvent: async (propertyId: string, eventId: string): Promise<PropertyEvent> => {
    const response = await api.get<PropertyEvent>(
      `/properties/${propertyId}/events/${eventId}`,
    );
    return response.data;
  },

  createPlanningProcessEvent: async (
    propertyId: string,
    data: CreatePlanningProcessEventDto,
  ): Promise<PropertyEvent> => {
    const response = await api.post<PropertyEvent>(
      `/properties/${propertyId}/events/planning-process`,
      data,
    );
    return response.data;
  },

  createPropertyDamageEvent: async (
    propertyId: string,
    data: CreatePropertyDamageEventDto,
  ): Promise<PropertyEvent> => {
    const response = await api.post<PropertyEvent>(
      `/properties/${propertyId}/events/property-damage`,
      data,
    );
    return response.data;
  },

  createExpenseEvent: async (
    propertyId: string,
    data: CreateExpenseEventDto,
  ): Promise<PropertyEvent> => {
    const response = await api.post<PropertyEvent>(
      `/properties/${propertyId}/events/expense`,
      data,
    );
    return response.data;
  },

  createRentalPaymentRequestEvent: async (
    propertyId: string,
    data: CreateRentalPaymentRequestEventDto,
  ): Promise<PropertyEvent> => {
    const response = await api.post<PropertyEvent>(
      `/properties/${propertyId}/events/rental-payment-request`,
      data,
    );
    return response.data;
  },

  updatePropertyEvent: async (
    propertyId: string,
    eventId: string,
    data: Partial<PropertyEvent>,
  ): Promise<PropertyEvent> => {
    const response = await api.patch<PropertyEvent>(
      `/properties/${propertyId}/events/${eventId}`,
      data,
    );
    return response.data;
  },

  deletePropertyEvent: async (propertyId: string, eventId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}/events/${eventId}`);
  },
};
