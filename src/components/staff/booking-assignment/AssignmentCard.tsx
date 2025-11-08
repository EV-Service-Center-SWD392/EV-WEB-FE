import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, RefreshCw, XCircle, Eye, Car, Phone, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { AssignmentDto } from "@/services/assignmentApiService";
import { directBookingService } from "@/services/directBookingService";
import type { BookingResponseDto } from "@/entities/booking.types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface AssignmentCardProps {
    assignment: AssignmentDto;
    technicianName?: string; // Optional technician name for display
    onReassign?: (_assignment: AssignmentDto) => void;
    onCancel?: (_assignment: AssignmentDto) => void;
}

export default function AssignmentCard({
    assignment,
    technicianName,
    onReassign,
    onCancel,
}: AssignmentCardProps) {
    const [isViewingBooking, setIsViewingBooking] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<BookingResponseDto | null>(null);
    const [isLoadingBooking, setIsLoadingBooking] = useState(false);

    const handleViewBooking = async () => {
        if (!assignment.bookingId) return;

        setIsLoadingBooking(true);
        setIsViewingBooking(true);

        try {
            const booking = await directBookingService.getBookingById(assignment.bookingId);
            setBookingDetails(booking);
        } catch (error) {
            console.error("Error fetching booking details:", error);
        } finally {
            setIsLoadingBooking(false);
        }
    };
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
            case 'IN_QUEUE':
                return 'Đang chờ';
            case 'ACTIVE':
                return 'Đang thực hiện';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'REASSIGNED':
                return 'Đã chuyển giao';
            default:
                return status;
        }
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">
                                    👨‍🔧 Assignment #{assignment.id.slice(0, 8)}
                                </h3>
                                <Badge className={getStatusColor(assignment.status)}>
                                    {getStatusLabel(assignment.status)}
                                </Badge>
                                {assignment.queueNo && (
                                    <Badge variant="outline">Queue #{assignment.queueNo}</Badge>
                                )}
                                {!assignment.bookingId && (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                        ⚙️ Task
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>Kỹ thuật viên: <strong>{technicianName || assignment.technicianId.slice(0, 8)}</strong></span>
                            </div>

                            {assignment.bookingId && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>Booking: <strong>#{assignment.bookingId.slice(0, 8)}</strong></span>
                                </div>
                            )}

                            {/* Planned Time */}
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Giờ dự kiến:</span>
                                    <span className="font-medium">
                                        {formatTime(assignment.plannedStartUtc)} - {formatTime(assignment.plannedEndUtc)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{formatDate(assignment.plannedStartUtc)}</span>
                            </div>
                        </div>

                        {/* Note */}
                        {assignment.note && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Ghi chú:</strong> {assignment.note}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                            {assignment.bookingId && (
                                <Button
                                    onClick={handleViewBooking}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <Eye className="h-4 w-4" />
                                    Xem chi tiết
                                </Button>
                            )}

                            {onReassign && assignment.bookingId && (assignment.status === 'PENDING' || assignment.status === 'ASSIGNED') && (
                                <Button
                                    onClick={() => onReassign(assignment)}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                                    title="Hủy assignment này và phân công cho kỹ thuật viên khác"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Phân công lại
                                </Button>
                            )}

                            {onCancel && (assignment.status === 'PENDING' || assignment.status === 'ASSIGNED') && (
                                <Button
                                    onClick={() => onCancel(assignment)}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                                    title="Hủy assignment này"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Hủy
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Booking Details Modal */}
            <Dialog open={isViewingBooking} onOpenChange={setIsViewingBooking}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Chi tiết Assignment #{assignment.id.slice(0, 8)}</DialogTitle>
                        <DialogDescription>
                            Thông tin đầy đủ về assignment và booking liên quan
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingBooking ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600">Đang tải thông tin...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Assignment Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Thông tin Assignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Assignment ID:</span>
                                        <p className="font-medium text-gray-900 font-mono">#{assignment.id.slice(0, 8)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <p className="font-medium">
                                            <Badge className={getStatusColor(assignment.status)}>
                                                {getStatusLabel(assignment.status)}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Kỹ thuật viên:</span>
                                        <p className="font-medium text-gray-900">👨‍🔧 {technicianName || assignment.technicianId.slice(0, 8)}</p>
                                    </div>
                                    {assignment.queueNo && (
                                        <div>
                                            <span className="text-gray-600">Số thứ tự:</span>
                                            <p className="font-medium text-gray-900">
                                                <Badge variant="outline">Queue #{assignment.queueNo}</Badge>
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Ngày làm việc:
                                        </span>
                                        <p className="font-medium text-gray-900">{formatDate(assignment.plannedStartUtc)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Giờ dự kiến:
                                        </span>
                                        <p className="font-medium text-gray-900">
                                            {formatTime(assignment.plannedStartUtc)} - {formatTime(assignment.plannedEndUtc)}
                                        </p>
                                    </div>
                                    {assignment.note && (
                                        <div className="md:col-span-2">
                                            <span className="text-gray-600">Ghi chú assignment:</span>
                                            <p className="font-medium text-gray-900 bg-white p-2 rounded mt-1">{assignment.note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {bookingDetails ? (
                                <>
                                    {/* Booking Info */}
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                        <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Thông tin Booking
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Booking ID:</span>
                                                <p className="font-medium text-gray-900 font-mono">#{assignment.bookingId?.slice(0, 8)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Trạng thái booking:</span>
                                                <p className="font-medium text-gray-900">
                                                    <Badge variant="outline">{bookingDetails.status}</Badge>
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Ngày đặt lịch:</span>
                                                <p className="font-medium text-gray-900">
                                                    {bookingDetails.preferredDate || bookingDetails.scheduledDate
                                                        ? formatDate(bookingDetails.preferredDate || bookingDetails.scheduledDate || '')
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Thời gian mong muốn:</span>
                                                <p className="font-medium text-gray-900">{bookingDetails.preferredTime || 'N/A'}</p>
                                            </div>
                                            {bookingDetails.notes && (
                                                <div className="md:col-span-2">
                                                    <span className="text-gray-600">Ghi chú booking:</span>
                                                    <p className="font-medium text-gray-900 bg-white p-2 rounded mt-1">{bookingDetails.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Thông tin Khách hàng
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Tên khách hàng:</span>
                                                <p className="font-medium text-gray-900 text-lg">👤 {bookingDetails.customerName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    Số điện thoại:
                                                </span>
                                                <p className="font-medium text-gray-900">
                                                    <a href={`tel:${bookingDetails.customerPhone}`} className="text-blue-600 hover:underline">
                                                        {bookingDetails.customerPhone || 'N/A'}
                                                    </a>
                                                </p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="text-gray-600">Email:</span>
                                                <p className="font-medium text-gray-900">
                                                    <a href={`mailto:${bookingDetails.customerEmail}`} className="text-blue-600 hover:underline">
                                                        {bookingDetails.customerEmail || 'N/A'}
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle Info */}
                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                        <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                                            <Car className="h-5 w-5" />
                                            Thông tin Xe
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Hãng xe:</span>
                                                <p className="font-medium text-gray-900">{bookingDetails.vehicleBrand || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Model:</span>
                                                <p className="font-medium text-gray-900">{bookingDetails.vehicleModel || 'N/A'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="text-gray-600">Biển số xe:</span>
                                                <p className="font-medium text-gray-900 text-lg">
                                                    🚗 {bookingDetails.vehicleVin || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600">Không tìm thấy thông tin booking chi tiết</p>
                                    <p className="text-sm text-gray-500 mt-1">Booking ID: {assignment.bookingId?.slice(0, 8)}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
