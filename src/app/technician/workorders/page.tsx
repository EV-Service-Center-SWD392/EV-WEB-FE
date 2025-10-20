/**
 * Technician Work Orders Dashboard Page
 * Card-based view for technicians to manage their assigned work
 */

'use client';

import * as React from 'react';
import { Wrench, CheckCircle, Clock, Package } from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import { WorkOrderCardGrid } from '@/components/workorders/WorkOrderCard';
import {
  useWorkOrdersByTechnician,
  useUpdateWorkOrderStatus,
} from '@/hooks/workorders/useWorkOrders';
import type { WorkOrderStatus } from '@/entities/workorder.types';

export default function TechnicianWorkOrdersPage() {
  // TODO: Get actual technician ID from auth context
  const technicianId = 'tech-123'; // Placeholder
  const [statusFilter, setStatusFilter] = React.useState<
    WorkOrderStatus | 'all'
  >('all');

  // Fetch work orders with polling (every 30 seconds for technicians)
  const { data: workOrders, isLoading } = useWorkOrdersByTechnician(
    technicianId,
    statusFilter === 'all' ? undefined : statusFilter,
    30000
  );

  const updateStatusMutation = useUpdateWorkOrderStatus();

  const handleStart = async (workOrderId: string) => {
    await updateStatusMutation.mutateAsync({
      id: workOrderId,
      status: 'InProgress',
    });
  };

  const handlePause = async (workOrderId: string) => {
    await updateStatusMutation.mutateAsync({
      id: workOrderId,
      status: 'Paused',
    });
  };

  const handleComplete = async (workOrderId: string) => {
    await updateStatusMutation.mutateAsync({
      id: workOrderId,
      status: 'QA',
    });
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!workOrders)
      return {
        total: 0,
        inProgress: 0,
        planned: 0,
        completed: 0,
      };

    return {
      total: workOrders.length,
      inProgress: workOrders.filter((wo) => wo.status === 'InProgress').length,
      planned: workOrders.filter((wo) => wo.status === 'Planned').length,
      completed: workOrders.filter((wo) => wo.status === 'Completed').length,
    };
  }, [workOrders]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Work Orders</h1>
        <p className="text-muted-foreground">
          Manage your assigned work orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Assigned</CardDescription>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>In Progress</CardDescription>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Planned</CardDescription>
            <Package className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.planned}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Completed</CardDescription>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-xs space-y-2">
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
        </CardContent>
      </Card>

      {/* Work Orders Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading work orders...</p>
        </div>
      ) : (
        <WorkOrderCardGrid
          workOrders={workOrders || []}
          onStart={handleStart}
          onPause={handlePause}
          onComplete={handleComplete}
          emptyMessage="No work orders assigned yet. Check back later for new assignments."
        />
      )}
    </div>
  );
}
