import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const mockUseAuth = vi.fn();
const mockIsAdmin = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../lib/personalizationUtils', () => ({
  isAdmin: (userId) => mockIsAdmin(userId),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAdmin.mockResolvedValue(false);
  });

  // Loading state tests - KILLS BOOLEAN MUTATIONS
  it('should show loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<BrowserRouter><ProtectedRoute><div>Content</div></ProtectedRoute></BrowserRouter>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    const { container } = render(<BrowserRouter><ProtectedRoute><div>Content</div></ProtectedRoute></BrowserRouter>);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show loading when role is being checked', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false });
    mockIsAdmin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(false), 100)));
    render(<BrowserRouter><ProtectedRoute requireAdmin={true}><div>Content</div></ProtectedRoute></BrowserRouter>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not show loading when auth is not loading', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(<BrowserRouter><ProtectedRoute><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  // Authentication tests - KILLS CONDITIONAL MUTATIONS
  it('should render children when authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false });
    render(<BrowserRouter><ProtectedRoute><div>Protected Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to sign-in when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          <Route path="/sign-in" element={<div>Sign In Page</div>} />
        </Routes>
      </BrowserRouter>
    );
    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render children when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          <Route path="/sign-in" element={<div>Sign In Page</div>} />
        </Routes>
      </BrowserRouter>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render children when user is undefined', () => {
    mockUseAuth.mockReturnValue({ user: undefined, loading: false });
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          <Route path="/sign-in" element={<div>Sign In Page</div>} />
        </Routes>
      </BrowserRouter>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  // Admin role tests - KILLS LOGICAL OPERATOR MUTATIONS
  it('should allow admin user when requireAdmin is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'admin-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(true);
    render(<BrowserRouter><ProtectedRoute requireAdmin={true}><div>Admin Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('should redirect non-admin when requireAdmin is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin={true}><div>Admin Content</div></ProtectedRoute>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(mockIsAdmin).toHaveBeenCalledWith('user-1');
    });
    await waitFor(() => {
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  it('should allow non-admin when requireAdmin is false', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(<BrowserRouter><ProtectedRoute requireAdmin={false}><div>User Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('User Content')).toBeInTheDocument();
    });
  });

  it('should allow non-admin when requireAdmin is not provided', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(<BrowserRouter><ProtectedRoute><div>User Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('User Content')).toBeInTheDocument();
    });
  });

  // BlockAdmin tests - KILLS CONDITIONAL MUTATIONS
  it('should redirect admin when blockAdmin is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'admin-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(true);
    render(
      <BrowserRouter>
        <ProtectedRoute blockAdmin={true}><div>User Content</div></ProtectedRoute>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(mockIsAdmin).toHaveBeenCalledWith('admin-1');
    });
    await waitFor(() => {
      expect(screen.queryByText('User Content')).not.toBeInTheDocument();
    });
  });

  it('should allow non-admin when blockAdmin is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(<BrowserRouter><ProtectedRoute blockAdmin={true}><div>User Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('User Content')).toBeInTheDocument();
    });
  });

  it('should allow admin when blockAdmin is false', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'admin-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(true);
    render(<BrowserRouter><ProtectedRoute blockAdmin={false}><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('should allow admin when blockAdmin is not provided', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'admin-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(true);
    render(<BrowserRouter><ProtectedRoute><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  // Role checking optimization tests - KILLS LOGICAL OPERATOR MUTATIONS
  it('should not check role when requireAdmin and blockAdmin are both false', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    render(<BrowserRouter><ProtectedRoute requireAdmin={false} blockAdmin={false}><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
    expect(mockIsAdmin).not.toHaveBeenCalled();
  });

  it('should check role when requireAdmin is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin={true}><div>Content</div></ProtectedRoute>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(mockIsAdmin).toHaveBeenCalledWith('user-1');
    }, { timeout: 3000 });
  });

  it('should check role when blockAdmin is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(<BrowserRouter><ProtectedRoute blockAdmin={true}><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(mockIsAdmin).toHaveBeenCalledWith('user-1');
    });
  });

  // Error handling tests - KILLS TRY-CATCH MUTATIONS
  it('should handle isAdmin error gracefully', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockRejectedValue(new Error('API Error'));
    render(<BrowserRouter><ProtectedRoute requireAdmin={true}><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  it('should set isAdminUser to false on error', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    mockIsAdmin.mockRejectedValue(new Error('Network Error'));
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute requireAdmin={true}><div>Admin Content</div></ProtectedRoute>} />
          <Route path="/books" element={<div>Books Page</div>} />
        </Routes>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Books Page')).toBeInTheDocument();
    });
  });

  // Cleanup tests - KILLS RETURN STATEMENT MUTATIONS
  it('should cancel role check on unmount', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    let resolveAdmin;
    mockIsAdmin.mockImplementation(() => new Promise(resolve => { resolveAdmin = resolve; }));
    const { unmount } = render(<BrowserRouter><ProtectedRoute requireAdmin={true}><div>Content</div></ProtectedRoute></BrowserRouter>);
    unmount();
    resolveAdmin(true);
    await waitFor(() => {
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  // Edge cases - KILLS BOUNDARY MUTATIONS
  it('should handle user without id', async () => {
    mockUseAuth.mockReturnValue({ user: {}, loading: false });
    render(<BrowserRouter><ProtectedRoute><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('should handle loading true and user present', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: true });
    render(<BrowserRouter><ProtectedRoute><div>Content</div></ProtectedRoute></BrowserRouter>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should handle both requireAdmin and blockAdmin false', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    render(<BrowserRouter><ProtectedRoute requireAdmin={false} blockAdmin={false}><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('should set roleLoading to false when no role check needed', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false });
    render(<BrowserRouter><ProtectedRoute><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('should handle user null and loading false early return', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockIsAdmin.mockResolvedValue(false);
    render(<BrowserRouter><ProtectedRoute requireAdmin={true}><div>Content</div></ProtectedRoute></BrowserRouter>);
    await waitFor(() => {
      expect(mockIsAdmin).not.toHaveBeenCalled();
    });
  });
});
