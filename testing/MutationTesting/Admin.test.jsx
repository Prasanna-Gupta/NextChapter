import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Admin from './Admin';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: '1' }, loading: false }),
}));

const mockQuery = {
  select: vi.fn(function() { return this; }),
  order: vi.fn(function() { return this; }),
  range: vi.fn(() => Promise.resolve({ data: [], error: null })),
  eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => mockQuery),
    channel: vi.fn(() => ({
      on: vi.fn(function() { return this; }),
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: 0, error: null })),
  },
}));

vi.mock('../lib/personalizationUtils', () => ({
  getUserProfile: vi.fn(() => Promise.resolve(null)),
}));

describe('Admin', () => {
  it('should render component', () => {
    const { container } = render(<BrowserRouter><Admin /></BrowserRouter>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
