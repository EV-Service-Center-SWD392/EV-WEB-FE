import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type {
    CreateQueueTicketDTO,
    QueueFilters,
    QueueReorderDTO,
    QueueTicket,
    UpdateQueueTicketDTO,
} from "@/entities/queue.types";
import { queueService } from "@/services/queueService";

/**
 * Hook to fetch queue tickets
 */
export function useQueue(
    filters: QueueFilters
): UseQueryResult<QueueTicket[], Error> {
    return useQuery({
        queryKey: ["queue", filters],
        queryFn: () => queueService.getQueue(filters),
        enabled: !!filters.centerId && !!filters.date,
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    });
}

/**
 * Hook to add a service request to the queue
 */
export function useAddToQueue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateQueueTicketDTO) => queueService.addToQueue(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            toast.success("Added to queue", {
                description: "Service request has been added to the queue",
            });
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to add to queue", {
                description: message,
            });
        },
    });
}

/**
 * Hook to reorder queue tickets (drag & drop)
 */
export function useReorderQueue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            centerId,
            date,
            dto,
        }: {
            centerId: string;
            date: string;
            dto: QueueReorderDTO;
        }) => queueService.reorder(centerId, date, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            toast.success("Queue reordered");
        },
        onError: (error: unknown) => {
            const status = (error as { response?: { status?: number } })?.response?.status;
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;

            if (status === 409) {
                toast.error("Reorder conflict", {
                    description:
                        "The queue has been modified by another user. Refreshing...",
                });
                queryClient.invalidateQueries({ queryKey: ["queue"] });
            } else {
                toast.error("Failed to reorder queue", {
                    description: message,
                });
            }
        },
    });
}

/**
 * Hook to mark a queue ticket as No-Show
 */
export function useMarkNoShow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => queueService.markNoShow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            toast.success("Marked as No-Show");
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to mark as No-Show", {
                description: message,
            });
        },
    });
}

/**
 * Hook to update queue ticket ETA
 */
export function useUpdateQueueEta() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, estimatedStartUtc }: { id: string; estimatedStartUtc: string }) =>
            queueService.updateEta(id, estimatedStartUtc),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            toast.success("ETA updated");
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to update ETA", {
                description: message,
            });
        },
    });
}

/**
 * Hook to update queue ticket (general)
 */
export function useUpdateQueueTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateQueueTicketDTO }) =>
            queueService.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            toast.success("Queue ticket updated");
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to update queue ticket", {
                description: message,
            });
        },
    });
}

/**
 * Hook to remove a ticket from queue
 */
export function useDeleteQueueTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => queueService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            toast.success("Removed from queue");
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to remove from queue", {
                description: message,
            });
        },
    });
}

/**
 * Hook to convert queue ticket to assignment
 */
export function useConvertQueueToAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => queueService.convertToAssignment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue"] });
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            toast.success("Converted to assignment");
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message;
            toast.error("Failed to convert", {
                description: message,
            });
        },
    });
}
