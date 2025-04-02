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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  const handleFormSubmit = async (data: MessageFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isLoading || isSubmitting || disabled;

  return (
    <div className="p-4 bg-primary">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-2">
        {error && (
          <div className="text-sm text-red-500 mb-2">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            {...register('content')}
            type="text"
            placeholder={disabled ? "Select a conversation to start chatting" : "Type a message..."}
            className={cn(
              "flex-1 px-4 py-2.5 bg-secondary border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all",
              errors.content && "border-red-500 focus:ring-red-500/20 focus:border-red-500/50",
              disabled && "bg-primary text-gray-400"
            )}
            disabled={isDisabled}
          />
          <button
            type="submit"
            disabled={isDisabled}
            className={cn(
              "px-4 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all flex items-center justify-center min-w-[40px]",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Send"
          >
            {isLoading || isSubmitting ? (
              <Loader className="w-4 h-4 animate-spin" data-testid="loader" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.content && (
          <div className="text-sm text-red-500 mt-1">
            {errors.content.message}
          </div>
        )}
      </form>
    </div>
  );
} 