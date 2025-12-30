import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../config/config', () => ({
  API_BASE_URL: 'http://localhost:5000',
  API_URL: 'http://localhost:5000/api'
}));

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn()
  })
}));

let capturedOnSelect = null;
vi.mock('../components/HeroSearch', () => ({
  default: ({ onSelect }) => {
    capturedOnSelect = onSelect;
    return <div data-testid="hero-search-mock">Mock HeroSearch</div>;
  }
}));

describe('HomePage', () => {
  it('renders welcome message and links', async () => {
    const api = (await import('../api/axios')).default;
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('BUILD')).toBeInTheDocument();
    expect(screen.getByText('KEEPER')).toBeInTheDocument();
    expect(screen.getByText(/Access the ultimate database/i)).toBeInTheDocument();

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  });

  it('handles fetch error gracefully', async () => {
    const api = (await import('../api/axios')).default;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    api.get.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it('renders hero cards when heroes are loaded', async () => {
    const api = (await import('../api/axios')).default;
    api.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Layla', hero_image_path: 'path.jpg' }]
    });

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());
    expect(screen.getByText('View Builds')).toBeInTheDocument();
  });

  it('filters heroes when search selects a hero', async () => {
    const api = (await import('../api/axios')).default;
    api.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Layla', hero_image_path: 'layla.jpg' },
        { id: 2, name: 'Miya', hero_image_path: 'miya.jpg' }
      ]
    });

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());
    expect(screen.getByText('Miya')).toBeInTheDocument();

    await act(async () => {
      capturedOnSelect({ id: 1, name: 'Layla', hero_image_path: 'layla.jpg' });
    });

    await waitFor(() => {
      expect(screen.getByText('Layla')).toBeInTheDocument();
      expect(screen.queryByText('Miya')).not.toBeInTheDocument();
    });
  });

  it('resets heroes when search is cleared', async () => {
    const api = (await import('../api/axios')).default;
    api.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Layla', hero_image_path: 'layla.jpg' },
        { id: 2, name: 'Miya', hero_image_path: 'miya.jpg' }
      ]
    });

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());

    await act(async () => {
      capturedOnSelect({ id: 1, name: 'Layla', hero_image_path: 'layla.jpg' });
    });

    await act(async () => {
      capturedOnSelect(null);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });

  it('handles image hover effects', async () => {
    const api = (await import('../api/axios')).default;
    api.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Layla', hero_image_path: 'path.jpg' }]
    });

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());

    const heroImage = screen.getByAltText('Layla');

    fireEvent.mouseOver(heroImage);
    expect(heroImage.style.transform).toBe('scale(1.1)');

    fireEvent.mouseOut(heroImage);
    expect(heroImage.style.transform).toBe('scale(1)');
  });
});
