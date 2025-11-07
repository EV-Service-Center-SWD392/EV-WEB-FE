/**
 * Service Intake Feature Types
 * Extends base intake types from @/entities/intake.types
 */

import type { IntakeStatus } from "@/entities/intake.types";

export type { IntakeStatus, ServiceIntake, CreateIntakeRequest, UpdateIntakeRequest } from "@/entities/intake.types";

/**
 * Filter options for Intake List
 */
export interface IntakeFilters {
    status?: IntakeStatus | "all";
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    centerId?: string;
    technicianId?: string;
}

/**
 * Status workflow configuration for UI
 */
export interface StatusWorkflow {
    status: IntakeStatus;
    label: string;
    color: string;
    bgColor: string;
    description: string;
    allowedTransitions: IntakeStatus[];
}

/**
 * State machine configuration
 */
export const INTAKE_STATUS_WORKFLOW: Record<IntakeStatus, StatusWorkflow> = {
    CHECKED_IN: {
        status: "CHECKED_IN",
        label: "Đã Check-in",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        description: "Xe đã đến trung tâm, chờ kiểm tra",
        allowedTransitions: ["INSPECTING", "CANCELLED"],
    },
    INSPECTING: {
        status: "INSPECTING",
        label: "Đang Kiểm Tra",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        description: "Kỹ thuật viên đang thực hiện kiểm tra",
        allowedTransitions: ["VERIFIED"],
    },
    VERIFIED: {
        status: "VERIFIED",
        label: "Đã Xác Minh",
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        description: "Đã xác minh checklist, sẵn sàng hoàn tất",
        allowedTransitions: ["FINALIZED"],
    },
    FINALIZED: {
        status: "FINALIZED",
        label: "Hoàn Tất",
        color: "text-green-700",
        bgColor: "bg-green-100",
        description: "Intake hoàn tất, có thể tạo Work Order",
        allowedTransitions: [],
    },
    CANCELLED: {
        status: "CANCELLED",
        label: "Đã Hủy",
        color: "text-red-700",
        bgColor: "bg-red-100",
        description: "Intake đã bị hủy",
        allowedTransitions: [],
    },
};

/**
 * Action types for state transitions
 */
export type IntakeActionType =
    | "start-inspecting"
    | "verify"
    | "finalize"
    | "cancel"
    | "update";

export interface IntakeAction {
    type: IntakeActionType;
    label: string;
    icon?: string;
    variant?: "default" | "destructive" | "outline" | "secondary";
    requiresConfirmation: boolean;
    confirmationMessage?: string;
    allowedFromStates: IntakeStatus[];
}

/**
 * Available actions configuration
 */
export const INTAKE_ACTIONS: Record<IntakeActionType, IntakeAction> = {
    "start-inspecting": {
        type: "start-inspecting",
        label: "Bắt Đầu Kiểm Tra",
        variant: "default",
        requiresConfirmation: true,
        confirmationMessage: "Bắt đầu kiểm tra xe này?",
        allowedFromStates: ["CHECKED_IN"],
    },
    verify: {
        type: "verify",
        label: "Xác Minh",
        variant: "default",
        requiresConfirmation: true,
        confirmationMessage: "Xác minh intake này? Đảm bảo đã hoàn thành checklist.",
        allowedFromStates: ["INSPECTING"],
    },
    finalize: {
        type: "finalize",
        label: "Hoàn Tất",
        variant: "default",
        requiresConfirmation: true,
        confirmationMessage: "Hoàn tất intake này? Sau đó có thể tạo Work Order.",
        allowedFromStates: ["VERIFIED"],
    },
    cancel: {
        type: "cancel",
        label: "Hủy",
        variant: "destructive",
        requiresConfirmation: true,
        confirmationMessage: "Hủy intake này? Hành động này không thể hoàn tác.",
        allowedFromStates: ["CHECKED_IN"],
    },
    update: {
        type: "update",
        label: "Cập Nhật",
        variant: "outline",
        requiresConfirmation: false,
        allowedFromStates: ["CHECKED_IN", "INSPECTING"],
    },
};
