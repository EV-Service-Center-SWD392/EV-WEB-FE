/**
 * Custom hooks for Service Intake management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
    ServiceIntake,
    CreateIntakeRequest,
    UpdateIntakeRequest,
    IntakeStatus,
} from '@/entities/intake.types';
import {
    createIntake,
    getIntake,
    getIntakeByBooking,
    updateIntake,
    finalizeIntake,
    listIntakes,
} from '@/services/intakeService';

export function useIntakeList(filters: { status?: IntakeStatus | 'all'; search?: string } = {}) {
    return useQuery({
        queryKey: ['intake-list', filters],
        queryFn: () => listIntakes(filters),
        staleTime: 60 * 1000,
    });
}

/**
 * Hook to fetch intake by booking ID
 * Returns null if no intake exists yet
 */
export function useIntake(bookingId: string) {
    return useQuery({
        queryKey: ['intake', 'booking', bookingId],
        queryFn: () => getIntakeByBooking(bookingId),
        enabled: !!bookingId,
    });
}

/**
 * Hook to fetch intake by intake ID
 */
export function useIntakeById(intakeId: string) {
    return useQuery({
        queryKey: ['intake', intakeId],
        queryFn: () => getIntake(intakeId),
        enabled: !!intakeId,
    });
}

/**
 * Hook to create a new intake
 */
export function useCreateIntake() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            bookingId,
            data,
        }: {
            bookingId: string;
            data: CreateIntakeRequest;
        }) => createIntake(bookingId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['intake', 'booking', variables.bookingId],
            });
            queryClient.setQueryData(['intake', data.id], data);
            toast.success('Service intake created successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to create intake: ${error.message}`);
        },
    });
}

/**
 * Hook to update an existing intake
 */
export function useUpdateIntake() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            intakeId,
            data,
        }: {
            intakeId: string;
            data: UpdateIntakeRequest;
        }) => updateIntake(intakeId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['intake', data.id] });
            queryClient.invalidateQueries({
                queryKey: ['intake', 'booking', data.bookingId],
            });
            toast.success('Intake updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update intake: ${error.message}`);
        },
    });
}

/**
 * Hook to finalize an intake (mark as Completed)
 */
export function useFinalizeIntake() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (intakeId: string) => finalizeIntake(intakeId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['intake', data.id] });
            queryClient.invalidateQueries({
                queryKey: ['intake', 'booking', data.bookingId],
            });
            toast.success('Intake finalized successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to finalize intake: ${error.message}`);
        },
    });
}

/**
 * Hook to check intake status and determine available actions
 */
export function useIntakeStatus(intake: ServiceIntake | null | undefined) {
    if (!intake) {
        return {
            canEdit: false,
            canFinalize: false,
            canVerify: false,
            canInitializeChecklist: false,
            isFinalized: false,
            status: undefined,
        };
    }

    const status = intake.status;
    const canEdit = status === 'Checked_In' || status === 'Inspecting';
    const canInitializeChecklist = status === 'Checked_In';
    const canVerify = status === 'Inspecting';
    const canFinalize = status === 'Verified';
    const isFinalized = status === 'Finalized';

    return {
        canEdit,
        canFinalize,
        canVerify,
        canInitializeChecklist,
        isFinalized,
        status,
    };
}
