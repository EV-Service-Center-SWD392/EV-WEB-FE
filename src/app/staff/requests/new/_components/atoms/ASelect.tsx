/**
 * Atomic Select Component
 */

'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ASelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ASelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: ASelectOption[];
  value?: string;
  onValueChange?: (_value: string) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export const ASelect: React.FC<ASelectProps> = ({
  label,
  error,
  helperText,
  placeholder = 'Select...',
  options,
  value,
  onValueChange,
  disabled,
  required,
  id,
}) => {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={selectId} className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          className={cn(error && 'border-destructive focus:ring-destructive')}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={`${selectId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

ASelect.displayName = 'ASelect';
