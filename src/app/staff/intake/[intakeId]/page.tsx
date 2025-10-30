/**
 * Service Intake Detail Page
 * View and manage service intake for a booking
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ServiceIntakeForm, ChecklistTable, IntakeSummaryCard } from '@/components/staff/intake';
import {
    useIntakeById,
    useUpdateIntake,
    useFinalizeIntake,
    useIntakeStatus,
    useChecklist,
    useChecklistByCategory,
    useSaveChecklistResponses,
    useChecklistCompletion,
} from '@/hooks/intake';
import { useAutoSave } from '@/hooks/intake/useAutoSave';
import type { IntakeFormInput } from '@/entities/schemas/intake.schema';
import type { ChecklistResponse } from '@/entities/intake.types';

interface IntakePageProps {
    params: Promise<{ intakeId: string }>;
}

export default function IntakePage({ params }: IntakePageProps) {
    const router = useRouter();
    const [intakeId, setIntakeId] = React.useState<string>('');
    const [pendingResponses, setPendingResponses] = React.useState<Map<string, Partial<ChecklistResponse>>>(new Map());

    React.useEffect(() => {
        params.then((p) => setIntakeId(p.intakeId));
    }, [params]);

    const { data: intake, isLoading: isLoadingIntake } = useIntakeById(intakeId);
    const { items, responses, isLoading: isLoadingChecklist } = useChecklist(intakeId);
    const checklistGroups = useChecklistByCategory(items);
    const completion = useChecklistCompletion(items, responses);
    const { canEdit, isCompleted } = useIntakeStatus(intake);

    const updateIntake = useUpdateIntake();
    const finalizeIntake = useFinalizeIntake();
    const saveResponses = useSaveChecklistResponses(intakeId);

    // Auto-save pending checklist responses
    const saveChecklistDraft = React.useCallback(async () => {
        if (pendingResponses.size === 0) return;

        try {
            const responsesToSave = Array.from(pendingResponses.values());
            await saveResponses.mutateAsync({
                responses: responsesToSave.map((r) => ({
                    checklistItemId: r.checklistItemId!,
                    boolValue: r.boolValue,
                    numberValue: r.numberValue,
                    textValue: r.textValue,
                    severity: r.severity,
                    note: r.note,
                    photoUrl: r.photoUrl,
                })),
            });

            setPendingResponses(new Map());
            toast.success('Lưu bản nháp thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu bản nháp');
            throw error;
        }
    }, [pendingResponses, saveResponses]);

    useAutoSave({
        data: Array.from(pendingResponses.values()),
        onSave: saveChecklistDraft,
        delay: 30000, // 30 seconds
        enabled: canEdit && pendingResponses.size > 0,
    });

    const handleUpdateIntake = async (data: IntakeFormInput) => {
        try {
            await updateIntake.mutateAsync({
                intakeId,
                data: {
                    odometer: data.odometer || undefined,
                    batterySoC: data.batterySoC || undefined,
                    notes: data.notes,
                    photos: data.photos,
                },
            });
            toast.success('Cập nhật thông tin tiếp nhận thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật thông tin');
            throw error;
        }
    };

    const handleChecklistResponseChange = (response: Partial<ChecklistResponse>) => {
        if (!response.checklistItemId) return;

        setPendingResponses((prev) => {
            const next = new Map(prev);
            next.set(response.checklistItemId!, response);
            return next;
        });
    };

    const handleSaveDraft = async () => {
        await saveChecklistDraft();
    };

    const handleFinalize = async () => {
        try {
            // Save any pending responses first
            if (pendingResponses.size > 0) {
                await saveChecklistDraft();
            }

            // Then finalize the intake
            await finalizeIntake.mutateAsync(intakeId);
            toast.success('Hoàn tất tiếp nhận dịch vụ thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi hoàn tất tiếp nhận');
            throw error;
        }
    };

    if (isLoadingIntake || isLoadingChecklist) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!intake) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">Intake not found</p>
                    <Button variant="outline" onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Service Intake</h1>
                        <p className="text-muted-foreground">
                            Booking ID: {intake.bookingId}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                {canEdit && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleSaveDraft}
                            disabled={saveResponses.isPending || pendingResponses.size === 0}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saveResponses.isPending ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button
                            onClick={handleFinalize}
                            disabled={
                                finalizeIntake.isPending ||
                                !completion.isAllRequiredCompleted ||
                                pendingResponses.size > 0
                            }
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {finalizeIntake.isPending ? 'Finalizing...' : 'Finalize'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Completion Progress */}
            {!isCompleted && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Checklist Progress</span>
                        <span className="text-sm text-muted-foreground">
                            {completion.requiredCompleted} / {completion.requiredTotal} required completed
                        </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${completion.completionPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Intake Information */}
                {isCompleted ? (
                    <IntakeSummaryCard intake={intake} />
                ) : (
                    <ServiceIntakeForm
                        intake={intake}
                        onSubmitAction={handleUpdateIntake}
                        isLoading={updateIntake.isPending}
                        readOnly={!canEdit}
                    />
                )}

                <Separator />

                {/* EV Checklist */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">EV Checklist</h2>
                    <ChecklistTable
                        checklistGroups={checklistGroups}
                        responses={responses}
                        onResponseChangeAction={handleChecklistResponseChange}
                        readOnly={!canEdit}
                    />
                </div>
            </div>
        </div>
    );
}
