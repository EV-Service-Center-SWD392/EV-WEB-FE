/**
 * Validation schema for quick customer creation
 */

import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164-ish format

export const quickCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(phoneRegex, 'Invalid phone format (use E.164: +12025550123)'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  address: z.string().max(200, 'Address too long').optional(),
  notes: z.string().max(300, 'Notes too long').optional(),
});

export type QuickCustomerInput = z.infer<typeof quickCustomerSchema>;
