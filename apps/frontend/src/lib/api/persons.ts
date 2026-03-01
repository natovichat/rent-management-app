import { api } from '../api';

export type PersonType = 'INDIVIDUAL' | 'COMPANY' | 'PARTNERSHIP';

export interface Person {
  id: string;
  name: string;
  type: PersonType;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreatePersonDto {
  name: string;
  type?: PersonType;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdatePersonDto extends Partial<CreatePersonDto> {}

export interface PersonsResponse {
  data: Person[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Person API service.
 * Persons are the universal entity representing individuals, companies, and partnerships.
 * They can act as property owners, tenants, mortgage holders, etc.
 */
export const personsApi = {
  /**
   * Get all persons with pagination, search, and type filter.
   */
  getPersons: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: PersonType,
    includeDeleted?: boolean,
  ): Promise<PersonsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }
    if (type) {
      params.append('type', type);
    }
    if (includeDeleted) {
      params.append('includeDeleted', 'true');
    }

    const response = await api.get<PersonsResponse>(`/persons?${params}`);
    return response.data;
  },

  /**
   * Get a person by ID.
   */
  getPerson: async (id: string): Promise<Person> => {
    const response = await api.get<Person>(`/persons/${id}`);
    return response.data;
  },

  /**
   * Create a new person.
   */
  createPerson: async (data: CreatePersonDto): Promise<Person> => {
    const response = await api.post<Person>('/persons', data);
    return response.data;
  },

  /**
   * Update a person.
   */
  updatePerson: async (id: string, data: UpdatePersonDto): Promise<Person> => {
    const response = await api.patch<Person>(`/persons/${id}`, data);
    return response.data;
  },

  /**
   * Soft-delete a person.
   */
  deletePerson: async (id: string): Promise<void> => {
    await api.delete(`/persons/${id}`);
  },

  /**
   * Restore a soft-deleted person.
   */
  restorePerson: async (id: string): Promise<Person> => {
    const response = await api.patch<Person>(`/persons/${id}/restore`);
    return response.data;
  },

  /**
   * Get all ownerships for a person (as property owner).
   */
  getPersonOwnerships: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/persons/${id}/ownerships`);
    return response.data;
  },

  /**
   * Get all rental agreements for a person (as tenant).
   */
  getPersonRentalAgreements: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/persons/${id}/rental-agreements`);
    return response.data;
  },
};
