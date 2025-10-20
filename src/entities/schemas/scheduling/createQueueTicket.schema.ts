import { z } from "zod";

export const createQueueTicketSchema = z.object({
    centerId: z.string().uuid("Center ID must be a valid UUID"),
    serviceRequestId: z
        .string()
        .uuid("Service Request ID must be a valid UUID"),
    reason: z.string().max(300, "Reason must be at most 300 characters").optional(),
    priority: z
        .number()
        .int("Priority must be an integer")
        .min(0, "Priority must be >= 0")
        .optional(),
});

export type CreateQueueTicketInput = z.infer<typeof createQueueTicketSchema>;

export const updateQueueTicketSchema = z.object({
    status: z.enum(["Waiting", "Ready", "NoShow", "Converted"]).optional(),
    estimatedStartUtc: z.string().datetime().optional(),
    priority: z
        .number()
        .int("Priority must be an integer")
        .min(0, "Priority must be >= 0")
        .optional(),
});

export type UpdateQueueTicketInput = z.infer<typeof updateQueueTicketSchema>;

export const queueReorderSchema = z.object({
    ticketIds: z.array(z.string().uuid("Ticket ID must be a valid UUID")).min(1),
});

export type QueueReorderInput = z.infer<typeof queueReorderSchema>;
