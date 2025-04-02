import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import React from "react";

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};

describe('ChatContainer', () => {
  it('renders with correct layout structure', () => {
    render(<ChatContainer />);
    expect(screen.getByTestId('message-list-container')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('allows sending a message', async () => {
    render(<ChatContainer />);
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton);
    });

    // Check loading state
    expect(sendButton).toBeDisabled();
    expect(sendButton).toContainElement(screen.getByTestId('loader'));
    expect(screen.getByTestId('message-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();

    // Wait for the simulated response
    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
      expect(screen.getByText('This is a simulated response')).toBeInTheDocument();
      expect(sendButton).not.toBeDisabled();
      expect(screen.queryByTestId('message-loading')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows error message when sending fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<ChatContainer />);
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Message cannot be empty')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });
}); 