'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Message } from '../types';
import { MessageBubble } from './message-bubble';
import { useCurrent } from '@/features/auth/api/use-current';

interface MessageListProps {
  messages?: Message[];
  isLoading?: boolean;
  error?: string | null;
}

export function MessageList({ messages = [], isLoading = false, error = null }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useCurrent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (error) {
    return (
      <div role="main" className="flex items-center justify-center h-full" data-testid="message-list">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:text-hover hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div role="main" className="flex items-center justify-center h-full" data-testid="message-list">
        <div className="text-center text-neutral-500">
          <p>No messages yet. Start a conversation!</p>
        </div>
      </div>
    );
  }

  const currentUserId = currentUser?.$id || 'current-user';

  return (
    <div role="main" className="p-4 space-y-6" data-testid="message-list">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
        />
      ))}
      {isLoading && (
        <div data-testid="message-loading" className="flex items-center gap-2 p-4 bg-secondary rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-primary">Message Loading...</span>
          <div data-testid="typing-indicator" className="flex gap-1">
            <div className="w-2 h-2 bg-tertiary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-tertiary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-tertiary rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
} 