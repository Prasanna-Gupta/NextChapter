import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformBookCoverUrls } from './bookUtils';
import { supabase } from './supabaseClient';

vi.mock('./supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn()
    }
  }
}));

describe('bookUtils', () => {
  describe('transformBookCoverUrls', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      
      // Default mock for storage
      supabase.storage.from.mockReturnValue({
        getPublicUrl: vi.fn((path) => ({
          data: { publicUrl: `https://storage.example.com/covers/${path}` }
        }))
      });
    });

    // Single book tests - KILLS CONDITIONAL MUTATIONS
    it('should transform single book with relative path', () => {
      const book = {
        id: '1',
        title: 'Test Book',
        cover_image: 'path/to/cover.jpg'
      };

      const result = transformBookCoverUrls(book);

      expect(result.cover_image).toBe('https://storage.example.com/covers/path/to/cover.jpg');
      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Book');
    });

    it('should not transform book with full HTTP URL', () => {
      const book = {
        id: '1',
        title: 'Test Book',
        cover_image: 'http://example.com/cover.jpg'
      };

      const result = transformBookCoverUrls(book);

      expect(result.cover_image).toBe('http://example.com/cover.jpg');
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should not transform book with full HTTPS URL', () => {
      const book = {
        id: '1',
        title: 'Test Book',
        cover_image: 'https://example.com/cover.jpg'
      };

      const result = transformBookCoverUrls(book);

      expect(result.cover_image).toBe('https://example.com/cover.jpg');
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should handle book with null cover_image', () => {
      const book = {
        id: '1',
        title: 'Test Book',
        cover_image: null
      };

      const result = transformBookCoverUrls(book);

      expect(result.cover_image).toBeNull();
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should handle book with undefined cover_image', () => {
      const book = {
        id: '1',
        title: 'Test Book'
      };

      const result = transformBookCoverUrls(book);

      expect(result.cover_image).toBeUndefined();
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should handle book with empty string cover_image', () => {
      const book = {
        id: '1',
        title: 'Test Book',
        cover_image: ''
      };

      const result = transformBookCoverUrls(book);

      expect(result.cover_image).toBe('');
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should handle null book', () => {
      const result = transformBookCoverUrls(null);
      expect(result).toBeNull();
    });

    it('should handle undefined book', () => {
      const result = transformBookCoverUrls(undefined);
      expect(result).toBeUndefined();
    });

    // Path cleaning tests - KILLS STRING MUTATIONS
    it('should remove "covers/" prefix from path', () => {
      const book = {
        id: '1',
        cover_image: 'covers/image.jpg'
      };

      transformBookCoverUrls(book);

      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('image.jpg');
    });

    it('should remove "book-storage/" prefix from path', () => {
      const book = {
        id: '1',
        cover_image: 'book-storage/image.jpg'
      };

      transformBookCoverUrls(book);

      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('image.jpg');
    });

    it('should remove "Book-storage/" prefix from path', () => {
      const book = {
        id: '1',
        cover_image: 'Book-storage/image.jpg'
      };

      transformBookCoverUrls(book);

      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('image.jpg');
    });

    it('should not modify path without bucket prefix', () => {
      const book = {
        id: '1',
        cover_image: 'subfolder/image.jpg'
      };

      transformBookCoverUrls(book);

      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('subfolder/image.jpg');
    });

    it('should handle path with multiple slashes', () => {
      const book = {
        id: '1',
        cover_image: 'covers/subfolder/image.jpg'
      };

      transformBookCoverUrls(book);

      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('subfolder/image.jpg');
    });

    // Storage bucket tests - KILLS FUNCTION CALL MUTATIONS
    it('should call storage.from with "covers" bucket', () => {
      const book = {
        id: '1',
        cover_image: 'image.jpg'
      };

      transformBookCoverUrls(book);

      expect(supabase.storage.from).toHaveBeenCalledWith('covers');
    });

    it('should call getPublicUrl with cleaned path', () => {
      const book = {
        id: '1',
        cover_image: 'path/to/image.jpg'
      };

      transformBookCoverUrls(book);

      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('path/to/image.jpg');
    });

    // Array of books tests - KILLS ARRAY MUTATIONS
    it('should transform array of books', () => {
      const books = [
        { id: '1', cover_image: 'image1.jpg' },
        { id: '2', cover_image: 'image2.jpg' },
        { id: '3', cover_image: 'image3.jpg' }
      ];

      const result = transformBookCoverUrls(books);

      expect(result).toHaveLength(3);
      expect(result[0].cover_image).toBe('https://storage.example.com/covers/image1.jpg');
      expect(result[1].cover_image).toBe('https://storage.example.com/covers/image2.jpg');
      expect(result[2].cover_image).toBe('https://storage.example.com/covers/image3.jpg');
    });

    it('should handle empty array', () => {
      const books = [];
      const result = transformBookCoverUrls(books);
      expect(result).toEqual([]);
    });

    it('should handle array with one book', () => {
      const books = [{ id: '1', cover_image: 'image.jpg' }];
      const result = transformBookCoverUrls(books);
      expect(result).toHaveLength(1);
      expect(result[0].cover_image).toBe('https://storage.example.com/covers/image.jpg');
    });

    it('should handle array with mixed URL types', () => {
      const books = [
        { id: '1', cover_image: 'relative/path.jpg' },
        { id: '2', cover_image: 'https://example.com/full.jpg' },
        { id: '3', cover_image: null },
        { id: '4', cover_image: 'covers/prefixed.jpg' }
      ];

      const result = transformBookCoverUrls(books);

      expect(result[0].cover_image).toBe('https://storage.example.com/covers/relative/path.jpg');
      expect(result[1].cover_image).toBe('https://example.com/full.jpg');
      expect(result[2].cover_image).toBeNull();
      expect(result[3].cover_image).toBe('https://storage.example.com/covers/prefixed.jpg');
    });

    it('should handle array with null books', () => {
      const books = [
        { id: '1', cover_image: 'image.jpg' },
        null,
        { id: '2', cover_image: 'image2.jpg' }
      ];

      const result = transformBookCoverUrls(books);

      expect(result).toHaveLength(3);
      expect(result[0].cover_image).toBe('https://storage.example.com/covers/image.jpg');
      expect(result[1]).toBeNull();
      expect(result[2].cover_image).toBe('https://storage.example.com/covers/image2.jpg');
    });

    // Edge cases - KILLS BOUNDARY MUTATIONS
    it('should preserve all book properties', () => {
      const book = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        cover_image: 'image.jpg',
        description: 'Test description',
        rating: 4.5
      };

      const result = transformBookCoverUrls(book);

      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Book');
      expect(result.author).toBe('Test Author');
      expect(result.description).toBe('Test description');
      expect(result.rating).toBe(4.5);
      expect(result.cover_image).toBe('https://storage.example.com/covers/image.jpg');
    });

    it('should not mutate original book object', () => {
      const book = {
        id: '1',
        cover_image: 'image.jpg'
      };

      const result = transformBookCoverUrls(book);

      expect(result).not.toBe(book);
      expect(book.cover_image).toBe('image.jpg'); // Original unchanged
    });

    it('should not mutate original array', () => {
      const books = [
        { id: '1', cover_image: 'image1.jpg' },
        { id: '2', cover_image: 'image2.jpg' }
      ];

      const result = transformBookCoverUrls(books);

      expect(result).not.toBe(books);
      expect(books[0].cover_image).toBe('image1.jpg'); // Original unchanged
    });

    // URL detection tests - KILLS CONDITIONAL MUTATIONS
    it('should detect http:// as full URL', () => {
      const book = { id: '1', cover_image: 'http://test.com/image.jpg' };
      const result = transformBookCoverUrls(book);
      expect(result.cover_image).toBe('http://test.com/image.jpg');
    });

    it('should detect https:// as full URL', () => {
      const book = { id: '1', cover_image: 'https://test.com/image.jpg' };
      const result = transformBookCoverUrls(book);
      expect(result.cover_image).toBe('https://test.com/image.jpg');
    });

    it('should not detect HTTP:// (uppercase) as full URL', () => {
      const book = { id: '1', cover_image: 'HTTP://test.com/image.jpg' };
      transformBookCoverUrls(book);
      expect(supabase.storage.from).toHaveBeenCalled();
    });

    it('should handle URL with query parameters', () => {
      const book = { id: '1', cover_image: 'https://test.com/image.jpg?v=1' };
      const result = transformBookCoverUrls(book);
      expect(result.cover_image).toBe('https://test.com/image.jpg?v=1');
    });

    it('should handle URL with hash', () => {
      const book = { id: '1', cover_image: 'https://test.com/image.jpg#section' };
      const result = transformBookCoverUrls(book);
      expect(result.cover_image).toBe('https://test.com/image.jpg#section');
    });

    // Special characters in paths - KILLS STRING MUTATIONS
    it('should handle path with spaces', () => {
      const book = { id: '1', cover_image: 'path with spaces/image.jpg' };
      transformBookCoverUrls(book);
      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('path with spaces/image.jpg');
    });

    it('should handle path with special characters', () => {
      const book = { id: '1', cover_image: 'path-with_special.chars/image.jpg' };
      transformBookCoverUrls(book);
      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('path-with_special.chars/image.jpg');
    });

    it('should handle path with unicode characters', () => {
      const book = { id: '1', cover_image: 'path/图片.jpg' };
      transformBookCoverUrls(book);
      const mockStorage = supabase.storage.from.mock.results[0].value;
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('path/图片.jpg');
    });
  });
});
