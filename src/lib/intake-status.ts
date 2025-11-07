/**
 * Service Intake Status Utilities
 * Based on API Documentation: http://localhost:5020/api/ServiceIntake
 * 
 * Workflow:
 * CHECKED_IN → INSPECTING → VERIFIED → FINALIZED
 *            ↓                      
 *         CANCELLED (only from CHECKED_IN or INSPECTING)
 */

import type { IntakeStatus } from '@/entities/intake.types';

export interface StatusConfig {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
    allowedActions: string[];
    description: string;
}

export const STATUS_CONFIG: Record<IntakeStatus, StatusConfig> = {
    CHECKED_IN: {
        label: 'Đã Check-in',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: '✓',
        allowedActions: ['update', 'cancel'],
        description: 'Khách hàng đã check-in, chưa bắt đầu kiểm tra',
    },
    INSPECTING: {
        label: 'Đang Kiểm tra',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: '🔍',
        allowedActions: ['update', 'verify', 'cancel'],
        description: 'Đang trong quá trình kiểm tra xe',
    },
    VERIFIED: {
        label: 'Đã Xác nhận',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        icon: '✓✓',
        allowedActions: ['finalize'],
        description: 'Đã hoàn thành kiểm tra và xác nhận',
    },
    FINALIZED: {
        label: 'Hoàn tất',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: '✓✓✓',
        allowedActions: [],
        description: 'Đã hoàn tất intake, sẵn sàng tạo work order',
    },
    CANCELLED: {
        label: 'Đã Hủy',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        icon: '✗',
        allowedActions: [],
        description: 'Intake đã bị hủy bỏ',
    },
};

/**
 * Get status configuration
 */
export function getStatusConfig(status: IntakeStatus): StatusConfig {
    return STATUS_CONFIG[status];
}

/**
 * Check if an action is allowed for a status
 */
export function isActionAllowed(status: IntakeStatus, action: string): boolean {
    const config = STATUS_CONFIG[status];
    return config.allowedActions.includes(action);
}

/**
 * Get available actions for a status
 */
export function getAvailableActions(status: IntakeStatus): string[] {
    return STATUS_CONFIG[status].allowedActions;
}

/**
 * Check if intake can be updated
 */
export function canUpdate(status: IntakeStatus): boolean {
    return status === 'CHECKED_IN' || status === 'INSPECTING';
}

/**
 * Check if intake can be verified
 */
export function canVerify(status: IntakeStatus): boolean {
    return status === 'INSPECTING';
}

/**
 * Check if intake can be finalized
 */
export function canFinalize(status: IntakeStatus): boolean {
    return status === 'VERIFIED';
}

/**
 * Check if intake can be cancelled
 */
export function canCancel(status: IntakeStatus): boolean {
    return status === 'CHECKED_IN' || status === 'INSPECTING';
}

/**
 * Check if intake is in final state (no more transitions)
 */
export function isFinalState(status: IntakeStatus): boolean {
    return status === 'FINALIZED' || status === 'CANCELLED';
}

/**
 * Get next possible statuses from current status
 */
export function getNextStatuses(status: IntakeStatus): IntakeStatus[] {
    switch (status) {
        case 'CHECKED_IN':
            return ['INSPECTING', 'CANCELLED'];
        case 'INSPECTING':
            return ['VERIFIED', 'CANCELLED'];
        case 'VERIFIED':
            return ['FINALIZED'];
        case 'FINALIZED':
        case 'CANCELLED':
            return [];
        default:
            return [];
    }
}

/**
 * Validate status transition
 */
export function isValidTransition(
    fromStatus: IntakeStatus,
    toStatus: IntakeStatus
): boolean {
    const nextStatuses = getNextStatuses(fromStatus);
    return nextStatuses.includes(toStatus);
}

/**
 * Get transition error message
 */
export function getTransitionError(
    fromStatus: IntakeStatus,
    action: string
): string {
    const config = STATUS_CONFIG[fromStatus];

    if (config.allowedActions.includes(action)) {
        return '';
    }

    return `Cannot ${action} intake with status: ${config.label}`;
}
