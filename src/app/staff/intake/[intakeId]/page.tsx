/**
 * Service Intake Detail Page
 * View and manage service intake for a booking
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Loader2, ClipboardList, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useWorkOrdersByIntake } from '@/hooks/workorders/useWorkOrders';
import { getWorkOrderStatusColor, getWorkOrderStatusLabel } from '@/entities/workorder.types';

interface IntakePageProps {
    params: Promise<{ intakeId: string }>;
}

export default function IntakePage({ params }: IntakePageProps) {
    const router = useRouter();
    const [intakeId, setIntakeId] = React.useState<string>('');
    const [pendingResponses, setPendingResponses] = React.useState<Map<string, Partial<ChecklistResponse>>>(new Map());
    const [checklistReady, setChecklistReady] = React.useState<boolean>(false);

    React.useEffect(() => {
        params.then((p) => setIntakeId(p.intakeId));
    }, [params]);

    const { data: intake, isLoading: isLoadingIntake } = useIntakeById(intakeId);
    const { items, responses = [], isLoading: isLoadingChecklist } = useChecklist(intakeId);
    const checklistGroups = useChecklistByCategory(items);
    const completion = useChecklistCompletion(items, responses);
    const { canEdit, canFinalize, canVerify, canInitializeChecklist, isFinalized, status: intakeStatus } =
        useIntakeStatus(intake);

    const updateIntake = useUpdateIntake();
    const finalizeIntake = useFinalizeIntake();
    const saveResponses = useSaveChecklistResponses(intakeId);
    const { data: workOrders = [], isLoading: isLoadingWorkOrders } = useWorkOrdersByIntake(intakeId);
    const primaryWorkOrder = workOrders[0];

    React.useEffect(() => {
        if (!intake) return;
        const hasResponses = (responses?.length ?? 0) > 0;
        setChecklistReady(intake.status !== 'Checked_In' || hasResponses);
    }, [intake, responses]);

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
                    licensePlate: data.licensePlate ? data.licensePlate : undefined,
                    odometer: data.odometer || undefined,
                    batterySoC: data.batterySoC || undefined,
                    arrivalNotes: data.arrivalNotes || undefined,
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

    const handleInitializeChecklist = async () => {
        try {
            await updateIntake.mutateAsync({
                intakeId,
                data: { status: 'Inspecting' },
            });
            toast.success('Đã khởi tạo checklist EV');
            setChecklistReady(true);
        } catch (error) {
            toast.error('Không thể khởi tạo checklist');
            console.error(error);
        }
    };

    const handleVerifyChecklist = async () => {
        try {
            if (pendingResponses.size > 0) {
                await saveChecklistDraft();
            }
            await updateIntake.mutateAsync({
                intakeId,
                data: { status: 'Verified' },
            });
            toast.success('Checklist đã được xác nhận');
        } catch (error) {
            toast.error('Không thể xác nhận checklist');
            console.error(error);
        }
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

                <Separator />

                <Card>
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Work Order liên quan</CardTitle>
                            <CardDescription>
                                Kết quả checklist sẽ chuyển thành báo giá sửa chữa cho khách hàng.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {primaryWorkOrder ? (
                                <>
                                    <Badge
                                        variant="secondary"
                                        className={`border ${getWorkOrderStatusColor(primaryWorkOrder.status)}`}
                                    >
                                        {getWorkOrderStatusLabel(primaryWorkOrder.status)}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/staff/workorders/${primaryWorkOrder.id}`)}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => router.push(`/staff/intake/${intakeId}/workorder`)}
                                >
                                    Tạo work order
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingWorkOrders ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ) : primaryWorkOrder ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">Mã Work Order</p>
                                    <p className="font-medium">#{primaryWorkOrder.id.slice(0, 8)}</p>
                                </div>
                                {primaryWorkOrder.technicianName && (
                                    <div className="space-y-1 text-sm">
                                        <p className="text-muted-foreground">Kỹ thuật viên phụ trách</p>
                                        <p className="font-medium">{primaryWorkOrder.technicianName}</p>
                                    </div>
                                )}
                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">Loại dịch vụ</p>
                                    <p className="font-medium">{primaryWorkOrder.serviceType}</p>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">Số hạng mục</p>
                                    <p className="font-medium">{primaryWorkOrder.tasks.length}</p>
                                </div>
                                {primaryWorkOrder.estimatedCost !== undefined && (
                                    <div className="space-y-1 text-sm">
                                        <p className="text-muted-foreground">Chi phí dự kiến</p>
                                        <p className="font-medium">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(primaryWorkOrder.estimatedCost)}
                                        </p>
                                    </div>
                                )}
                                {primaryWorkOrder.partsRequired && (
                                    <div className="space-y-1 text-sm md:col-span-2">
                                        <p className="text-muted-foreground">Phụ tùng / vật tư</p>
                                        <p className="font-medium whitespace-pre-wrap">
                                            {primaryWorkOrder.partsRequired}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
                                Chưa có work order cho intake này. Sau khi hoàn tất checklist, hãy tạo work order để gửi báo giá và xin phê duyệt từ khách hàng.
                            </div>
                        )}
                    </CardContent>
                </Card>
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
                {(canInitializeChecklist || canEdit || canVerify || canFinalize) && (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        {canInitializeChecklist && !checklistReady && (
                            <Button
                                variant="secondary"
                                onClick={handleInitializeChecklist}
                                disabled={updateIntake.isPending}
                            >
                                <ClipboardList className="w-4 h-4 mr-2" />
                                Khởi tạo checklist
                            </Button>
                        )}
                        {canEdit && (
                            <Button
                                variant="outline"
                                onClick={handleSaveDraft}
                                disabled={saveResponses.isPending || pendingResponses.size === 0}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saveResponses.isPending ? 'Saving...' : 'Lưu nháp'}
                            </Button>
                        )}
                        {canVerify && (
                            <Button
                                variant="default"
                                onClick={handleVerifyChecklist}
                                disabled={
                                    updateIntake.isPending ||
                                    !completion.isAllRequiredCompleted ||
                                    pendingResponses.size > 0
                                }
                            >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Xác nhận checklist
                            </Button>
                        )}
                        {canFinalize && (
                            <Button
                                onClick={handleFinalize}
                                disabled={finalizeIntake.isPending}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {finalizeIntake.isPending ? 'Finalizing...' : 'Ký hoàn tất'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Completion Progress */}
            {!isFinalized && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Checklist Progress</span>
                            {intakeStatus && (
                                <Badge variant="outline" className="uppercase tracking-tight">
                                    {intakeStatus.replace(/_/g, ' ')}
                                </Badge>
                            )}
                        </div>
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
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                        Pipeline: Checked-In → Inspecting → Verified → Finalized / Cancelled
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {/* Intake Information */}
                {isFinalized ? (
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
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">EV Checklist</h2>
                        {!checklistReady && canInitializeChecklist && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleInitializeChecklist}
                                disabled={updateIntake.isPending}
                            >
                                <ClipboardList className="w-4 h-4 mr-2" />
                                Khởi tạo
                            </Button>
                        )}
                    </div>
                    {checklistReady ? (
                        <ChecklistTable
                            checklistGroups={checklistGroups}
                            responses={responses}
                            onResponseChangeAction={handleChecklistResponseChange}
                            readOnly={!canEdit}
                        />
                    ) : (
                        <div className="p-6 border rounded-lg bg-muted/40 text-center text-sm text-muted-foreground">
                            Checklist chưa được khởi tạo. Hãy khởi tạo để bắt đầu kiểm tra xe điện.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
