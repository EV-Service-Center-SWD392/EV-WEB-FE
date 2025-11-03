/**
 * Work Order Card Component
 * Card view for technicians to see their assigned work orders
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Pause, CheckCircle, Clock, Package } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WorkOrderProgressBadge } from './WorkOrderProgressTracker';
import { calculateWorkOrderProgress } from '@/entities/workorder.types';
import type { WorkOrder } from '@/entities/workorder.types';

interface WorkOrderCardProps {
    workOrder: WorkOrder;
    onStart?: (_workOrderId: string) => void;
    onPause?: (_workOrderId: string) => void;
    onComplete?: (_workOrderId: string) => void;
    onViewDetail?: (_workOrderId: string) => void;
}

export function WorkOrderCard({
    workOrder,
    onStart,
    onPause,
    onComplete,
    onViewDetail,
}: WorkOrderCardProps) {
    const router = useRouter();
    const progress = calculateWorkOrderProgress(workOrder.tasks);

    const handleViewDetail = () => {
        if (onViewDetail) {
            onViewDetail(workOrder.id);
        } else {
            router.push(`/technician/workorders/${workOrder.id}`);
        }
    };

    const getActionButton = () => {
        switch (workOrder.status) {
            case 'Draft':
                return (
                    <Button size="sm" variant="outline" disabled className="w-full">
                        Ready to submit
                    </Button>
                );
            case 'AwaitingApproval':
                return (
                    <Button size="sm" variant="outline" disabled className="w-full">
                        Pending approval
                    </Button>
                );
            case 'Approved':
                return (
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onStart?.(workOrder.id);
                        }}
                        className="w-full"
                    >
                        <Play className="mr-2 h-4 w-4" />
                        Start Work
                    </Button>
                );
            case 'InProgress':
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPause?.(workOrder.id);
                            }}
                            className="flex-1"
                        >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onComplete?.(workOrder.id);
                            }}
                            className="flex-1"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                        </Button>
                    </div>
                );
            case 'Paused':
                return (
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onStart?.(workOrder.id);
                        }}
                        className="w-full"
                    >
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                    </Button>
                );
            case 'WaitingParts':
                return (
                    <Button size="sm" variant="outline" disabled className="w-full">
                        <Package className="mr-2 h-4 w-4" />
                        Waiting for Parts
                    </Button>
                );
            case 'Revised':
                return (
                    <Button size="sm" variant="outline" disabled className="w-full">
                        Needs revision
                    </Button>
                );
            case 'Rejected':
                return (
                    <Button size="sm" variant="outline" disabled className="w-full">
                        Rejected
                    </Button>
                );
            case 'Completed':
                return (
                    <Button size="sm" variant="outline" disabled className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card
                className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                onClick={handleViewDetail}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <CardTitle className="text-lg">
                                {workOrder.vehicleInfo?.model || 'Unknown Vehicle'}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {workOrder.vehicleInfo?.brand || ''} •{' '}
                                {workOrder.vehicleInfo?.vin || 'No VIN'}
                            </CardDescription>
                        </div>
                        <WorkOrderProgressBadge status={workOrder.status} />
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-3">
                    {/* Service Type */}
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{workOrder.serviceType}</span>
                    </div>

                    {/* Customer Info */}
                    {workOrder.customerInfo?.name && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Customer: </span>
                            <span className="font-medium">{workOrder.customerInfo.name}</span>
                        </div>
                    )}

                    {/* Estimated Cost */}
                    {workOrder.estimatedCost !== undefined && (
                        <div className="text-sm text-muted-foreground">
                            Estimated Cost:{' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(workOrder.estimatedCost)}
                        </div>
                    )}

                    {/* Parts Required */}
                    {workOrder.partsRequired && (
                        <p className="text-xs text-muted-foreground">
                            Parts: {workOrder.partsRequired}
                        </p>
                    )}

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Task Count */}
                    {workOrder.tasks.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {workOrder.tasks.filter((t) => t.status === 'Done').length} of{' '}
                            {workOrder.tasks.length} tasks completed
                        </div>
                    )}

                    {/* Notes Preview */}
                    {workOrder.notes && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {workOrder.notes}
                        </p>
                    )}
                </CardContent>

                <CardFooter onClick={(e) => e.stopPropagation()}>
                    {getActionButton()}
                </CardFooter>
            </Card>
        </motion.div>
    );
}

// Grid container for cards
export function WorkOrderCardGrid({
    workOrders,
    onStart,
    onPause,
    onComplete,
    onViewDetail,
    emptyMessage = 'No work orders found.',
}: {
    workOrders: WorkOrder[];
    onStart?: (_workOrderId: string) => void;
    onPause?: (_workOrderId: string) => void;
    onComplete?: (_workOrderId: string) => void;
    onViewDetail?: (_workOrderId: string) => void;
    emptyMessage?: string;
}) {
    if (workOrders.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workOrders.map((workOrder) => (
                <WorkOrderCard
                    key={workOrder.id}
                    workOrder={workOrder}
                    onStart={onStart}
                    onPause={onPause}
                    onComplete={onComplete}
                    onViewDetail={onViewDetail}
                />
            ))}
        </div>
    );
}
