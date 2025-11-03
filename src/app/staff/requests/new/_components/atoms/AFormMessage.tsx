/**
 * Atomic Form Message Component
 */

'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface AFormMessageProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message?: string;
  className?: string;
}

const typeStyles = {
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400',
};

const typeIcons = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
};

export const AFormMessage: React.FC<AFormMessageProps> = ({
  type = 'error',
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border p-3 text-sm',
        typeStyles[type],
        className
      )}
      role="alert"
    >
      <span className="flex-shrink-0">{typeIcons[type]}</span>
      <p className="flex-1">{message}</p>
    </div>
  );
};

AFormMessage.displayName = 'AFormMessage';
