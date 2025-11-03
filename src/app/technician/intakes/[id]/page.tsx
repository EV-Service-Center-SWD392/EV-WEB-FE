/**
 * Intake Detail Page (Technician)
 * Shows intake details with tabs: Info, Checklist, Work Order
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Car, User, Info as InfoIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { getIntake } from '@/services/intakeService';
import { getWorkOrdersByIntake, createWorkOrder } from '@/services/workOrderService';
import { ChecklistEditor } from '@/components/technician/ChecklistEditor';
import { useAuthStore } from '@/stores/auth';
import type { ServiceIntake, IntakeStatus } from '@/entities/intake.types';
import type { WorkOrder } from '@/entities/workorder.types';

interface IntakeDetailPageProps {
    params: {
        id: string;
    };
}

export default function IntakeDetailPage({ params }: IntakeDetailPageProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = React.useState(true);
    const [intake, setIntake] = React.useState<ServiceIntake | null>(null);
    const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([]);
    const [activeTab, setActiveTab] = React.useState<'info' | 'checklist' | 'workorder'>('info');
    const [isCreatingWorkOrder, setIsCreatingWorkOrder] = React.useState(false);

    // Load intake and related data
    const loadIntake = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const intakeData = await getIntake(params.id);
            setIntake(intakeData);

            // Load work orders if finalized
            if (intakeData.status === 'Finalized' || intakeData.status === 'Verified') {
                const orders = await getWorkOrdersByIntake(params.id);
                setWorkOrders(orders);
            }
        } catch (error) {
            console.error('Failed to load intake:', error);
            toast.error('Không thể tải thông tin phiếu tiếp nhận');
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    React.useEffect(() => {
        loadIntake();
    }, [loadIntake]);

    const getStatusBadge = (status: IntakeStatus) => {
        const variants: Record<IntakeStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
            Checked_In: { variant: 'secondary', label: 'Đã tiếp nhận' },
            Inspecting: { variant: 'default', label: 'Đang kiểm tra' },
            Verified: { variant: 'outline', label: 'Đã xác minh' },
            Finalized: { variant: 'outline', label: 'Hoàn tất' },
            Cancelled: { variant: 'destructive', label: 'Đã hủy' },
        };

        const config = variants[status] || { variant: 'secondary' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleChecklistSave = async () => {
        toast.success('Đã lưu checklist');
        await loadIntake(); // Reload to get updated status
    };

    const handleCreateWorkOrder = async () => {
        if (!intake || !user) return;

        try {
            setIsCreatingWorkOrder(true);

            const workOrder = await createWorkOrder({
                intakeId: intake.id,
                technicianId: user.id,
                serviceType: 'EV Diagnostic & Repair',
                notes: 'Work order created from checklist inspection',
            });

            toast.success('Đã tạo Work Order thành công');
            setWorkOrders([...workOrders, workOrder]);
            setActiveTab('workorder');
        } catch (error) {
            console.error('Failed to create work order:', error);
            toast.error('Không thể tạo Work Order');
        } finally {
            setIsCreatingWorkOrder(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading || !intake) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Đang tải...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Phiếu tiếp nhận #{intake.id.slice(0, 8)}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {intake.vehicleBrand} {intake.vehicleType} - {intake.licensePlate}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(intake.status)}
                    {intake.status === 'Finalized' && workOrders.length === 0 && (
                        <Button onClick={handleCreateWorkOrder} disabled={isCreatingWorkOrder}>
                            {isCreatingWorkOrder ? 'Đang tạo...' : 'Tạo Work Order'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                    <TabsTrigger value="info">
                        <InfoIcon className="w-4 h-4 mr-2" />
                        Thông tin
                    </TabsTrigger>
                    <TabsTrigger value="checklist">
                        <Car className="w-4 h-4 mr-2" />
                        Checklist
                    </TabsTrigger>
                    <TabsTrigger value="workorder">
                        <User className="w-4 h-4 mr-2" />
                        Work Order
                    </TabsTrigger>
                </TabsList>

                {/* Info Tab */}
                <TabsContent value="info" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin khách hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Tên:</div>
                                    <div className="font-medium">{intake.customerName || '-'}</div>

                                    <div className="text-muted-foreground">Điện thoại:</div>
                                    <div>{intake.customerPhone || '-'}</div>

                                    <div className="text-muted-foreground">Email:</div>
                                    <div>{intake.customerEmail || '-'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin xe</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Hãng:</div>
                                    <div className="font-medium">{intake.vehicleBrand || '-'}</div>

                                    <div className="text-muted-foreground">Dòng xe:</div>
                                    <div>{intake.vehicleType || '-'}</div>

                                    <div className="text-muted-foreground">Biển số:</div>
                                    <div className="font-medium">{intake.licensePlate || '-'}</div>

                                    {intake.odometer && (
                                        <>
                                            <div className="text-muted-foreground">Số km:</div>
                                            <div>{intake.odometer.toLocaleString()} km</div>
                                        </>
                                    )}

                                    {intake.batterySoC !== undefined && (
                                        <>
                                            <div className="text-muted-foreground">Pin:</div>
                                            <div>{intake.batterySoC}%</div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Info */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Thông tin dịch vụ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground mb-1">Trung tâm:</div>
                                        <div className="font-medium">{intake.serviceCenterName || '-'}</div>
                                    </div>

                                    <div>
                                        <div className="text-muted-foreground mb-1">Thời gian tiếp nhận:</div>
                                        <div>{formatDate(intake.createdAt)}</div>
                                    </div>

                                    {intake.scheduledDate && (
                                        <div>
                                            <div className="text-muted-foreground mb-1">Lịch hẹn:</div>
                                            <div>{formatDate(intake.scheduledDate)}</div>
                                        </div>
                                    )}

                                    {intake.verifiedAt && (
                                        <div>
                                            <div className="text-muted-foreground mb-1">Thời gian xác minh:</div>
                                            <div>{formatDate(intake.verifiedAt)}</div>
                                        </div>
                                    )}
                                </div>

                                {intake.arrivalNotes && (
                                    <div className="pt-3 border-t">
                                        <div className="text-sm text-muted-foreground mb-2">Ghi chú khi đến:</div>
                                        <div className="text-sm">{intake.arrivalNotes}</div>
                                    </div>
                                )}

                                {intake.notes && (
                                    <div className="pt-3 border-t">
                                        <div className="text-sm text-muted-foreground mb-2">Ghi chú khác:</div>
                                        <div className="text-sm">{intake.notes}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Checklist Tab */}
                <TabsContent value="checklist">
                    <ChecklistEditor
                        intakeId={intake.id}
                        onSave={handleChecklistSave}
                        readOnly={intake.status === 'Finalized' || intake.status === 'Cancelled'}
                    />
                </TabsContent>

                {/* Work Order Tab */}
                <TabsContent value="workorder">
                    {workOrders.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground mb-4">
                                    {intake.status === 'Finalized'
                                        ? 'Chưa có Work Order. Nhấn "Tạo Work Order" để bắt đầu.'
                                        : 'Hoàn tất checklist trước khi tạo Work Order.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {workOrders.map((order) => (
                                <Card key={order.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle>Work Order #{order.id.slice(0, 8)}</CardTitle>
                                            <Badge>{order.status}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Loại dịch vụ:</span>
                                                <span>{order.serviceType}</span>
                                            </div>
                                            {order.estimatedCost && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Chi phí ước tính:</span>
                                                    <span className="font-medium">
                                                        {order.estimatedCost.toLocaleString()} VNĐ
                                                    </span>
                                                </div>
                                            )}
                                            {order.notes && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-muted-foreground mb-1">Ghi chú:</p>
                                                    <p>{order.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push(`/technician/workorders/${order.id}`)}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
