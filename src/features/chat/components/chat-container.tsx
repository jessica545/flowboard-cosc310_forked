'use client';

import React, { useState } from 'react';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { MessageFormData, Message } from '../types';

export function ChatContainer() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (data: MessageFormData) => {
    try {
      setIsSending(true);
      setError(null);
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        senderId: 'current-user',
        createdAt: new Date().toISOString(),
        conversationId: 'default'
      };
      
      setMessages(prev => [...prev, newMessage]);

      // Simulate response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a simulated response",
        senderId: 'other-user',
        createdAt: new Date().toISOString(),
        conversationId: 'default'
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-white" data-testid="message-list-container">
        <MessageList 
          messages={messages}
          isLoading={isSending}
          error={error}
        />
      </div>
      <div className="border-t bg-white" data-testid="message-input">
        <MessageInput 
          onSubmit={handleSubmit}
          isLoading={isSending}
          error={error}
        />
      </div>
    </div>
  );
} 