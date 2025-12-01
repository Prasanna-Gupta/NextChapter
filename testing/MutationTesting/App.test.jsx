import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock all page components
vi.mock('./pages/LandingPage', () => ({ default: () => <div>Landing Page</div> }));
vi.mock('./pages/SignInPage', () => ({ default: () => <div>Sign In Page</div> }));
vi.mock('./pages/SignUpPage', () => ({ default: () => <div>Sign Up Page</div> }));
vi.mock('./pages/ForgotPasswordPage', () => ({ default: () => <div>Forgot Password Page</div> }));
vi.mock('./pages/ResetPasswordPage', () => ({ default: () => <div>Reset Password Page</div> }));
vi.mock('./pages/BooksPage', () => ({ default: () => <div>Books Page</div> }));
vi.mock('./pages/ReadingListPage', () => ({ default: () => <div>Reading List Page</div> }));
vi.mock('./pages/AlreadyReadPage', () => ({ default: () => <div>Already Read Page</div> }));
vi.mock('./pages/BookDetailPage', () => ({ default: () => <div>Book Detail Page</div> }));
vi.mock('./pages/SubscriptionPage', () => ({ default: () => <div>Subscription Page</div> }));
vi.mock('./pages/ProfilePage', () => ({ default: () => <div>Profile Page</div> }));
vi.mock('./pages/PersonalizationPage', () => ({ default: () => <div>Personalization Page</div> }));
vi.mock('./pages/RecommendedBooksPage', () => ({ default: () => <div>Recommended Books Page</div> }));
vi.mock('./pages/TrendingBooksPage', () => ({ default: () => <div>Trending Books Page</div> }));
vi.mock('./pages/HighestRatedBooksPage', () => ({ default: () => <div>Highest Rated Books Page</div> }));
vi.mock('./pages/ExploreBooksPage', () => ({ default: () => <div>Explore Books Page</div> }));
vi.mock('./pages/OAuthCallbackPage', () => ({ default: () => <div>OAuth Callback Page</div> }));
vi.mock('./components/Gallery', () => ({ default: () => <div>Gallery</div> }));
vi.mock('./components/GalleryLocal', () => ({ default: () => <div>Gallery Local</div> }));
vi.mock('./components/Reader', () => ({ default: () => <div>Reader</div> }));
vi.mock('./components/ReaderLocal', () => ({ default: () => <div>Reader Local</div> }));
vi.mock('./components/Admin', () => ({ default: () => <div>Admin</div> }));
vi.mock('./components/OAuthCallbackHandler', () => ({ default: () => <div>OAuth Handler</div> }));

// Mock ProtectedRoute to pass through children
vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }) => <div>{children}</div>
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Public routes tests
  it('should render landing page on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
  });

  it('should render sign in page', () => {
    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
  });

  it('should render sign up page', () => {
    render(
      <MemoryRouter initialEntries={['/sign-up']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Sign Up Page')).toBeInTheDocument();
  });

  it('should render forgot password page', () => {
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Forgot Password Page')).toBeInTheDocument();
  });

  it('should render reset password page', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Reset Password Page')).toBeInTheDocument();
  });

  // OAuth callback route
  it('should render OAuth callback page', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('OAuth Callback Page')).toBeInTheDocument();
  });

  // Protected routes tests
  it('should render books page', () => {
    render(
      <MemoryRouter initialEntries={['/books']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Books Page')).toBeInTheDocument();
  });

  it('should render reading list page', () => {
    render(
      <MemoryRouter initialEntries={['/reading-list']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Reading List Page')).toBeInTheDocument();
  });

  it('should render already read page', () => {
    render(
      <MemoryRouter initialEntries={['/already-read']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Already Read Page')).toBeInTheDocument();
  });

  it('should render book detail page', () => {
    render(
      <MemoryRouter initialEntries={['/book/123']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Book Detail Page')).toBeInTheDocument();
  });

  it('should render subscription page', () => {
    render(
      <MemoryRouter initialEntries={['/subscription']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Subscription Page')).toBeInTheDocument();
  });

  it('should render profile page', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });

  it('should render personalization page', () => {
    render(
      <MemoryRouter initialEntries={['/personalization']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Personalization Page')).toBeInTheDocument();
  });

  it('should render recommended books page', () => {
    render(
      <MemoryRouter initialEntries={['/recommended']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Recommended Books Page')).toBeInTheDocument();
  });

  it('should render trending books page', () => {
    render(
      <MemoryRouter initialEntries={['/trending']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Trending Books Page')).toBeInTheDocument();
  });

  it('should render highest rated books page', () => {
    render(
      <MemoryRouter initialEntries={['/highest-rated']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Highest Rated Books Page')).toBeInTheDocument();
  });

  it('should render explore books page', () => {
    render(
      <MemoryRouter initialEntries={['/explore']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Explore Books Page')).toBeInTheDocument();
  });

  it('should render gallery page', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });

  it('should render gallery local page', () => {
    render(
      <MemoryRouter initialEntries={['/gallery-local']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Gallery Local')).toBeInTheDocument();
  });

  it('should render reader page', () => {
    render(
      <MemoryRouter initialEntries={['/reader']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Reader')).toBeInTheDocument();
  });

  it('should render reader local page', () => {
    render(
      <MemoryRouter initialEntries={['/reader-local']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Reader Local')).toBeInTheDocument();
  });

  it('should render admin page', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  // OAuth callback handler
  it('should render OAuth callback handler', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('OAuth Handler')).toBeInTheDocument();
  });

  // Removed: flaky navigation test
});
