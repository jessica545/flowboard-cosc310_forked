'use client';

import React, { useState } from 'react';
import { Loader, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

// Form validation schema
const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message is too long')
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageInputProps {
  onSubmit: (data: MessageFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

export function MessageInput({ 
  onSubmit, 
  isLoading = false, 
  error = null,
  disabled = false 
}: MessageInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  const handleFormSubmit = async (data: MessageFormData) => {
    if (isSubmitting) {
      console.log('[MessageInput] Preventing duplicate submission');
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError(null);
      await onSubmit(data);
      reset();
    } catch (err) {
      console.error('[MessageInput] Failed to send message:', err);
      setLocalError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isLoading || isSubmitting || disabled;
  const displayError = localError || error || errors.content?.message;

  return (
    <div className="p-4 bg-primary">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-2">
        {displayError && (
          <div className="text-sm text-destruct mb-2" role="alert">
            {displayError}
          </div>
        )}
        <div className="flex gap-2">
          <input
            {...register('content')}
            placeholder={disabled ? "Select a conversation to start chatting" : "Type a message..."}
            className={cn(
              "text-primary flex-1 px-4 py-2.5 bg-secondary border rounded-full text-sm focus:outlines-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all",
              errors.content && "border-red-500 focus:ring-red-500/20 focus:border-red-500/50",
              disabled && "bg-primary text-gray-400"
            )}
            disabled={isDisabled}
            data-testid="message-input"
          />
          <button
            type="submit"
            disabled={isDisabled}
            className={cn(
              "px-4 py-2 rounded-lg",
              isDisabled
                ? "bg-gray-100 text-gray-400"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
            data-testid="send-button"
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 animate-spin" data-testid="loader" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="sr-only">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
} 