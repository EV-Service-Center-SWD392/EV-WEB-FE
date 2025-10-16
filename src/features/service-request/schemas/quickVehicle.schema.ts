/**
 * Validation schema for quick vehicle creation
 */

import { z } from 'zod';

export const quickVehicleSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  brand: z.string().max(50, 'Brand too long').optional(),
  model: z.string().max(50, 'Model too long').optional(),
  year: z
    .number()
    .int()
    .min(1900, 'Year too old')
    .max(new Date().getFullYear() + 1, 'Year too far in future')
    .optional(),
  licensePlate: z.string().max(20, 'License plate too long').optional(),
  vin: z.string().length(17, 'VIN must be exactly 17 characters').optional(),
  notes: z.string().max(300, 'Notes too long').optional(),
});

export type QuickVehicleInput = z.infer<typeof quickVehicleSchema>;
