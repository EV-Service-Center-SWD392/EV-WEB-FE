/**
 * Center Preference Molecule
 * Allows selecting a preferred service center
 */

'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Center } from '@/features/service-request/types/domain';

export interface CenterPreferenceProps {
  centers: Center[];
  selectedCenter?: Center | null;
  onSelectCenter: (_center: Center | null) => void;
  isLoading?: boolean;
  error?: string | null;
  label?: string;
}

export const CenterPreference: React.FC<CenterPreferenceProps> = ({
  centers,
  selectedCenter,
  onSelectCenter,
  isLoading,
  error,
  label = 'Preferred Service Center (Optional)',
}) => {
  return (
    <div className="space-y-2">
      <Label className={cn(error && 'text-destructive')}>{label}</Label>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading centers...</div>
      )}

      {!isLoading && centers.length === 0 && (
        <p className="text-sm text-muted-foreground">No service centers available</p>
      )}

      {!isLoading && centers.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {centers.map((center) => (
              <Card
                key={center.id}
                className={cn(
                  'p-3 cursor-pointer transition-all hover:border-primary',
                  selectedCenter?.id === center.id &&
                    'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2',
                  !center.isActive && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => center.isActive && onSelectCenter(center)}
                role="radio"
                aria-checked={selectedCenter?.id === center.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && center.isActive) {
                    e.preventDefault();
                    onSelectCenter(center);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{center.name}</p>
                    <p className="text-sm text-muted-foreground">{center.address}</p>
                    {center.phone && (
                      <p className="text-xs text-muted-foreground mt-1">📞 {center.phone}</p>
                    )}
                  </div>
                  {selectedCenter?.id === center.id && (
                    <span className="ml-2 text-primary">✓</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {selectedCenter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectCenter(null)}
              className="w-full"
            >
              Clear Selection
            </Button>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

CenterPreference.displayName = 'CenterPreference';
