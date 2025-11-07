import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, CheckCircle } from "lucide-react";
import { AvailableTechnician } from "@/services/technicianAvailabilityService";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface TechnicianCardProps {
    technician: AvailableTechnician;
    isSelected: boolean;
    onSelect: (_technician: AvailableTechnician) => void;
}

export default function TechnicianCard({
    technician,
    isSelected,
    onSelect,
}: TechnicianCardProps) {
    const formatTime = (utcString: string) => {
        try {
            return format(parseISO(utcString), "HH:mm", { locale: vi });
        } catch {
            return utcString;
        }
    };

    const availableSchedules = technician.matchingSchedules.length;
    const hasAvailability = availableSchedules > 0;

    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-md ${isSelected
                ? "ring-2 ring-blue-500 bg-blue-50 border-blue-500"
                : "hover:border-gray-400"
                }`}
            onClick={() => onSelect(technician)}
        >
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header with selection indicator */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                                }`}>
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">{technician.userName}</h3>
                                <p className="text-xs text-gray-500">ID: {technician.userId.slice(0, 8)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasAvailability ? (
                                <Badge className="bg-green-500">Có lịch</Badge>
                            ) : (
                                <Badge variant="destructive">Không có lịch</Badge>
                            )}
                            {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                        </div>
                    </div>

                    {/* Availability Info */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Lịch làm việc khả dụng:</span>
                            <span className="font-semibold text-green-600">
                                {availableSchedules} ca
                            </span>
                        </div>
                    </div>

                    {/* Working Hours */}
                    {technician.matchingSchedules.length > 0 && (
                        <div className="space-y-1">
                            {technician.matchingSchedules.map((schedule, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>
                                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Warning for no availability */}
                    {!hasAvailability && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-1">
                            ❌ Kỹ thuật viên không có lịch làm việc trong khung giờ này
                        </div>
                    )}

                    {/* Select Button */}
                    <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full ${isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(technician);
                        }}
                        disabled={!hasAvailability}
                    >
                        {isSelected ? "Đã chọn" : "Chọn kỹ thuật viên"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
