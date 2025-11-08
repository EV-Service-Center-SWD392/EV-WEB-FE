"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    PlayCircle,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import { assignmentApiService, AssignmentDto } from "@/services/assignmentApiService";
import { toast } from "sonner";

interface AssignmentStatusManagerProps {
    assignment: AssignmentDto;
    onStatusChanged?: () => void;
}

/**
 * Component to manage assignment status transitions according to state diagram
 * 
 * State Flow:
 * PENDING → ASSIGNED → IN_QUEUE → ACTIVE → COMPLETED
 *                   ↓              ↓
 *              CANCELLED      REASSIGNED
 */
export default function AssignmentStatusManager({
    assignment,
    onStatusChanged,
}: AssignmentStatusManagerProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleStatusChange = async (
        action: () => Promise<AssignmentDto>,
        successMessage: string
    ) => {
        setIsLoading(true);
        try {
            await action();
            toast.success(successMessage);
            onStatusChanged?.();
        } catch (error) {
            console.error("Error changing assignment status:", error);
            toast.error("Không thể cập nhật trạng thái assignment");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = () => {
        const statusConfig = {
            PENDING: { label: "Chờ xử lý", variant: "secondary" as const, color: "bg-gray-500" },
            ASSIGNED: { label: "Đã phân công", variant: "default" as const, color: "bg-blue-500" },
            IN_QUEUE: { label: "Trong hàng đợi", variant: "outline" as const, color: "bg-yellow-500" },
            ACTIVE: { label: "Đang làm việc", variant: "default" as const, color: "bg-green-500" },
            COMPLETED: { label: "Hoàn thành", variant: "default" as const, color: "bg-emerald-600" },
            CANCELLED: { label: "Đã hủy", variant: "destructive" as const, color: "bg-red-500" },
            REASSIGNED: { label: "Đã chuyển giao", variant: "outline" as const, color: "bg-orange-500" },
        };

        const config = statusConfig[assignment.status] || statusConfig.PENDING;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const canStartWork = assignment.status === 'ASSIGNED' || assignment.status === 'IN_QUEUE';
    const canComplete = assignment.status === 'ACTIVE';
    const canAddToQueue = assignment.status === 'ASSIGNED';
    const canCancel = assignment.status === 'PENDING' || assignment.status === 'ASSIGNED';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Trạng thái Assignment</CardTitle>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Status transition actions */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Add to Queue: ASSIGNED → IN_QUEUE */}
                    {canAddToQueue && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            onClick={() =>
                                handleStatusChange(
                                    () => assignmentApiService.addToQueue(assignment.id),
                                    "Đã thêm vào hàng đợi"
                                )
                            }
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Thêm vào hàng đợi
                        </Button>
                    )}

                    {/* Start Work: ASSIGNED/IN_QUEUE → ACTIVE */}
                    {canStartWork && (
                        <Button
                            variant="default"
                            size="sm"
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                                handleStatusChange(
                                    () => assignmentApiService.startWork(assignment.id),
                                    "Đã bắt đầu làm việc"
                                )
                            }
                        >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Bắt đầu làm việc
                        </Button>
                    )}

                    {/* Complete: ACTIVE → COMPLETED */}
                    {canComplete && (
                        <Button
                            variant="default"
                            size="sm"
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 col-span-2"
                            onClick={() =>
                                handleStatusChange(
                                    () => assignmentApiService.complete(assignment.id),
                                    "Đã hoàn thành công việc"
                                )
                            }
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Hoàn thành
                        </Button>
                    )}

                    {/* Cancel */}
                    {canCancel && (
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading}
                            onClick={() =>
                                handleStatusChange(
                                    () => assignmentApiService.cancel(assignment.id).then(() => assignment),
                                    "Đã hủy assignment"
                                )
                            }
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Hủy
                        </Button>
                    )}
                </div>

                {/* Assignment Info */}
                <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
                    <div>Assignment ID: {assignment.id.slice(0, 8)}...</div>
                    <div>Technician ID: {assignment.technicianId.slice(0, 8)}...</div>
                    {assignment.queueNo && <div>Queue #: {assignment.queueNo}</div>}
                </div>

                {/* Status flow hint */}
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Flow:</strong> PENDING → ASSIGNED → IN_QUEUE → ACTIVE → COMPLETED
                </div>
            </CardContent>
        </Card>
    );
}
