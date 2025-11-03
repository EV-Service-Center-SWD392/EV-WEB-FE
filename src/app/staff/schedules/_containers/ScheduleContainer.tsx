/**
 * Schedule Container
 * Orchestrates business logic for Schedule tab
 * Connects hooks, services, and ScheduleBoard organism
 */

'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CreateAssignmentDTO, Assignment } from '@/entities/assignment.types';
import { BookingStatus } from '@/entities/booking.types';

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
import { bookingService } from '@/services/bookingService';
import type { AssignableWorkItem } from '@/hooks/scheduling/useAssignableWork';

type TechnicianFiltersState = {
    shift: "all" | "Morning" | "Afternoon" | "Evening";
    specialty: "all" | string;
    workload: "all" | "Light" | "Balanced" | "Heavy";
};

export const ScheduleContainer: React.FC = () => {
    const queryClient = useQueryClient();

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
    const [technicianFilters, setTechnicianFilters] =
        React.useState<TechnicianFiltersState>({
            shift: "all",
            specialty: "all",
            workload: "all",
        });

    // Data hooks
    const { data: centers = [], isLoading: isLoadingCenters } = useCenters();
    const { data: technicians = [] } = useTechnicians();
    const filteredTechnicians = React.useMemo(() => {
        return technicians.filter((tech) => {
            if (!tech.isActive) return false;
            if (
                technicianFilters.shift !== "all" &&
                tech.shift !== technicianFilters.shift
            ) {
                return false;
            }
            if (
                technicianFilters.workload !== "all" &&
                tech.workload !== technicianFilters.workload
            ) {
                return false;
            }
            if (
                technicianFilters.specialty !== "all" &&
                !tech.specialties?.includes(technicianFilters.specialty)
            ) {
                return false;
            }
            return true;
        });
    }, [technicians, technicianFilters]);

    // Mock capacity data for now
    const capacity = React.useMemo(() => {
        if (!centerId) return null;
        return {
            date: selectedDate,
            centerId,
            capacity: 20,
            occupied: 5,
            available: 15
        };
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
            if (dto.bookingId) {
                await bookingService.updateBooking(dto.bookingId, {
                    technicianId: dto.technicianId,
                    assignmentStatus: BookingStatus.ASSIGNED,
                });
            }
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
            if (pendingAssignment.bookingId) {
                await bookingService.updateBooking(pendingAssignment.bookingId, {
                    technicianId: pendingAssignment.technicianId,
                    assignmentStatus: BookingStatus.ASSIGNED,
                });
            }
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
        queryClient.invalidateQueries({ queryKey: ["assignable-work"] });
        queryClient.invalidateQueries({ queryKey: ["assignable-bookings-work"] });
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        toast.success('Đã làm mới hàng chờ và phân công');
    };

    const handleConfirmWorkItem = async (workItem: AssignableWorkItem | undefined) => {
        if (!workItem || workItem.type !== 'booking') {
            toast.info('Chỉ có thể xác nhận cho các booking.');
            return;
        }

        try {
            await bookingService.updateBooking(workItem.id, {
                status: BookingStatus.CONFIRMED,
                assignmentStatus: BookingStatus.IN_QUEUE,
            });
            toast.success('Đã xác nhận lịch hẹn cho khách hàng');
            queryClient.invalidateQueries({ queryKey: ["assignable-work"] });
            queryClient.invalidateQueries({ queryKey: ["assignable-bookings-work"] });
            setSelectedWorkId('');
        } catch (error) {
            toast.error('Không thể xác nhận lịch hẹn');
            console.error(error);
        }
    };

    const handleRescheduleWorkItem = async (workItem: AssignableWorkItem | undefined) => {
        if (!workItem || workItem.type !== 'booking') {
            toast.info('Vui lòng chọn booking để dời lịch.');
            return;
        }

        try {
            const baseDate = workItem.scheduledTime
                ? new Date(workItem.scheduledTime)
                : new Date(`${selectedDate}T09:00:00Z`);

            baseDate.setHours(baseDate.getHours() + 2);

            await bookingService.updateBooking(workItem.id, {
                scheduledDate: baseDate.toISOString(),
                status: BookingStatus.PENDING,
                assignmentStatus: BookingStatus.PENDING,
            });
            toast.success(
                `Đã dời lịch sang ${baseDate.toLocaleString('vi-VN')}`
            );
            queryClient.invalidateQueries({ queryKey: ["assignable-work"] });
            queryClient.invalidateQueries({ queryKey: ["assignable-bookings-work"] });
            setSelectedWorkId('');
        } catch (error) {
            toast.error('Không thể dời lịch hẹn');
            console.error(error);
        }
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
                filteredTechnicians={filteredTechnicians}
                capacity={capacity}
                workItems={workItems}
                assignments={assignments}
                selectedCenterId={centerId}
                selectedDate={selectedDate}
                selectedWorkId={selectedWorkId}
                technicianFilters={technicianFilters}
                onCenterChange={handleCenterChange}
                onDateChange={handleDateChange}
                onSelectWork={handleSelectWork}
                onAssign={handleAssign}
                onTechnicianFiltersChange={(filters) => setTechnicianFilters(filters)}
                onConfirmWorkItem={handleConfirmWorkItem}
                onRescheduleWorkItem={handleRescheduleWorkItem}
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
