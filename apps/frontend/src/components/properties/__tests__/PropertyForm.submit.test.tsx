/**
 * Test form submission and mutation execution
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

const mockPropertiesApi = propertiesApi as jest.Mocked<typeof propertiesApi>;

describe('PropertyForm - Submission Test', () => {
  test('Should execute mutation when form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    const mockSetSnackbar = jest.fn();
    
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
            setSnackbar={mockSetSnackbar}
          />
        </Dialog>
      </QueryClientProvider>
    );
    
    console.log('=== TEST STARTED ===');
    
    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText(/נכס חדש/)).toBeInTheDocument();
    });
    
    console.log('=== FORM READY - Starting to fill fields ===');
    
    // Fill required fields
    const addressInput = screen.getByLabelText(/כתובת/);
    await user.clear(addressInput);
    await user.type(addressInput, 'רחוב הרצל 123');
    console.log('✓ Address filled');
    
    const fileNumberInput = screen.getByLabelText(/מספר תיק/);
    await user.clear(fileNumberInput);
    await user.type(fileNumberInput, 'F-2026-001');
    console.log('✓ File number filled');
    
    // Find and click property type select
    const typeSelect = screen.getByLabelText(/סוג נכס/);
    await user.click(typeSelect);
    
    // Wait for dropdown options
    await waitFor(() => {
      const option = screen.queryByRole('option', { name: /מגורים/ });
      if (option) {
        return true;
      }
      throw new Error('Waiting for dropdown options');
    });
    
    const residentialOption = screen.getByRole('option', { name: /מגורים/ });
    await user.click(residentialOption);
    console.log('✓ Property type selected: מגורים');
    
    // Find and click status select
    const statusSelect = screen.getByLabelText(/סטטוס/);
    await user.click(statusSelect);
    
    await waitFor(() => {
      const option = screen.queryByRole('option', { name: /בבעלות/ });
      if (option) {
        return true;
      }
      throw new Error('Waiting for status options');
    });
    
    const ownedOption = screen.getByRole('option', { name: /בבעלות/ });
    await user.click(ownedOption);
    console.log('✓ Status selected: בבעלות');
    
    console.log('=== ALL REQUIRED FIELDS FILLED - Finding submit button ===');
    
    // Find submit button
    const submitButton = screen.getByRole('button', { name: /שמור/ });
    console.log('✓ Submit button found');
    
    // Check if button is disabled
    console.log(`Submit button disabled: ${submitButton.hasAttribute('disabled')}`);
    
    // Click submit
    console.log('=== CLICKING SUBMIT BUTTON ===');
    await user.click(submitButton);
    
    console.log('=== WAITING FOR API CALL ===');
    
    // Wait for mutation to complete
    await waitFor(
      () => {
        console.log(`API call count: ${mockPropertiesApi.create.mock.calls.length}`);
        expect(mockPropertiesApi.create).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
    
    console.log('✓✓✓ API WAS CALLED! ✓✓✓');
    console.log('API called with:', mockPropertiesApi.create.mock.calls[0][0]);
    
    // Check if onClose was called
    await waitFor(
      () => {
        console.log(`onClose call count: ${mockOnClose.mock.calls.length}`);
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
    
    console.log('✓✓✓ ONCLOSE WAS CALLED! ✓✓✓');
    
    // Check if success message was shown
    await waitFor(
      () => {
        console.log(`setSnackbar call count: ${mockSetSnackbar.mock.calls.length}`);
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            open: true,
            severity: 'success',
          })
        );
      },
      { timeout: 3000 }
    );
    
    console.log('✓✓✓ SUCCESS MESSAGE SHOWN! ✓✓✓');
    console.log('Success message:', mockSetSnackbar.mock.calls[0][0]);
    
    console.log('=== TEST PASSED! ALL CALLBACKS EXECUTED ===');
  }, 30000); // 30 second timeout
});
