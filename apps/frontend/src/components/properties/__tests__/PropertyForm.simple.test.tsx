/**
 * Simple DEBUG test to identify validation error
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dialog } from '@mui/material';
import PropertyForm from '../PropertyForm';

// Mock the API services
jest.mock('@/services/properties', () => ({
  propertiesApi: {
    create: jest.fn().mockResolvedValue({ id: '123', address: 'Test' }),
  },
}));

jest.mock('@/services/investmentCompanies', () => ({
  investmentCompaniesApi: {
    getAll: jest.fn().mockResolvedValue([]), // Return empty array
  },
}));

describe('PropertyForm - Simple DEBUG', () => {
  test('Should log form state and identify validation error', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    
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
    
    console.log('=== FORM RENDERED ===');
    
    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText(/נכס חדש/)).toBeDefined();
    });
    
    console.log('=== FORM IS READY ===');
    
    // Try to find all input fields
    const inputs = screen.getAllByRole('textbox');
    console.log(`Found ${inputs.length} textbox inputs`);
    
    // Log what's on screen
    screen.debug(undefined, 50000);
  });
});
