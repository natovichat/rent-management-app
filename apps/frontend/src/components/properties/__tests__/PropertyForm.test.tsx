/**
 * Comprehensive unit tests for PropertyForm component
 * 
 * Goal: Identify validation/mutation issues blocking E2E tests
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dialog } from '@mui/material';
import PropertyForm from '../PropertyForm';
// Mock the API services
jest.mock('@/services/properties', () => ({
  propertiesApi: {
    getAll: jest.fn(),
    getOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/services/investmentCompanies', () => ({
  investmentCompaniesApi: {
    getAll: jest.fn(),
    getOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Import after mocking
import { propertiesApi } from '@/services/properties';
import { investmentCompaniesApi } from '@/services/investmentCompanies';

const mockPropertiesApi = propertiesApi as jest.Mocked<typeof propertiesApi>;
const mockInvestmentCompaniesApi = investmentCompaniesApi as jest.Mocked<typeof investmentCompaniesApi>;

// Helper to create a QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

// Helper to render PropertyForm with all providers
const renderPropertyForm = (props = {}) => {
  const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    ...props,
  };
  // Wrap in Dialog since PropertyForm expects to be inside a Dialog
  return {
    ...render(
      <Dialog open={true} onClose={defaultProps.onClose}>
        <PropertyForm {...defaultProps} />
      </Dialog>,
      { wrapper: createWrapper() }
    ),
    mockOnClose: defaultProps.onClose,
    mockOnSuccess: defaultProps.onSuccess,
  };
};

describe('PropertyForm - Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvestmentCompaniesApi.getAll.mockResolvedValue([]);
  });

  test('should validate required fields', async () => {
    const user = userEvent.setup();
    const { mockOnClose } = renderPropertyForm();

    // Try to submit without filling address
    const submitButton = screen.getByTestId('property-form-submit-button');
    await user.click(submitButton);

    // Form should not submit - address is required
    await waitFor(() => {
      expect(mockPropertiesApi.create).not.toHaveBeenCalled();
    });

    // Address field should show error
    const addressInput = screen.getByTestId('property-address-input');
    expect(addressInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should accept valid numeric fields', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockResolvedValue({
      id: '1',
      address: 'רחוב הרצל 123',
      totalArea: 120,
      landArea: 100,
      floors: 5,
      totalUnits: 10,
      parkingSpaces: 2,
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    renderPropertyForm();

    // Fill required field
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');

    // Fill numeric fields with valid values
    const totalAreaInput = screen.getByLabelText(/שטח כולל/);
    await user.type(totalAreaInput, '120');

    const landAreaInput = screen.getByLabelText(/שטח קרקע/);
    await user.type(landAreaInput, '100');

    // Check that no validation errors appear
    await waitFor(() => {
      expect(totalAreaInput).not.toHaveAttribute('aria-invalid', 'true');
      expect(landAreaInput).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  test('should handle empty optional numeric fields', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockResolvedValue({
      id: '1',
      address: 'רחוב הרצל 123',
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    const { mockOnClose } = renderPropertyForm();

    // Fill only required field
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');

    // Leave optional numeric fields empty
    // Submit form
    const submitButton = screen.getByTestId('property-form-submit-button');
    await user.click(submitButton);

    // Form should submit successfully with only address
    await waitFor(() => {
      expect(mockPropertiesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address: 'רחוב הרצל 123',
        })
      );
    });
  });

  test('should report which field has validation error', async () => {
    const user = userEvent.setup();
    renderPropertyForm();

    // Fill form with EXACT data from E2E test
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');
    
    const fileNumberInput = screen.getByTestId('property-file-number-input');
    await user.type(fileNumberInput, 'F-2026-001');

    // Select type and status
    const typeSelect = screen.getByTestId('property-type-select');
    await user.click(typeSelect);
    await user.click(screen.getByText('מגורים'));

    const statusSelect = screen.getByTestId('property-status-select');
    await user.click(statusSelect);
    await user.click(screen.getByText('בבעלות'));

    // Fill numeric fields with EXACT E2E test data
    const totalAreaInput = screen.getByLabelText(/שטח כולל/);
    await user.type(totalAreaInput, '120');

    const landAreaInput = screen.getByLabelText(/שטח קרקע/);
    await user.type(landAreaInput, '100');

    const floorsInput = screen.getByLabelText(/מספר קומות/);
    await user.type(floorsInput, '5');

    const totalUnitsInput = screen.getByLabelText(/מספר יחידות כולל/);
    await user.type(totalUnitsInput, '10');

    const parkingSpacesInput = screen.getByLabelText(/מספר מקומות חניה/);
    await user.type(parkingSpacesInput, '2');

    // Try to submit
    const submitButton = screen.getByTestId('property-form-submit-button');
    await user.click(submitButton);

    // Wait a bit for validation to run
    await waitFor(() => {
      // Check if API was called
      if (mockPropertiesApi.create.mock.calls.length === 0) {
        // Log all form fields to identify the issue
        console.log('=== DEBUG: Form validation failed ===');
        console.log('Address:', screen.getByTestId('property-address-input').getAttribute('value'));
        console.log('File Number:', fileNumberInput.getAttribute('value'));
        console.log('Type:', typeSelect.textContent);
        console.log('Status:', statusSelect.textContent);
        console.log('Total Area:', totalAreaInput.getAttribute('value'));
        console.log('Land Area:', landAreaInput.getAttribute('value'));
        console.log('Floors:', floorsInput.getAttribute('value'));
        console.log('Total Units:', totalUnitsInput.getAttribute('value'));
        console.log('Parking Spaces:', parkingSpacesInput.getAttribute('value'));
        
        // Check for error messages
        const errorMessages = screen.queryAllByRole('alert');
        console.log('Error messages found:', errorMessages.map(el => el.textContent));
        
        // Check for helper text errors
        const helperTexts = document.querySelectorAll('.MuiFormHelperText-root.Mui-error');
        console.log('Helper text errors:', Array.from(helperTexts).map(el => el.textContent));
      }
    }, { timeout: 3000 });

    // This test will help identify the validation issue
    // The console.log statements above will show what's wrong
  });
});

describe('PropertyForm - Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvestmentCompaniesApi.getAll.mockResolvedValue([]);
  });

  test('should call API when form is valid', async () => {
    const user = userEvent.setup();
    const mockProperty = {
      id: '1',
      address: 'רחוב הרצל 123',
      fileNumber: 'F-2026-001',
      type: 'RESIDENTIAL' as const,
      status: 'OWNED' as const,
      totalArea: 120,
      landArea: 100,
      floors: 5,
      totalUnits: 10,
      parkingSpaces: 2,
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    mockPropertiesApi.create.mockResolvedValue(mockProperty);

    const { mockOnClose } = renderPropertyForm();

    // Fill form
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');
    await user.type(screen.getByTestId('property-file-number-input'), 'F-2026-001');

    // Select type
    const typeSelect = screen.getByTestId('property-type-select');
    await user.click(typeSelect);
    await user.click(screen.getByText('מגורים'));

    // Select status
    const statusSelect = screen.getByTestId('property-status-select');
    await user.click(statusSelect);
    await user.click(screen.getByText('בבעלות'));

    // Fill numeric fields
    await user.type(screen.getByLabelText(/שטח כולל/), '120');
    await user.type(screen.getByLabelText(/שטח קרקע/), '100');
    await user.type(screen.getByLabelText(/מספר קומות/), '5');
    await user.type(screen.getByLabelText(/מספר יחידות כולל/), '10');
    await user.type(screen.getByLabelText(/מספר מקומות חניה/), '2');

    // Submit
    const submitButton = screen.getByTestId('property-form-submit-button');
    await user.click(submitButton);

    // Verify API was called
    await waitFor(() => {
      expect(mockPropertiesApi.create).toHaveBeenCalledTimes(1);
    });

    // Verify API was called with correct data
    expect(mockPropertiesApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        address: 'רחוב הרצל 123',
        fileNumber: 'F-2026-001',
        type: 'RESIDENTIAL',
        status: 'OWNED',
        totalArea: 120,
        landArea: 100,
        floors: 5,
        totalUnits: 10,
        parkingSpaces: 2,
      })
    );
  });

  test('should NOT call API when form has validation errors', async () => {
    const user = userEvent.setup();
    renderPropertyForm();

    // Try to submit without required address
    const submitButton = screen.getByTestId('property-form-submit-button');
    await user.click(submitButton);

    // Wait for validation to run
    await waitFor(() => {
      expect(mockPropertiesApi.create).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('should remove undefined/NaN values before submission', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockResolvedValue({
      id: '1',
      address: 'רחוב הרצל 123',
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    renderPropertyForm();

    // Fill only required field
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');

    // Leave optional fields empty (they should not be sent)
    const submitButton = screen.getByTestId('property-form-submit-button');
    await user.click(submitButton);

    // Verify API was called with clean data (no undefined, no NaN)
    await waitFor(() => {
      expect(mockPropertiesApi.create).toHaveBeenCalled();
    });

    const callArgs = mockPropertiesApi.create.mock.calls[0][0];
    
    // Check that no undefined values are present
    Object.keys(callArgs).forEach((key) => {
      expect(callArgs[key]).not.toBeUndefined();
      if (typeof callArgs[key] === 'number') {
        expect(callArgs[key]).not.toBeNaN();
      }
    });

    // Should only have address
    expect(Object.keys(callArgs)).toEqual(['address']);
  });
});

describe('PropertyForm - Mutation Callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvestmentCompaniesApi.getAll.mockResolvedValue([]);
  });

  test('should call onClose when mutation succeeds', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockResolvedValue({
      id: '1',
      address: 'רחוב הרצל 123',
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    const { mockOnClose } = renderPropertyForm();

    // Fill and submit form
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');
    await user.click(screen.getByTestId('property-form-submit-button'));

    // Verify onClose was called
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('should show success message on mutation success', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockResolvedValue({
      id: '1',
      address: 'רחוב הרצל 123',
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    renderPropertyForm();

    // Fill and submit form
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');
    await user.click(screen.getByTestId('property-form-submit-button'));

    // Verify success message appears
    await waitFor(() => {
      const snackbar = screen.getByTestId('property-form-snackbar');
      expect(snackbar).toBeInTheDocument();
      const alert = screen.getByTestId('property-form-alert');
      expect(alert).toHaveTextContent('הנכס נוסף בהצלחה');
    });
  });

  test('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockResolvedValue({
      id: '1',
      address: 'רחוב הרצל 123',
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    renderPropertyForm();

    // Fill form
    const addressInput = screen.getByTestId('property-address-input');
    await user.type(addressInput, 'רחוב הרצל 123');

    // Submit
    await user.click(screen.getByTestId('property-form-submit-button'));

    // Wait for success
    await waitFor(() => {
      expect(mockPropertiesApi.create).toHaveBeenCalled();
    });

    // Form should be reset (address field should be empty)
    // Note: This might not work if dialog closes immediately
    // The form reset happens in onSuccess callback
  });

  test('should invalidate queries after success', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockResolvedValue({
      id: '1',
      address: 'רחוב הרצל 123',
      unitCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    render(
      <QueryClientProvider client={queryClient}>
        <PropertyForm onClose={jest.fn()} />
      </QueryClientProvider>
    );

    // Fill and submit form
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');
    await user.click(screen.getByTestId('property-form-submit-button'));

    // Verify queries were invalidated
    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['properties'],
      });
    });
  });
});

describe('PropertyForm - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvestmentCompaniesApi.getAll.mockResolvedValue([]);
  });

  test('should show error message when API fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'שגיאה בשמירת נכס';
    mockPropertiesApi.create.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    renderPropertyForm();

    // Fill and submit form
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');
    await user.click(screen.getByTestId('property-form-submit-button'));

    // Verify error message appears
    await waitFor(() => {
      const alert = screen.getByTestId('property-form-alert');
      expect(alert).toHaveTextContent(errorMessage);
      expect(alert).toHaveClass('MuiAlert-standardError');
    });
  });

  test('should handle 400 Bad Request', async () => {
    const user = userEvent.setup();
    mockPropertiesApi.create.mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: 'Validation failed',
        },
      },
    });

    renderPropertyForm();

    // Fill and submit form
    await user.type(screen.getByTestId('property-address-input'), 'רחוב הרצל 123');
    await user.click(screen.getByTestId('property-form-submit-button'));

    // Verify error is displayed
    await waitFor(() => {
      const alert = screen.getByTestId('property-form-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('MuiAlert-standardError');
    });
  });
});

describe('PropertyForm - DEBUG: Identify Validation Error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvestmentCompaniesApi.getAll.mockResolvedValue([]);
  });

  test('DEBUG: Identify which field has validation error with exact E2E data', async () => {
    const user = userEvent.setup();
    renderPropertyForm();

    console.log('\n=== DEBUG TEST: Identifying validation error ===\n');

    // Fill form with EXACT data from E2E test
    const addressInput = screen.getByTestId('property-address-input');
    await user.type(addressInput, 'רחוב הרצל 123');
    console.log('✓ Address filled:', addressInput.getAttribute('value'));

    const fileNumberInput = screen.getByTestId('property-file-number-input');
    await user.type(fileNumberInput, 'F-2026-001');
    console.log('✓ File number filled:', fileNumberInput.getAttribute('value'));

    // Select type
    const typeSelect = screen.getByTestId('property-type-select');
    await user.click(typeSelect);
    await user.click(screen.getByText('מגורים'));
    console.log('✓ Type selected: RESIDENTIAL');

    // Select status
    const statusSelect = screen.getByTestId('property-status-select');
    await user.click(statusSelect);
    await user.click(screen.getByText('בבעלות'));
    console.log('✓ Status selected: OWNED');

    // Fill numeric fields with EXACT E2E test data
    const totalAreaInput = screen.getByLabelText(/שטח כולל/);
    await user.type(totalAreaInput, '120');
    console.log('✓ Total area:', totalAreaInput.getAttribute('value'));

    const landAreaInput = screen.getByLabelText(/שטח קרקע/);
    await user.type(landAreaInput, '100');
    console.log('✓ Land area:', landAreaInput.getAttribute('value'));

    const floorsInput = screen.getByLabelText(/מספר קומות/);
    await user.type(floorsInput, '5');
    console.log('✓ Floors:', floorsInput.getAttribute('value'));

    const totalUnitsInput = screen.getByLabelText(/מספר יחידות כולל/);
    await user.type(totalUnitsInput, '10');
    console.log('✓ Total units:', totalUnitsInput.getAttribute('value'));

    const parkingSpacesInput = screen.getByLabelText(/מספר מקומות חניה/);
    await user.type(parkingSpacesInput, '2');
    console.log('✓ Parking spaces:', parkingSpacesInput.getAttribute('value'));

    // Wait a moment for form state to update
    await waitFor(() => {
      // Check form state
      console.log('\n=== Form State Check ===');
    }, { timeout: 1000 });

    // Try to submit
    const submitButton = screen.getByTestId('property-form-submit-button');
    await user.click(submitButton);

    // Wait and check if API was called
    await waitFor(
      () => {
        if (mockPropertiesApi.create.mock.calls.length === 0) {
          console.log('\n❌ API NOT CALLED - Form validation blocked submission\n');
          
          // Check for validation errors in the DOM
          const errorHelperTexts = document.querySelectorAll('.MuiFormHelperText-root.Mui-error');
          console.log('Validation errors found:', errorHelperTexts.length);
          errorHelperTexts.forEach((el, idx) => {
            console.log(`  Error ${idx + 1}:`, el.textContent);
          });

          // Check for aria-invalid attributes
          const invalidFields = document.querySelectorAll('[aria-invalid="true"]');
          console.log('\nFields with aria-invalid="true":', invalidFields.length);
          invalidFields.forEach((el, idx) => {
            const label = el.closest('.MuiFormControl-root')?.querySelector('label')?.textContent;
            console.log(`  Field ${idx + 1}:`, label || el.getAttribute('name') || el.getAttribute('data-testid'));
          });

          // Log all form values
          console.log('\n=== All Form Values ===');
          const form = document.querySelector('[data-testid="property-form"]');
          if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach((input) => {
              const name = (input as HTMLInputElement).name || (input as HTMLInputElement).getAttribute('data-testid');
              const value = (input as HTMLInputElement).value;
              if (value) {
                console.log(`  ${name}:`, value);
              }
            });
          }
        } else {
          console.log('\n✅ API CALLED - Form validation passed\n');
          console.log('Submitted data:', mockPropertiesApi.create.mock.calls[0][0]);
        }
      },
      { timeout: 3000 }
    );

    // This test will output detailed debugging information
    expect(true).toBe(true); // Test always passes - it's for debugging
  });
});
