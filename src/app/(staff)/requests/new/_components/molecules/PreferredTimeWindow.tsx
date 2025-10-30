/**
 * Preferred Time Window Molecule
 * Combines date range, time of day, and days of week selection
 */

'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import type { PreferredTimeWindow as TimeWindow, TimeOfDay } from '@/features/service-request/types/domain';

import { ADateRange } from '../atoms/ADateRange';
import { ATimeOfDayPicker } from '../atoms/ATimeOfDayPicker';

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export interface PreferredTimeWindowProps {
  value?: TimeWindow;
  onChange: (_value: TimeWindow) => void;
  error?: string | null;
  label?: string;
}

export const PreferredTimeWindow: React.FC<PreferredTimeWindowProps> = ({
  value = {},
  onChange,
  error,
  label = 'Preferred Time Window (Optional)',
}) => {
  const handleDateFromChange = (dateFrom: string) => {
    onChange({ ...value, dateFrom: dateFrom || undefined });
  };

  const handleDateToChange = (dateTo: string) => {
    onChange({ ...value, dateTo: dateTo || undefined });
  };

  const handleTimeOfDayChange = (timeOfDay: TimeOfDay) => {
    onChange({ ...value, timeOfDay });
  };

  const toggleDayOfWeek = (day: number) => {
    const current = value.daysOfWeek || [];
    const newDays = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    onChange({ ...value, daysOfWeek: newDays.length > 0 ? newDays : undefined });
  };

  return (
    <div className="space-y-4">
      <Label className={cn(error && 'text-destructive')}>{label}</Label>

      <ADateRange
        label="Date Range"
        dateFrom={value.dateFrom}
        dateTo={value.dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        helperText="When would the customer prefer service?"
      />

      <ATimeOfDayPicker
        label="Time of Day"
        value={value.timeOfDay}
        onChange={handleTimeOfDayChange}
        helperText="Preferred time of day for service"
      />

      <div className="space-y-2">
        <Label>Days of Week</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const isSelected = value.daysOfWeek?.includes(day.value);
            return (
              <Badge
                key={day.value}
                variant={isSelected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all hover:scale-105',
                  isSelected && 'ring-2 ring-ring ring-offset-2'
                )}
                onClick={() => toggleDayOfWeek(day.value)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDayOfWeek(day.value);
                  }
                }}
              >
                {day.label}
              </Badge>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Select preferred days of the week for service
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

PreferredTimeWindow.displayName = 'PreferredTimeWindow';
