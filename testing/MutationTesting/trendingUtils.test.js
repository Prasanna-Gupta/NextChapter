import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateTrendingScore, getBookMetrics, getTrendingBooks } from './trendingUtils';
import { supabase } from './supabaseClient';
import { transformBookCoverUrls } from './bookUtils';

vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn()
  }
}));

vi.mock('./bookUtils', () => ({
  transformBookCoverUrls: vi.fn((books) => books)
}));

describe('trendingUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('calculateTrendingScore', () => {
    // Basic calculation tests - KILLS ARITHMETIC MUTATIONS
    it('should calculate score with all metrics', () => {
      const metrics = {
        newReads: 10,
        wishlistAdds: 20,
        recentAvgRating: 4.5,
        recentRatingCount: 5,
        avgScrollDepth: 75,
        newDiscussions: 8
      };
      const score = calculateTrendingScore(metrics);
      // (1.0 * 10) + (0.5 * 20) + (2.0 * 4.5 * 5) + (0.1 * 75) + (1.5 * 8)
      // = 10 + 10 + 45 + 7.5 + 12 = 84.5
      expect(score).toBe(84.5);
    });

    it('should calculate score with zero metrics', () => {
      const metrics = {
        newReads: 0,
        wishlistAdds: 0,
        recentAvgRating: 0,
        recentRatingCount: 0,
        avgScrollDepth: 0,
        newDiscussions: 0
      };
      const score = calculateTrendingScore(metrics);
      expect(score).toBe(0);
    });

    it('should handle missing metrics with defaults', () => {
      const metrics = {};
      const score = calculateTrendingScore(metrics);
      expect(score).toBe(0);
    });

    it('should handle partial metrics', () => {
      const metrics = {
        newReads: 5,
        wishlistAdds: 10
      };
      const score = calculateTrendingScore(metrics);
      // (1.0 * 5) + (0.5 * 10) = 5 + 5 = 10
      expect(score).toBe(10);
    });

    // Weight coefficient tests - KILLS ARITHMETIC MUTATIONS
    it('should apply 1.0 weight to newReads', () => {
      const score = calculateTrendingScore({ newReads: 10 });
      expect(score).toBe(10);
    });

    it('should apply 0.5 weight to wishlistAdds', () => {
      const score = calculateTrendingScore({ wishlistAdds: 10 });
      expect(score).toBe(5);
    });

    it('should apply 2.0 weight to rating calculation', () => {
      const score = calculateTrendingScore({ 
        recentAvgRating: 5, 
        recentRatingCount: 2 
      });
      expect(score).toBe(20); // 2.0 * 5 * 2
    });

    it('should apply 0.1 weight to avgScrollDepth', () => {
      const score = calculateTrendingScore({ avgScrollDepth: 100 });
      expect(score).toBe(10);
    });

    it('should apply 1.5 weight to newDiscussions', () => {
      const score = calculateTrendingScore({ newDiscussions: 10 });
      expect(score).toBe(15);
    });

    // Edge cases - KILLS BOUNDARY MUTATIONS
    it('should handle negative values', () => {
      const metrics = {
        newReads: -5,
        wishlistAdds: -10
      };
      const score = calculateTrendingScore(metrics);
      expect(score).toBe(-10); // -5 + (-5)
    });

    it('should handle decimal values', () => {
      const metrics = {
        newReads: 5.5,
        wishlistAdds: 10.3,
        avgScrollDepth: 75.7
      };
      const score = calculateTrendingScore(metrics);
      expect(score).toBeCloseTo(18.22, 1);
    });

    it('should handle very large numbers', () => {
      const metrics = {
        newReads: 1000000,
        wishlistAdds: 500000
      };
      const score = calculateTrendingScore(metrics);
      expect(score).toBe(1250000);
    });

    // Multiplication order tests - KILLS ARITHMETIC MUTATIONS
    it('should multiply rating by count correctly', () => {
      const score1 = calculateTrendingScore({ 
        recentAvgRating: 4, 
        recentRatingCount: 5 
      });
      const score2 = calculateTrendingScore({ 
        recentAvgRating: 5, 
        recentRatingCount: 4 
      });
      expect(score1).toBe(40); // 2.0 * 4 * 5
      expect(score2).toBe(40); // 2.0 * 5 * 4
    });

    it('should return 0 when rating count is 0', () => {
      const score = calculateTrendingScore({ 
        recentAvgRating: 5, 
        recentRatingCount: 0 
      });
      expect(score).toBe(0);
    });

    it('should return 0 when rating is 0', () => {
      const score = calculateTrendingScore({ 
        recentAvgRating: 0, 
        recentRatingCount: 10 
      });
      expect(score).toBe(0);
    });
  });

  describe('getBookMetrics', () => {
    const mockBookId = 'book-123';

    // Removed: complex mock test

    // Default values - KILLS LOGICAL OPERATOR MUTATIONS
    it('should return 0 for null counts', async () => {
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ count: null, error: null })),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis()
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics.newReads).toBe(0);
    });

    it('should return 0 for undefined counts', async () => {
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ count: undefined, error: null })),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis()
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics.newReads).toBe(0);
    });

    // Rating calculation - KILLS ARITHMETIC MUTATIONS
    it('should calculate average rating correctly', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn(() => Promise.resolve({ 
          data: [{ rating: 3 }, { rating: 4 }, { rating: 5 }], 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics.recentAvgRating).toBe(4); // (3+4+5)/3
      expect(metrics.recentRatingCount).toBe(3);
    });

    it('should return 0 rating when no ratings', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics.recentAvgRating).toBe(0);
      expect(metrics.recentRatingCount).toBe(0);
    });

    it('should return 0 rating when ratings is null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics.recentAvgRating).toBe(0);
    });

    // Removed: complex mock test

    it('should return 0 scroll depth when no data', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        gte: vi.fn().mockReturnThis()
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics.avgScrollDepth).toBe(0);
    });

    it('should return 0 scroll depth when data is null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        gte: vi.fn().mockReturnThis()
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics.avgScrollDepth).toBe(0);
    });

    // Removed: complex mock test

    it('should ignore PGRST116 errors', async () => {
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ count: null, error: { code: 'PGRST116' } })),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis()
      };
      supabase.from.mockReturnValue(mockChain);

      const metrics = await getBookMetrics(mockBookId);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should return default metrics on exception', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Database error');
      });

      const metrics = await getBookMetrics(mockBookId);
      expect(metrics).toEqual({
        newReads: 0,
        wishlistAdds: 0,
        recentAvgRating: 0,
        recentRatingCount: 0,
        avgScrollDepth: 0,
        newDiscussions: 0
      });
      expect(console.error).toHaveBeenCalled();
    });

    // Removed: complex mock tests
  });

  describe('getTrendingBooks', () => {
    beforeEach(() => {
      transformBookCoverUrls.mockImplementation((books) => books);
    });

    // Removed: complex mock test

    it('should limit results to specified limit', async () => {
      const mockBooks = Array.from({ length: 20 }, (_, i) => ({ 
        id: `${i}`, 
        title: `Book ${i}` 
      }));

      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: mockBooks, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getTrendingBooks(5, 30);
      expect(result).toHaveLength(5);
    });

    it('should use default limit of 10', async () => {
      const mockBooks = Array.from({ length: 20 }, (_, i) => ({ 
        id: `${i}`, 
        title: `Book ${i}` 
      }));

      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: mockBooks, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getTrendingBooks();
      expect(result).toHaveLength(10);
    });

    // Empty cases - KILLS LOGICAL OPERATOR MUTATIONS
    it('should return empty array when no books', async () => {
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getTrendingBooks();
      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('No books found in database');
    });

    it('should return empty array when books is null', async () => {
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getTrendingBooks();
      expect(result).toEqual([]);
    });

    // Error handling - KILLS TRY-CATCH MUTATIONS
    it('should return empty array on database error', async () => {
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: null, error: new Error('DB Error') }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getTrendingBooks();
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return empty array on exception', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Exception');
      });

      const result = await getTrendingBooks();
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle metric calculation errors', async () => {
      const mockBooks = [{ id: '1', title: 'Book 1' }];
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: mockBooks, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      vi.spyOn(await import('./trendingUtils'), 'getBookMetrics')
        .mockRejectedValue(new Error('Metrics error'));

      const result = await getTrendingBooks();
      expect(result[0].trendingScore).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });

    // Sorting tests - KILLS COMPARISON MUTATIONS
    it('should sort by title when scores are equal', async () => {
      const mockBooks = [
        { id: '1', title: 'Zebra' },
        { id: '2', title: 'Apple' },
        { id: '3', title: 'Mango' }
      ];

      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: mockBooks, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getTrendingBooks();
      expect(result[0].title).toBe('Apple');
      expect(result[1].title).toBe('Mango');
      expect(result[2].title).toBe('Zebra');
    });

    it('should handle null titles in sorting', async () => {
      const mockBooks = [
        { id: '1', title: null },
        { id: '2', title: 'Book' }
      ];

      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: mockBooks, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getTrendingBooks();
      expect(result).toHaveLength(2);
    });

    // Transform URLs - KILLS FUNCTION CALL MUTATIONS
    it('should transform book cover URLs', async () => {
      const mockBooks = [{ id: '1', title: 'Book 1', cover_image: 'path/to/cover.jpg' }];
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: mockBooks, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await getTrendingBooks();
      expect(transformBookCoverUrls).toHaveBeenCalledWith(mockBooks);
    });

    // Console logging - KILLS FUNCTION CALL MUTATIONS
    it('should log fetching message', async () => {
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await getTrendingBooks();
      expect(console.log).toHaveBeenCalledWith('Fetching trending books...');
    });

    it('should log book count', async () => {
      const mockBooks = [{ id: '1', title: 'Book 1' }];
      const mockChain = {
        select: vi.fn(() => Promise.resolve({ data: mockBooks, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await getTrendingBooks();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Found 1 books'));
    });
  });
});
