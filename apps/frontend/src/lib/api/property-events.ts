import { api } from '../api';

export type PropertyEventType = 'PLANNING_PROCESS' | 'PROPERTY_DAMAGE' | 'EXPENSE' | 'RENTAL_PAYMENT_REQUEST';
export type ExpenseEventType = 'REPAIR' | 'MAINTENANCE' | 'IMPROVEMENT' | 'TAX' | 'INSURANCE' | 'UTILITY' | 'MANAGEMENT_FEE' | 'OTHER';
export type RentalPaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface PropertyEvent {
  id: string;
  propertyId: string;
  eventType: PropertyEventType;
  eventDate: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Type-specific fields
  planningStage?: string;
  developerName?: string;
  projectedSizeAfter?: number;
  damageType?: string;
  estimatedDamageCost?: number;
  expenseId?: string;
  expenseType?: ExpenseEventType;
  amount?: number;
  paidToAccount?: string;
  affectsPropertyValue?: boolean;
  rentalAgreementId?: string;
  month?: number;
  year?: number;
  paymentDate?: string;
  paymentStatus?: RentalPaymentStatus;
}

export interface CreatePlanningProcessEventDto {
  eventDate: string;
  description?: string;
  notes?: string;
  planningStage?: string;
  developerName?: string;
  projectedSizeAfter?: number;
}

export interface CreatePropertyDamageEventDto {
  eventDate: string;
  description?: string;
  notes?: string;
  damageType?: string;
  estimatedDamageCost?: number;
  expenseId?: string;
}

export interface CreateExpenseEventDto {
  eventDate: string;
  description?: string;
  notes?: string;
  expenseType: ExpenseEventType;
  amount: number;
  paidToAccount?: string;
  affectsPropertyValue?: boolean;
}

export interface CreateRentalPaymentRequestEventDto {
  eventDate: string;
  description?: string;
  notes?: string;
  rentalAgreementId: string;
  month: number;
  year: number;
  amount: number;
  paymentDate?: string;
  paymentStatus: RentalPaymentStatus;
}

export interface PropertyEventsResponse {
  data: PropertyEvent[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Property Event API service.
 * Polymorphic events with 4 types.
 */
export const propertyEventsApi = {
  /**
   * Get all events for a property.
   */
  getPropertyEvents: async (
    propertyId: string,
    page: number = 1,
    limit: number = 10,
    eventType?: PropertyEventType,
  ): Promise<PropertyEventsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (eventType) {
      params.append('eventType', eventType);
    }

    const response = await api.get<PropertyEventsResponse>(
      `/properties/${propertyId}/events?${params}`,
    );
    return response.data;
  },

  /**
   * Get a single event by ID.
   */
  getPropertyEvent: async (propertyId: string, eventId: string): Promise<PropertyEvent> => {
    const response = await api.get<PropertyEvent>(`/properties/${propertyId}/events/${eventId}`);
    return response.data;
  },

  /**
   * Create a planning process event.
   */
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

  /**
   * Create a property damage event.
   */
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

  /**
   * Create an expense event.
   */
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

  /**
   * Create a rental payment request event.
   */
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

  /**
   * Update an event.
   */
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

  /**
   * Delete an event.
   */
  deletePropertyEvent: async (propertyId: string, eventId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}/events/${eventId}`);
  },
};
