/**
 * Atomic Time of Day Picker Component
 */

'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TimeOfDay } from '@/features/service-request/types/domain';

const TIME_OPTIONS: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: 'Morning', label: 'Morning', icon: '🌅' },
  { value: 'Afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'Evening', label: 'Evening', icon: '🌙' },
  { value: 'Any', label: 'Any Time', icon: '🕐' },
];

export interface ATimeOfDayPickerProps {
  label?: string;
  value?: TimeOfDay;
  onChange?: (_value: TimeOfDay) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
}

export const ATimeOfDayPicker: React.FC<ATimeOfDayPickerProps> = ({
  label,
  error,
  helperText,
  value,
  onChange,
  required,
  id,
}) => {
  const pickerId = id || 'time-of-day-picker';

  return (
    <div className="space-y-2">
      {label && (
        <Label className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-labelledby={pickerId}
        aria-invalid={!!error}
      >
        {TIME_OPTIONS.map((option) => (
          <Badge
            key={option.value}
            variant={value === option.value ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all hover:scale-105',
              value === option.value && 'ring-2 ring-ring ring-offset-2'
            )}
            onClick={() => onChange?.(option.value)}
            role="radio"
            aria-checked={value === option.value}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange?.(option.value);
              }
            }}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </Badge>
        ))}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

ATimeOfDayPicker.displayName = 'ATimeOfDayPicker';
