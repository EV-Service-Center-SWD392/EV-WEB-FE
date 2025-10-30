/**
 * Duplicate Warning Banner Organism
 * Shows a warning when a duplicate service request is detected
 */

'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface DuplicateWarningBannerProps {
  visible: boolean;
  existingRequestId: string | null;
  onViewExisting?: () => void;
  onDismiss?: () => void;
}

export const DuplicateWarningBanner: React.FC<DuplicateWarningBannerProps> = ({
  visible,
  existingRequestId,
  onViewExisting,
  onDismiss,
}) => {
  if (!visible || !existingRequestId) return null;

  return (
    <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
            Similar Request Found
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            A similar service request already exists for this customer. Request ID:{' '}
            <code className="font-mono bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
              {existingRequestId}
            </code>
          </p>
          <div className="flex gap-2 mt-3">
            {onViewExisting && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onViewExisting}
                className="border-yellow-300 text-yellow-900 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-100"
              >
                View Existing Request
              </Button>
            )}
            {onDismiss && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-300"
              >
                Continue Anyway
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

DuplicateWarningBanner.displayName = 'DuplicateWarningBanner';
