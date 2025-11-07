/**
 * Technician Assignments Page
 * Shows intakes assigned to the current technician
 * Technician can view and work on checklist
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, ClipboardList, WrenchIcon, AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';

import { assignmentService } from '@/services/assignmentService';
import { listIntakes } from '@/services/intakeService';
import { useAuthStore } from '@/stores/auth';
import type { Assignment } from '@/entities/assignment.types';
import type { ServiceIntake, IntakeStatus } from '@/entities/intake.types';

interface IntakeWithAssignment extends ServiceIntake {
    assignment?: Assignment;
}

export default function TechnicianAssignmentsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [assignments, setAssignments] = React.useState<IntakeWithAssignment[]>([]);
    const [activeTab, setActiveTab] = React.useState<'pending' | 'in-progress' | 'completed'>('pending');

    // Load technician's assignments
    const loadAssignments = React.useCallback(async () => {
        if (!user?.id) {
            toast.error('Không tìm thấy thông tin người dùng');
            return;
        }

        try {
            setIsLoading(true);
            setIsError(false);
            setErrorMessage('');

            // Get assignments for current technician
            const myAssignments = await assignmentService.getAssignments({
                technicianId: user.id,
            });

            // Get all intakes
            const allIntakes = await listIntakes();

            // Match intakes with assignments
            const intakesWithAssignments: IntakeWithAssignment[] = [];

            for (const assignment of myAssignments) {
                if (assignment.bookingId) {
                    // Find intake for this booking
                    const intake = allIntakes.find((i) => i.bookingId === assignment.bookingId);
                    if (intake) {
                        intakesWithAssignments.push({
                            ...intake,
                            assignment,
                        });
                    }
                }
            }

            setAssignments(intakesWithAssignments);
        } catch (error) {
            console.error('Failed to load assignments:', error);
            setIsError(true);
            setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách phân công');
            toast.error('Không thể tải danh sách phân công');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    React.useEffect(() => {
        loadAssignments();
    }, [loadAssignments]);

    const getStatusBadge = (status: IntakeStatus) => {
        const variants: Record<IntakeStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
            CHECKED_IN: { variant: 'secondary', label: 'Đã tiếp nhận' },
            INSPECTING: { variant: 'default', label: 'Đang kiểm tra' },
            VERIFIED: { variant: 'outline', label: 'Đã xác minh' },
            FINALIZED: { variant: 'outline', label: 'Hoàn tất' },
            CANCELLED: { variant: 'destructive', label: 'Đã hủy' },
        };

        const config = variants[status] || { variant: 'secondary' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getActionButton = (intake: IntakeWithAssignment) => {
        switch (intake.status) {
            case 'CHECKED_IN':
                return (
                    <Button
                        size="sm"
                        onClick={() => router.push(`/technician/intakes/${intake.id}`)}
                    >
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Bắt đầu kiểm tra
                    </Button>
                );
            case 'INSPECTING':
                return (
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => router.push(`/technician/intakes/${intake.id}`)}
                    >
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Tiếp tục kiểm tra
                    </Button>
                );
            case 'FINALIZED':
                return (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => router.push(`/technician/intakes/${intake.id}`)}
                    >
                        <WrenchIcon className="w-4 h-4 mr-1" />
                        Tạo Work Order
                    </Button>
                );
            default:
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/technician/intakes/${intake.id}`)}
                    >
                        Xem chi tiết
                    </Button>
                );
        }
    };

    const filterByStatus = (intake: IntakeWithAssignment) => {
        switch (activeTab) {
            case 'pending':
                return intake.status === 'CHECKED_IN';
            case 'in-progress':
                return intake.status === 'INSPECTING' || intake.status === 'VERIFIED';
            case 'completed':
                return intake.status === 'FINALIZED';
            default:
                return true;
        }
    };

    const filteredAssignments = assignments.filter(filterByStatus);

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

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Công việc được phân công</h1>
                    </div>
                </div>
                <EmptyState
                    variant="error"
                    icon={AlertCircle}
                    title="Không thể tải danh sách công việc"
                    description={errorMessage || 'Đã có lỗi xảy ra khi tải dữ liệu'}
                    action={
                        <Button onClick={loadAssignments} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Thử lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Công việc được phân công</h1>
                    <p className="text-muted-foreground mt-2">
                        Danh sách xe cần kiểm tra và sửa chữa
                    </p>
                </div>
                <Button variant="outline" onClick={loadAssignments}>
                    Làm mới
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                    <TabsTrigger value="pending">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Chờ kiểm tra ({assignments.filter((a) => a.status === 'CHECKED_IN').length})
                    </TabsTrigger>
                    <TabsTrigger value="in-progress">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Đang làm ({assignments.filter((a) => a.status === 'INSPECTING' || a.status === 'VERIFIED').length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Hoàn tất ({assignments.filter((a) => a.status === 'FINALIZED').length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {filteredAssignments.length === 0 ? (
                        <EmptyState
                            icon={ClipboardList}
                            title="Không có công việc nào"
                            description={
                                activeTab === 'pending'
                                    ? 'Chưa có xe nào cần kiểm tra'
                                    : activeTab === 'in-progress'
                                        ? 'Chưa có công việc nào đang thực hiện'
                                        : 'Chưa có công việc nào hoàn tất'
                            }
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAssignments.map((intake) => (
                                <Card key={intake.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {intake.vehicleBrand} {intake.vehicleType}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {intake.licensePlate && intake.licensePlate !== 'string'
                                                        ? intake.licensePlate
                                                        : '-'}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(intake.status)}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Khách hàng:</span>
                                                <span className="font-medium">{intake.customerName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">SĐT:</span>
                                                <span>{intake.customerPhone}</span>
                                            </div>
                                            {intake.odometer && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Số km:</span>
                                                    <span>{intake.odometer.toLocaleString()} km</span>
                                                </div>
                                            )}
                                            {intake.batteryPercent !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Pin:</span>
                                                    <span>{intake.batteryPercent}%</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Thời gian:</span>
                                                <span className="text-xs">{formatDate(intake.createdAt)}</span>
                                            </div>
                                        </div>

                                        {intake.arrivalNotes && (
                                            <div className="pt-2 border-t">
                                                <p className="text-sm text-muted-foreground">Ghi chú:</p>
                                                <p className="text-sm mt-1">{intake.arrivalNotes}</p>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter>
                                        {getActionButton(intake)}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
