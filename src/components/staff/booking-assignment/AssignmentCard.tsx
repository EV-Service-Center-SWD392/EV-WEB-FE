import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Eye, RefreshCw, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { AssignmentDto } from "@/services/assignmentApiService";

interface AssignmentCardProps {
    assignment: AssignmentDto;
    onView?: (_assignment: AssignmentDto) => void;
    onReassign?: (_assignment: AssignmentDto) => void;
    onCancel?: (_assignment: AssignmentDto) => void;
}

export default function AssignmentCard({
    assignment,
    onView,
    onReassign,
    onCancel,
}: AssignmentCardProps) {
    const formatTime = (utcString: string) => {
        try {
            return format(parseISO(utcString), "HH:mm", { locale: vi });
        } catch {
            return utcString;
        }
    };

    const formatDate = (utcString: string) => {
        try {
            return format(parseISO(utcString), "dd/MM/yyyy", { locale: vi });
        } catch {
            return utcString;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500';
            case 'ASSIGNED':
                return 'bg-blue-500';
            case 'ACTIVE':
                return 'bg-green-500';
            case 'COMPLETED':
                return 'bg-gray-500';
            case 'CANCELLED':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xử lý';
            case 'ASSIGNED':
                return 'Đã phân công';
            case 'ACTIVE':
                return 'Đang thực hiện';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                                👨‍🔧 Assignment #{assignment.id.slice(0, 8)}
                            </h3>
                            <Badge className={getStatusColor(assignment.status)}>
                                {getStatusLabel(assignment.status)}
                            </Badge>
                            {assignment.queueNo && (
                                <Badge variant="outline">Queue #{assignment.queueNo}</Badge>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Kỹ thuật viên ID: <strong>{assignment.technicianId.slice(0, 8)}</strong></span>
                        </div>

                        {assignment.bookingId && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>Booking: <strong>#{assignment.bookingId.slice(0, 8)}</strong></span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                                {formatTime(assignment.plannedStartUtc)} - {formatTime(assignment.plannedEndUtc)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(assignment.plannedStartUtc)}</span>
                        </div>
                    </div>

                    {assignment.note && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Ghi chú:</strong> {assignment.note}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {onView && (
                            <Button
                                onClick={() => onView(assignment)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </Button>
                        )}

                        {onReassign && assignment.status === 'PENDING' && (
                            <Button
                                onClick={() => onReassign(assignment)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reassign
                            </Button>
                        )}

                        {onCancel && (assignment.status === 'PENDING' || assignment.status === 'ASSIGNED') && (
                            <Button
                                onClick={() => onCancel(assignment)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
