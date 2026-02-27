/**
 * Test form submission and mutation execution
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dialog } from '@mui/material';
import PropertyForm from '../PropertyForm';
import { propertiesApi } from '@/services/properties';

// Mock the API services
jest.mock('@/services/properties', () => ({
  propertiesApi: {
    create: jest.fn(),
  },
}));

jest.mock('@/services/investmentCompanies', () => ({
  investmentCompaniesApi: {
    getAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
  },
}));

const mockPropertiesApi = propertiesApi as jest.Mocked<typeof propertiesApi>;

// Helper to get the actual <input> inside a MUI TextField
const getInput = (testId: string) => {
  const wrapper = screen.getByTestId(testId);
  return wrapper.querySelector('input') as HTMLInputElement;
};

// Helper to submit the form
const submitForm = () => {
  const form = document.querySelector('[data-testid="property-form"]');
  if (form) fireEvent.submit(form);
};

describe('PropertyForm - Submission Test', () => {
  test('Should execute mutation when form is submitted', async () => {
    const mockOnClose = jest.fn();
    
    // Mock successful API response
    mockPropertiesApi.create.mockResolvedValue({
      id: '123',
      address: 'Test Address',
      fileNumber: 'F-2026-001',
      type: 'RESIDENTIAL',
      status: 'OWNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <Dialog open={true} onClose={mockOnClose}>
          <PropertyForm 
            onClose={mockOnClose}
          />
        </Dialog>
      </QueryClientProvider>
    );
    
    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText(/נכס חדש/)).toBeDefined();
    });
    
    // Fill address using fireEvent.change (reliable for React Hook Form)
    const addressInput = getInput('property-address-input');
    fireEvent.change(addressInput, { target: { value: 'רחוב הרצל 123' } });
    
    // Fill file number
    const fileNumberInput = getInput('property-file-number-input');
    fireEvent.change(fileNumberInput, { target: { value: 'F-2026-001' } });
    
    // Select property type using MUI Select pattern
    const typeSelect = screen.getByTestId('property-type-select');
    fireEvent.mouseDown(typeSelect);
    await waitFor(() => screen.getByRole('option', { name: /מגורים/ }));
    fireEvent.click(screen.getByRole('option', { name: /מגורים/ }));
    
    // Select status
    const statusSelect = screen.getByTestId('property-status-select');
    fireEvent.mouseDown(statusSelect);
    await waitFor(() => screen.getByRole('option', { name: /בבעלות/ }));
    fireEvent.click(screen.getByRole('option', { name: /בבעלות/ }));
    
    // Submit the form
    await act(async () => {
      submitForm();
    });
    
    // Wait for mutation to complete - API should be called
    await waitFor(
      () => {
        expect(mockPropertiesApi.create).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
    
    const callArgs = mockPropertiesApi.create.mock.calls[0][0];
    expect(callArgs).toMatchObject({ address: 'רחוב הרצל 123' });
    
    // Check if onClose was eventually called (after success callbacks)
    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  }, 20000);
});
