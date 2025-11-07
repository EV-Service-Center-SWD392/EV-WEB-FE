"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingCardData } from "./BookingCard";
import { assignmentApiService, CreateAssignmentDto } from "@/services/assignmentApiService";
import {
    technicianAvailabilityService,
    type AvailableTechnician,
    type BookingInfo
} from "@/services/technicianAvailabilityService";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface AssignTechnicianModalProps {
    open: boolean;
    onOpenChangeAction: (_open: boolean) => void;
    booking: BookingCardData | null;
    onAssignmentCreatedAction: () => void;
}

// Card component for displaying technician info
function TechnicianCardV2({
    technician,
    isSelected,
    onSelect
}: {
    technician: AvailableTechnician;
    isSelected: boolean;
    onSelect: (_tech: AvailableTechnician) => void;
}) {
    return (
        <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
            onClick={() => onSelect(technician)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-semibold text-lg">{technician.userName}</h4>
                    <p className="text-sm text-gray-600">📧 {technician.email}</p>
                    {technician.phoneNumber && (
                        <p className="text-sm text-gray-600">📱 {technician.phoneNumber}</p>
                    )}
                    {technician.matchingSchedules && technician.matchingSchedules.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                            <p>✅ {technician.matchingSchedules.length} lịch làm việc phù hợp</p>
                        </div>
                    )}
                </div>
                {isSelected && (
                    <div className="flex-shrink-0 ml-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                            ✓
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface AssignTechnicianModalProps {
    open: boolean;
    onOpenChangeAction: (_open: boolean) => void;
    booking: BookingCardData | null;
    onAssignmentCreatedAction: () => void;
}

export default function AssignTechnicianModal({
    open,
    onOpenChangeAction,
    booking,
    onAssignmentCreatedAction,
}: AssignTechnicianModalProps) {
    const [selectedTechnician, setSelectedTechnician] = useState<AvailableTechnician | null>(null);
    const [technicians, setTechnicians] = useState<AvailableTechnician[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch available technicians when modal opens
    useEffect(() => {
        const fetchAvailableTechnicians = async () => {
            if (!booking || !booking.slot) {
                setError("Thông tin booking không đầy đủ. Cần có thông tin slot.");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Validate booking status
                if (booking.status !== "APPROVED") {
                    setError("Chỉ có thể assign technician cho booking đã APPROVED");
                    setIsLoading(false);
                    return;
                }

                // Extract booking info from props
                const bookingInfo: BookingInfo = {
                    centerId: booking.slot.centerId || "",
                    centerName: booking.slot.centerName || "",
                    bookingDate: booking.bookingDate || format(new Date(), "yyyy-MM-dd"),
                    startTime: ensureFullTimeFormat(booking.slot.startUtc),
                    endTime: ensureFullTimeFormat(booking.slot.endUtc),
                };

                // Validate booking info
                if (!bookingInfo.centerId || !bookingInfo.centerName) {
                    setError("Thông tin center không đầy đủ");
                    setIsLoading(false);
                    return;
                }

                // Use the updated service
                const data = await technicianAvailabilityService.getAvailableTechnicians(bookingInfo);

                setTechnicians(data);

                if (data.length === 0) {
                    setError("Không có kỹ thuật viên khả dụng trong khung giờ này.");
                }
            } catch (err) {
                console.error("Error fetching available technicians:", err);
                const errorMessage = err instanceof Error ? err.message : "Không thể tải danh sách kỹ thuật viên";
                setError(errorMessage);
                toast.error("Lỗi: " + errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        if (open && booking) {
            fetchAvailableTechnicians();
        } else {
            // Reset state when modal closes
            setSelectedTechnician(null);
            setTechnicians([]);
            setError(null);
        }
    }, [open, booking]);

    // Helper function to ensure time format is HH:mm:ss
    const ensureFullTimeFormat = (time: string): string => {
        if (time.split(':').length === 3) return time;
        return `${time}:00`;
    };

    const handleConfirmAssignment = async () => {
        if (!selectedTechnician || !booking?.slot) return;

        setIsSubmitting(true);

        try {
            // Use bookingDate if available, otherwise use today's date
            const dateToUse = booking.bookingDate || format(new Date(), "yyyy-MM-dd");

            // Format datetime for assignment API
            // API expects ISO 8601 UTC format: "2025-11-10T09:00:00Z"
            const formatDateTime = (date: string, time: string): string => {
                // Ensure time has seconds
                const fullTime = time.split(':').length === 3 ? time : `${time}:00`;
                return `${date}T${fullTime}Z`;
            };

            const payload: CreateAssignmentDto = {
                bookingId: booking.bookingId,
                technicianId: selectedTechnician.userId, // Changed from technicianId to userId
                plannedStartUtc: formatDateTime(dateToUse, booking.slot.startUtc),
                plannedEndUtc: formatDateTime(dateToUse, booking.slot.endUtc),
            };

            await assignmentApiService.create(payload);

            toast.success("Phân công kỹ thuật viên thành công!");
            onAssignmentCreatedAction();
            onOpenChangeAction(false);
        } catch (err: unknown) {
            console.error("Error creating assignment:", err);
            const errorMessage = err instanceof Error ? err.message : "Không thể tạo phân công";
            setError(errorMessage);
            toast.error(`Lỗi: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (time: string) => {
        // slot.startUtc and slot.endUtc are just time strings (HH:MM or HH:MM:SS)
        // No need to parse as ISO date
        return time.split(':').slice(0, 2).join(':'); // Return HH:MM
    };

    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi });
        } catch {
            return dateString;
        }
    };

    const getDayOfWeekLabel = (dayOfWeek: number | string): string => {
        const labels: Record<string, string> = {
            'MON': 'Thứ 2',
            'TUE': 'Thứ 3',
            'WED': 'Thứ 4',
            'THU': 'Thứ 5',
            'FRI': 'Thứ 6',
            'SAT': 'Thứ 7',
            'SUN': 'Chủ nhật',
            '1': 'Thứ 2',
            '2': 'Thứ 3',
            '3': 'Thứ 4',
            '4': 'Thứ 5',
            '5': 'Thứ 6',
            '6': 'Thứ 7',
            '0': 'Chủ nhật',
        };
        const key = String(dayOfWeek).toUpperCase();
        return labels[key] || labels[String(dayOfWeek)] || String(dayOfWeek);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">🎯 Assign Technician to Booking</DialogTitle>
                    <DialogDescription>
                        Chọn kỹ thuật viên phù hợp để phân công cho booking này
                    </DialogDescription>
                </DialogHeader>

                {/* Booking Details Section */}
                {booking && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold text-lg mb-3">📋 CHI TIẾT BOOKING</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Booking ID:</span>
                                <p className="font-mono font-semibold">{booking.bookingId}</p>
                            </div>
                            {booking.customerName && (
                                <div>
                                    <span className="text-gray-600">Khách hàng:</span>
                                    <p className="font-semibold">{booking.customerName}</p>
                                </div>
                            )}
                            {booking.vehicleInfo && (
                                <div>
                                    <span className="text-gray-600">Phương tiện:</span>
                                    <p className="font-semibold">{booking.vehicleInfo}</p>
                                </div>
                            )}
                            {booking.slot && (
                                <>
                                    <div>
                                        <span className="text-gray-600">Thời gian:</span>
                                        <p className="font-semibold">
                                            {formatTime(booking.slot.startUtc)} - {formatTime(booking.slot.endUtc)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ngày:</span>
                                        <p className="font-semibold">
                                            {booking.bookingDate
                                                ? formatDate(booking.bookingDate)
                                                : getDayOfWeekLabel(booking.slot.dayOfWeek)}
                                        </p>
                                    </div>
                                    {booking.slot.centerName && (
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Trung tâm:</span>
                                            <p className="font-semibold">{booking.slot.centerName}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Available Technicians Section */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">👨‍🔧 KỸ THUẬT VIÊN KHẢ DỤNG</h3>

                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Đang tải danh sách kỹ thuật viên...</span>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {!isLoading && !error && technicians.length === 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Không tìm thấy kỹ thuật viên khả dụng trong khung giờ này.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!isLoading && technicians.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {technicians.map((tech) => (
                                <TechnicianCardV2
                                    key={tech.userId}
                                    technician={tech}
                                    isSelected={selectedTechnician?.userId === tech.userId}
                                    onSelect={setSelectedTechnician}
                                />
                            ))}
                        </div>
                    )}

                    {selectedTechnician && selectedTechnician.matchingSchedules.length <= 1 && (
                        <Alert className="bg-orange-50 border-orange-200">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                ⚠️ Lưu ý: Kỹ thuật viên được chọn có ít lịch làm việc phù hợp ({selectedTechnician.matchingSchedules.length} lịch).
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Footer Actions */}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChangeAction(false)}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirmAssignment}
                        disabled={!selectedTechnician || isSubmitting || technicians.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận phân công"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
