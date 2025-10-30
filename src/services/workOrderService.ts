/**
 * Work Order Service
 * Handles all API calls for Work Order Management
 */

import type {
    WorkOrder,
    WorkOrderTask,
    WorkOrderPhoto,
    CreateWorkOrderRequest,
    UpdateWorkOrderRequest,
    CreateTaskRequest,
    UpdateTaskRequest,
    WorkOrderStatus,
} from '@/entities/workorder.types';

import { api } from './api';

/**
 * Get all work orders with optional filters
 * GET /api/workorders
 */
export async function getWorkOrders(params?: {
    centerId?: string;
    technicianId?: string;
    status?: WorkOrderStatus;
    intakeId?: string;
}): Promise<WorkOrder[]> {
    const response = await api.get<WorkOrder[]>('/api/workorders', { params });
    return response.data;
}

/**
 * Get work order by ID
 * GET /api/workorders/{id}
 */
export async function getWorkOrderById(id: string): Promise<WorkOrder> {
    const response = await api.get<WorkOrder>(`/api/workorders/${id}`);
    return response.data;
}

/**
 * Get work orders by intake ID
 * GET /api/intakes/{intakeId}/workorders
 */
export async function getWorkOrdersByIntake(
    intakeId: string
): Promise<WorkOrder[]> {
    const response = await api.get<WorkOrder[]>(
        `/api/intakes/${intakeId}/workorders`
    );
    return response.data;
}

/**
 * Get work orders assigned to a technician
 * GET /api/technicians/{technicianId}/workorders
 */
export async function getWorkOrdersByTechnician(
    technicianId: string,
    status?: WorkOrderStatus
): Promise<WorkOrder[]> {
    const params = status ? { status } : undefined;
    const response = await api.get<WorkOrder[]>(
        `/api/technicians/${technicianId}/workorders`,
        { params }
    );
    return response.data;
}

/**
 * Create a new work order
 * POST /api/workorders
 */
export async function createWorkOrder(
    data: CreateWorkOrderRequest
): Promise<WorkOrder> {
    const response = await api.post<WorkOrder>('/api/workorders', data);
    return response.data;
}

/**
 * Update an existing work order
 * PUT /api/workorders/{id}
 */
export async function updateWorkOrder(
    id: string,
    data: UpdateWorkOrderRequest
): Promise<WorkOrder> {
    const response = await api.put<WorkOrder>(`/api/workorders/${id}`, data);
    return response.data;
}

/**
 * Update work order status
 * PATCH /api/workorders/{id}/status
 */
export async function updateWorkOrderStatus(
    id: string,
    status: WorkOrderStatus
): Promise<WorkOrder> {
    const response = await api.patch<WorkOrder>(
        `/api/workorders/${id}/status`,
        { status }
    );
    return response.data;
}

/**
 * Delete a work order
 * DELETE /api/workorders/{id}
 */
export async function deleteWorkOrder(id: string): Promise<void> {
    await api.delete(`/api/workorders/${id}`);
}

// ============================================
// Task Management
// ============================================

/**
 * Get all tasks for a work order
 * GET /api/workorders/{workOrderId}/tasks
 */
export async function getWorkOrderTasks(
    workOrderId: string
): Promise<WorkOrderTask[]> {
    const response = await api.get<WorkOrderTask[]>(
        `/api/workorders/${workOrderId}/tasks`
    );
    return response.data;
}

/**
 * Get a specific task by ID
 * GET /api/tasks/{taskId}
 */
export async function getTaskById(taskId: string): Promise<WorkOrderTask> {
    const response = await api.get<WorkOrderTask>(`/api/tasks/${taskId}`);
    return response.data;
}

/**
 * Create a new task for a work order
 * POST /api/workorders/{workOrderId}/tasks
 */
export async function createTask(
    workOrderId: string,
    data: CreateTaskRequest
): Promise<WorkOrderTask> {
    const response = await api.post<WorkOrderTask>(
        `/api/workorders/${workOrderId}/tasks`,
        data
    );
    return response.data;
}

/**
 * Update an existing task
 * PUT /api/tasks/{taskId}
 */
export async function updateTask(
    taskId: string,
    data: UpdateTaskRequest
): Promise<WorkOrderTask> {
    const response = await api.put<WorkOrderTask>(`/api/tasks/${taskId}`, data);
    return response.data;
}

/**
 * Delete a task
 * DELETE /api/tasks/{taskId}
 */
export async function deleteTask(taskId: string): Promise<void> {
    await api.delete(`/api/tasks/${taskId}`);
}

/**
 * Bulk update tasks for a work order
 * PUT /api/workorders/{workOrderId}/tasks
 */
export async function updateWorkOrderTasks(
    workOrderId: string,
    tasks: Partial<WorkOrderTask>[]
): Promise<WorkOrderTask[]> {
    const response = await api.put<WorkOrderTask[]>(
        `/api/workorders/${workOrderId}/tasks`,
        { tasks }
    );
    return response.data;
}

// ============================================
// Photo Management
// ============================================

/**
 * Get all photos for a work order
 * GET /api/workorders/{workOrderId}/photos
 */
export async function getWorkOrderPhotos(
    workOrderId: string
): Promise<WorkOrderPhoto[]> {
    const response = await api.get<WorkOrderPhoto[]>(
        `/api/workorders/${workOrderId}/photos`
    );
    return response.data;
}

/**
 * Upload a photo to a work order
 * POST /api/workorders/{workOrderId}/photos
 */
export async function uploadPhoto(
    workOrderId: string,
    file: File,
    type?: 'before' | 'during' | 'after'
): Promise<WorkOrderPhoto> {
    const formData = new FormData();
    formData.append('file', file);
    if (type) {
        formData.append('type', type);
    }

    const response = await api.post<WorkOrderPhoto>(
        `/api/workorders/${workOrderId}/photos`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
}

/**
 * Delete a photo
 * DELETE /api/photos/{photoId}
 */
export async function deletePhoto(photoId: string): Promise<void> {
    await api.delete(`/api/photos/${photoId}`);
}

// ============================================
// Notes Management
// ============================================

/**
 * Update work order notes
 * PATCH /api/workorders/{id}/notes
 */
export async function updateWorkOrderNotes(
    id: string,
    notes: string
): Promise<WorkOrder> {
    const response = await api.patch<WorkOrder>(`/api/workorders/${id}/notes`, {
        notes,
    });
    return response.data;
}

// ============================================
// Statistics & Reports
// ============================================

/**
 * Get work order statistics for a technician
 * GET /api/technicians/{technicianId}/workorders/stats
 */
export async function getTechnicianWorkOrderStats(technicianId: string): Promise<{
    total: number;
    planned: number;
    inProgress: number;
    paused: number;
    waitingParts: number;
    qa: number;
    completed: number;
    avgCompletionTime?: number;
}> {
    const response = await api.get(
        `/api/technicians/${technicianId}/workorders/stats`
    );
    return response.data;
}

/**
 * Get work order statistics for a service center
 * GET /api/centers/{centerId}/workorders/stats
 */
export async function getCenterWorkOrderStats(centerId: string): Promise<{
    total: number;
    byStatus: Record<WorkOrderStatus, number>;
    byTechnician: Array<{
        technicianId: string;
        technicianName: string;
        count: number;
    }>;
}> {
    const response = await api.get(`/api/centers/${centerId}/workorders/stats`);
    return response.data;
}
