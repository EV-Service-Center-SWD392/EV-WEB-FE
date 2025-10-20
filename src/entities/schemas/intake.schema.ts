/**
 * Validation schemas for Service Intake & Checklist
 * Using Zod for runtime validation
 */

import { z } from 'zod';

// Service Intake Schemas

export const createIntakeSchema = z.object({
    odometer: z.number().min(0, 'Odometer must be positive').optional(),
    batterySoC: z
        .number()
        .min(0, 'Battery SoC must be between 0-100')
        .max(100, 'Battery SoC must be between 0-100')
        .optional(),
    notes: z
        .string()
        .max(500, 'Notes must be 500 characters or less')
        .optional(),
    photos: z.array(z.string().url('Invalid photo URL')).optional(),
});

export const updateIntakeSchema = createIntakeSchema.extend({
    status: z.enum(['Draft', 'Completed']).optional(),
});

export type CreateIntakeInput = z.infer<typeof createIntakeSchema>;
export type UpdateIntakeInput = z.infer<typeof updateIntakeSchema>;

// Checklist Response Schemas

export const checklistResponseSchema = z.object({
    checklistItemId: z.string().uuid('Invalid checklist item ID'),
    boolValue: z.boolean().optional(),
    numberValue: z.number().optional(),
    textValue: z.string().max(1000, 'Text value too long').optional(),
    severity: z.enum(['Low', 'Medium', 'High']).optional(),
    note: z.string().max(500, 'Note must be 500 characters or less').optional(),
    photoUrl: z.string().url('Invalid photo URL').optional(),
});

export const saveChecklistResponsesSchema = z.object({
    responses: z.array(checklistResponseSchema).min(1, 'At least one response required'),
});

export type ChecklistResponseInput = z.infer<typeof checklistResponseSchema>;
export type SaveChecklistResponsesInput = z.infer<typeof saveChecklistResponsesSchema>;

// Form Schemas (for react-hook-form)

export const intakeFormSchema = z.object({
    odometer: z
        .number()
        .min(0, 'Odometer must be positive')
        .optional()
        .or(z.literal('')),
    batterySoC: z
        .number()
        .min(0, 'Battery SoC must be between 0-100')
        .max(100, 'Battery SoC must be between 0-100')
        .optional()
        .or(z.literal('')),
    notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
    photos: z.array(z.string()).optional(),
});

export type IntakeFormInput = z.infer<typeof intakeFormSchema>;

// Single checklist item response form
export const checklistItemFormSchema = z.object({
    checklistItemId: z.string(),
    boolValue: z.boolean().optional(),
    numberValue: z
        .number()
        .optional()
        .or(z.literal('')),
    textValue: z.string().max(1000, 'Text too long').optional(),
    severity: z.enum(['Low', 'Medium', 'High']).optional(),
    note: z.string().max(500, 'Note too long').optional(),
    photoUrl: z.string().optional(),
});

export type ChecklistItemFormInput = z.infer<typeof checklistItemFormSchema>;
