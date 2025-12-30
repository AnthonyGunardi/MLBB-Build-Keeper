import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeroSearch from '../components/HeroSearch';
import HeroService from '../services/heroService';
import { vi } from 'vitest';

vi.mock('../config/config', () => ({
  API_BASE_URL: 'http://localhost:5000',
  API_URL: 'http://localhost:5000/api'
}));

vi.mock('../services/heroService');

describe('HeroSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders search input', () => {
    render(<HeroSearch />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');
    expect(input).toBeInTheDocument();
  });

  test('fetches suggestions on input change', async () => {
    const mockHeroes = [{ id: 1, name: 'Layla', role_icon_path: 'icon.jpg' }];
    HeroService.getAllHeroes.mockResolvedValue(mockHeroes);

    render(<HeroSearch />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });

    await waitFor(() => {
      expect(HeroService.getAllHeroes).toHaveBeenCalledWith({ search: 'Lay' });
    });

    expect(screen.getByText('Layla')).toBeInTheDocument();
  });

  test('calls onSelect when suggestion is clicked', async () => {
    const mockHero = { id: 1, name: 'Layla', role_icon_path: 'icon.jpg' };
    HeroService.getAllHeroes.mockResolvedValue([mockHero]);
    const onSelectMock = vi.fn();

    render(<HeroSearch onSelect={onSelectMock} />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });

    await waitFor(() => {
      expect(screen.getByText('Layla')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Layla'));

    expect(onSelectMock).toHaveBeenCalledWith(mockHero);
    expect(input.value).toBe('Layla');
  });

  test('clears search when clear button is clicked', async () => {
    const onSelectMock = vi.fn();
    render(<HeroSearch onSelect={onSelectMock} />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✕'));

    expect(input.value).toBe('');
    expect(onSelectMock).toHaveBeenCalledWith(null);
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    HeroService.getAllHeroes.mockRejectedValue(new Error('API Error'));

    render(<HeroSearch />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Err' } });

    await waitFor(() => {
      expect(HeroService.getAllHeroes).toHaveBeenCalled();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch suggestions', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('handleSelect works without onSelect prop', async () => {
    const mockHero = { id: 1, name: 'Layla', role_icon_path: 'icon.jpg' };
    HeroService.getAllHeroes.mockResolvedValue([mockHero]);

    render(<HeroSearch />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });

    await waitFor(() => {
      expect(screen.getByText('Layla')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Layla'));

    expect(input.value).toBe('Layla');
  });

  test('handleClear works without onSelect prop', async () => {
    render(<HeroSearch />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✕'));

    expect(input.value).toBe('');
  });

  test('clears suggestions when input is emptied (else branch)', async () => {
    const mockHeroes = [{ id: 1, name: 'Layla', role_icon_path: 'icon.jpg' }];
    HeroService.getAllHeroes.mockResolvedValue(mockHeroes);
    const onSelectMock = vi.fn();

    render(<HeroSearch onSelect={onSelectMock} />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });
    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());

    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.queryByText('Layla')).not.toBeInTheDocument();
    });
    expect(onSelectMock).toHaveBeenCalledWith(null);
  });

  test('closes suggestions on click outside', async () => {
    const mockHeroes = [{ id: 1, name: 'Layla', role_icon_path: 'icon.jpg' }];
    HeroService.getAllHeroes.mockResolvedValue(mockHeroes);

    render(
      <div>
        <div data-testid="outside">Outside</div>
        <HeroSearch />
      </div>
    );
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });
    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByTestId('outside'));

    await waitFor(() => {
      expect(screen.queryByText('Layla')).not.toBeInTheDocument();
    });
  });

  test('keeps suggestions open on click inside wrapper', async () => {
    const mockHeroes = [{ id: 1, name: 'Layla', role_icon_path: 'icon.jpg' }];
    HeroService.getAllHeroes.mockResolvedValue(mockHeroes);

    render(<HeroSearch />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });
    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());

    // Click inside the input (which is inside the wrapper)
    fireEvent.mouseDown(input);

    // Suggestions should still be visible
    expect(screen.getByText('Layla')).toBeInTheDocument();
  });

  test('renders suggestion without role icon', async () => {
    const mockHeroes = [{ id: 1, name: 'Layla' }]; // No role_icon_path
    HeroService.getAllHeroes.mockResolvedValue(mockHeroes);

    render(<HeroSearch />);
    const input = screen.getByPlaceholderText('SEARCH PROTOCOL // HERO NAME...');

    fireEvent.change(input, { target: { value: 'Lay' } });
    await waitFor(() => expect(screen.getByText('Layla')).toBeInTheDocument());

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
