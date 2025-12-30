import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthService from '../services/authService';

vi.mock('../services/authService');

const TestComponent = () => {
  const { user, loading, login, register, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => register('user', 'test@test.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads user from token on mount', async () => {
    localStorage.setItem('token', 'valid-token');
    AuthService.getMe.mockResolvedValue({ email: 'stored@test.com' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('stored@test.com');
  });

  it('handles getMe error on mount and removes token', async () => {
    localStorage.setItem('token', 'invalid-token');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    AuthService.getMe.mockRejectedValue(new Error('Token expired'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.getItem('token')).toBeNull();
    consoleSpy.mockRestore();
  });

  it('shows no user when no token exists on mount', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('login sets token and fetches user', async () => {
    AuthService.login.mockResolvedValue({ token: 'new-token' });
    AuthService.getMe.mockResolvedValue({ email: 'loggedin@test.com' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(localStorage.getItem('token')).toBe('new-token');
    expect(screen.getByTestId('user')).toHaveTextContent('loggedin@test.com');
  });

  it('register sets token and fetches user', async () => {
    AuthService.register.mockResolvedValue({ token: 'reg-token' });
    AuthService.getMe.mockResolvedValue({ email: 'registered@test.com' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    await act(async () => {
      await userEvent.click(screen.getByText('Register'));
    });

    expect(localStorage.getItem('token')).toBe('reg-token');
    expect(screen.getByTestId('user')).toHaveTextContent('registered@test.com');
  });

  it('logout clears token and user', async () => {
    localStorage.setItem('token', 'existing-token');
    AuthService.getMe.mockResolvedValue({ email: 'existing@test.com' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('existing@test.com');
    });

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });
});
