/**
 * Service Multi-Select Molecule
 * Allows selecting multiple service types with chips
 */

'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ServiceType } from '@/features/service-request/types/domain';

export interface ServiceMultiSelectProps {
  serviceTypes: ServiceType[];
  selectedServiceTypes: ServiceType[];
  onToggleServiceType: (_serviceType: ServiceType) => void;
  isLoading?: boolean;
  error?: string | null;
  label?: string;
  required?: boolean;
}

export const ServiceMultiSelect: React.FC<ServiceMultiSelectProps> = ({
  serviceTypes,
  selectedServiceTypes,
  onToggleServiceType,
  isLoading,
  error,
  label = 'Service Types',
  required,
}) => {
  const isSelected = (serviceType: ServiceType) =>
    selectedServiceTypes.some((st) => st.id === serviceType.id);

  return (
    <div className="space-y-2">
      <Label className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading service types...</div>
      )}

      {!isLoading && serviceTypes.length === 0 && (
        <p className="text-sm text-muted-foreground">No service types available</p>
      )}

      {!isLoading && serviceTypes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {serviceTypes.map((serviceType) => (
              <Card
                key={serviceType.id}
                className={cn(
                  'p-3 cursor-pointer transition-all hover:border-primary',
                  isSelected(serviceType) &&
                    'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2',
                  !serviceType.isActive && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => serviceType.isActive && onToggleServiceType(serviceType)}
                role="checkbox"
                aria-checked={isSelected(serviceType)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && serviceType.isActive) {
                    e.preventDefault();
                    onToggleServiceType(serviceType);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{serviceType.name}</p>
                    {serviceType.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {serviceType.description}
                      </p>
                    )}
                    {serviceType.estimatedDuration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ⏱️ ~{serviceType.estimatedDuration} min
                      </p>
                    )}
                  </div>
                  {isSelected(serviceType) && (
                    <span className="ml-2 text-primary">✓</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {selectedServiceTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <p className="text-sm font-medium w-full">Selected:</p>
              {selectedServiceTypes.map((serviceType) => (
                <Badge
                  key={serviceType.id}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => onToggleServiceType(serviceType)}
                >
                  {serviceType.name}
                  <span className="ml-1">✕</span>
                </Badge>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectedServiceTypes.forEach((st) => onToggleServiceType(st));
                }}
                className="ml-auto"
              >
                Clear All
              </Button>
            </div>
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

ServiceMultiSelect.displayName = 'ServiceMultiSelect';
