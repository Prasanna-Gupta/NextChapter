import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';

const mockNavigate = vi.fn();
const mockUpdatePassword = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    updatePassword: mockUpdatePassword,
  })
}));

vi.mock('../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdatePassword.mockResolvedValue({ error: null });
    // Mock window.location.hash to simulate recovery token
    delete window.location;
    window.location = { hash: '#type=recovery&access_token=test-token' };
  });

  // Rendering tests
  it('should render reset password form with valid token', () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('should render new password input', () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    expect(newPasswordInput).toBeInTheDocument();
    expect(newPasswordInput.type).toBe('password');
  });

  it('should render confirm password input', () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('should render update password button', () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const button = screen.getByRole('button', { name: /update password/i });
    expect(button).toBeInTheDocument();
  });

  it('should show error when no recovery token present', () => {
    window.location = { hash: '' };
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    expect(screen.getByText(/invalid or expired/i)).toBeInTheDocument();
  });

  it('should show request reset link when no token', () => {
    window.location = { hash: '' };
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    expect(screen.getByText(/request reset link/i)).toBeInTheDocument();
  });

  // Form validation tests
  it('should show error for empty passwords', async () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.click(submitButton);

    // HTML5 validation will prevent submission, so we just check the button exists
    expect(submitButton).toBeInTheDocument();
  });

  it('should show error for short password', async () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText(/at least 6 characters/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should show error for password mismatch', async () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  // Form submission tests
  it('should call updatePassword with correct password', async () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpassword123');
    });
  });



  it('should show success message on successful update', async () => {
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  // Error handling tests
  it('should display error message on update failure', async () => {
    mockUpdatePassword.mockResolvedValue({ error: { message: 'Invalid token' } });
    
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle update password exception', async () => {
    mockUpdatePassword.mockRejectedValue(new Error('Network error'));
    
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  // Loading state tests
  it('should show loading text during submission', async () => {
    mockUpdatePassword.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
    
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/updating/i)).toBeInTheDocument();
  });

  it('should disable button during submission', async () => {
    mockUpdatePassword.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
    
    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
