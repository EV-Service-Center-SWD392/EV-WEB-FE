/**
 * Custom hooks for Service Intake management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
    ServiceIntake,
    CreateIntakeRequest,
    UpdateIntakeRequest,
} from '@/entities/intake.types';
import {
    createIntake,
    getIntake,
    getIntakeByBooking,
    updateIntake,
    finalizeIntake,
} from '@/services/intakeService';

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
            isCompleted: false,
            isDraft: false,
        };
    }

    const isDraft = intake.status === 'Draft';
    const isCompleted = intake.status === 'Completed';

    return {
        canEdit: isDraft,
        canFinalize: isDraft,
        isCompleted,
        isDraft,
    };
}
