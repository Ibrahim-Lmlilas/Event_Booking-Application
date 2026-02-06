import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInForm from '../SignInForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/hooks/useAuth');
jest.mock('@/lib/api/auth');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockLogin = jest.fn();
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      logout: jest.fn(),
      checkAuth: jest.fn(),
    });
  });

  it('renders the sign in form correctly', () => {
    render(<SignInForm />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    await user.type(passwordInput, 'password123');

    // Clear any previous mock calls
    (authApi.login as jest.Mock).mockClear();

    // Verify the form has the invalid email value
    expect(emailInput.value).toBe('invalid-email');
    expect(passwordInput.value).toBe('password123');

    const form = emailInput.closest('form');
    expect(form).toBeInTheDocument();
    
    // Submit the form - validation should prevent API call
    if (form) {
      fireEvent.submit(form);
    }

    // Wait for the validation error to appear
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify API was not called due to validation failure
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('displays validation error for short password', async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, '12345');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('calls authApi.login with correct credentials on valid submit', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      access_token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'participant',
      },
    };

    (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith(mockResponse.access_token, mockResponse.user);
      expect(toast.success).toHaveBeenCalledWith('Login successful! 🎉');
    });
  });

  it('displays error toast on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';

    (authApi.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      // The component translates "Invalid credentials" to a French message
      expect(toast.error).toHaveBeenCalledWith('Email ou mot de passe incorrect. Veuillez réessayer.');
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    (authApi.login as jest.Mock).mockReturnValue(loginPromise);

    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolveLogin!({
      access_token: 'token',
      user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'participant' },
    });

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });

  it('calls onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const mockResponse = {
      access_token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'participant',
      },
    };

    (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

    render(<SignInForm onSuccess={onSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
