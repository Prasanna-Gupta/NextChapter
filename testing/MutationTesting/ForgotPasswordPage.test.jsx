import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';

const mockResetPassword = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
  })
}));

vi.mock('../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetPassword.mockResolvedValue({ data: {}, error: null });
  });

  // Rendering tests
  it('should render forgot password form', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    expect(screen.getByText(/forgot.*password/i)).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.type).toBe('email');
  });

  it('should render reset password button', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const button = screen.getByRole('button', { name: /reset password/i });
    expect(button).toBeInTheDocument();
  });

  it('should render back to sign in link', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const link = screen.getByText(/back to sign in/i);
    expect(link).toBeInTheDocument();
  });

  // Form validation tests
  it('should prevent submission with empty email', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.click(submitButton);

    // HTML5 validation prevents submission
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('should not call resetPassword with whitespace-only email', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: '   ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // The component trims the email, so it should show the error
      expect(mockResetPassword).not.toHaveBeenCalled();
    });
  });

  // Form submission tests
  it('should call resetPassword with correct email', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should trim and lowercase email before submission', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: '  Test@Example.COM  ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show success message on successful reset', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
    });
  });

  // Error handling tests
  it('should display error message on reset failure', async () => {
    mockResetPassword.mockResolvedValue({ error: { message: 'User not found' } });
    
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('should display generic error for null error message', async () => {
    mockResetPassword.mockResolvedValue({ error: { message: null } });
    
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
    });
  });

  it('should handle reset password exception', async () => {
    mockResetPassword.mockRejectedValue(new Error('Network error'));
    
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  // Loading state tests
  it('should show loading text during submission', async () => {
    mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 100)));
    
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });

  it('should disable button during submission', async () => {
    mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 100)));
    
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
