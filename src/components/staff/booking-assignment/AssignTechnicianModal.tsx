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

// Card component for displaying technician info - now supports multi-select
function TechnicianCardV2({
    technician,
    isSelected,
    onToggle
}: {
    technician: AvailableTechnician;
    isSelected: boolean;
    onToggle: (_tech: AvailableTechnician) => void;
}) {
    // Show center names from matching schedules
    const centerNames = Array.from(new Set(
        technician.matchingSchedules.map(s => s.centerName)
    )).join(", ");

    return (
        <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                ? "border-green-500 bg-green-50 shadow-md"
                : "border-gray-300 hover:border-green-400 hover:shadow-sm bg-white"
                }`}
            onClick={() => onToggle(technician)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900">{technician.userName}</h4>
                    <p className="text-sm text-gray-700 mt-1">📧 {technician.email}</p>
                    {technician.phoneNumber && (
                        <p className="text-sm text-gray-700">📱 {technician.phoneNumber}</p>
                    )}
                    <div className="mt-2 space-y-1">
                        <div className="px-2 py-1 bg-blue-100 rounded-md inline-block">
                            <p className="text-xs text-blue-800 font-medium">
                                ✅ {technician.matchingSchedules.length} lịch làm việc phù hợp
                            </p>
                        </div>
                        {centerNames && (
                            <div className="text-xs text-gray-600">
                                🏢 Trung tâm: {centerNames}
                            </div>
                        )}
                    </div>
                </div>
                {isSelected && (
                    <div className="flex-shrink-0 ml-2">
                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
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
    const [selectedTechnicians, setSelectedTechnicians] = useState<AvailableTechnician[]>([]); // Changed to array
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

                console.warn("🔍 DEBUG - Full booking object:", booking);
                console.warn("📋 EXTRACTED BOOKING INFO:", {
                    centerId: bookingInfo.centerId,
                    centerName: bookingInfo.centerName,
                    bookingDate: bookingInfo.bookingDate,
                    startTime: bookingInfo.startTime,
                    endTime: bookingInfo.endTime,
                    slotStartUtc: booking.slot.startUtc,
                    slotEndUtc: booking.slot.endUtc
                });

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
                    setError(
                        "Không có kỹ thuật viên khả dụng trong khung giờ này.\n\n" +
                        "Vui lòng kiểm tra:\n" +
                        "• Đã có technician trong hệ thống chưa?\n" +
                        "• Technician đã được assign work schedule chưa?\n" +
                        "• Work schedule có trùng với center và time slot không?"
                    );
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
            setSelectedTechnicians([]);
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
        if (selectedTechnicians.length === 0 || !booking?.slot) return;

        // Validate centerId
        if (!booking.slot.centerId) {
            setError("Thiếu thông tin centerId. Vui lòng kiểm tra lại booking.");
            toast.error("Lỗi: Thiếu thông tin centerId");
            return;
        }

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

            // Create assignment for each selected technician
            const assignmentPromises = selectedTechnicians.map(tech => {
                const payload: CreateAssignmentDto = {
                    bookingId: booking.bookingId,
                    technicianId: tech.userId,
                    centerId: booking.slot!.centerId!, // Non-null assertion since we validated above
                    plannedStartUtc: formatDateTime(dateToUse, booking.slot!.startUtc),
                    plannedEndUtc: formatDateTime(dateToUse, booking.slot!.endUtc),
                };

                console.warn("📤 Creating assignment with payload:", payload);
                return assignmentApiService.create(payload);
            });

            // Wait for all assignments to be created
            await Promise.all(assignmentPromises);

            toast.success(`Phân công thành công ${selectedTechnicians.length} kỹ thuật viên!`);
            onAssignmentCreatedAction();
            onOpenChangeAction(false);
        } catch (err: unknown) {
            console.error("Error creating assignment:", err);

            // Parse error message
            let errorMessage = "Không thể tạo phân công";

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            // Check for specific error from backend
            const errorObj = err as { response?: { data?: { message?: string } } };
            if (errorObj.response?.data?.message) {
                errorMessage = errorObj.response.data.message;
            }

            // Provide helpful message for common errors
            if (errorMessage.includes("does not belong to booking center") ||
                errorMessage.includes("Technician does not belong")) {
                errorMessage = `❌ Lỗi: Một hoặc nhiều kỹ thuật viên không có lịch làm việc tại trung tâm "${booking.slot.centerName}".\n\n` +
                    `Vui lòng:\n` +
                    `1. Kiểm tra lại work schedule của kỹ thuật viên\n` +
                    `2. Đảm bảo work schedule có centerId = "${booking.slot.centerId}"\n` +
                    `3. Hoặc chọn kỹ thuật viên khác có lịch làm việc tại trung tâm này`;
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle technician selection (add/remove from array)
    const handleToggleTechnician = (tech: AvailableTechnician) => {
        setSelectedTechnicians(prev => {
            const isAlreadySelected = prev.some(t => t.userId === tech.userId);
            if (isAlreadySelected) {
                // Remove from selection
                return prev.filter(t => t.userId !== tech.userId);
            } else {
                // Add to selection
                return [...prev, tech];
            }
        });
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-gray-900">🎯 Assign Technician to Booking</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Chọn kỹ thuật viên phù hợp để phân công cho booking này
                    </DialogDescription>
                </DialogHeader>

                {/* Booking Details Section */}
                {booking && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold text-lg mb-3 text-gray-900">📋 CHI TIẾT BOOKING</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-700 font-medium">Booking ID:</span>
                                <p className="font-mono font-semibold text-gray-900">{booking.bookingId}</p>
                            </div>
                            {booking.customerName && (
                                <div>
                                    <span className="text-gray-700 font-medium">Khách hàng:</span>
                                    <p className="font-semibold text-gray-900">{booking.customerName}</p>
                                </div>
                            )}
                            {booking.vehicleInfo && (
                                <div>
                                    <span className="text-gray-700 font-medium">Phương tiện:</span>
                                    <p className="font-semibold text-gray-900">{booking.vehicleInfo}</p>
                                </div>
                            )}
                            {booking.slot && (
                                <>
                                    <div>
                                        <span className="text-gray-700 font-medium">Thời gian:</span>
                                        <p className="font-semibold text-gray-900">
                                            {formatTime(booking.slot.startUtc)} - {formatTime(booking.slot.endUtc)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-700 font-medium">Ngày:</span>
                                        <p className="font-semibold text-gray-900">
                                            {booking.bookingDate
                                                ? formatDate(booking.bookingDate)
                                                : getDayOfWeekLabel(booking.slot.dayOfWeek)}
                                        </p>
                                    </div>
                                    {booking.slot.centerName && (
                                        <div className="col-span-2">
                                            <span className="text-gray-700 font-medium">Trung tâm:</span>
                                            <p className="font-semibold text-gray-900">{booking.slot.centerName}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Available Technicians Section */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900">👨‍🔧 KỸ THUẬT VIÊN KHẢ DỤNG</h3>

                    {isLoading && (
                        <div className="flex items-center justify-center py-8 bg-white rounded-lg border border-gray-200">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-700 font-medium">Đang tải danh sách kỹ thuật viên...</span>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-300">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">{error}</AlertDescription>
                        </Alert>
                    )}

                    {!isLoading && !error && technicians.length === 0 && (
                        <Alert className="bg-yellow-50 border-yellow-300">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                Không tìm thấy kỹ thuật viên khả dụng trong khung giờ này.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!isLoading && technicians.length > 0 && (
                        <>
                            <div className="mb-3 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium">
                                    👥 Chọn kỹ thuật viên (có thể chọn nhiều)
                                </p>
                                {selectedTechnicians.length > 0 && (
                                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                        {selectedTechnicians.length} đã chọn
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 p-2 bg-gray-50 rounded-lg">
                                {technicians.map((tech) => (
                                    <TechnicianCardV2
                                        key={tech.userId}
                                        technician={tech}
                                        isSelected={selectedTechnicians.some(t => t.userId === tech.userId)}
                                        onToggle={handleToggleTechnician}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {selectedTechnicians.length > 0 && booking?.slot?.centerName && (
                        <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                            <p className="text-sm text-green-800 font-semibold mb-2">
                                ✓ Đã chọn {selectedTechnicians.length} kỹ thuật viên:
                            </p>
                            <div className="space-y-1">
                                {selectedTechnicians.map((tech, index) => (
                                    <p key={tech.userId} className="text-xs text-green-700">
                                        {index + 1}. {tech.userName}
                                    </p>
                                ))}
                            </div>
                            <p className="text-xs text-green-700 mt-2">
                                Tại trung tâm: {booking.slot.centerName}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <DialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChangeAction(false)}
                        disabled={isSubmitting}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirmAssignment}
                        disabled={selectedTechnicians.length === 0 || isSubmitting || technicians.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            `Xác nhận phân công${selectedTechnicians.length > 1 ? ` (${selectedTechnicians.length} KTV)` : ''}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
