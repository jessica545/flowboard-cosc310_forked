import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/features/chat/components/message-bubble';

const mockMessage = {
  id: '1',
  content: 'Hello world',
  senderId: 'current-user',
  createdAt: '2024-03-30T12:00:00Z',
  conversationId: 'default'
};

describe('MessageBubble', () => {
  it('renders current user message correctly', () => {
    render(<MessageBubble message={mockMessage} isCurrentUser={true} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByTestId('message-1')).toHaveClass('flex-row-reverse');
  });

  it('renders other user message correctly', () => {
    render(<MessageBubble message={mockMessage} isCurrentUser={false} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByTestId('message-1')).toHaveClass('flex-row');
  });

  it('formats timestamp correctly', () => {
    const date = new Date('2024-03-30T12:00:00Z');
    const message = { ...mockMessage, createdAt: date.toISOString() };
    
    render(<MessageBubble message={message} isCurrentUser={true} />);
    
    const formattedTime = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
  });

  it('handles long messages with proper wrapping', () => {
    const longMessage = { 
      ...mockMessage, 
      content: 'This is a very long message that should wrap properly when it exceeds the maximum width of the container'
    };
    
    render(<MessageBubble message={longMessage} isCurrentUser={true} />);
    
    const messageElement = screen.getByText(longMessage.content);
    expect(messageElement).toHaveClass('whitespace-pre-wrap', 'break-words');
  });

  it('displays avatar component', () => {
    render(<MessageBubble message={mockMessage} isCurrentUser={true} />);
    
    const avatar = screen.getByTestId('message-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('w-8', 'h-8');
  });
}); 