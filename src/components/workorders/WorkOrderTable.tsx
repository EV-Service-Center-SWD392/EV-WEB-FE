/**
 * Work Order Table Component
 * For staff to view and manage work orders
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, MoreHorizontal, CheckCircle } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkOrderProgressBadge } from './WorkOrderProgressTracker';
import { calculateWorkOrderProgress } from '@/entities/workorder.types';
import type { WorkOrder } from '@/entities/workorder.types';

interface WorkOrderTableProps {
    workOrders: WorkOrder[];
    isLoading?: boolean;
    onViewDetail?: (workOrderId: string) => void;
    onMarkCompleted?: (workOrderId: string) => void;
}

function formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export function WorkOrderTable({
    workOrders,
    isLoading,
    onViewDetail,
    onMarkCompleted,
}: WorkOrderTableProps) {
    const router = useRouter();

    const handleViewDetail = (id: string) => {
        if (onViewDetail) {
            onViewDetail(id);
        } else {
            router.push(`/staff/workorders/${id}`);
        }
    };

    if (isLoading) {
        return <WorkOrderTableSkeleton />;
    }

    if (workOrders.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-sm text-muted-foreground">
                    No work orders found. Create a new work order to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[60px]">STT</TableHead>
                        <TableHead className="w-[120px]">Order ID</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Progress</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workOrders.map((order, index) => {
                        const progress = calculateWorkOrderProgress(order.tasks);
                        return (
                            <TableRow
                                key={order.id}
                                className="cursor-pointer transition-colors hover:bg-accent/50"
                                onClick={() => handleViewDetail(order.id)}
                            >
                                <TableCell className="font-medium text-gray-900">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    #{order.id.slice(0, 8)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {order.vehicleInfo?.model || 'Unknown'}
                                        </span>
                                        {order.vehicleInfo?.vin && (
                                            <span className="text-xs text-muted-foreground">
                                                VIN: {order.vehicleInfo.vin}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{order.serviceType}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium">
                                        {order.technicianName || 'Unassigned'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <WorkOrderProgressBadge status={order.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-full max-w-[100px] overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium">{progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(order.startedAt)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(order.completedAt)}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleViewDetail(order.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            {order.status !== 'Completed' && onMarkCompleted && (
                                                <DropdownMenuItem
                                                    onClick={() => onMarkCompleted(order.id)}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark Completed
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function WorkOrderTableSkeleton() {
    return (
        <div className="rounded-xl border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[120px]">Order ID</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Progress</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-28" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-8" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
