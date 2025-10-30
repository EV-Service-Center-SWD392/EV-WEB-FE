/**
 * Custom hooks for Work Order management
 * Uses React Query for data fetching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
    CreateWorkOrderRequest,
    UpdateWorkOrderRequest,
    CreateTaskRequest,
    UpdateTaskRequest,
    WorkOrderStatus,
    WorkOrderTask,
} from '@/entities/workorder.types';

import {
    getWorkOrders,
    getWorkOrderById,
    getWorkOrdersByIntake,
    getWorkOrdersByTechnician,
    createWorkOrder,
    updateWorkOrder,
    updateWorkOrderStatus,
    deleteWorkOrder,
    getWorkOrderTasks,
    createTask,
    updateTask,
    deleteTask,
    updateWorkOrderTasks,
    getWorkOrderPhotos,
    uploadPhoto,
    deletePhoto,
    updateWorkOrderNotes,
    getTechnicianWorkOrderStats,
    getCenterWorkOrderStats,
} from '@/services/workOrderService';

// ============================================
// Work Order Queries
// ============================================

/**
 * Hook to fetch all work orders with optional filters
 */
export function useWorkOrders(params?: {
    centerId?: string;
    technicianId?: string;
    status?: WorkOrderStatus;
    intakeId?: string;
    refetchInterval?: number;
}) {
    const { refetchInterval, ...queryParams } = params || {};

    return useQuery({
        queryKey: ['workorders', queryParams],
        queryFn: () => getWorkOrders(queryParams),
        refetchInterval: refetchInterval || false,
    });
}

/**
 * Hook to fetch a single work order by ID
 */
export function useWorkOrderById(id: string, refetchInterval?: number) {
    return useQuery({
        queryKey: ['workorder', id],
        queryFn: () => getWorkOrderById(id),
        enabled: !!id,
        refetchInterval: refetchInterval || false,
    });
}

/**
 * Hook to fetch work orders by intake ID
 */
export function useWorkOrdersByIntake(intakeId: string) {
    return useQuery({
        queryKey: ['workorders', 'intake', intakeId],
        queryFn: () => getWorkOrdersByIntake(intakeId),
        enabled: !!intakeId,
    });
}

/**
 * Hook to fetch work orders assigned to a technician
 */
export function useWorkOrdersByTechnician(
    technicianId: string,
    status?: WorkOrderStatus,
    refetchInterval?: number
) {
    return useQuery({
        queryKey: ['workorders', 'technician', technicianId, status],
        queryFn: () => getWorkOrdersByTechnician(technicianId, status),
        enabled: !!technicianId,
        refetchInterval: refetchInterval || false,
    });
}

// ============================================
// Work Order Mutations
// ============================================

/**
 * Hook to create a new work order
 */
export function useCreateWorkOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateWorkOrderRequest) => createWorkOrder(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['workorders'] });
            queryClient.invalidateQueries({
                queryKey: ['workorders', 'intake', data.intakeId],
            });
            queryClient.invalidateQueries({
                queryKey: ['workorders', 'technician', data.technicianId],
            });
            queryClient.setQueryData(['workorder', data.id], data);
            toast.success('Work order created successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to create work order: ${error.message}`);
        },
    });
}

/**
 * Hook to update a work order
 */
export function useUpdateWorkOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: UpdateWorkOrderRequest;
        }) => updateWorkOrder(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['workorders'] });
            queryClient.setQueryData(['workorder', data.id], data);
            toast.success('Work order updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update work order: ${error.message}`);
        },
    });
}

/**
 * Hook to update work order status
 */
export function useUpdateWorkOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: WorkOrderStatus }) =>
            updateWorkOrderStatus(id, status),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workorders'] });
            queryClient.setQueryData(['workorder', data.id], data);

            // Show status-specific success message
            const statusMessages: Record<WorkOrderStatus, string> = {
                Planned: 'Work order planned',
                InProgress: 'Work order started',
                Paused: 'Work order paused',
                WaitingParts: 'Work order waiting for parts',
                QA: 'Work order sent to QA',
                Completed: 'Work order completed',
            };

            toast.success(statusMessages[variables.status]);
        },
        onError: (error: Error) => {
            toast.error(`Failed to update status: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a work order
 */
export function useDeleteWorkOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteWorkOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workorders'] });
            toast.success('Work order deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete work order: ${error.message}`);
        },
    });
}

/**
 * Hook to update work order notes
 */
export function useUpdateWorkOrderNotes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes: string }) =>
            updateWorkOrderNotes(id, notes),
        onSuccess: (data) => {
            queryClient.setQueryData(['workorder', data.id], data);
            toast.success('Notes updated');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update notes: ${error.message}`);
        },
    });
}

// ============================================
// Task Queries & Mutations
// ============================================

/**
 * Hook to fetch tasks for a work order
 */
export function useWorkOrderTasks(workOrderId: string) {
    return useQuery({
        queryKey: ['workorder', workOrderId, 'tasks'],
        queryFn: () => getWorkOrderTasks(workOrderId),
        enabled: !!workOrderId,
    });
}

/**
 * Hook to create a new task
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            workOrderId,
            data,
        }: {
            workOrderId: string;
            data: CreateTaskRequest;
        }) => createTask(workOrderId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['workorder', data.workOrderId, 'tasks'],
            });
            queryClient.invalidateQueries({
                queryKey: ['workorder', data.workOrderId],
            });
            toast.success('Task created');
        },
        onError: (error: Error) => {
            toast.error(`Failed to create task: ${error.message}`);
        },
    });
}

/**
 * Hook to update a task
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            taskId,
            data,
        }: {
            taskId: string;
            data: UpdateTaskRequest;
        }) => updateTask(taskId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['workorder', data.workOrderId, 'tasks'],
            });
            queryClient.invalidateQueries({
                queryKey: ['workorder', data.workOrderId],
            });
            toast.success('Task updated');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update task: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId }: { taskId: string; workOrderId: string }) =>
            deleteTask(taskId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workorder', variables.workOrderId, 'tasks'],
            });
            queryClient.invalidateQueries({
                queryKey: ['workorder', variables.workOrderId],
            });
            toast.success('Task deleted');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete task: ${error.message}`);
        },
    });
}

/**
 * Hook to bulk update tasks
 */
export function useUpdateWorkOrderTasks() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            workOrderId,
            tasks,
        }: {
            workOrderId: string;
            tasks: Partial<WorkOrderTask>[];
        }) => updateWorkOrderTasks(workOrderId, tasks),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workorder', variables.workOrderId, 'tasks'],
            });
            queryClient.invalidateQueries({
                queryKey: ['workorder', variables.workOrderId],
            });
            toast.success('Tasks updated');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update tasks: ${error.message}`);
        },
    });
}

// ============================================
// Photo Queries & Mutations
// ============================================

/**
 * Hook to fetch photos for a work order
 */
export function useWorkOrderPhotos(workOrderId: string) {
    return useQuery({
        queryKey: ['workorder', workOrderId, 'photos'],
        queryFn: () => getWorkOrderPhotos(workOrderId),
        enabled: !!workOrderId,
    });
}

/**
 * Hook to upload a photo
 */
export function useUploadPhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            workOrderId,
            file,
            type,
        }: {
            workOrderId: string;
            file: File;
            type?: 'before' | 'during' | 'after';
        }) => uploadPhoto(workOrderId, file, type),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['workorder', data.workOrderId, 'photos'],
            });
            queryClient.invalidateQueries({
                queryKey: ['workorder', data.workOrderId],
            });
            toast.success('Photo uploaded');
        },
        onError: (error: Error) => {
            toast.error(`Failed to upload photo: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a photo
 */
export function useDeletePhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ photoId }: { photoId: string; workOrderId: string }) =>
            deletePhoto(photoId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workorder', variables.workOrderId, 'photos'],
            });
            queryClient.invalidateQueries({
                queryKey: ['workorder', variables.workOrderId],
            });
            toast.success('Photo deleted');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete photo: ${error.message}`);
        },
    });
}

// ============================================
// Statistics Queries
// ============================================

/**
 * Hook to fetch technician work order statistics
 */
export function useTechnicianWorkOrderStats(technicianId: string) {
    return useQuery({
        queryKey: ['workorders', 'stats', 'technician', technicianId],
        queryFn: () => getTechnicianWorkOrderStats(technicianId),
        enabled: !!technicianId,
    });
}

/**
 * Hook to fetch center work order statistics
 */
export function useCenterWorkOrderStats(centerId: string) {
    return useQuery({
        queryKey: ['workorders', 'stats', 'center', centerId],
        queryFn: () => getCenterWorkOrderStats(centerId),
        enabled: !!centerId,
    });
}
