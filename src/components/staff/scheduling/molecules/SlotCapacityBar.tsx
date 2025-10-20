/**
 * Slot Capacity Bar - Molecule Component
 * Hiển thị capacity của trung tâm với progress bar và màu sắc theo tỷ lệ
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SlotCapacityBarProps {
    capacity: number;      // Tổng số slot (VD: 20)
    occupied: number;      // Đã dùng (VD: 12)
    available: number;     // Còn trống (VD: 8)
    className?: string;
}

export const SlotCapacityBar: React.FC<SlotCapacityBarProps> = ({
    capacity,
    occupied,
    available,
    className,
}) => {
    // Tính tỷ lệ phần trăm
    const occupiedPercent = capacity > 0 ? (occupied / capacity) * 100 : 0;
    const availablePercent = capacity > 0 ? (available / capacity) * 100 : 0;

    // Xác định màu sắc dựa trên tỷ lệ sử dụng
    const getStatusColor = () => {
        if (occupiedPercent >= 90) return 'bg-red-500';
        if (occupiedPercent >= 75) return 'bg-orange-500';
        if (occupiedPercent >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusText = () => {
        if (occupiedPercent >= 90) return 'Gần đầy';
        if (occupiedPercent >= 75) return 'Bận';
        if (occupiedPercent >= 50) return 'Trung bình';
        return 'Còn trống';
    };

    const getStatusTextColor = () => {
        if (occupiedPercent >= 90) return 'text-red-700';
        if (occupiedPercent >= 75) return 'text-orange-700';
        if (occupiedPercent >= 50) return 'text-yellow-700';
        return 'text-green-700';
    };

    return (
        <div className={cn('space-y-2', className)}>
            {/* Header với số liệu */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Công suất:</span>
                    <span className={cn('font-semibold', getStatusTextColor())}>
                        {occupied}/{capacity}
                    </span>
                    <span className="text-muted-foreground">
                        ({occupiedPercent.toFixed(0)}%)
                    </span>
                </div>
                <span className={cn('text-xs font-medium px-2 py-1 rounded', getStatusTextColor(), 'bg-opacity-10')}>
                    {getStatusText()}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                {/* Occupied portion */}
                <div
                    className={cn(
                        'absolute left-0 top-0 h-full transition-all duration-300',
                        getStatusColor()
                    )}
                    style={{ width: `${occupiedPercent}%` }}
                />
                {/* Available portion - lighter shade */}
                <div
                    className="absolute right-0 top-0 h-full bg-blue-200"
                    style={{ width: `${availablePercent}%`, left: `${occupiedPercent}%` }}
                />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className={cn('w-2 h-2 rounded-full', getStatusColor())} />
                    <span>Đã phân công: {occupied}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-200" />
                    <span>Còn trống: {available}</span>
                </div>
            </div>
        </div>
    );
};
