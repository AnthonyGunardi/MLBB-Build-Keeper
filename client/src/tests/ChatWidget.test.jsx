import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import ChatWidget from '../components/Chat/ChatWidget';
import chatService from '../services/chatService';

vi.mock('../services/chatService');

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders FAB button by default', () => {
    render(<ChatWidget />);
    expect(screen.getByRole('button', { name: 'Open Chat' })).toBeInTheDocument();
  });

  it('does not show chat window initially', () => {
    render(<ChatWidget />);
    expect(screen.queryByText('Virtual Coach')).not.toBeInTheDocument();
  });

  it('opens chat window when FAB is clicked', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));
    expect(screen.getByText('Virtual Coach')).toBeInTheDocument();
  });

  it('shows initial welcome message from assistant', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));
    expect(screen.getByText(/Hey! I'm your Virtual Coach/)).toBeInTheDocument();
  });

  it('closes chat window when close button is clicked', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));
    expect(screen.getByText('Virtual Coach')).toBeInTheDocument();

    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText('Virtual Coach')).not.toBeInTheDocument();
  });

  it('can type in input field', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    const input = screen.getByPlaceholderText('Ask about builds...');
    fireEvent.change(input, { target: { value: 'Best build for Layla?' } });
    expect(input.value).toBe('Best build for Layla?');
  });

  it('submits message and shows user message', async () => {
    chatService.sendMessage.mockResolvedValue('AI response here');
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    const input = screen.getByPlaceholderText('Ask about builds...');
    fireEvent.change(input, { target: { value: 'Best build for Layla?' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Best build for Layla?')).toBeInTheDocument();
    });
  });

  it('shows assistant response after sending message', async () => {
    chatService.sendMessage.mockResolvedValue('Use Windtalker for attack speed');
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    const input = screen.getByPlaceholderText('Ask about builds...');
    fireEvent.change(input, { target: { value: 'Best build?' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Use Windtalker for attack speed')).toBeInTheDocument();
    });
    expect(chatService.sendMessage).toHaveBeenCalledWith('Best build?');
  });

  it('shows error message on API failure', async () => {
    chatService.sendMessage.mockRejectedValue(new Error('Network error'));
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    const input = screen.getByPlaceholderText('Ask about builds...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Sorry, I'm having trouble connecting/)).toBeInTheDocument();
    });
  });

  it('clears input after sending message', async () => {
    chatService.sendMessage.mockResolvedValue('Response');
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    const input = screen.getByPlaceholderText('Ask about builds...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('does not submit empty or whitespace-only message', async () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    const input = screen.getByPlaceholderText('Ask about builds...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form'));

    expect(chatService.sendMessage).not.toHaveBeenCalled();
  });

  it('disables send button while loading', async () => {
    let resolvePromise;
    chatService.sendMessage.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePromise = resolve;
        })
    );

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    const input = screen.getByPlaceholderText('Ask about builds...');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '➤' })).toBeDisabled();
    });

    // Resolve the promise to clean up
    resolvePromise('Response');
  });
});
