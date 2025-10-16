/**
 * Validation schema for creating a ServiceRequest
 */

import { z } from 'zod';

export const preferredTimeWindowSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening', 'Any']).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  {
    message: 'dateFrom must be before or equal to dateTo',
    path: ['dateTo'],
  }
);

export const createServiceRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  vehicleId: z.string().optional(),
  serviceTypeIds: z.array(z.string()).min(1, 'At least one service type is required'),
  preferredCenterId: z.string().optional(),
  preferredTimeWindow: preferredTimeWindowSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
  channel: z.enum(['Phone', 'WalkIn', 'Web', 'Email']),
  allowContact: z.boolean().refine((val) => val === true, {
    message: 'Customer must allow contact to proceed',
  }),
  attachments: z.array(z.string().url()).optional(),
});

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
