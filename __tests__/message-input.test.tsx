import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MessageInput } from '@/features/chat/components/message-input';

describe('MessageInput', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders input and send button', () => {
    render(<MessageInput onSubmit={mockOnSubmit} />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('shows validation error for empty message', async () => {
    render(<MessageInput onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'Send' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Message cannot be empty')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows validation error for long message', async () => {
    render(<MessageInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const submitButton = screen.getByRole('button', { name: 'Send' });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'a'.repeat(1001) } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Message is too long')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits valid message', async () => {
    render(<MessageInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const submitButton = screen.getByRole('button', { name: 'Send' });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello, world!' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ content: 'Hello, world!' });
    });
  });

  it('shows loading state while submitting', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<MessageInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const submitButton = screen.getByRole('button', { name: 'Send' });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello, world!' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toContainElement(screen.getByTestId('loader'));
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton.querySelector('.lucide-send')).toBeInTheDocument();
    });
  });

  it('shows error message when provided', () => {
    render(<MessageInput onSubmit={mockOnSubmit} error="Failed to send message" />);
    expect(screen.getByText('Failed to send message')).toBeInTheDocument();
  });

  it('disables input and button when loading', () => {
    render(<MessageInput onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send' })).toContainElement(screen.getByTestId('loader'));
  });
}); 