/**
 * Quick Customer Modal Organism
 * Modal for creating a new customer quickly
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { quickCustomerSchema, type QuickCustomerInput } from '@/features/service-request/schemas/quickCustomer.schema';
import { AInput } from '../atoms/AInput';
import { APhoneInput } from '../atoms/APhoneInput';
import { AEmailInput } from '../atoms/AEmailInput';
import { ATextarea } from '../atoms/ATextarea';
import { AFormMessage } from '../atoms/AFormMessage';

export interface QuickCustomerModalProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onSubmit: (_data: QuickCustomerInput) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickCustomerInput>({
    resolver: zodResolver(quickCustomerSchema),
  });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: QuickCustomerInput) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Quickly add a new customer. You can update details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && <AFormMessage type="error" message={error} />}

          <AInput
            label="Name"
            placeholder="John Doe"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <APhoneInput
            label="Phone"
            required
            error={errors.phone?.message}
            helperText="Use E.164 format: +1234567890"
            {...register('phone')}
          />

          <AEmailInput
            label="Email"
            error={errors.email?.message}
            {...register('email')}
          />

          <AInput
            label="Address"
            placeholder="123 Main St, City, State"
            error={errors.address?.message}
            {...register('address')}
          />

          <ATextarea
            label="Notes"
            placeholder="Any additional notes..."
            rows={3}
            maxLength={300}
            showCount
            error={errors.notes?.message}
            {...register('notes')}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

QuickCustomerModal.displayName = 'QuickCustomerModal';
