/**
 * IntakeActions Component
 * Displays available actions for an intake based on its status
 */

'use client';

import { Button } from '@/components/ui/button';
import {
    useUpdateIntake,
    useVerifyIntake,
    useFinalizeIntake,
    useCancelIntake
} from '@/hooks/intake/useIntake';
import { getStatusConfig, getAvailableActions } from '@/lib/intake-status';
import type { ServiceIntake } from '@/entities/intake.types';
import { CheckCircle, X, Edit } from 'lucide-react';

interface IntakeActionsProps {
    intake: ServiceIntake;
    onUpdate?: () => void;
    onVerify?: () => void;
    onFinalize?: () => void;
    onCancel?: () => void;
}

export function IntakeActions({
    intake,
    onUpdate,
    onVerify,
    onFinalize,
    onCancel,
}: IntakeActionsProps) {
    const updateMutation = useUpdateIntake();
    const verifyMutation = useVerifyIntake();
    const finalizeMutation = useFinalizeIntake();
    const cancelMutation = useCancelIntake();

    const availableActions = getAvailableActions(intake.status);
    const config = getStatusConfig(intake.status);

    const handleUpdate = () => {
        onUpdate?.();
    };

    const handleVerify = async () => {
        try {
            await verifyMutation.mutateAsync(intake.id);
            onVerify?.();
        } catch {
            // Error handled by hook
        }
    };

    const handleFinalize = async () => {
        try {
            await finalizeMutation.mutateAsync(intake.id);
            onFinalize?.();
        } catch {
            // Error handled by hook
        }
    };

    const handleCancel = async () => {
        if (confirm('Bạn có chắc muốn hủy intake này?')) {
            try {
                await cancelMutation.mutateAsync(intake.id);
                onCancel?.();
            } catch {
                // Error handled by hook
            }
        }
    };

    if (availableActions.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                {config.description}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {availableActions.includes('update') && (
                <Button
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    variant="outline"
                    size="sm"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Cập nhật
                </Button>
            )}

            {availableActions.includes('verify') && (
                <Button
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending}
                    variant="default"
                    size="sm"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {verifyMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận'}
                </Button>
            )}

            {availableActions.includes('finalize') && (
                <Button
                    onClick={handleFinalize}
                    disabled={finalizeMutation.isPending}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {finalizeMutation.isPending ? 'Đang hoàn tất...' : 'Hoàn tất'}
                </Button>
            )}

            {availableActions.includes('cancel') && (
                <Button
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    variant="destructive"
                    size="sm"
                >
                    <X className="mr-2 h-4 w-4" />
                    {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy bỏ'}
                </Button>
            )}
        </div>
    );
}
