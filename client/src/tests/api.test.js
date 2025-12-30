import { vi, describe, it, expect } from 'vitest';

const mockUse = vi.fn();
vi.mock('axios', () => ({
  default: {
    create: () => ({ interceptors: { request: { use: mockUse } } })
  }
}));

describe('Axios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('intercepts requests', async () => {
    await import('../api/axios');
    expect(mockUse).toHaveBeenCalled();
    const [success, error] = mockUse.mock.calls[0];

    localStorage.setItem('token', 't');
    const c1 = { headers: {} };
    const res1 = success(c1);
    expect(res1.headers['x-auth-token']).toBe('t');

    localStorage.removeItem('token');
    const c2 = { headers: {} };
    const res2 = success(c2);
    expect(res2.headers['x-auth-token']).toBeUndefined();

    await expect(error('e')).rejects.toBe('e');
  });
});
