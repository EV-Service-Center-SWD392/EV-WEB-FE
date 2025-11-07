/**
 * Atomic Date Range Picker Component
 */

'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ADateRangeProps {
  label?: string;
  error?: string;
  helperText?: string;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (_date: string) => void;
  onDateToChange?: (_date: string) => void;
  required?: boolean;
  id?: string;
}

export const ADateRange: React.FC<ADateRangeProps> = ({
  label,
  error,
  helperText,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  required,
  id,
}) => {
  const rangeId = id || `daterange-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2">
      {label && (
        <Label className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${rangeId}-from`} className="text-xs text-muted-foreground">
            From
          </Label>
          <input
            id={`${rangeId}-from`}
            type="date"
            value={dateFrom || ''}
            onChange={(e) => onDateFromChange?.(e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={!!error}
          />
        </div>
        <div>
          <Label htmlFor={`${rangeId}-to`} className="text-xs text-muted-foreground">
            To
          </Label>
          <input
            id={`${rangeId}-to`}
            type="date"
            value={dateTo || ''}
            onChange={(e) => onDateToChange?.(e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={!!error}
          />
        </div>
      </div>
      {error && (
        <p id={`${rangeId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${rangeId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

ADateRange.displayName = 'ADateRange';
