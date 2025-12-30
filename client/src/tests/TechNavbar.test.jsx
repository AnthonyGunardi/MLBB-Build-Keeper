import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TechNavbar from '../components/TechNavbar';
import * as AuthContext from '../context/AuthContext';
import styles from '../components/TechNavbar/TechNavbar.module.css';

const useAuthSpy = vi.spyOn(AuthContext, 'useAuth');

describe('TechNavbar Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavbar = (user = null) => {
    useAuthSpy.mockReturnValue({ user, logout: mockLogout });
    return render(
      <BrowserRouter>
        <TechNavbar />
      </BrowserRouter>
    );
  };

  it('renders logo and navigation links', () => {
    renderNavbar();
    expect(screen.getByText('ML:Builds')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders user info and logout when authenticated', () => {
    renderNavbar({ email: 'test@example.com', role: 'user' });
    expect(screen.getByText('CMD // test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
    expect(screen.getByText('My Builds')).toBeInTheDocument();
  });

  it('renders admin link for admin user', () => {
    renderNavbar({ email: 'admin@example.com', role: 'admin' });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    const { container } = renderNavbar();

    const nav = container.querySelector('nav');
    expect(nav.classList.contains(styles.menuOpen)).toBe(false);

    const toggleBtn = screen.getByLabelText('Toggle navigation');

    fireEvent.click(toggleBtn);
    expect(nav.classList.contains(styles.menuOpen)).toBe(true);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(toggleBtn);
    expect(nav.classList.contains(styles.menuOpen)).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes mobile menu when a link is clicked', () => {
    const { container } = renderNavbar();
    const nav = container.querySelector('nav');
    const toggleBtn = screen.getByLabelText('Toggle navigation');

    fireEvent.click(toggleBtn);
    expect(nav.classList.contains(styles.menuOpen)).toBe(true);

    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    expect(nav.classList.contains(styles.menuOpen)).toBe(false);
  });

  it('closes mobile menu when logout is clicked', () => {
    renderNavbar({ email: 'user@test.com' });
    const toggleBtn = screen.getByLabelText('Toggle navigation');

    fireEvent.click(toggleBtn);

    const logoutBtn = screen.getByText('Disconnect');
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
  });
});
