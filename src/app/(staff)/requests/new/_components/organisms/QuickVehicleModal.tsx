/**
 * Quick Vehicle Modal Organism
 * Modal for creating a new vehicle quickly
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

import { quickVehicleSchema, type QuickVehicleInput } from '@/features/service-request/schemas/quickVehicle.schema';
import { AInput } from '../atoms/AInput';
import { ATextarea } from '../atoms/ATextarea';
import { AFormMessage } from '../atoms/AFormMessage';

export interface QuickVehicleModalProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onSubmit: (_data: QuickVehicleInput) => Promise<void>;
  customerId: string;
  isSubmitting: boolean;
  error?: string | null;
}

export const QuickVehicleModal: React.FC<QuickVehicleModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  customerId,
  isSubmitting,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<QuickVehicleInput>({
    resolver: zodResolver(quickVehicleSchema),
    defaultValues: {
      customerId,
    },
  });

  React.useEffect(() => {
    setValue('customerId', customerId);
  }, [customerId, setValue]);

  React.useEffect(() => {
    if (!open) {
      reset({ customerId });
    }
  }, [open, reset, customerId]);

  const handleFormSubmit = async (data: QuickVehicleInput) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a vehicle for this customer. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && <AFormMessage type="error" message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <AInput
              label="Brand"
              placeholder="Toyota"
              error={errors.brand?.message}
              {...register('brand')}
            />

            <AInput
              label="Model"
              placeholder="Camry"
              error={errors.model?.message}
              {...register('model')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AInput
              label="Year"
              type="number"
              placeholder="2023"
              error={errors.year?.message}
              {...register('year', { valueAsNumber: true })}
            />

            <AInput
              label="License Plate"
              placeholder="ABC-1234"
              error={errors.licensePlate?.message}
              {...register('licensePlate')}
            />
          </div>

          <AInput
            label="VIN"
            placeholder="17-character VIN"
            maxLength={17}
            error={errors.vin?.message}
            helperText="Optional: Vehicle Identification Number"
            {...register('vin')}
          />

          <ATextarea
            label="Notes"
            placeholder="Any additional vehicle notes..."
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
              {isSubmitting ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

QuickVehicleModal.displayName = 'QuickVehicleModal';
