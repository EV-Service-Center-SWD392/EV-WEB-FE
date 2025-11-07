/**
 * Assignable Work List - Molecule Component
 * Danh sách công việc có thể gán cho technician (bookings + service requests)
 */

import * as React from 'react';
import { User, Car, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AssignableWorkItem } from '@/hooks/scheduling/useAssignableWork';

export interface AssignableWorkListProps {
    workItems: AssignableWorkItem[];
    selectedWorkId?: string;
    onSelectWork: (_workId: string) => void;
    onAssign: (_workItem: AssignableWorkItem) => void;
    isLoading?: boolean;
    className?: string;
}

export const AssignableWorkList: React.FC<AssignableWorkListProps> = ({
    workItems,
    selectedWorkId,
    onSelectWork,
    onAssign,
    isLoading = false,
    className,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse bg-muted/50" />
                ))}
            </div>
        );
    }

    if (workItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/30 px-4 py-10 text-center text-muted-foreground">
                <p className="text-sm font-medium text-foreground">
                    Không có công việc nào chờ phân công
                </p>
                <p className="text-xs">
                    Kiểm tra lại bộ lọc hoặc chuyển sang tab Hàng chờ để tạo ticket walk-in.
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            {workItems.map((item) => {
                const isSelected = selectedWorkId === item.id;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            'p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md',
                            isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => onSelectWork(item.id)}
                    >
                        {/* Header: Customer & Type */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-foreground">
                                        {item.customerName}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {item.type === 'booking' ? 'Booking' : 'Walk-in'}
                                    </Badge>
                                </div>
                                {item.customerPhone && (
                                    <p className="text-xs text-muted-foreground ml-6">
                                        {item.customerPhone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex items-center gap-2 mb-2 text-sm">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{item.vehicleInfo}</span>
                        </div>

                        {/* Services */}
                        <div className="mb-3">
                            <p className="text-sm text-foreground line-clamp-2">
                                <span className="font-medium">Dịch vụ:</span> {item.services}
                            </p>
                        </div>

                        {/* Scheduled Time */}
                        {item.scheduledTime && (
                            <div className="flex items-center gap-2 mb-3 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {format(new Date(item.scheduledTime), 'HH:mm - dd/MM/yyyy', {
                                        locale: vi,
                                    })}
                                </span>
                            </div>
                        )}

                        {/* Suggested Technician (if any) */}
                        {item.suggestedTechId && (
                            <div className="mb-3">
                                <Badge variant="secondary" className="text-xs">
                                    Gợi ý: Technician {item.suggestedTechId}
                                </Badge>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-xs text-muted-foreground">
                                ID: {item.id}
                            </span>
                            <Button
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAssign(item);
                                }}
                            >
                                {isSelected ? 'Phân công' : 'Chọn'}
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
