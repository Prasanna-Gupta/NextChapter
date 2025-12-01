import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignInPage from './SignInPage';

const mockNavigate = vi.fn();
const mockSignIn = vi.fn();
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
    signIn: mockSignIn,
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

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    mockHasCompletedPersonalization.mockResolvedValue(true);
  });

  // Rendering tests
  it('should render sign in form', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.type).toBe('email');
  });

  it('should render password input', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.type).toBe('password');
  });

  it('should render sign in button', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const link = screen.getByText(/forgot password/i);
    expect(link).toBeInTheDocument();
  });

  it('should render sign up link', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const link = screen.getByText(/sign up/i);
    expect(link).toBeInTheDocument();
  });

  it('should render remember me checkbox', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  // Form submission tests
  it('should call signIn with correct credentials', async () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should trim and lowercase email before submission', async () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: '  Test@Example.COM  ' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should navigate to books on successful sign in with completed personalization', async () => {
    mockHasCompletedPersonalization.mockResolvedValue(true);
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/books', { replace: true });
    });
  });

  it('should navigate to personalization on successful sign in without completed personalization', async () => {
    mockHasCompletedPersonalization.mockResolvedValue(false);
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/personalization', { replace: true });
    });
  });

  // Error handling tests
  it('should display error message on sign in failure', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should display generic error for null error message', async () => {
    mockSignIn.mockResolvedValue({ error: { message: null } });
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to sign in/i)).toBeInTheDocument();
    });
  });

  it('should handle sign in exception', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'));
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  // OAuth tests
  it('should call signInWithOAuth for Google', async () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const googleButton = screen.getByText(/continue with google/i);

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
    });
  });

  it('should call signInWithOAuth for Apple', async () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const appleButton = screen.getByText(/continue with apple/i);

    fireEvent.click(appleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('apple');
    });
  });

  it('should handle Google OAuth error', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: { message: 'OAuth failed' } });
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const googleButton = screen.getByText(/continue with google/i);

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('OAuth failed')).toBeInTheDocument();
    });
  });

  it('should handle Apple OAuth error', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: { message: 'Apple OAuth failed' } });
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const appleButton = screen.getByText(/continue with apple/i);

    fireEvent.click(appleButton);

    await waitFor(() => {
      expect(screen.getByText('Apple OAuth failed')).toBeInTheDocument();
    });
  });

  it('should handle Google OAuth exception', async () => {
    mockSignInWithOAuth.mockRejectedValue(new Error('Network error'));
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const googleButton = screen.getByText(/continue with google/i);

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  // Loading state tests
  it('should show loading text during submission', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { user: { id: '123' } }, error: null }), 100)));
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('should disable button during submission', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { user: { id: '123' } }, error: null }), 100)));
    
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  // Success message test
  it('should show success message on successful sign in', async () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/successfully signed in/i)).toBeInTheDocument();
    });
  });

  // Remember me checkbox test
  it('should toggle remember me checkbox', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
