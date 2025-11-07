/**
 * Custom hooks for Service Intake management
 * Updated to match API spec: http://localhost:5020/api/ServiceIntake
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
    updateIntake,
    verifyIntake,
    finalizeIntake,
    cancelIntake,
    listIntakes,
} from '@/services/intakeService';

/**
 * Hook to list intakes with filters
 */
export function useIntakeList(filters: {
    centerId?: string;
    date?: string;
    status?: string;
    technicianId?: string;
} = {}) {
    return useQuery({
        queryKey: ['intake-list', filters],
        queryFn: () => listIntakes(filters),
        staleTime: 60 * 1000,
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
        mutationFn: (data: CreateIntakeRequest) => createIntake(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['intake-list'] });
            queryClient.setQueryData(['intake', data.id], data);
            toast.success('✅ Service intake created successfully');
        },
        onError: (error: Error) => {
            toast.error(`❌ Failed to create intake: ${error.message}`);
        },
    });
}

/**
 * Hook to update an existing intake
 * Auto transitions from CHECKED_IN → INSPECTING on first update
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
            queryClient.invalidateQueries({ queryKey: ['intake-list'] });
            toast.success('✅ Intake updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`❌ Failed to update intake: ${error.message}`);
        },
    });
}

/**
 * Hook to verify an intake (INSPECTING → VERIFIED)
 */
export function useVerifyIntake() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (intakeId: string) => verifyIntake(intakeId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['intake', data.id] });
            queryClient.invalidateQueries({ queryKey: ['intake-list'] });
            toast.success('✅ Intake verified successfully');
        },
        onError: (error: Error) => {
            toast.error(`❌ Failed to verify intake: ${error.message}`);
        },
    });
}

/**
 * Hook to finalize an intake (VERIFIED → FINALIZED)
 */
export function useFinalizeIntake() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (intakeId: string) => finalizeIntake(intakeId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['intake', data.id] });
            queryClient.invalidateQueries({ queryKey: ['intake-list'] });
            toast.success('✅ Intake finalized successfully');
        },
        onError: (error: Error) => {
            toast.error(`❌ Failed to finalize intake: ${error.message}`);
        },
    });
}

/**
 * Hook to cancel an intake (CHECKED_IN/INSPECTING → CANCELLED)
 */
export function useCancelIntake() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (intakeId: string) => cancelIntake(intakeId),
        onSuccess: (_data, intakeId) => {
            queryClient.invalidateQueries({ queryKey: ['intake', intakeId] });
            queryClient.invalidateQueries({ queryKey: ['intake-list'] });
            toast.success('✅ Intake cancelled successfully');
        },
        onError: (error: Error) => {
            toast.error(`❌ Failed to cancel intake: ${error.message}`);
        },
    });
}

/**
 * Hook to check intake status and determine available actions
 */
export function useIntakeStatus(intake: ServiceIntake | null | undefined) {
    if (!intake) {
        return {
            canUpdate: false,
            canVerify: false,
            canFinalize: false,
            canCancel: false,
            isFinalized: false,
            isCancelled: false,
            status: undefined,
        };
    }

    const status = intake.status;
    const canUpdate = status === 'CHECKED_IN' || status === 'INSPECTING';
    const canVerify = status === 'INSPECTING';
    const canFinalize = status === 'VERIFIED';
    const canCancel = status === 'CHECKED_IN' || status === 'INSPECTING';
    const isFinalized = status === 'FINALIZED';
    const isCancelled = status === 'CANCELLED';

    return {
        canUpdate,
        canVerify,
        canFinalize,
        canCancel,
        isFinalized,
        isCancelled,
        status,
    };
}
