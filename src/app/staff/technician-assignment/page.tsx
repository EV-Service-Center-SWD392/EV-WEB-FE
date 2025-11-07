"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { toast } from "sonner";
import { directBookingService } from "@/services/directBookingService";
import BookingCard, { BookingCardData } from "@/components/staff/booking-assignment/BookingCard";
import AssignmentCard from "@/components/staff/booking-assignment/AssignmentCard";
import AssignTechnicianModal from "@/components/staff/booking-assignment/AssignTechnicianModal";
import { assignmentApiService, AssignmentDto } from "@/services/assignmentApiService";

export default function TechnicianAssignmentPage() {
    const queryClient = useQueryClient();

    // State
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<string>("all");

    // Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingCardData | null>(null);

    // Fetch approved bookings with slot information
    const {
        data: bookings = [],
        isLoading: isLoadingBookings,
        error: bookingsError
    } = useQuery({
        queryKey: ["approved-bookings", selectedDate],
        queryFn: async () => {
            try {
                // Use enhanced method to get bookings with slot info
                const bookingsData = await directBookingService.getApprovedBookingsWithSlots();

                // Map to BookingCardData format with enriched slot information
                const mappedBookings: BookingCardData[] = bookingsData.map((booking) => ({
                    bookingId: booking.id,
                    customerName: booking.customerName,
                    vehicleInfo: `${booking.vehicleBrand} ${booking.vehicleModel}${booking.vehicleVin ? ` (${booking.vehicleVin})` : ''}`,
                    status: "APPROVED" as const,
                    bookingDate: booking.preferredDate || booking.scheduledDate || undefined,
                    slotTime: booking.preferredTime,
                    // Add slot info from bookingschedule table with center information
                    slot: booking.slotInfo ? {
                        slotId: booking.slotInfo.slotId,
                        slot: booking.slotInfo.slot,
                        startUtc: booking.slotInfo.startUtc,
                        endUtc: booking.slotInfo.endUtc,
                        dayOfWeek: parseInt(booking.slotInfo.dayOfWeek) || 0,
                        capacity: booking.slotInfo.capacity,
                        centerId: booking.slotInfo.centerId,
                        centerName: booking.slotInfo.centerName,
                    } : undefined,
                }));

                return mappedBookings;
            } catch (error) {
                console.error("Error fetching bookings:", error);
                throw error;
            }
        },
    });

    // Fetch assignments
    const {
        data: assignments = [],
        isLoading: isLoadingAssignments,
        error: assignmentsError,
    } = useQuery({
        queryKey: ["assignments", selectedDate, assignmentStatusFilter],
        queryFn: async () => {
            try {
                const params: {
                    date?: string;
                    status?: string;
                } = {
                    date: selectedDate,
                };

                if (assignmentStatusFilter !== "all") {
                    params.status = assignmentStatusFilter;
                }

                const data = await assignmentApiService.getByRange(params);
                return data;
            } catch (error) {
                console.error("Error fetching assignments:", error);
                throw error;
            }
        },
    });

    // Handle assign technician
    const handleAssignTech = (booking: BookingCardData) => {
        setSelectedBooking(booking);
        setIsAssignModalOpen(true);
    };

    // Handle assignment created
    const handleAssignmentCreated = () => {
        // Refresh both bookings and assignments
        queryClient.invalidateQueries({ queryKey: ["approved-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
    };

    // Handle view assignment
    const handleViewAssignment = (assignment: AssignmentDto) => {
        toast.info(`Viewing assignment ${assignment.id.slice(0, 8)}`);
        // TODO: Implement view details modal
    };

    // Handle reassign
    const handleReassign = (assignment: AssignmentDto) => {
        toast.info(`Reassigning ${assignment.id.slice(0, 8)}`);
        // TODO: Implement reassign functionality
    };

    // Handle cancel assignment
    const handleCancelAssignment = async (assignment: AssignmentDto) => {
        if (!confirm("Bạn có chắc chắn muốn hủy assignment này?")) {
            return;
        }

        try {
            await assignmentApiService.cancel(assignment.id);
            toast.success("Đã hủy assignment thành công!");
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
        } catch (error) {
            console.error("Error cancelling assignment:", error);
            toast.error("Không thể hủy assignment");
        }
    };

    // Filtered bookings
    const filteredBookings = bookings;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">📋 Phân công Kỹ thuật viên</h1>
                    <p className="text-gray-600 mt-1">
                        Quản lý phân công kỹ thuật viên cho các booking đã được duyệt
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>🔍 Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date-filter">📅 Ngày</Label>
                            <Input
                                id="date-filter"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="booking-status-filter">🚗 Trạng thái Booking</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="booking-status-filter">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="approved">Đã duyệt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assignment-status-filter">👨‍🔧 Trạng thái Assignment</Label>
                            <Select
                                value={assignmentStatusFilter}
                                onValueChange={setAssignmentStatusFilter}
                            >
                                <SelectTrigger id="assignment-status-filter">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                    <SelectItem value="ASSIGNED">Đã phân công</SelectItem>
                                    <SelectItem value="ACTIVE">Đang thực hiện</SelectItem>
                                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        📊 BOOKINGS CẦN ASSIGN (APPROVED)
                        {isLoadingBookings && <Loader2 className="h-5 w-5 animate-spin" />}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bookingsError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Lỗi tải danh sách bookings. Vui lòng thử lại.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoadingBookings ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2">Đang tải bookings...</span>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Không có booking nào cần assign</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredBookings.map((booking) => (
                                <BookingCard
                                    key={booking.bookingId}
                                    booking={booking}
                                    onAssignTech={handleAssignTech}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assignments Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        📋 ASSIGNMENTS ĐÃ TẠO
                        {isLoadingAssignments && <Loader2 className="h-5 w-5 animate-spin" />}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {assignmentsError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Lỗi tải danh sách assignments. Vui lòng thử lại.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoadingAssignments ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2">Đang tải assignments...</span>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Chưa có assignment nào được tạo</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.map((assignment) => (
                                <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onView={handleViewAssignment}
                                    onReassign={handleReassign}
                                    onCancel={handleCancelAssignment}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assign Technician Modal */}
            <AssignTechnicianModal
                open={isAssignModalOpen}
                onOpenChangeAction={setIsAssignModalOpen}
                booking={selectedBooking}
                onAssignmentCreatedAction={handleAssignmentCreated}
            />
        </div>
    );
}
