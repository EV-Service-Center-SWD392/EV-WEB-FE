"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2,
    Calendar as CalendarIcon,
    AlertCircle,
    UserCog,
    Filter
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { directBookingService } from "@/services/directBookingService";
import BookingCard, { BookingCardData } from "@/components/staff/booking-assignment/BookingCard";
import AssignmentCard from "@/components/staff/booking-assignment/AssignmentCard";
import AssignTechnicianModal from "@/components/staff/booking-assignment/AssignTechnicianModal";
import { assignmentApiService, AssignmentDto } from "@/services/assignmentApiService";
import { technicianService } from "@/services/technicianService";

export default function TechnicianAssignmentPage() {
    const queryClient = useQueryClient();

    // State
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingCardData | null>(null);

    // Reassign modal state
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [_assignmentToReassign, setAssignmentToReassign] = useState<AssignmentDto | null>(null);

    // Fetch approved bookings WITHOUT assignments (only bookings that need assignment)
    const {
        data: bookings = [],
        isLoading: isLoadingBookings,
        error: bookingsError
    } = useQuery({
        queryKey: ["unassigned-bookings", selectedDate],
        queryFn: async () => {
            try {
                // Get all approved bookings
                const allBookings = await directBookingService.getApprovedBookingsWithSlots();

                // Get all assignments to filter out already assigned bookings
                const allAssignments = await assignmentApiService.getByRange({
                    date: selectedDate,
                });

                const assignedBookingIds = new Set(
                    allAssignments
                        .filter(a => a.status !== 'CANCELLED')
                        .map(a => a.bookingId)
                        .filter(Boolean)
                );

                // Filter only bookings that haven't been assigned yet
                const unassignedBookings = allBookings.filter(
                    booking => !assignedBookingIds.has(booking.id)
                );

                // Map to BookingCardData format
                const mappedBookings: BookingCardData[] = unassignedBookings.map((booking) => ({
                    bookingId: booking.id,
                    customerName: booking.customerName,
                    vehicleInfo: `${booking.vehicleBrand} ${booking.vehicleModel}${booking.vehicleVin ? ` (${booking.vehicleVin})` : ''}`,
                    status: "APPROVED" as const,
                    bookingDate: booking.preferredDate || booking.scheduledDate || undefined,
                    slotTime: booking.preferredTime,
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

    // Fetch assignments (only today's assignments)
    const {
        data: assignments = [],
        isLoading: isLoadingAssignments,
        error: assignmentsError,
    } = useQuery({
        queryKey: ["assignments", selectedDate],
        queryFn: async () => {
            try {
                const data = await assignmentApiService.getByRange({
                    date: selectedDate,
                });

                // Debug log
                console.warn("📊 [Assignments] Loaded assignments:", {
                    total: data.length,
                    withBooking: data.filter(a => a.bookingId).length,
                    withoutBooking: data.filter(a => !a.bookingId).length,
                    sample: data.slice(0, 3).map(a => ({
                        id: a.id.slice(0, 8),
                        bookingId: a.bookingId ? a.bookingId.slice(0, 8) : null,
                        status: a.status,
                    }))
                });

                return data;
            } catch (error) {
                console.error("Error fetching assignments:", error);
                throw error;
            }
        },
    });

    // Fetch technicians to map IDs to names
    const {
        data: technicians = [],
    } = useQuery({
        queryKey: ["technicians"],
        queryFn: async () => {
            try {
                return await technicianService.getTechnicians();
            } catch (error) {
                console.error("Error fetching technicians:", error);
                return [];
            }
        },
    });

    // Create a map of technician ID to name for quick lookup
    const technicianMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        technicians.forEach((tech) => {
            map[tech.userId] = tech.userName || 'Unknown';
        });
        return map;
    }, [technicians]);

    // Handle assign technician
    const handleAssignTech = (booking: BookingCardData) => {
        setSelectedBooking(booking);
        setIsAssignModalOpen(true);
    };

    // Handle assignment created
    const handleAssignmentCreated = () => {
        // Refresh both bookings and assignments
        queryClient.invalidateQueries({ queryKey: ["unassigned-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        toast.success("Đã phân công thành công!");
    };

    // Handle reassign - open modal with booking info from cancelled assignment
    const handleReassign = async (assignment: AssignmentDto) => {
        console.warn("🔄 [Reassign] Starting reassign for assignment:", {
            id: assignment.id,
            bookingId: assignment.bookingId,
            technicianId: assignment.technicianId,
            status: assignment.status,
        });

        if (!assignment.bookingId) {
            console.error("❌ [Reassign] Assignment has no bookingId:", assignment);
            toast.error("Assignment này không có liên kết với booking. Không thể reassign.");
            return;
        }

        // Store assignment for reassign flow
        setAssignmentToReassign(assignment);

        try {
            console.warn("🔄 [Reassign] Starting reassign flow for assignment:", assignment.id);

            // First, cancel current assignment
            const cancelResult = await assignmentApiService.cancel(assignment.id);

            console.warn("✅ [Reassign] Cancel result:", cancelResult);

            if (!cancelResult) {
                toast.error("Không thể hủy assignment");
                return;
            }

            // Check if booking can be reassigned
            if (cancelResult.hasActiveAssignments) {
                toast.warning("Booking này vẫn còn assignments khác. Vui lòng hủy tất cả trước khi reassign.");
                console.warn("⚠️ [Reassign] Booking has active assignments:", cancelResult);
                return;
            }

            console.warn("📋 [Reassign] Fetching booking details for:", assignment.bookingId);

            // Fetch booking details to populate reassign modal
            const booking = await directBookingService.getBookingById(assignment.bookingId);

            if (!booking) {
                toast.error("Không tìm thấy thông tin booking");
                return;
            }

            console.warn("✅ [Reassign] Booking details:", booking);

            // Try to get slot info from original assignment or booking
            // Important: We need slot info for AssignTechnicianModal to work
            let slotInfo = undefined;

            // Option 1: Use slot info from the assignment we're cancelling
            if (assignment.plannedStartUtc && assignment.plannedEndUtc) {
                // Extract time from ISO string (e.g., "2025-11-08T17:00:00Z" -> "17:00")
                const extractTime = (isoString: string) => {
                    try {
                        const date = parseISO(isoString);
                        return format(date, "HH:mm");
                    } catch {
                        return isoString;
                    }
                };

                slotInfo = {
                    slotId: "", // Not critical for reassign
                    slot: 0,
                    startUtc: extractTime(assignment.plannedStartUtc),
                    endUtc: extractTime(assignment.plannedEndUtc),
                    dayOfWeek: 0,
                    capacity: 1,
                    centerId: assignment.centerId,
                    centerName: "",
                };

                console.warn("✅ [Reassign] Using slot info from assignment:", slotInfo);
            }

            // Map to BookingCardData format
            const bookingData: BookingCardData = {
                bookingId: booking.id,
                customerName: booking.customerName,
                vehicleInfo: `${booking.vehicleBrand} ${booking.vehicleModel}${booking.vehicleVin ? ` (${booking.vehicleVin})` : ''}`,
                status: "APPROVED" as const,
                bookingDate: booking.preferredDate || booking.scheduledDate || undefined,
                slotTime: booking.preferredTime,
                slot: slotInfo,
            };

            setSelectedBooking(bookingData);
            setIsReassignModalOpen(true);

            toast.success("Đã hủy assignment. Vui lòng chọn kỹ thuật viên mới.");

            // Refresh lists
            queryClient.invalidateQueries({ queryKey: ["unassigned-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["assignments"] });

            console.warn("🎉 [Reassign] Modal opened successfully");

        } catch (error) {
            console.error("❌ [Reassign] Error during reassign:", error);
            toast.error("Có lỗi xảy ra khi reassign");
        }
    };

    // Handle cancel assignment
    const handleCancelAssignment = async (assignment: AssignmentDto) => {
        if (!confirm("Bạn có chắc chắn muốn hủy assignment này?")) {
            return;
        }

        try {
            console.warn("🗑️ [Cancel] Cancelling assignment:", assignment.id);

            const result = await assignmentApiService.cancel(assignment.id);

            console.warn("✅ [Cancel] Cancel result:", result);

            if (result) {
                toast.success(result.message);

                // Show info if booking can be reassigned
                if (!result.hasActiveAssignments) {
                    toast.info("Booking này đã sẵn sàng để assign lại!");
                }

                // Refresh both lists - booking will appear in unassigned list if no active assignments
                queryClient.invalidateQueries({ queryKey: ["unassigned-bookings", selectedDate] });
                queryClient.invalidateQueries({ queryKey: ["assignments", selectedDate] });

                console.warn("🔄 [Cancel] Lists refreshed");
            } else {
                toast.error("Không thể hủy assignment");
            }
        } catch (error) {
            console.error("❌ [Cancel] Error cancelling assignment:", error);
            toast.error("Không thể hủy assignment");
        }
    };

    // Handle reassignment completed
    const handleReassignmentCreated = () => {
        setIsReassignModalOpen(false);
        setAssignmentToReassign(null);
        setSelectedBooking(null);
        queryClient.invalidateQueries({ queryKey: ["unassigned-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
        toast.success("Đã reassign thành công!");
    };

    // Filtered bookings
    const filteredBookings = bookings;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                            <UserCog className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Technician Assignment</h1>
                    </div>
                    <p className="text-gray-600 ml-[60px]">
                        Manage technician assignments for approved bookings
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Filter className="h-5 w-5 text-blue-600" />
                        Chọn ngày
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="max-w-xs">
                        <Label htmlFor="date-filter" className="flex items-center gap-2 text-gray-700 mb-2">
                            <CalendarIcon className="h-4 w-4" />
                            Ngày làm việc
                        </Label>
                        <Input
                            id="date-filter"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-gray-300"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                            Chọn ngày để xem bookings cần assign technician
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Section */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <UserCog className="h-5 w-5 text-blue-600" />
                        Approved Bookings Requiring Assignment
                        {isLoadingBookings && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {bookingsError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Lỗi tải danh sách bookings. Vui lòng thử lại.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoadingBookings ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                                <span className="text-gray-600">Loading bookings...</span>
                            </div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-sm">
                                <CalendarIcon className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">No bookings to assign</p>
                            <p className="text-sm text-muted-foreground">All approved bookings have been assigned</p>
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
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <CalendarIcon className="h-5 w-5 text-green-600" />
                        Created Assignments
                        {isLoadingAssignments && <Loader2 className="h-5 w-5 animate-spin text-green-600" />}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {assignmentsError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Lỗi tải danh sách assignments. Vui lòng thử lại.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoadingAssignments ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-3" />
                                <span className="text-gray-600">Loading assignments...</span>
                            </div>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-sm">
                                <AlertCircle className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">No assignments created yet</p>
                            <p className="text-sm text-muted-foreground">Start by assigning technicians to approved bookings above</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.map((assignment) => (
                                <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    technicianName={technicianMap[assignment.technicianId]}
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

            {/* Reassign Technician Modal */}
            <AssignTechnicianModal
                open={isReassignModalOpen}
                onOpenChangeAction={setIsReassignModalOpen}
                booking={selectedBooking}
                onAssignmentCreatedAction={handleReassignmentCreated}
            />
        </div>
    );
}
