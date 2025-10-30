/**
 * Schedule Container
 * Orchestrates business logic for Schedule tab
 * Connects hooks, services, and ScheduleBoard organism
 */

'use client';

import * as React from 'react';
import { toast } from 'sonner';

import type { CreateAssignmentDTO, Assignment } from '@/entities/assignment.types';

import { ScheduleBoard } from '@/components/staff/scheduling/organisms/ScheduleBoard';
import { ConflictNotice } from '@/components/staff/scheduling/organisms/ConflictNotice';
import {
    useCenters,
    useTechnicians,
    useAssignableWork,
    useAssignments,
    useCreateAssignment,
    useCheckConflict,
    useScheduleParams,
} from '@/hooks/scheduling';
import { staffDirectoryService } from '@/services/staffDirectoryService';

export const ScheduleContainer: React.FC = () => {
    // State from Zustand store
    const { centerId, selectedDate, setCenterId, setSelectedDate } =
        useScheduleParams();

    // Local UI state
    const [selectedWorkId, setSelectedWorkId] = React.useState<string>('');
    const [conflictDialogOpen, setConflictDialogOpen] = React.useState(false);
    const [conflictingAssignment, setConflictingAssignment] =
        React.useState<Assignment | null>(null);
    const [pendingAssignment, setPendingAssignment] =
        React.useState<CreateAssignmentDTO | null>(null);

    // Data hooks
    const { data: centers = [], isLoading: isLoadingCenters } = useCenters();
    const { data: technicians = [] } = useTechnicians(centerId || '');

    // Fetch capacity separately
    const [capacity, setCapacity] = React.useState<import('@/entities/slot.types').SlotCapacity | null>(null);
    React.useEffect(() => {
        if (centerId && selectedDate) {
            staffDirectoryService
                .getCapacity(centerId, selectedDate)
                .then(setCapacity)
                .catch(() => setCapacity(null));
        }
    }, [centerId, selectedDate]);
    const { data: workItems = [], isLoading: isLoadingWorkItems } =
        useAssignableWork(centerId || '', selectedDate);
    const { data: assignments = [] } = useAssignments({
        centerId: centerId || undefined,
        date: selectedDate,
    });

    // Mutations
    const createAssignment = useCreateAssignment();
    const checkConflict = useCheckConflict();

    // Handlers
    const handleCenterChange = (newCenterId: string) => {
        setCenterId(newCenterId);
        setSelectedWorkId(''); // Reset selected work
    };

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        setSelectedWorkId(''); // Reset selected work
    };

    const handleSelectWork = (workId: string) => {
        setSelectedWorkId(workId);
    };

    const handleAssign = async (dto: CreateAssignmentDTO) => {
        try {
            // Check for conflicts first (using start/end time)
            const startUtc = `${selectedDate}T09:00:00Z`;
            const endUtc = `${selectedDate}T17:00:00Z`;

            const conflict = await checkConflict.mutateAsync({
                technicianId: dto.technicianId,
                startUtc,
                endUtc,
            });

            if (conflict.hasConflict && conflict.conflicts && conflict.conflicts.length > 0) {
                // Show conflict dialog with first conflicting assignment
                setConflictingAssignment(conflict.conflicts[0]);
                setPendingAssignment(dto);
                setConflictDialogOpen(true);
                return;
            }

            // No conflict - proceed with assignment
            await createAssignment.mutateAsync(dto);
            toast.success('Phân công thành công!');
            setSelectedWorkId(''); // Reset selection
        } catch (error) {
            toast.error('Lỗi khi phân công công việc');
            console.error('Assignment error:', error);
        }
    };

    const handleConfirmConflict = async () => {
        if (!pendingAssignment) return;

        try {
            // Force assign despite conflict
            await createAssignment.mutateAsync(pendingAssignment);
            toast.success('Phân công thành công (có xung đột)');
            setSelectedWorkId('');
            setPendingAssignment(null);
            setConflictingAssignment(null);
        } catch (error) {
            toast.error('Lỗi khi phân công công việc');
            console.error('Assignment error:', error);
        }
    };

    const handleCancelConflict = () => {
        setPendingAssignment(null);
        setConflictingAssignment(null);
    };

    const handleRefresh = () => {
        // Refresh logic - hooks will auto-refetch based on queryClient invalidation
        toast.info('Đang làm mới dữ liệu...');
    };

    // Find technician name for conflict dialog
    const conflictTechName = conflictingAssignment
        ? technicians.find((t) => t.id === conflictingAssignment.technicianId)
            ?.name
        : undefined;

    return (
        <>
            <ScheduleBoard
                centers={centers}
                technicians={technicians}
                capacity={capacity}
                workItems={workItems}
                assignments={assignments}
                selectedCenterId={centerId}
                selectedDate={selectedDate}
                selectedWorkId={selectedWorkId}
                onCenterChange={handleCenterChange}
                onDateChange={handleDateChange}
                onSelectWork={handleSelectWork}
                onAssign={handleAssign}
                onRefresh={handleRefresh}
                isLoadingCenters={isLoadingCenters}
                isLoadingWorkItems={isLoadingWorkItems}
                isSubmitting={createAssignment.isPending}
            />

            {/* Conflict Dialog */}
            <ConflictNotice
                open={conflictDialogOpen}
                onOpenChange={setConflictDialogOpen}
                conflictingAssignment={conflictingAssignment}
                technicianName={conflictTechName}
                onConfirm={handleConfirmConflict}
                onCancel={handleCancelConflict}
            />
        </>
    );
};
