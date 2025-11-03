/**
 * Empty State Component
 * Reusable component for displaying empty/error states
 */

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'error' | 'warning';
}

const variantStyles = {
  default: {
    container: 'border-border/60 bg-muted/40',
    icon: 'text-muted-foreground',
    title: 'text-foreground',
    description: 'text-muted-foreground',
  },
  error: {
    container: 'border-destructive/30 bg-destructive/5',
    icon: 'text-destructive',
    title: 'text-destructive',
    description: 'text-destructive/80',
  },
  warning: {
    container: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-100',
    description: 'text-amber-700 dark:text-amber-300',
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center px-4',
        styles.container,
        className
      )}
    >
      {Icon && (
        <div className="rounded-full bg-background/50 p-3">
          <Icon className={cn('h-8 w-8', styles.icon)} />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className={cn('text-base font-semibold', styles.title)}>{title}</h3>
        {description && (
          <p className={cn('text-sm max-w-md', styles.description)}>{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
