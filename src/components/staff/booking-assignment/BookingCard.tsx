import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Car, User, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export interface BookingCardData {
    bookingId: string;
    customerName?: string;
    vehicleInfo?: string;
    slotTime?: string;
    bookingDate?: string;
    status: 'APPROVED';
    slot?: {
        slotId: string;
        slot: number;
        startUtc: string;
        endUtc: string;
        dayOfWeek: number;
        capacity: number;
        centerId?: string;
        centerName?: string;
    };
}

interface BookingCardProps {
    booking: BookingCardData;
    onAssignTech: (_booking: BookingCardData) => void;
}

export default function BookingCard({ booking, onAssignTech }: BookingCardProps) {
    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), "EEEE, dd/MM/yyyy", { locale: vi });
        } catch {
            return dateString;
        }
    };

    const getTimeDisplay = () => {
        if (booking.slot) {
            // slot.startUtc and endUtc are just HH:MM format (e.g., "09:00", "11:00")
            return `${booking.slot.startUtc} - ${booking.slot.endUtc}`;
        }
        return booking.slotTime || "Chưa xác định";
    };

    const getDayOfWeekLabel = (dayOfWeek: string): string => {
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
        return labels[dayOfWeek.toUpperCase()] || labels[dayOfWeek] || dayOfWeek;
    };

    const getDateDisplay = () => {
        // Prioritize slot.dayOfWeek since bookingDate might be null
        if (booking.slot?.dayOfWeek !== undefined) {
            return getDayOfWeekLabel(String(booking.slot.dayOfWeek));
        }
        // Fallback to bookingDate if available
        if (booking.bookingDate) {
            return formatDate(booking.bookingDate);
        }
        return "Chưa xác định";
    };

    return (
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                    🚗 Booking #{booking.bookingId.slice(0, 8)}
                                </h3>
                                <Badge variant="default" className="bg-green-500">
                                    {booking.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {booking.customerName && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>Khách hàng: <strong>{booking.customerName}</strong></span>
                                </div>
                            )}

                            {booking.vehicleInfo && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Car className="h-4 w-4 text-gray-400" />
                                    <span>Xe: <strong>{booking.vehicleInfo}</strong></span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{getDateDisplay()}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>Giờ: <strong>{getTimeDisplay()}</strong></span>
                            </div>

                            {/* Show slot info if available */}
                            {booking.slot && (
                                <>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>Slot: <strong>#{booking.slot.slot}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            Sức chứa: {booking.slot.capacity} xe
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                        <Button
                            onClick={() => onAssignTech(booking)}
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Assign Tech
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
