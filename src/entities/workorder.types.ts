/**
 * Work Order Management Types
 * For technician work order creation, updates, and progress tracking
 */

import { z } from 'zod';

// Work Order Status Type
export type WorkOrderStatus =
    | "Draft"
    | "AwaitingApproval"
    | "Approved"
    | "InProgress"
    | "Paused"
    | "WaitingParts"
    | "QA"
    | "Revised"
    | "Rejected"
    | "Completed";

// Task Status Type
export type TaskStatus =
    | "NotStarted"
    | "InProgress"
    | "Done";

// Work Order Interface
export interface WorkOrder {
    id: string;
    intakeId: string;
    technicianId: string;
    technicianName?: string;
    vehicleInfo?: {
        vin?: string;
        model?: string;
        brand?: string;
    };
    customerInfo?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    serviceType: string;
    partsRequired?: string;
    estimatedCost?: number;
    approvalNotes?: string;
    status: WorkOrderStatus;
    tasks: WorkOrderTask[];
    notes?: string;
    startedAt?: string;
    completedAt?: string;
    pausedAt?: string;
    photos?: WorkOrderPhoto[];
    createdAt: string;
    updatedAt?: string;
}

// Work Order Task Interface
export interface WorkOrderTask {
    id: string;
    workOrderId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    estimatedMinutes?: number;
    actualMinutes?: number;
    technicianNote?: string;
    completedAt?: string;
    order: number;
}

// Work Order Photo Interface
export interface WorkOrderPhoto {
    id: string;
    workOrderId: string;
    url: string;
    name: string;
    type?: 'before' | 'during' | 'after';
    uploadedAt: string;
}

// Work Order Update Payload
export interface WorkOrderUpdate {
    status?: WorkOrderStatus;
    notes?: string;
    tasks?: WorkOrderTask[];
    photos?: WorkOrderPhoto[];
    partsRequired?: string;
    estimatedCost?: number;
    approvalNotes?: string;
}

// Create Work Order Payload
export interface CreateWorkOrderRequest {
    intakeId: string;
    technicianId: string;
    serviceType: string;
    notes?: string;
    partsRequired?: string;
    estimatedCost?: number;
    status?: WorkOrderStatus;
    tasks?: Omit<WorkOrderTask, 'id' | 'workOrderId'>[];
}

// Update Work Order Payload
export interface UpdateWorkOrderRequest {
    serviceType?: string;
    notes?: string;
    status?: WorkOrderStatus;
    partsRequired?: string;
    estimatedCost?: number;
    approvalNotes?: string;
}

// Create Task Payload
export interface CreateTaskRequest {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    order?: number;
}

// Update Task Payload
export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    status?: TaskStatus;
    estimatedMinutes?: number;
    actualMinutes?: number;
    technicianNote?: string;
}

// Photo Upload Payload
export interface UploadPhotoRequest {
    file: File;
    type?: 'before' | 'during' | 'after';
}

// ============================================
// Zod Validation Schemas
// ============================================

// Work Order Status Schema
export const WorkOrderStatusSchema = z.enum([
    "Draft",
    "AwaitingApproval",
    "Approved",
    "InProgress",
    "Paused",
    "WaitingParts",
    "QA",
    "Revised",
    "Rejected",
    "Completed"
]);

// Task Status Schema
export const TaskStatusSchema = z.enum([
    "NotStarted",
    "InProgress",
    "Done"
]);

// Work Order Task Schema
export const WorkOrderTaskSchema = z.object({
    id: z.string(),
    workOrderId: z.string(),
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    status: TaskStatusSchema,
    estimatedMinutes: z.number().positive().optional(),
    actualMinutes: z.number().positive().optional(),
    technicianNote: z.string().optional(),
    completedAt: z.string().optional(),
    order: z.number().int().min(0)
});

// Work Order Photo Schema
export const WorkOrderPhotoSchema = z.object({
    id: z.string(),
    workOrderId: z.string(),
    url: z.string().url(),
    name: z.string(),
    type: z.enum(['before', 'during', 'after']).optional(),
    uploadedAt: z.string()
});

// Work Order Schema
export const WorkOrderSchema = z.object({
    id: z.string(),
    intakeId: z.string(),
    technicianId: z.string(),
    technicianName: z.string().optional(),
    vehicleInfo: z.object({
        vin: z.string().optional(),
        model: z.string().optional(),
        brand: z.string().optional()
    }).optional(),
    customerInfo: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional()
    }).optional(),
    serviceType: z.string().min(1, "Service type is required"),
    partsRequired: z.string().optional(),
    estimatedCost: z.number().positive().optional(),
    approvalNotes: z.string().optional(),
    status: WorkOrderStatusSchema,
    tasks: z.array(WorkOrderTaskSchema),
    notes: z.string().optional(),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
    pausedAt: z.string().optional(),
    photos: z.array(WorkOrderPhotoSchema).optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional()
});

// Create Work Order Request Schema
export const CreateWorkOrderRequestSchema = z.object({
    intakeId: z.string().min(1, "Service intake is required"),
    technicianId: z.string().min(1, "Technician is required"),
    serviceType: z.string().min(1, "Service type is required"),
    notes: z.string().optional(),
    partsRequired: z.string().optional(),
    estimatedCost: z.number().positive().optional(),
    status: WorkOrderStatusSchema.optional(),
    tasks: z.array(z.object({
        title: z.string().min(1, "Task title is required"),
        description: z.string().optional(),
        estimatedMinutes: z.number().positive().optional(),
        order: z.number().int().min(0)
    })).optional()
});

// Update Work Order Request Schema
export const UpdateWorkOrderRequestSchema = z.object({
    serviceType: z.string().min(1).optional(),
    notes: z.string().optional(),
    status: WorkOrderStatusSchema.optional(),
    partsRequired: z.string().optional(),
    estimatedCost: z.number().positive().optional(),
    approvalNotes: z.string().optional()
});

// Create Task Request Schema
export const CreateTaskRequestSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    estimatedMinutes: z.number().positive().optional(),
    order: z.number().int().min(0).optional()
});

// Update Task Request Schema
export const UpdateTaskRequestSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: TaskStatusSchema.optional(),
    estimatedMinutes: z.number().positive().optional(),
    actualMinutes: z.number().positive().optional(),
    technicianNote: z.string().optional()
});

// Helper function to get status color
export function getWorkOrderStatusColor(status: WorkOrderStatus): string {
    switch (status) {
        case "Draft":
            return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
        case "AwaitingApproval":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
        case "Approved":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
        case "InProgress":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
        case "Paused":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
        case "WaitingParts":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
        case "QA":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
        case "Revised":
            return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
        case "Rejected":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
        case "Completed":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
}

// Helper function to get task status color
export function getTaskStatusColor(status: TaskStatus): string {
    switch (status) {
        case "NotStarted":
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
        case "InProgress":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
        case "Done":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
}

// Helper function to calculate work order progress
export function calculateWorkOrderProgress(tasks: WorkOrderTask[]): number {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === "Done").length;
    return Math.round((completedTasks / tasks.length) * 100);
}

// Helper function to format duration
export function formatDuration(minutes?: number): string {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
}

// Helper function to get status label
export function getWorkOrderStatusLabel(status: WorkOrderStatus): string {
    switch (status) {
        case "Draft":
            return "Draft";
        case "AwaitingApproval":
            return "Awaiting Approval";
        case "Approved":
            return "Approved";
        case "Paused":
            return "Paused";
        case "WaitingParts":
            return "Waiting Parts";
        case "InProgress":
            return "In Progress";
        case "QA":
            return "Quality Assurance";
        case "Revised":
            return "Revised";
        case "Rejected":
            return "Rejected";
        case "Completed":
            return "Completed";
        default:
            return status;
    }
}
