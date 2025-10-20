import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppointmentForm from '@/components/forms/AppointmentForm';

// Mock the hooks
jest.mock('@/hooks/useProviders', () => ({
  useCreateAppointment: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

jest.mock('@/hooks/useApiError', () => ({
  useApiError: () => ({
    handleError: jest.fn(),
    handleSuccess: jest.fn(),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AppointmentForm', () => {
  const mockProvider = {
    id: '1',
    doctor: 'Dr. Smith',
    specialty: 'Cardiology',
    location: 'Dallas Medical Center',
  };

  const mockSlot = {
    iso: '2024-01-15T10:00:00.000Z',
    label: '10:00 AM',
  };

  it('renders form with provider and slot information', () => {
    render(
      <TestWrapper>
        <AppointmentForm
          selectedProvider={mockProvider}
          selectedSlot={mockSlot}
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Book Appointment')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Cardiology • Dallas Medical Center')).toBeInTheDocument();
  });

  it('shows message when no provider or slot selected', () => {
    render(
      <TestWrapper>
        <AppointmentForm
          selectedProvider={null}
          selectedSlot={null}
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Please select a provider and time slot first.')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AppointmentForm
          selectedProvider={mockProvider}
          selectedSlot={mockSlot}
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    );

    // Try to submit without filling required fields
    await user.click(screen.getByText('Book Appointment'));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AppointmentForm
          selectedProvider={mockProvider}
          selectedSlot={mockSlot}
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    );

    // Fill in invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/patient name/i), 'John Doe');
    await user.click(screen.getByText('Book Appointment'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    
    render(
      <TestWrapper>
        <AppointmentForm
          selectedProvider={mockProvider}
          selectedSlot={mockSlot}
          onSuccess={mockOnSuccess}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    );

    // Fill in valid data
    await user.type(screen.getByLabelText(/patient name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '555-123-4567');
    await user.type(screen.getByLabelText(/notes/i), 'Regular checkup');

    // Submit form
    await user.click(screen.getByText('Book Appointment'));

    // Should call onSuccess
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();
    
    render(
      <TestWrapper>
        <AppointmentForm
          selectedProvider={mockProvider}
          selectedSlot={mockSlot}
          onSuccess={jest.fn()}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    await user.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
