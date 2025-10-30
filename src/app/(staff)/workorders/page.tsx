/**
 * Staff Work Orders Dashboard Page
 * Overview of all work orders with filters and management
 */

'use client';

import * as React from 'react';
import { Plus, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkOrderTable } from '@/components/workorders/WorkOrderTable';
import { useWorkOrders, useUpdateWorkOrderStatus } from '@/hooks/workorders/useWorkOrders';
import type { WorkOrderStatus } from '@/entities/workorder.types';

export default function StaffWorkOrdersPage() {
    const [statusFilter, setStatusFilter] = React.useState<WorkOrderStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Fetch work orders with optional polling (every 60 seconds)
    const { data: workOrders, isLoading } = useWorkOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        refetchInterval: 60000, // Poll every 60 seconds
    });

    const updateStatusMutation = useUpdateWorkOrderStatus();

    const handleMarkCompleted = async (workOrderId: string) => {
        await updateStatusMutation.mutateAsync({
            id: workOrderId,
            status: 'Completed',
        });
    };

    // Filter work orders by search query
    const filteredWorkOrders = React.useMemo(() => {
        if (!workOrders) return [];

        if (!searchQuery) return workOrders;

        const query = searchQuery.toLowerCase();
        return workOrders.filter(
            (wo) =>
                wo.id.toLowerCase().includes(query) ||
                wo.vehicleInfo?.model?.toLowerCase().includes(query) ||
                wo.vehicleInfo?.vin?.toLowerCase().includes(query) ||
                wo.technicianName?.toLowerCase().includes(query) ||
                wo.serviceType.toLowerCase().includes(query)
        );
    }, [workOrders, searchQuery]);

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor all work orders
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Work Order
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                    <CardDescription>
                        Filter and search work orders
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(value as WorkOrderStatus | 'all')
                                }
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Planned">Planned</SelectItem>
                                    <SelectItem value="InProgress">In Progress</SelectItem>
                                    <SelectItem value="Paused">Paused</SelectItem>
                                    <SelectItem value="WaitingParts">Waiting Parts</SelectItem>
                                    <SelectItem value="QA">QA</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search by ID, vehicle, VIN, technician, or service type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            {workOrders && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Orders</CardDescription>
                            <CardTitle className="text-3xl">{workOrders.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>In Progress</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">
                                {workOrders.filter((wo) => wo.status === 'InProgress').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Waiting Parts</CardDescription>
                            <CardTitle className="text-3xl text-amber-600">
                                {workOrders.filter((wo) => wo.status === 'WaitingParts').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Completed</CardDescription>
                            <CardTitle className="text-3xl text-green-600">
                                {workOrders.filter((wo) => wo.status === 'Completed').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            )}

            {/* Work Orders Table */}
            <WorkOrderTable
                workOrders={filteredWorkOrders}
                isLoading={isLoading}
                onMarkCompleted={handleMarkCompleted}
            />
        </div>
    );
}
