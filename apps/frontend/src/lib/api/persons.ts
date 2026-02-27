import { api } from '../api';

export interface Person {
  id: string;
  name: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonDto {
  name: string;
  idNumber?: string;
  email?: string;
  phone?: string;
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
 * Persons represent individuals (mortgage owners, payers, tenants).
 */
export const personsApi = {
  /**
   * Get all persons with pagination and search.
   */
  getPersons: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<PersonsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
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
   * Delete a person.
   */
  deletePerson: async (id: string): Promise<void> => {
    await api.delete(`/persons/${id}`);
  },

  /**
   * Get all rental agreements for a person (as tenant).
   */
  getPersonRentalAgreements: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/persons/${id}/rental-agreements`);
    return response.data;
  },
};
