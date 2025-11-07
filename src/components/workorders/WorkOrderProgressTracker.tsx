/**
 * Work Order Progress Tracker Component
 * Visual status progression with animated transitions
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    Wrench,
    ShieldCheck,
    CheckCircle,
    Pause,
    ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkOrderStatus, WorkOrder } from '@/entities/workorder.types';
import { getWorkOrderStatusLabel } from '@/entities/workorder.types';

interface WorkOrderProgressTrackerProps {
    workOrder: WorkOrder;
    className?: string;
    showTimestamps?: boolean;
}

interface StepConfig {
    status: WorkOrderStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const steps: StepConfig[] = [
    {
        status: 'Draft',
        label: 'Draft',
        icon: Clock,
        description: 'Work order captured',
    },
    {
        status: 'AwaitingApproval',
        label: 'Awaiting Approval',
        icon: ClipboardList,
        description: 'Waiting for customer decision',
    },
    {
        status: 'Approved',
        label: 'Approved',
        icon: ShieldCheck,
        description: 'Customer approved work',
    },
    {
        status: 'InProgress',
        label: 'In Progress',
        icon: Wrench,
        description: 'Technician working',
    },
    {
        status: 'QA',
        label: 'Quality Assurance',
        icon: ShieldCheck,
        description: 'Under review',
    },
    {
        status: 'Completed',
        label: 'Completed',
        icon: CheckCircle,
        description: 'Work finished',
    },
];

function getStatusIndex(status: WorkOrderStatus): number {
    if (status === 'Paused' || status === 'WaitingParts') {
        return steps.findIndex((step) => step.status === 'InProgress');
    }
    if (status === 'Revised' || status === 'Rejected') {
        return steps.findIndex((step) => step.status === 'AwaitingApproval');
    }
    const idx = steps.findIndex((step) => step.status === status);
    return idx === -1 ? steps.length - 1 : idx;
}

function getStepState(
    currentStatus: WorkOrderStatus,
    stepStatus: WorkOrderStatus
): 'completed' | 'current' | 'pending' {
    const currentIndex = getStatusIndex(currentStatus);
    const stepIndex = getStatusIndex(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
}

function formatTimestamp(timestamp?: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function WorkOrderProgressTracker({
    workOrder,
    className,
    showTimestamps = true,
}: WorkOrderProgressTrackerProps) {
    const currentIndex = getStatusIndex(workOrder.status);
    const isPaused = workOrder.status === 'Paused' || workOrder.status === 'WaitingParts';

    return (
        <div className={cn('w-full', className)}>
            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-6 h-0.5 w-full bg-muted" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute left-0 top-6 h-0.5 bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                        width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />

                {/* Steps */}
                <div className="relative flex items-start justify-between">
                    {steps.map((step, index) => {
                        const state = getStepState(workOrder.status, step.status);
                        const Icon = step.icon;
                        const isActive = state === 'current';
                        const isCompleted = state === 'completed';

                        // Get timestamp for this step
                        let timestamp = '';
                        if (showTimestamps) {
                            if (step.status === 'Draft') {
                                timestamp = formatTimestamp(workOrder.createdAt);
                            } else if (step.status === 'InProgress') {
                                timestamp = formatTimestamp(workOrder.startedAt);
                            } else if (step.status === 'Completed') {
                                timestamp = formatTimestamp(workOrder.completedAt);
                            }
                        }

                        return (
                            <div
                                key={step.status}
                                className="relative flex flex-col items-center"
                                style={{ width: `${100 / steps.length}%` }}
                            >
                                {/* Step Circle */}
                                <motion.div
                                    className={cn(
                                        'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background',
                                        {
                                            'border-primary bg-primary text-primary-foreground':
                                                isCompleted,
                                            'border-primary bg-background text-primary': isActive,
                                            'border-muted bg-background text-muted-foreground':
                                                state === 'pending',
                                        }
                                    )}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                        opacity: 1,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Icon
                                        className={cn('h-5 w-5', {
                                            'animate-pulse': isActive && !isPaused,
                                        })}
                                    />
                            </motion.div>

                                {/* Paused Indicator */}
                                {isPaused && step.status === 'InProgress' && (
                                    <motion.div
                                        className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white shadow-lg"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                    >
                                        <Pause className="h-3 w-3" />
                                    </motion.div>
                                )}

                                {/* Step Label */}
                                <div className="mt-3 text-center">
                                    <p
                                        className={cn('text-sm font-medium', {
                                            'text-primary': isActive || isCompleted,
                                            'text-muted-foreground': state === 'pending',
                                        })}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {step.description}
                                    </p>
                                    {timestamp && (
                                        <p className="mt-1 text-xs font-medium text-primary">
                                            {timestamp}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Message */}
            <motion.div
                className="mt-8 rounded-lg border bg-muted/50 p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <p className="text-sm font-medium">
                    {isPaused ? (
                        <span className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-500">
                            <Pause className="h-4 w-4" />
                            Work Paused
                            {workOrder.pausedAt && (
                                <span className="text-muted-foreground">
                                    since {formatTimestamp(workOrder.pausedAt)}
                                </span>
                            )}
                        </span>
                    ) : workOrder.status === 'Completed' ? (
                        <span className="text-green-600 dark:text-green-500">
                            Work order completed successfully!
                        </span>
                    ) : workOrder.status === 'WaitingParts' ? (
                        <span className="text-amber-600 dark:text-amber-500">
                            Waiting for parts to arrive
                        </span>
                    ) : workOrder.status === 'QA' ? (
                        <span className="text-purple-600 dark:text-purple-500">
                            Under quality assurance review
                        </span>
                    ) : workOrder.status === 'InProgress' ? (
                        <span className="text-blue-600 dark:text-blue-500">
                            Technician is working on this order
                        </span>
                    ) : (
                        <span className="text-muted-foreground">
                            Work order is planned and ready to start
                        </span>
                    )}
                </p>
                {workOrder.notes && (
                    <p className="mt-2 text-xs text-muted-foreground">{workOrder.notes}</p>
                )}
            </motion.div>
        </div>
    );
}

// Compact version for card views
export function WorkOrderProgressBadge({
    status,
    className,
}: {
    status: WorkOrderStatus;
    className?: string;
}) {
    const step = steps.find((s) => s.status === status);
    const Icon = step?.icon || Clock;

    const getStatusColor = (s: WorkOrderStatus): string => {
        switch (s) {
            case 'Draft':
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            case 'AwaitingApproval':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
            case 'Approved':
                return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
            case 'InProgress':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'Paused':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
            case 'WaitingParts':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
            case 'QA':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            case 'Revised':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
            case 'Rejected':
                return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
            case 'Completed':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
                getStatusColor(status),
                className
            )}
        >
            <Icon className="h-3 w-3" />
            {step?.label || getWorkOrderStatusLabel(status)}
        </div>
    );
}
