/**
 * Schedule Board - Organism Component
 * Main board tổng hợp cho Schedule tab
 * Kết hợp: Filters + Capacity + Work List + Assignment Form
 */

import * as React from 'react';
import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Center, Technician, SlotCapacity } from '@/entities/slot.types';
import type { Assignment, CreateAssignmentDTO } from '@/entities/assignment.types';
import type { AssignableWorkItem } from '@/hooks/scheduling/useAssignableWork';

import { ACenterSelect } from '../atoms/ACenterSelect';
import { ADayPicker } from '../atoms/ADayPicker';
import { SlotCapacityBar } from '../molecules/SlotCapacityBar';
import { AssignableWorkList } from '../molecules/AssignableWorkList';
import { AssignmentQuickForm } from '../molecules/AssignmentQuickForm';

type TechnicianFilters = {
    shift: "all" | "Morning" | "Afternoon" | "Evening";
    specialty: "all" | string;
    workload: "all" | "Light" | "Balanced" | "Heavy";
};

export interface ScheduleBoardProps {
    // Data
    centers: Center[];
    technicians: Technician[];
    filteredTechnicians?: Technician[];
    capacity: SlotCapacity | null;
    workItems: AssignableWorkItem[];
    assignments: Assignment[];

    // Selected state
    selectedCenterId: string | null;
    selectedDate: string;
    selectedWorkId?: string;
    technicianFilters?: TechnicianFilters;

    // Handlers
    onCenterChange: (_centerId: string) => void;
    onDateChange: (_date: string) => void;
    onSelectWork: (_workId: string) => void;
    onAssign: (_dto: CreateAssignmentDTO) => void;
    onTechnicianFiltersChange?: (_filters: TechnicianFilters) => void;
    onConfirmWorkItem?: (_item: AssignableWorkItem) => void;
    onRescheduleWorkItem?: (_item: AssignableWorkItem) => void;
    onRefresh?: () => void;

    // Loading states
    isLoadingCenters?: boolean;
    isLoadingWorkItems?: boolean;
    isSubmitting?: boolean;
}

export const ScheduleBoard: React.FC<ScheduleBoardProps> = ({
    centers,
    technicians,
    filteredTechnicians,
    capacity,
    workItems,
    assignments,
    selectedCenterId,
    selectedDate,
    selectedWorkId,
    technicianFilters,
    onCenterChange,
    onDateChange,
    onSelectWork,
    onAssign,
    onTechnicianFiltersChange,
    onConfirmWorkItem,
    onRescheduleWorkItem,
    onRefresh,
    isLoadingCenters = false,
    isLoadingWorkItems = false,
    isSubmitting = false,
}) => {
    void technicianFilters;
    void onTechnicianFiltersChange;

    const selectedWork = workItems.find((w) => w.id === selectedWorkId);

    // Map 'request' to 'serviceRequest' for type compatibility
    const workItemType = selectedWork?.type === 'request' ? 'serviceRequest' : selectedWork?.type || 'booking';
    const techniciansToShow = filteredTechnicians && filteredTechnicians.length > 0 ? filteredTechnicians : technicians;

    return (
        <div className="space-y-6">
            {/* Header với Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Phân công kỹ thuật viên</CardTitle>
                            <CardDescription>
                                Chọn trung tâm và ngày để xem công việc cần phân công
                            </CardDescription>
                        </div>
                        {onRefresh && (
                            <Button variant="outline" size="sm" onClick={onRefresh}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Làm mới
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Center Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Trung tâm</label>
                            <ACenterSelect
                                centers={centers}
                                value={selectedCenterId || ''}
                                onChange={onCenterChange}
                                disabled={isLoadingCenters}
                            />
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ngày</label>
                            <ADayPicker
                                value={selectedDate}
                                onChange={onDateChange}
                            />
                        </div>
                    </div>

                    {/* Capacity Bar */}
                    {capacity && selectedCenterId && (
                        <div className="mt-4 pt-4 border-t">
                            <SlotCapacityBar
                                capacity={capacity.capacity}
                                occupied={capacity.occupied}
                                available={capacity.available}
                            />
                        </div>
                    )}
        </CardContent>
    </Card>

    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-semibold text-primary">Gợi ý:</span> Phân công kỹ thuật viên trước giờ hẹn, sau đó tiếp nhận
        khách tại quầy để tạo intake và checklist.
    </div>

    {/* Main Content Grid */}
            {selectedCenterId ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Assignable Work List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Công việc cần phân công</CardTitle>
                            <CardDescription>
                                {workItems.length} công việc chờ được phân công
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AssignableWorkList
                                workItems={workItems}
                                selectedWorkId={selectedWorkId}
                                onSelectWork={onSelectWork}
                                onAssign={(item) => {
                                    onSelectWork(item.id);
                                }}
                                onConfirmWorkItem={onConfirmWorkItem}
                                onRescheduleWorkItem={onRescheduleWorkItem}
                                isLoading={isLoadingWorkItems}
                            />
                        </CardContent>
                    </Card>

                    {/* Right: Assignment Form hoặc Assignments List */}
                    <div className="space-y-6">
                        {/* Assignment Form (when work selected) */}
                        {selectedWork ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Phân công cho: {selectedWork.customerName}</CardTitle>
                                    <CardDescription>
                                        {selectedWork.vehicleInfo} - {selectedWork.services}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AssignmentQuickForm
                                        workItemId={selectedWork.id}
                                        workItemType={workItemType as 'booking' | 'serviceRequest'}
                                        technicians={techniciansToShow}
                                        selectedDate={selectedDate}
                                        onSubmit={onAssign}
                                        onCancel={() => onSelectWork('')}
                                        isSubmitting={isSubmitting}
                                        centerId={selectedCenterId}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            /* Assignments List (when no work selected) */
                            <Card>
                                <CardHeader>
                                    <CardTitle>Đã phân công hôm nay</CardTitle>
                                    <CardDescription>
                                        {assignments.length} công việc đã được phân công
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {assignments.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            Chưa có phân công nào
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {assignments.map((assignment) => (
                                                <div
                                                    key={assignment.id}
                                                    className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">
                                                                {assignment.bookingId
                                                                    ? `Booking: ${assignment.bookingId}`
                                                                    : `Request: ${assignment.serviceRequestId}`}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Tech: {assignment.technicianId}
                                                            </p>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {assignment.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                /* No center selected */
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Vui lòng chọn trung tâm để xem công việc cần phân công</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
