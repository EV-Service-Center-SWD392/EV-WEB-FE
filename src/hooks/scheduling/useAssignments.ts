import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type {
    Assignment,
    AssignmentFilters,
    CreateAssignmentDTO,
    UpdateAssignmentDTO,
} from "@/entities/assignment.types";
import { assignmentService } from "@/services/assignmentService";

/**
 * Hook to fetch assignments with filters
 */
export function useAssignments(
    filters: AssignmentFilters
): UseQueryResult<Assignment[], Error> {
    return useQuery({
        queryKey: ["assignments", filters],
        queryFn: () => assignmentService.getAssignments(filters),
        enabled: !!filters.centerId && !!filters.date,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 3 * 60 * 1000,
    });
}

/**
 * Hook to create a new assignment
 */
export function useCreateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateAssignmentDTO) => assignmentService.create(dto),
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            queryClient.invalidateQueries({ queryKey: ["assignable-work"] });
            queryClient.invalidateQueries({ queryKey: ["assignable-bookings-work"] });
        },
        onError: (error: unknown) => {
            const status = (error as { response?: { status?: number } })?.response?.status;
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;

            if (status === 409) {
                // Conflict - technician already busy
                toast.error("Scheduling Conflict", {
                    description:
                        "The technician is already assigned to another task during this time. Please choose a different technician or time.",
                });
            } else if (status === 400) {
                // Validation error
                toast.error("Validation Error", {
                    description: message || "Please check the form and try again.",
                });
            } else {
                toast.error("Failed to create assignment", {
                    description: message || "An unexpected error occurred.",
                });
            }
        },
    });
}

/**
 * Hook to update an assignment
 */
export function useUpdateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateAssignmentDTO }) =>
            assignmentService.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            toast.success("Assignment updated successfully");
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to update assignment", {
                description: message,
            });
        },
    });
}

/**
 * Hook to delete an assignment
 */
export function useDeleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => assignmentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            queryClient.invalidateQueries({ queryKey: ["assignable-work"] });
            toast.success("Assignment removed successfully");
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to remove assignment", {
                description: message,
            });
        },
    });
}

/**
 * Hook to check for technician conflicts
 */
export function useCheckConflict() {
    return useMutation({
        mutationFn: ({
            technicianId,
            startUtc,
            endUtc,
        }: {
            technicianId: string;
            startUtc: string;
            endUtc: string;
        }) => assignmentService.checkConflict(technicianId, startUtc, endUtc),
    });
}
