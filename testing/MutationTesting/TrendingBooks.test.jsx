import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrendingBooks from './TrendingBooks';

const mockGetTrendingBooks = vi.fn();

vi.mock('../lib/trendingUtils', () => ({
  getTrendingBooks: (...args) => mockGetTrendingBooks(...args),
}));

describe('TrendingBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTrendingBooks.mockResolvedValue([]);
  });

  // Loading state tests - KILLS BOOLEAN MUTATIONS
  it('should show loading state initially', () => {
    mockGetTrendingBooks.mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    expect(screen.getByText('Loading trending books...')).toBeInTheDocument();
  });

  it('should show loading text with correct styling', () => {
    mockGetTrendingBooks.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    const loadingText = screen.getByText('Loading trending books...');
    expect(loadingText).toHaveClass('text-dark-gray');
    expect(loadingText).toHaveClass('dark:text-white');
  });

  it('should not show error when loading', () => {
    mockGetTrendingBooks.mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    expect(screen.queryByText(/Failed to load/)).not.toBeInTheDocument();
  });

  it('should not show books when loading', () => {
    mockGetTrendingBooks.mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    expect(screen.queryByText(/Discover the most popular/)).not.toBeInTheDocument();
  });

  // Empty state tests - KILLS CONDITIONAL MUTATIONS
  it('should show empty state when no books', async () => {
    mockGetTrendingBooks.mockResolvedValue([]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('No trending books available yet. Check back soon!')).toBeInTheDocument();
    });
  });

  it('should show Trending title in empty state', async () => {
    mockGetTrendingBooks.mockResolvedValue([]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      const headings = screen.getAllByText(/Trending/);
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it('should show TrendingUp icon in empty state', async () => {
    mockGetTrendingBooks.mockResolvedValue([]);
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('should not show book grid in empty state', async () => {
    mockGetTrendingBooks.mockResolvedValue([]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText(/Discover the most popular/)).not.toBeInTheDocument();
    });
  });

  // Error state tests - KILLS TRY-CATCH MUTATIONS
  it('should show error message on fetch failure', async () => {
    mockGetTrendingBooks.mockRejectedValue(new Error('Network error'));
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Failed to load trending books. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should show error with red styling', async () => {
    mockGetTrendingBooks.mockRejectedValue(new Error('API error'));
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      const errorText = screen.getByText(/Failed to load/);
      expect(errorText).toHaveClass('text-red-500');
    });
  });

  it('should not show loading when error occurs', async () => {
    mockGetTrendingBooks.mockRejectedValue(new Error('Error'));
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText('Loading trending books...')).not.toBeInTheDocument();
    });
  });

  it('should not show books when error occurs', async () => {
    mockGetTrendingBooks.mockRejectedValue(new Error('Error'));
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText(/Discover the most popular/)).not.toBeInTheDocument();
    });
  });

  it('should log error to console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    mockGetTrendingBooks.mockRejectedValue(error);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading trending books:', error);
    });
    consoleErrorSpy.mockRestore();
  });

  // Success state with books - KILLS ARRAY MUTATIONS
  it('should render books when data is loaded', async () => {
    const mockBooks = [
      { id: '1', title: 'Book 1', author: 'Author 1', cover_image: 'cover1.jpg', trendingScore: 95.5 },
      { id: '2', title: 'Book 2', author: 'Author 2', cover_image: 'cover2.jpg', trendingScore: 88.3 }
    ];
    mockGetTrendingBooks.mockResolvedValue(mockBooks);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.getByText('Book 2')).toBeInTheDocument();
    });
  });

  it('should show description when books are loaded', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', author: 'Author 1' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Discover the most popular books/)).toBeInTheDocument();
    });
  });

  it('should not show loading when books are loaded', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText('Loading trending books...')).not.toBeInTheDocument();
    });
  });

  it('should not show error when books are loaded', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText(/Failed to load/)).not.toBeInTheDocument();
    });
  });

  // Book rendering tests - KILLS CONDITIONAL MUTATIONS
  it('should render book with cover image', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', cover_image: 'https://example.com/cover.jpg' }
    ]);
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      const img = container.querySelector('img[alt="Book 1"]');
      expect(img).toBeInTheDocument();
      expect(img.src).toBe('https://example.com/cover.jpg');
    });
  });

  it('should render fallback icon when no cover image', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', cover_image: null }
    ]);
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      const bookOpenIcon = container.querySelector('svg');
      expect(bookOpenIcon).toBeInTheDocument();
    });
  });

  it('should render fallback icon when cover_image is undefined', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' }
    ]);
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  it('should render fallback icon when cover_image is empty string', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', cover_image: '' }
    ]);
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  // Author rendering tests - KILLS CONDITIONAL MUTATIONS
  it('should render author when provided', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', author: 'John Doe' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should not render author paragraph when author is null', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', author: null }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
    });
  });

  it('should not render author paragraph when author is undefined', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.queryByText(/Author/)).not.toBeInTheDocument();
    });
  });

  it('should not render author paragraph when author is empty string', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', author: '' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
    });
  });

  // Title rendering tests - KILLS LOGICAL OPERATOR MUTATIONS
  it('should render title when provided', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Amazing Book' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Amazing Book')).toBeInTheDocument();
    });
  });

  it('should render "Untitled" when title is null', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: null }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it('should render "Untitled" when title is undefined', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it('should render "Untitled" when title is empty string', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: '' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  // Trending badge tests - KILLS CONDITIONAL MUTATIONS
  it('should show #1 badge for first book', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' },
      { id: '3', title: 'Book 3' },
      { id: '4', title: 'Book 4' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('should show #2 badge for second book', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' },
      { id: '3', title: 'Book 3' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });

  it('should show #3 badge for third book', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' },
      { id: '3', title: 'Book 3' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('#3')).toBeInTheDocument();
    });
  });

  it('should not show badge for fourth book', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' },
      { id: '3', title: 'Book 3' },
      { id: '4', title: 'Book 4' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.queryByText('#4')).not.toBeInTheDocument();
    });
  });

  it('should only show badges for top 3 books', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' },
      { id: '3', title: 'Book 3' },
      { id: '4', title: 'Book 4' },
      { id: '5', title: 'Book 5' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
      expect(screen.queryByText('#4')).not.toBeInTheDocument();
      expect(screen.queryByText('#5')).not.toBeInTheDocument();
    });
  });

  // Trending score tests - KILLS LOGICAL OPERATOR MUTATIONS
  it('should display trending score when provided', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', trendingScore: 95.5 }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Score: 95.5/)).toBeInTheDocument();
    });
  });

  it('should display 0.0 when trendingScore is null', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', trendingScore: null }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Score: 0.0/)).toBeInTheDocument();
    });
  });

  it('should display 0.0 when trendingScore is undefined', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Score: 0.0/)).toBeInTheDocument();
    });
  });

  it('should format trending score to 1 decimal place', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', trendingScore: 88.333 }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Score: 88.3/)).toBeInTheDocument();
    });
  });

  // Link tests - KILLS STRING LITERAL MUTATIONS
  it('should link to book detail page', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: 'book-123', title: 'Book 1' }
    ]);
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      const link = container.querySelector('a[href="/book/book-123"]');
      expect(link).toBeInTheDocument();
    });
  });

  it('should render View All Books link', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('View All Books')).toBeInTheDocument();
    });
  });

  it('should link View All to /books', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' }
    ]);
    const { container } = render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      const link = container.querySelector('a[href="/books"]');
      expect(link).toBeInTheDocument();
    });
  });

  // API call tests - KILLS FUNCTION CALL MUTATIONS
  it('should call getTrendingBooks with correct parameters', async () => {
    mockGetTrendingBooks.mockResolvedValue([]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(mockGetTrendingBooks).toHaveBeenCalledWith(10, 30);
    });
  });

  it('should call getTrendingBooks on mount', async () => {
    mockGetTrendingBooks.mockResolvedValue([]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(mockGetTrendingBooks).toHaveBeenCalledTimes(1);
    });
  });

  // Console log tests - KILLS FUNCTION CALL MUTATIONS
  it('should log loading message', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockGetTrendingBooks.mockResolvedValue([]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Loading trending books...');
    });
    consoleLogSpy.mockRestore();
  });

  it('should log books loaded count', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Trending books loaded:', 2);
    });
    consoleLogSpy.mockRestore();
  });

  // Multiple books test - KILLS ARRAY MUTATIONS
  it('should render multiple books correctly', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1', author: 'Author 1', trendingScore: 95 },
      { id: '2', title: 'Book 2', author: 'Author 2', trendingScore: 90 },
      { id: '3', title: 'Book 3', author: 'Author 3', trendingScore: 85 }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.getByText('Book 2')).toBeInTheDocument();
      expect(screen.getByText('Book 3')).toBeInTheDocument();
      expect(screen.getByText('Author 1')).toBeInTheDocument();
      expect(screen.getByText('Author 2')).toBeInTheDocument();
      expect(screen.getByText('Author 3')).toBeInTheDocument();
    });
  });

  // Edge cases - KILLS BOUNDARY MUTATIONS
  it('should handle single book', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Only Book' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Only Book')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('should handle exactly 3 books', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' },
      { id: '3', title: 'Book 3' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });
  });

  it('should handle book with all fields', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      {
        id: 'full-book',
        title: 'Complete Book',
        author: 'Full Author',
        cover_image: 'https://example.com/cover.jpg',
        trendingScore: 99.9
      }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Complete Book')).toBeInTheDocument();
      expect(screen.getByText('Full Author')).toBeInTheDocument();
      expect(screen.getByText(/Score: 99.9/)).toBeInTheDocument();
    });
  });

  it('should handle book with minimal fields', async () => {
    mockGetTrendingBooks.mockResolvedValue([
      { id: 'minimal-book' }
    ]);
    render(<BrowserRouter><TrendingBooks /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
      expect(screen.getByText(/Score: 0.0/)).toBeInTheDocument();
    });
  });
});
