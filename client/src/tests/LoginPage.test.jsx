import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../api/axios');
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

const mockLogin = vi.fn();

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LoginPage />
      </BrowserRouter>
    );
  };

  it('renders login form', () => {
    renderComponent();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderComponent();
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password');
  });

  it('submits form successfully', async () => {
    mockLogin.mockResolvedValue();
    renderComponent();

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Initialize Login'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('displays error message on login failure', async () => {
    mockLogin.mockRejectedValue({ response: { data: { msg: 'Invalid credentials' } } });
    renderComponent();

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Initialize Login'));

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
  });

  it('displays default error message on login failure (Branch Coverage)', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    renderComponent();

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Initialize Login'));

    await waitFor(() => expect(screen.getByText('Login failed')).toBeInTheDocument());
  });
});
