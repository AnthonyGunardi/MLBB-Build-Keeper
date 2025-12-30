import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../pages/RegisterPage';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const mockRegister = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister
  })
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RegisterPage />
      </BrowserRouter>
    );
  };

  it('renders register form', () => {
    renderComponent();
    expect(screen.getByText('New User Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('validates password match', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'mismatch' } });

    fireEvent.click(screen.getByText('Initialize Account'));

    await waitFor(() => expect(screen.getByText('Passwords do not match')).toBeInTheDocument());
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register on valid submission', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Initialize Account'));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith('testuser', 'test@test.com', 'password123'));
  });

  it('displays error on register failure', async () => {
    mockRegister.mockRejectedValue({ response: { data: { msg: 'User already exists' } } });
    renderComponent();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Initialize Account'));

    await waitFor(() => expect(screen.getByText('User already exists')).toBeInTheDocument());
  });

  it('displays default error on register failure without API message', async () => {
    mockRegister.mockRejectedValue(new Error('Network Error'));
    renderComponent();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Initialize Account'));

    await waitFor(() => expect(screen.getByText('Registration failed')).toBeInTheDocument());
  });
});
