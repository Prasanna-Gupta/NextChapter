import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUpPage from './SignUpPage';

const mockNavigate = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockHasCompletedPersonalization = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signUp: mockSignUp,
    signInWithOAuth: mockSignInWithOAuth,
  })
}));

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
  })
}));

vi.mock('../lib/personalizationUtils', () => ({
  hasCompletedPersonalization: (...args) => mockHasCompletedPersonalization(...args),
}));

vi.mock('../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue({ data: { user: { id: '123' }, session: {} }, error: null });
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    mockHasCompletedPersonalization.mockResolvedValue(false);
  });

  // Rendering tests
  it('should render sign up form', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.type).toBe('email');
  });

  it('should render password input', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.type).toBe('password');
  });

  it('should render confirm password input', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('should render sign up button', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const button = screen.getByRole('button', { name: /sign up/i });
    expect(button).toBeInTheDocument();
  });

  it('should render sign in link', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const links = screen.getAllByText(/sign in/i);
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render password visibility toggles', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const toggleButtons = screen.getAllByRole('button', { name: /show password|hide password/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  // Form validation tests - these test the custom validation logic
  it('should prevent submission with empty email', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Should not call signUp because email is required by HTML5
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should not call signUp with invalid email format', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should not call signUp because email validation fails
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('should show error for password mismatch', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should show error for short password', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });

  // Form submission tests
  it('should call signUp with correct credentials', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should trim and lowercase email before submission', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: '  Test@Example.COM  ' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should navigate to personalization on successful sign up with session', async () => {
    mockHasCompletedPersonalization.mockResolvedValue(false);
    
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/personalization', { replace: true });
    });
  });

  it('should show email confirmation message when no session', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: '123' }, session: null }, error: null });
    
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  // Error handling tests
  it('should display error message on sign up failure', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already exists' } });
    
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
    });
  });

  it('should handle sign up exception', async () => {
    mockSignUp.mockRejectedValue(new Error('Network error'));
    
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  // OAuth tests
  it('should call signInWithOAuth for Google', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const googleButton = screen.getByText(/continue with google/i);

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
    });
  });

  it('should call signInWithOAuth for Apple', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const appleButton = screen.getByText(/continue with apple/i);

    fireEvent.click(appleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('apple');
    });
  });

  it('should handle Google OAuth error', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: { message: 'OAuth failed' } });
    
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const googleButton = screen.getByText(/continue with google/i);

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('OAuth failed')).toBeInTheDocument();
    });
  });

  // Password visibility toggle tests
  it('should toggle password visibility', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButton = screen.getAllByRole('button', { name: /show password|hide password/i })[0];

    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  // Loading state tests
  it('should show loading text during submission', async () => {
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { user: { id: '123' }, session: {} }, error: null }), 100)));
    
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
  });
});
