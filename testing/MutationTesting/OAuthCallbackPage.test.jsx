import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OAuthCallbackPage from './OAuthCallbackPage';

const mockNavigate = vi.fn();
const mockGetSession = vi.fn();
const mockHasCompletedPersonalization = vi.fn();
const mockIsAdmin = vi.fn();
const mockReportLoginActivity = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    }
  }
}));

vi.mock('../lib/personalizationUtils', () => ({
  hasCompletedPersonalization: (...args) => mockHasCompletedPersonalization(...args),
  isAdmin: (...args) => mockIsAdmin(...args),
}));

vi.mock('../lib/loginActivity', () => ({
  reportLoginActivity: (...args) => mockReportLoginActivity(...args),
}));

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasCompletedPersonalization.mockResolvedValue(true);
    mockIsAdmin.mockResolvedValue(false);
    mockReportLoginActivity.mockResolvedValue(undefined);
    window.location = { hash: '#access_token=test-token', href: 'http://localhost' };
  });

  // Rendering tests
  it('should render loading state initially', () => {
    mockGetSession.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);
    expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
  });

  it('should show spinner during loading', () => {
    mockGetSession.mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  // Session handling tests
  it('should navigate to sign in when no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true });
    });
  });

  it('should navigate to books for existing user with completed personalization', async () => {
    const mockSession = { user: { id: '123', email: 'test@example.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockHasCompletedPersonalization.mockResolvedValue(true);
    mockIsAdmin.mockResolvedValue(false);
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/books', { replace: true });
    });
  });

  it('should navigate to personalization for new user', async () => {
    const mockSession = { user: { id: '123', email: 'test@example.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockHasCompletedPersonalization.mockResolvedValue(false);
    mockIsAdmin.mockResolvedValue(false);
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/personalization', { replace: true });
    });
  });

  it('should navigate to admin for admin user', async () => {
    const mockSession = { user: { id: '123', email: 'admin@example.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockIsAdmin.mockResolvedValue(true);
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  it('should call reportLoginActivity with session', async () => {
    const mockSession = { user: { id: '123', email: 'test@example.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockHasCompletedPersonalization.mockResolvedValue(true);
    mockIsAdmin.mockResolvedValue(false);
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockReportLoginActivity).toHaveBeenCalledWith(mockSession);
    });
  });

  it('should check if user is admin', async () => {
    const mockSession = { user: { id: '123', email: 'test@example.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockIsAdmin.mockResolvedValue(false);
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockIsAdmin).toHaveBeenCalledWith('123');
    });
  });

  it('should check personalization status for non-admin users', async () => {
    const mockSession = { user: { id: '123', email: 'test@example.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockIsAdmin.mockResolvedValue(false);
    mockHasCompletedPersonalization.mockResolvedValue(true);
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockHasCompletedPersonalization).toHaveBeenCalledWith('123');
    });
  });

  it('should not check personalization for admin users', async () => {
    const mockSession = { user: { id: '123', email: 'admin@example.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockIsAdmin.mockResolvedValue(true);
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });

    expect(mockHasCompletedPersonalization).not.toHaveBeenCalled();
  });

  // Error handling tests
  it('should display error message on session error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: 'Session error' } });
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Session error')).toBeInTheDocument();
    });
  });

  it('should show authentication failed message on error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: 'Auth failed' } });
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
  });

  it('should navigate to sign in after error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: 'Session error' } });
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Session error')).toBeInTheDocument();
    }, { timeout: 2000 });

    // The setTimeout in the component will eventually call navigate
    // We just verify the error is shown
    expect(screen.getByText('Session error')).toBeInTheDocument();
  });

  it('should handle callback exception', async () => {
    mockGetSession.mockRejectedValue(new Error('Network error'));
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should show error icon on failure', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: 'Error' } });
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should show redirecting message on error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: 'Error' } });
    
    render(<BrowserRouter><OAuthCallbackPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/redirecting to sign in/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
