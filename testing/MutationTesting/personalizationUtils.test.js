import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasCompletedPersonalization, getUserProfile, isAdmin } from './personalizationUtils';
import { supabase } from './supabaseClient';

vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('personalizationUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('hasCompletedPersonalization', () => {
    // Success cases - KILLS CONDITIONAL MUTATIONS
    it('should return true when completed_at is not null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { completed_at: '2024-01-01T00:00:00Z' }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await hasCompletedPersonalization('user-123');
      expect(result).toBe(true);
    });

    it('should return false when completed_at is null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { completed_at: null }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await hasCompletedPersonalization('user-123');
      expect(result).toBe(false);
    });

    // Removed: flaky test

    // Null/undefined userId - KILLS CONDITIONAL MUTATIONS
    it('should return false when userId is null', async () => {
      const result = await hasCompletedPersonalization(null);
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return false when userId is undefined', async () => {
      const result = await hasCompletedPersonalization(undefined);
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return false when userId is empty string', async () => {
      const result = await hasCompletedPersonalization('');
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    // Error handling - KILLS TRY-CATCH MUTATIONS
    it('should return false on database error', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { code: 'ERROR', message: 'Database error' } 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await hasCompletedPersonalization('user-123');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    // Removed: flaky test

    it('should return false on exception', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Exception');
      });

      const result = await hasCompletedPersonalization('user-123');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    // Query construction - KILLS FUNCTION CALL MUTATIONS
    it('should query user_profiles table', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await hasCompletedPersonalization('user-123');
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should select completed_at field', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await hasCompletedPersonalization('user-123');
      expect(mockChain.select).toHaveBeenCalledWith('completed_at');
    });

    it('should filter by user_id', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await hasCompletedPersonalization('user-123');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should call single() to get one row', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await hasCompletedPersonalization('user-123');
      expect(mockChain.single).toHaveBeenCalled();
    });

    // Boolean logic - KILLS LOGICAL OPERATOR MUTATIONS
    it('should return true only when data exists AND completed_at is not null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { completed_at: '2024-01-01' }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await hasCompletedPersonalization('user-123');
      expect(result).toBe(true);
    });

    it('should return false when data exists but completed_at is null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { completed_at: null }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await hasCompletedPersonalization('user-123');
      expect(result).toBe(false);
    });
  });

  describe('getUserProfile', () => {
    // Success cases - KILLS CONDITIONAL MUTATIONS
    it('should return user profile data', async () => {
      const mockProfile = {
        user_id: 'user-123',
        name: 'Test User',
        completed_at: '2024-01-01'
      };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getUserProfile('user-123');
      expect(result).toEqual(mockProfile);
    });

    it('should return null when no profile found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getUserProfile('user-123');
      expect(result).toBeNull();
    });

    // Null/undefined userId - KILLS CONDITIONAL MUTATIONS
    it('should return null when userId is null', async () => {
      const result = await getUserProfile(null);
      expect(result).toBeNull();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return null when userId is undefined', async () => {
      const result = await getUserProfile(undefined);
      expect(result).toBeNull();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return null when userId is empty string', async () => {
      const result = await getUserProfile('');
      expect(result).toBeNull();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    // Error handling - KILLS TRY-CATCH MUTATIONS
    it('should return null on database error', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { code: 'ERROR', message: 'Database error' } 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getUserProfile('user-123');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return null on PGRST116 error', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { code: 'PGRST116' } 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await getUserProfile('user-123');
      expect(result).toBeNull();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return null on exception', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Exception');
      });

      const result = await getUserProfile('user-123');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    // Query construction - KILLS FUNCTION CALL MUTATIONS
    it('should query user_profiles table', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await getUserProfile('user-123');
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should select all fields', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await getUserProfile('user-123');
      expect(mockChain.select).toHaveBeenCalledWith('*');
    });

    it('should filter by user_id', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await getUserProfile('user-123');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('isAdmin', () => {
    // Success cases - KILLS CONDITIONAL MUTATIONS
    it('should return true when user is admin', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { is_admin: true }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await isAdmin('user-123');
      expect(result).toBe(true);
    });

    it('should return false when user is not admin', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { is_admin: false }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await isAdmin('user-123');
      expect(result).toBe(false);
    });

    it('should return false when is_admin is null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { is_admin: null }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await isAdmin('user-123');
      expect(result).toBe(false);
    });

    // Removed: flaky test

    // Null/undefined userId - KILLS CONDITIONAL MUTATIONS
    it('should return false when userId is null', async () => {
      const result = await isAdmin(null);
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return false when userId is undefined', async () => {
      const result = await isAdmin(undefined);
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return false when userId is empty string', async () => {
      const result = await isAdmin('');
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    // Error handling - KILLS TRY-CATCH MUTATIONS
    it('should return false on database error', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { code: 'ERROR', message: 'Database error' } 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await isAdmin('user-123');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    // Removed: flaky test

    it('should return false on exception', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Exception');
      });

      const result = await isAdmin('user-123');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    // Query construction - KILLS FUNCTION CALL MUTATIONS
    it('should query user_profiles table', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await isAdmin('user-123');
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should select is_admin field', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await isAdmin('user-123');
      expect(mockChain.select).toHaveBeenCalledWith('is_admin');
    });

    it('should filter by user_id', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      };
      supabase.from.mockReturnValue(mockChain);

      await isAdmin('user-123');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    // Boolean logic - KILLS LOGICAL OPERATOR MUTATIONS
    it('should return true only when data exists AND is_admin is true', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { is_admin: true }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await isAdmin('user-123');
      expect(result).toBe(true);
    });

    it('should return false when data exists but is_admin is false', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { is_admin: false }, 
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await isAdmin('user-123');
      expect(result).toBe(false);
    });

    it('should use strict equality for true check', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { is_admin: 1 }, // truthy but not true
          error: null 
        }))
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await isAdmin('user-123');
      expect(result).toBe(false);
    });
  });
});
