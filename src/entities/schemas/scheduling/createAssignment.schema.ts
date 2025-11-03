import { z } from "zod";

// Validation: exactly one of bookingId or serviceRequestId must be present
export const createAssignmentSchema = z
    .object({
        centerId: z.string().uuid("Center ID must be a valid UUID"),
        technicianId: z.string().uuid("Technician ID must be a valid UUID"),
        bookingId: z.string().uuid("Booking ID must be a valid UUID").optional(),
        serviceRequestId: z
            .string()
            .uuid("Service Request ID must be a valid UUID")
            .optional(),
        plannedStartUtc: z.string().datetime().optional(),
        note: z.string().max(300, "Note must be at most 300 characters").optional(),
    })
    .refine(
        (data) => {
            // XOR: exactly one must be present
            const hasBooking = !!data.bookingId;
            const hasRequest = !!data.serviceRequestId;
            return hasBooking !== hasRequest; // true if exactly one is present
        },
        {
            message:
                "Exactly one of bookingId or serviceRequestId must be provided",
            path: ["bookingId"],
        }
    );

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const updateAssignmentSchema = z.object({
    status: z
        .enum(["Pending", "Assigned", "InQueue", "Active", "Completed", "Reassigned", "Cancelled"])
        .optional(),
    startUtc: z.string().datetime().optional(),
    endUtc: z.string().datetime().optional(),
    note: z.string().max(300, "Note must be at most 300 characters").optional(),
});

export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
