import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const { mockGetAllHeroes } = vi.hoisted(() => {
  return { mockGetAllHeroes: vi.fn() };
});

vi.mock('../services/heroService', () => ({
  default: {
    getAllHeroes: mockGetAllHeroes
  }
}));

let capturedOnSelect = null;
vi.mock('../components/HeroSearch', () => ({
  default: ({ onSelect }) => {
    capturedOnSelect = onSelect;
    return <div data-testid="hero-search-mock">Mock HeroSearch</div>;
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));
import { useAuth } from '../context/AuthContext';

vi.mock('../config/config', () => ({
  API_BASE_URL: 'http://localhost:5000',
  API_URL: 'http://localhost:5000/api'
}));

const mockUser = { email: 'user@test.com', role: 'user' };
const mockAdmin = { email: 'admin@test.com', role: 'admin' };
const mockLogout = vi.fn();

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero list successfully', async () => {
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    mockGetAllHeroes.mockResolvedValue([
      { id: 1, name: 'Layla', role: 'Marksman', hero_image_path: 'path.jpg', role_icon_path: 'icon.jpg' }
    ]);

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());
    expect(screen.getByText('Marksman')).toBeInTheDocument();
    expect(screen.getByText('Manage Builds')).toBeInTheDocument();
  });

  it('handles fetch error', async () => {
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    mockGetAllHeroes.mockRejectedValue(new Error('Fetch Failed'));

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Error loading heroes.')).toBeInTheDocument());
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('redirects to login if user not authenticated', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </BrowserRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows Admin link for admin user', async () => {
    useAuth.mockReturnValue({ user: mockAdmin, logout: mockLogout });
    mockGetAllHeroes.mockResolvedValue([]);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());
  });

  it('hides Admin link for normal user', async () => {
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    mockGetAllHeroes.mockResolvedValue([]);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </BrowserRouter>
    );
    await waitFor(() => expect(screen.queryByText('Admin')).not.toBeInTheDocument());
  });

  it('handles logout click', async () => {
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    mockGetAllHeroes.mockResolvedValue([]);

    await act(async () => {
      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Dashboard />
        </BrowserRouter>
      );
    });

    await waitFor(() => expect(screen.getByText('Disconnect')).toBeInTheDocument());

    await act(async () => {
      screen.getByText('Disconnect').click();
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('filters heroes when search selects a hero', async () => {
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    const mockHeroes = [
      { id: 1, name: 'Layla', role: 'Marksman', hero_image_path: 'layla.jpg', role_icon_path: 'icon.jpg' },
      { id: 2, name: 'Miya', role: 'Marksman', hero_image_path: 'miya.jpg', role_icon_path: 'icon.jpg' }
    ];
    mockGetAllHeroes.mockResolvedValue(mockHeroes);

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());
    expect(screen.getByText('Miya')).toBeInTheDocument();

    await act(async () => {
      capturedOnSelect({
        id: 1,
        name: 'Layla',
        role: 'Marksman',
        hero_image_path: 'layla.jpg',
        role_icon_path: 'icon.jpg'
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Layla')).toBeInTheDocument();
      expect(screen.queryByText('Miya')).not.toBeInTheDocument();
    });
  });

  it('resets heroes when search is cleared', async () => {
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    const mockHeroes = [
      { id: 1, name: 'Layla', role: 'Marksman', hero_image_path: 'layla.jpg', role_icon_path: 'icon.jpg' },
      { id: 2, name: 'Miya', role: 'Marksman', hero_image_path: 'miya.jpg', role_icon_path: 'icon.jpg' }
    ];
    mockGetAllHeroes.mockResolvedValue(mockHeroes);

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());

    await act(async () => {
      capturedOnSelect({
        id: 1,
        name: 'Layla',
        role: 'Marksman',
        hero_image_path: 'layla.jpg',
        role_icon_path: 'icon.jpg'
      });
    });

    await act(async () => {
      capturedOnSelect(null);
    });

    await waitFor(() => {
      expect(mockGetAllHeroes).toHaveBeenCalledTimes(2);
    });
  });
});
