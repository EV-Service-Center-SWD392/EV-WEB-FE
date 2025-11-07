import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

    const workloadPercentage = technician.totalSlots > 0
        ? ((technician.totalSlots - technician.availableSlots) / technician.totalSlots) * 100
        : 0;

    const getWorkloadColor = () => {
        if (workloadPercentage >= 80) return "text-red-600";
        if (workloadPercentage >= 60) return "text-orange-600";
        return "text-green-600";
    };

    const getWorkloadBadge = () => {
        if (technician.availableSlots === 0) {
            return <Badge variant="destructive">Đầy lịch</Badge>;
        }
        if (workloadPercentage >= 80) {
            return <Badge className="bg-orange-500">Gần đầy</Badge>;
        }
        return <Badge className="bg-green-500">Còn trống</Badge>;
    };

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
                                <h3 className="font-semibold text-base">{technician.technicianName}</h3>
                                <p className="text-xs text-gray-500">ID: {technician.technicianId.slice(0, 8)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getWorkloadBadge()}
                            {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                        </div>
                    </div>

                    {/* Workload Info */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Công việc:</span>
                            <span className={`font-semibold ${getWorkloadColor()}`}>
                                {technician.totalSlots - technician.availableSlots}/{technician.totalSlots} slots
                            </span>
                        </div>
                        <Progress value={workloadPercentage} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Còn trống: <strong>{technician.availableSlots} slots</strong></span>
                            <span>{Math.round(workloadPercentage)}% đã sử dụng</span>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                            Giờ làm việc: <strong>{formatTime(technician.startUtc)} - {formatTime(technician.endUtc)}</strong>
                        </span>
                    </div>

                    {/* Warning for high workload */}
                    {workloadPercentage >= 80 && technician.availableSlots > 0 && (
                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-center gap-1">
                            ⚠️ Lưu ý: Kỹ thuật viên có tải công việc cao, có thể xảy ra trзадержки
                        </div>
                    )}

                    {technician.availableSlots === 0 && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-1">
                            ❌ Kỹ thuật viên đã đầy lịch trong khung giờ này
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
                        disabled={technician.availableSlots === 0}
                    >
                        {isSelected ? "Đã chọn" : "Chọn kỹ thuật viên"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
