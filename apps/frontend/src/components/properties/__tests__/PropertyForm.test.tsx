/**
 * Unit tests for PropertyForm component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dialog } from '@mui/material';
import PropertyForm from '../PropertyForm';

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

import { propertiesApi } from '@/services/properties';
import { investmentCompaniesApi } from '@/services/investmentCompanies';

const mockPropertiesApi = propertiesApi as jest.Mocked<typeof propertiesApi>;
const mockInvestmentCompaniesApi = investmentCompaniesApi as jest.Mocked<typeof investmentCompaniesApi>;

const defaultMockProperty = {
  id: '1',
  address: 'רחוב הרצל 123',
  unitCount: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const renderPropertyForm = (props: Record<string, unknown> = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const defaultProps = { onClose: jest.fn(), onSuccess: jest.fn(), ...props };

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <Dialog open={true} onClose={defaultProps.onClose}>
          <PropertyForm {...defaultProps} />
        </Dialog>
      </QueryClientProvider>
    ),
    queryClient,
    mockOnClose: defaultProps.onClose as jest.Mock,
    mockOnSuccess: defaultProps.onSuccess as jest.Mock,
  };
};

// Helper: get the actual <input> inside a MUI TextField wrapper
const getInput = (testId: string) => {
  const wrapper = screen.getByTestId(testId);
  return wrapper.querySelector('input') as HTMLInputElement;
};

// Helper: set input value using fireEvent.change (most reliable for React Hook Form)
const setInputValue = (testId: string, value: string) => {
  const input = getInput(testId);
  fireEvent.change(input, { target: { value } });
};

// Helper: open MUI Select and pick an option
const selectMuiOption = async (testId: string, optionName: string) => {
  const selectEl = screen.getByTestId(testId);
  fireEvent.mouseDown(selectEl);
  const option = await screen.findByRole('option', { name: optionName });
  fireEvent.click(option);
};

// Helper: submit the form directly
const submitForm = () => {
  const form = document.querySelector('[data-testid="property-form"]');
  if (form) fireEvent.submit(form);
};

beforeEach(() => {
  jest.clearAllMocks();
  mockInvestmentCompaniesApi.getAll.mockResolvedValue({
    data: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  });
});

describe('PropertyForm - Rendering', () => {
  test('renders address field', () => {
    renderPropertyForm();
    expect(screen.getByTestId('property-address-input')).toBeDefined();
    expect(getInput('property-address-input')).toBeDefined();
  });

  test('renders submit button', () => {
    renderPropertyForm();
    expect(screen.getByTestId('property-form-submit-button')).toBeDefined();
  });
});

describe('PropertyForm - Validation', () => {
  test('does not call API when address is empty', async () => {
    renderPropertyForm();
    submitForm();

    await waitFor(() => {
      expect(mockPropertiesApi.create).not.toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('shows address validation error on empty submit', async () => {
    renderPropertyForm();
    submitForm();

    await waitFor(() => {
      const input = getInput('property-address-input');
      const helperTextError = document.querySelector('.MuiFormHelperText-root.Mui-error');
      expect(input?.getAttribute('aria-invalid') === 'true' || !!helperTextError).toBe(true);
    }, { timeout: 2000 });
  });
});

describe('PropertyForm - Submission', () => {
  test('calls API when address is provided', async () => {
    mockPropertiesApi.create.mockResolvedValue(defaultMockProperty);

    renderPropertyForm();

    // Use fireEvent.change to reliably update React Hook Form's state
    setInputValue('property-address-input', 'רחוב הרצל 123');
    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(mockPropertiesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ address: 'רחוב הרצל 123' })
      );
    }, { timeout: 10000 });
  }, 15000);

  test('calls API with type and status when selects are used', async () => {
    mockPropertiesApi.create.mockResolvedValue({
      ...defaultMockProperty,
      type: 'RESIDENTIAL',
      status: 'OWNED',
    });

    renderPropertyForm();

    setInputValue('property-address-input', 'רחוב הרצל 123');
    await selectMuiOption('property-type-select', 'מגורים');
    await selectMuiOption('property-status-select', 'בבעלות');
    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(mockPropertiesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address: 'רחוב הרצל 123',
          type: 'RESIDENTIAL',
          status: 'OWNED',
        })
      );
    }, { timeout: 10000 });
  }, 15000);

  test('calls onSuccess callback after successful submission', async () => {
    mockPropertiesApi.create.mockResolvedValue(defaultMockProperty);

    const { mockOnSuccess } = renderPropertyForm();

    setInputValue('property-address-input', 'רחוב הרצל 123');
    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 15000 });
  }, 20000);

  test('invalidates properties query after successful creation', async () => {
    mockPropertiesApi.create.mockResolvedValue(defaultMockProperty);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    render(
      <QueryClientProvider client={queryClient}>
        <PropertyForm onClose={jest.fn()} onSuccess={jest.fn()} />
      </QueryClientProvider>
    );

    setInputValue('property-address-input', 'רחוב הרצל 123');
    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['properties'] })
      );
    }, { timeout: 10000 });
  }, 15000);
});

describe('PropertyForm - Error Handling', () => {
  test('shows error alert when API returns an error', async () => {
    mockPropertiesApi.create.mockRejectedValue({
      response: { data: { message: 'שגיאה בשמירת נכס' } },
    });

    renderPropertyForm();

    setInputValue('property-address-input', 'רחוב הרצל 123');
    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="property-form-alert"]')).not.toBeNull();
    }, { timeout: 10000 });
  }, 15000);

  test('shows error for 400 Bad Request', async () => {
    mockPropertiesApi.create.mockRejectedValue({
      response: { status: 400, data: { message: 'Validation failed' } },
    });

    renderPropertyForm();

    setInputValue('property-address-input', 'רחוב הרצל 123');
    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="property-form-alert"]')).not.toBeNull();
    }, { timeout: 10000 });
  }, 15000);
});
